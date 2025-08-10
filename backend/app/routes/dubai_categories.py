from flask import Blueprint, jsonify
import json, os

categories_bp = Blueprint("dubai_categories", __name__)

PART_MAP = {
    "A": "General",
    "B": "Architecture",
    "C": "Accessibility",
    "D": "Vertical Transportation",
    "E": "Building Envelope",
    "F": "Structure",
    "G": "Incoming Utilities",
    "H": "Indoor Environment",
    "J": "Security",
    "K": "Villas"
}

@categories_bp.route("/dubai/categories", methods=["GET"])
def get_dubai_categories():
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../shared/Dubai Book'))
    sections_file = os.path.join(base_path, "dubai_building_code_sections.json")
    mapping_file = os.path.join(base_path, "dubai_dbc_subcategories.json")

    if not os.path.exists(sections_file) or not os.path.exists(mapping_file):
        return jsonify({"error": "File not found"}), 404

    with open(sections_file, "r", encoding="utf-8") as f:
        sections = json.load(f)
    with open(mapping_file, "r", encoding="utf-8") as f:
        sub_map = json.load(f)

    output = {}

    for part_letter, cat_data in sub_map.items():
        main_cat = PART_MAP.get(part_letter, part_letter)
        output[main_cat] = []

        subcategories = cat_data.get("subcategories", [])

        # Case 1: curated subcategories → match ONLY immediate children of prefixes
        if subcategories:
            for sub in subcategories:
                sub_name = sub["name"]
                prefixes = sub.get("prefixes", [])

                matched_sections = []
                for pref in prefixes:
                    if not isinstance(pref, str):
                        continue
                    pref_matches = [
                        sec for sec in sections
                        if sec["section_id"] == pref or (
                            sec["section_id"].startswith(pref + ".") and
                            sec["section_id"].count(".") == pref.count(".") + 1
                        )
                    ]
                    matched_sections.extend(pref_matches)

                if matched_sections:
                    # Each curated subcategory becomes ONE checkbox on frontend
                    output[main_cat].append({
                        "subcategory": sub_name,
                        "sections": [{
                            "section_id": sub["id"],  # use curated ID
                            "section_title": sub_name
                        }]
                    })

        # Case 2: no curated subcategories → General / Security get ALL sections as one entry
        else:
            part_sections = [
                sec for sec in sections
                if sec["section_id"].startswith(part_letter + ".")
            ]
            if part_sections:
                output[main_cat].append({
                    "subcategory": f"{main_cat} (all sections)",
                    "sections": [{
                        "section_id": part_letter + "_ALL",
                        "section_title": f"All {main_cat} Sections"
                    }]
                })

    return jsonify(output)
