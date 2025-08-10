import sys
import os
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.utils.file_loader import load_codebook_text
from backend.app.services.matching_engine import split_codebook_by_clause, embed_and_store_clauses

# Load the full codebook text (SBC 501)
text = load_codebook_text("SBC-501_Mechanical.pdf")  # in shared/codebooks/

# ✅ Split by logical clauses (not tokens!)
clauses = split_codebook_by_clause(text)

# ✅ Embed and store in FAISS
clauses = split_codebook_by_clause(text)
embed_and_store_clauses(clauses, index_name="sbc501")
