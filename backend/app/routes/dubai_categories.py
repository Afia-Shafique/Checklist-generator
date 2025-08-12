from flask import Blueprint, jsonify
import json, os

categories_bp = Blueprint("dubai_categories", __name__)

PART_MAP = {
    "A": "General & Compliance",
    "B": "Architecture & Space Planning",
    "C": "Accessibility",
    "D": "Vertical Transportation",
    "E": "Building Envelope",
    "F": "Structure",
    "G": "MEP & Utilities",
    "H": "Indoor Environment",
    "J": "Security",
    "K": "Villas & Special Buildings"
}


@categories_bp.route("/dubai/categories", methods=["GET"])
def get_dubai_categories():
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../shared/Dubai Book'))
    mapping_file = os.path.join(base_path, "dubai_dbc_subcategories.json")

    if not os.path.exists(mapping_file):
        return jsonify({"error": "File not found"}), 404

    with open(mapping_file, "r", encoding="utf-8") as f:
        sub_map = json.load(f)

    output = {}

    for part_letter, cat_data in sub_map.items():
        main_cat = PART_MAP.get(part_letter, part_letter)
        output[main_cat] = []

        subcategories = cat_data.get("subcategories", [])
        for sub in subcategories:
            output[main_cat].append({
                "subcategory_id": sub["id"],
                "subcategory_name": sub["name"],
                "prefixes": sub.get("prefixes", [])
            })

    return jsonify(output)