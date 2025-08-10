import re
import textwrap


def chunk_text(text):
    lines = text.splitlines()
    chunks = []
    current_section = ""
    section_id = None

    # Matches: SECTION 1: or 1.1 or 2.3.4
    section_header_pattern = re.compile(r"^(SECTION\s+\d+[:\-]?|\d+(\.\d+)*\s+.+)", re.IGNORECASE)

    for line in lines:
        line = line.strip()
        if not line:
            continue

        if section_header_pattern.match(line):
            # If we already have a section collected, save it
            if current_section:
                chunks.append(current_section.strip())
                current_section = ""

        current_section += line + "\n"

    # Add the final section
    if current_section:
        chunks.append(current_section.strip())

    return chunks


import re

def clean_chunk_formatting(chunk: str) -> str:
    
    # Merge broken numbered lines like "1.\n1.3 Heading" → "1.3 Heading"
    chunk = re.sub(r'(?<!\d)\b(\d{1,2})\.\s*\n\s*(\1\.\d{1,2}[^\n]*)', r'\2', chunk)

    # Step 1: Fix broken subheading numbers like "1.\n7.1" → "1.7.1"
    chunk = re.sub(r'(?<=\b\d)\.\s*\n\s*(\d+\.\d+)', r'.\1', chunk)

    # Step 2: Fix broken deeper headings like "2.\n1.1" → "2.1.1"
    chunk = re.sub(r'(?<=\b\d)\.\s*\n\s*(\d+\.\d+\.\d+)', r'.\1', chunk)

    # Step 3: Fix broken one-line headings like "2.\nSCOPE OF WORK" → "2. SCOPE OF WORK"
    chunk = re.sub(r'(?<=\b\d)\.\s*\n\s*([A-Z][^\n]+)', r'. \1', chunk)

    # Step 4: Remove meaningless heading lines like just ".1" or "1."
    chunk = re.sub(r'^\s*\.?\d+\s*$', '', chunk, flags=re.MULTILINE)

    # Step 5: Add line break before any heading like 1.4 or 2.1.3 (except if it's already on its own line)
    chunk = re.sub(r'(?<!\n)(?=\b\d+(\.\d+)+\s+[A-Z])', r'\n', chunk)

    # Step 6: Ensure "Section X:" is on a separate line
    chunk = re.sub(r'(?<!\n)(Section\s+\d+:)', r'\n\1', chunk)
    chunk = re.sub(r'(Section\s+\d+:)(?!\n)', r'\1\n', chunk)

    # Step 7: Normalize bullets like • or ‣
    # Add bullets only before proper bullet lines, avoid numbered headings
    chunk = re.sub(r'\n[\•‣\-\*]+\s*(?!\d+\.\d+)', '\n• ', chunk)


    # Step 8: Remove duplicate empty lines
    chunk = re.sub(r'\n{3,}', '\n\n', chunk)

    return chunk.strip()


def merge_broken_numbered_lines(text: str) -> str:
    lines = text.split("\n")
    merged_lines = []
    skip_next = False

    for i in range(len(lines)):
        if skip_next:
            skip_next = False
            continue

        current = lines[i].strip()
        next_line = lines[i + 1].strip() if i + 1 < len(lines) else ""

        # Detect pattern: line like '2.' followed by '2.1 Subheading'
        if re.fullmatch(r"\d+\.", current) and re.match(r"\d+(\.\d+)+", next_line):
            merged_lines.append(f"{current}{next_line}")  # e.g., '2.2.1'
            skip_next = True
        else:
            merged_lines.append(current)

    return "\n".join(merged_lines)


def convert_chunks_to_json(chunks):
    section_json = []

    for chunk in chunks:
        lines = chunk.splitlines()
        if not lines:
            continue

        # First line might be SECTION header or numbered heading
        first_line = lines[0].strip()
        match = re.match(r"^(SECTION\s+\d+|(\d+(\.\d+)*))", first_line, re.IGNORECASE)
        section_id = match.group(0).strip() if match else "unknown"

        section_json.append({
            "section_id": section_id,
            "title": first_line,
            "content": chunk.strip()
        })

    return section_json
