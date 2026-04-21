"""
Translation Service (Kannada -> English)
========================================
Lightweight, dependency-free translator used by the recommendation and
notification flows so the existing /ml_pipeline package keeps receiving
English keywords (it is NOT modified).

Behaviour:
- Loads dataset/translation_kn_en.json once.
- Detects Kannada by Unicode block (U+0C80..U+0CFF).
- Replaces every Kannada token found in the input with its English mapping.
- Tokens not in the dictionary are dropped (fallback: returns original
  string if NOTHING matched, so English queries pass through untouched).
"""

from __future__ import annotations

import json
import os
import re
from typing import Dict, Optional, Tuple

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_PROJECT_ROOT = os.path.dirname(_BACKEND_DIR)
_DICT_PATH = os.path.join(_PROJECT_ROOT, "dataset", "translation_kn_en.json")

_KN_RE = re.compile(r"[\u0C80-\u0CFF]+")
_dict_cache: Optional[Dict[str, str]] = None


def _load_dict() -> Dict[str, str]:
    global _dict_cache
    if _dict_cache is None:
        if os.path.exists(_DICT_PATH):
            with open(_DICT_PATH, "r", encoding="utf-8") as fh:
                _dict_cache = json.load(fh)
        else:
            _dict_cache = {}
    return _dict_cache


def is_kannada(text: Optional[str]) -> bool:
    if not text:
        return False
    return bool(_KN_RE.search(text))


def translate_kn_to_en(text: Optional[str]) -> str:
    """Translate Kannada tokens in `text` to English using the dictionary.

    English text passes through unchanged. Multi-word Kannada phrases are
    matched first (longest-key-first) so 'ಹಿರಿಯ ನಾಗರಿಕ' wins over 'ನಾಗರಿಕ'.
    """
    if not text:
        return text or ""
    if not is_kannada(text):
        return text

    mapping = _load_dict()
    result = text
    # Longest keys first to greedily match phrases.
    for kn in sorted(mapping.keys(), key=len, reverse=True):
        if kn in result:
            result = result.replace(kn, f" {mapping[kn]} ")

    # Collapse whitespace and strip remaining Kannada chars.
    result = _KN_RE.sub(" ", result)
    result = re.sub(r"\s+", " ", result).strip()
    return result or text


def translate_profile(profile: Optional[Dict]) -> Tuple[Optional[Dict], Dict[str, str]]:
    """Return (english_profile, original_kn_fields).

    Only `occupation` and `category` are translated, per spec. Original
    Kannada values are preserved separately so the caller can persist
    both `occupation_original` and `occupation_en`.
    """
    if not profile:
        return profile, {}

    originals: Dict[str, str] = {}
    out = dict(profile)
    for field in ("occupation", "category"):
        val = out.get(field)
        if isinstance(val, str) and is_kannada(val):
            originals[field] = val
            out[field] = translate_kn_to_en(val)
    return out, originals
