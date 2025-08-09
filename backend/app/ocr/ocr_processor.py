import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import cv2
import numpy as np
import os
import pandas as pd
import docx
# Removed textract as it's causing installation issues
import docx2txt
import fitz
from collections import Counter
import re
from docx import Document
from ..services.section_splitter import chunk_text
from ..services.section_splitter import clean_chunk_formatting
from ..services.section_splitter import merge_broken_numbered_lines
from ..services.section_splitter import convert_chunks_to_json

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
poppler_path = r'C:\poppler-24.08.0\Library\bin'

def preprocess_image(pil_image):
    cv_img = np.array(pil_image)
    gray = cv2.cvtColor(cv_img, cv2.COLOR_RGB2GRAY)
    denoised = cv2.medianBlur(gray, 3)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    coords = np.column_stack(np.where(thresh > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    (h, w) = thresh.shape
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    deskewed = cv2.warpAffine(thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    return Image.fromarray(deskewed)

def clean_ocr_text(text: str) -> str:
    # Fix cases like "1.\n7.3" → "1.7.3"
    text = re.sub(r'(?<=\b\d)\.\s*\n\s*(\d+\.\d+)', r'.\1', text)

    # Fix cases like "1.\n7" → "1.7"
    text = re.sub(r'(?<=\b\d)\.\s*\n\s*(\d+)', r'.\1', text)

    # Fix multiple broken line number cases like "1.\n7.\n3" → "1.7.3"
    text = re.sub(r'(?<=\b\d)\.\s*\n\s*(\d+)\.\s*\n\s*(\d+)', r'.\1.\2', text)

    # Remove multiple newlines and normalize spacing
    text = re.sub(r'\n{2,}', '\n', text)

    return text




def extract_project_name(text, max_lines=20):
    
    lines = text.splitlines()

    # Keywords to look for in the header area
    project_keywords = [
        r'construction of',
        r'project name[:\s]*',
        r'project title[:\s]*',
        r'project[:\s]*'
    ]

    for line in lines[:max_lines]:
        for keyword in project_keywords:
            if re.search(keyword, line, re.IGNORECASE):
                # Extract text after the keyword
                match = re.search(rf'{keyword}\s*(.+)', line, re.IGNORECASE)
                if match:
                    full_text = match.group(1).strip()

                    # ✅ Trim after stop keywords
                    stop_keywords = ['project no', 'bid reference', 'section', 'client', 'owner']
                    for stop in stop_keywords:
                        full_text = re.split(stop, full_text, flags=re.IGNORECASE)[0].strip()

                    # ✅ Limit to max 8 words to avoid overflow
                    words = full_text.split()
                    short_text = ' '.join(words[:5])

                    return short_text

    return None



def remove_headers_footers(text: str, max_line_len=80):
    """
    Removes common page headers and footers by detecting repeating patterns
    and page markers (like 'Page 1 of X').
    """
    lines = text.splitlines()
    cleaned_lines = []

    page_header_candidates = []
    page_footer_candidates = []

    # Heuristic: headers are usually in top 5 lines of a page
    # footers are usually in last 5 lines before a page break
    page_breaks = [i for i, l in enumerate(lines) if re.match(r'^\f$', l.strip())]  # '\f' = page break

    page_start = 0
    for pb in page_breaks + [len(lines)]:
        page = lines[page_start:pb]
        if len(page) >= 5:
            page_header_candidates.append(page[:5])
            page_footer_candidates.append(page[-5:])
        page_start = pb + 1

    # Flatten header/footer candidates and count
    flat_headers = Counter(line for grp in page_header_candidates for line in grp)
    flat_footers = Counter(line for grp in page_footer_candidates for line in grp)

    # Get top 3 repeated lines that look like headers/footers
    common_headers = {line for line, count in flat_headers.items() if count >= 2 and len(line) <= max_line_len}
    common_footers = {line for line, count in flat_footers.items() if count >= 2 and len(line) <= max_line_len}

    for line in lines:
        if line.strip() in common_headers or line.strip() in common_footers:
            continue
        if re.match(r'Page\s+\d+(\s+of\s+\d+)?', line, re.IGNORECASE):
            continue
        cleaned_lines.append(line)

    return '\n'.join(cleaned_lines)


def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    print("File extension:", ext)

    text = ''

    if ext in ['.png', '.jpg', '.jpeg']:
        image = Image.open(file_path)
        preprocessed = preprocess_image(image)
        text = pytesseract.image_to_string(preprocessed)

    elif ext == '.pdf':
        try:
            # Try extracting digital text using fitz (PyMuPDF)
            pdf = fitz.open(file_path)
            for page in pdf:
                page_text = page.get_text()
                if page_text.strip():
                    text += page_text
            if not text.strip():
                raise ValueError("Empty text from PyMuPDF.")
        except Exception as e:
            print("fitz PDF text extraction failed or empty:", str(e))
            # Fallback to OCR using Tesseract
            images = convert_from_path(file_path, poppler_path=poppler_path)
            for img in images:
                preprocessed = preprocess_image(img)
                ocr_text = pytesseract.image_to_string(preprocessed, config='--psm 6')
                text += "\n" + ocr_text

    elif ext == '.docx':
        doc = Document(file_path)
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        text = "\n".join(paragraphs)

    elif ext == '.txt':
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()

    else:
        return {"error": "Unsupported file format."}

    # Clean and post-process the text
    text = clean_ocr_text(text)
    text = remove_headers_footers(text)
    text = merge_broken_numbered_lines(text)
    project_name = extract_project_name(text)
    chunks = chunk_text(text)
    chunks = [clean_chunk_formatting(chunk) for chunk in chunks]
    structured_sections = convert_chunks_to_json(chunks)
  
    print("✅ Returning from extract_text_from_file")
    print("Project Name:", project_name)
    print("Structured Sections:", structured_sections)

    return {
        "project_name": project_name,
        "sections": structured_sections  # Ready to pass to GPT
    }




