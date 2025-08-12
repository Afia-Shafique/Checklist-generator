import re
import logging

logger = logging.getLogger(__name__)

def normalize_section_id(sec_id, title, content):
    """
    Normalize or recover section_id from raw ID, title, or content.
    Always returns something, default 'UNKNOWN'.
    """
    if sec_id and sec_id.strip():
        return sec_id.strip()

    m = re.search(r'([A-Z]\.\d+(?:\.\d+)*)', title or "")
    if m:
        return m.group(1)

    m = re.search(r'([A-Z]\.\d+(?:\.\d+)*)', content or "")
    if m:
        return m.group(1)

    return "UNKNOWN"


def filter_matches_by_subcategory(matches, selected_subcategories, sub_map, sections_file_path, allowed_keywords):
    """
    Filters GPT matches so only clauses from allowed subcategories pass through.
    Uses both prefix and keyword matching, but more forgiving than before.
    """
    # 1️⃣ Load allowed prefixes
    allowed_prefixes = []
    for part_letter, cat_data in sub_map.items():
        for sub in cat_data.get("subcategories", []):
            if sub["id"] in selected_subcategories:
                allowed_prefixes.extend(sub.get("prefixes", []))

    allowed_prefixes = sorted(set([p.strip() for p in allowed_prefixes if p.strip()]))

    filtered_matches = []
    filtered_out_log = []

    logger.info(f"Allowed prefixes: {allowed_prefixes}")
    logger.info(f"Allowed keywords: {allowed_keywords}")
    logger.info(f"Matched before filtering: {len(matches)}")

    for match in matches:
        if "matched_clause" not in match or not isinstance(match["matched_clause"], dict):
            match["matched_clause"] = {}

        mc = match["matched_clause"]
        title = mc.get("title", "") or ""
        content = mc.get("content", "") or ""
        raw_id = mc.get("section_id", "") or ""

        canonical = normalize_section_id(raw_id, title, content)
        match["matched_clause"]["section_id"] = canonical

        # Relaxed prefix check: allow match if prefix OR keyword matches
        prefix_ok = any(canonical.startswith(pref) for pref in allowed_prefixes)
        keyword_ok = any(
            kw.lower() in (title + " " + content).lower()
            for kw in allowed_keywords
        ) if allowed_keywords else False

        if prefix_ok or keyword_ok:
            filtered_matches.append(match)
        else:
            filtered_out_log.append({
                "reason": "no_match",
                "canonical": canonical,
                "match_excerpt": (content[:80] + "...") if content else ""
            })

    logger.info(f"Matched after filtering: {len(filtered_matches)}")
    if filtered_out_log:
        logger.info(f"{len(filtered_out_log)} matches filtered out. First few: {filtered_out_log[:3]}")

    return filtered_matches
