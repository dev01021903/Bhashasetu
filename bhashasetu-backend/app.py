#!/usr/bin/env python3
"""
BhashaSetu - Python Flask Backend API
A child-friendly educational word-dictionary and learning REST API.
Reads curated word databases from CSV and serves endpoints for frontend applications.
"""

import os
import sys
import time
import random
import logging
from typing import Dict, List, Any, Optional, Tuple
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

# Configure server-side logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("bhashasetu-backend")

# ==============================================================================
# 1. FLASK APPLICATION & CORS SETUP
# ==============================================================================
app = Flask(__name__)

# Base allowed origins for local and deployed frontend environments
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Support optional FRONTEND_URL env var for deployed Vercel/Netlify frontend
frontend_env = os.getenv("FRONTEND_URL")
if frontend_env:
    for url in frontend_env.split(","):
        cleaned = url.strip()
        if cleaned and cleaned not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(cleaned)

# Enable CORS with specified allowed origins
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

# Path to the curated CSV data file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE_PATH = os.path.join(BASE_DIR, "data", "tribal_words.csv")

# In-memory CSV cache structure (TTL = 60 seconds)
_CACHE_DATA: Optional[List[Dict[str, Any]]] = None
_CACHE_TIMESTAMP: float = 0.0
CACHE_TTL_SECONDS = 60.0


# ==============================================================================
# 2. DATA LOADING & CACHING HELPERS
# ==============================================================================
def clean_str(val: Any) -> str:
    """Helper to clean string values and safely handle NaNs/nulls."""
    if val is None or pd.isna(val):
        return ""
    return str(val).strip()


def normalize_row_to_word_dict(row: pd.Series, index: int) -> Dict[str, Any]:
    """
    Normalizes a CSV row into standard BhashaSetu Word structure.
    Provides safe fallbacks for optional fields.
    """
    row_dict = row.to_dict()

    # Determine unique ID
    row_id = clean_str(row_dict.get("id"))
    if not row_id:
        row_id = str(index + 1)

    # Detect language, local_word, hindi_word, english_word
    language = clean_str(row_dict.get("language", "Santali"))
    local_word = clean_str(row_dict.get("local_word"))
    hindi_word = clean_str(row_dict.get("hindi_word"))
    english_word = clean_str(row_dict.get("english_word"))

    # Support wide multi-column header CSVs if present (e.g. columns named 'Santali', 'Nagpuri', etc.)
    if not local_word:
        for col_name in ["Santali", "Nagpuri", "Khortha", "Gondi", "Bhili", "Ho", "Mundari", "Kurukh", "local"]:
            if col_name in row_dict and clean_str(row_dict.get(col_name)):
                local_word = clean_str(row_dict.get(col_name))
                if not language:
                    language = col_name
                break

    category = clean_str(row_dict.get("category", "General"))
    if not category:
        category = "General"

    emoji = clean_str(row_dict.get("emoji", "🌟"))
    if not emoji:
        emoji = "🌟"

    audio_url = clean_str(row_dict.get("audio_url"))
    image_url = clean_str(row_dict.get("image_url"))
    difficulty = clean_str(row_dict.get("difficulty", "easy")).lower()
    if difficulty not in ["easy", "medium", "hard"]:
        difficulty = "easy"

    return {
        "id": row_id,
        "language": language,
        "local_word": local_word,
        "hindi_word": hindi_word,
        "english_word": english_word,
        "category": category,
        "emoji": emoji,
        "audio_url": audio_url,
        "image_url": image_url,
        "difficulty": difficulty
    }


def load_words_data() -> Tuple[List[Dict[str, Any]], Optional[str]]:
    """
    Loads and caches CSV word data in memory for 60 seconds.
    Returns: (list_of_words, error_message)
    """
    global _CACHE_DATA, _CACHE_TIMESTAMP

    now = time.time()
    if _CACHE_DATA is not None and (now - _CACHE_TIMESTAMP) < CACHE_TTL_SECONDS:
        return _CACHE_DATA, None

    if not os.path.exists(CSV_FILE_PATH):
        logger.error(f"CSV file not found at: {CSV_FILE_PATH}")
        return [], "Data file 'data/tribal_words.csv' is missing on the server."

    try:
        df = pd.read_csv(CSV_FILE_PATH, encoding="utf-8").fillna("")
        words_list = []
        for idx, row in df.iterrows():
            word_obj = normalize_row_to_word_dict(row, idx)
            # Only include valid rows with at least one translation word
            if word_obj["local_word"] or word_obj["english_word"] or word_obj["hindi_word"]:
                words_list.append(word_obj)

        _CACHE_DATA = words_list
        _CACHE_TIMESTAMP = now
        logger.info(f"Successfully loaded and cached {len(words_list)} words from CSV.")
        return _CACHE_DATA, None

    except Exception as exc:
        logger.exception("Error reading CSV file:")
        return [], "Unable to read word database file. Please verify CSV format."


def filter_words(
    words: List[Dict[str, Any]],
    category: Optional[str] = None,
    language: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Filters a list of word dictionaries by optional category and language."""
    filtered = words
    if category:
        cat_clean = category.strip().lower()
        filtered = [w for w in filtered if w["category"].lower() == cat_clean]

    if language:
        lang_clean = language.strip().lower()
        filtered = [w for w in filtered if w["language"].lower() == lang_clean]

    return filtered


def validate_int_param(val: Any, default: int, min_val: int, max_val: int) -> int:
    """Validates an integer query parameter with safe min/max clamping."""
    if val is None:
        return default
    try:
        parsed = int(val)
        return max(min_val, min(max_val, parsed))
    except (ValueError, TypeError):
        return default


# ==============================================================================
# 3. API ENDPOINTS
# ==============================================================================

@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint.
    GET /health
    """
    return jsonify({
        "status": "ok",
        "message": "BhashaSetu backend is running"
    }), 200


@app.route("/api/words", methods=["GET"])
def get_words():
    """
    Get all words with optional category, language, and limit filters.
    GET /api/words?category=Animals&language=Santali&limit=50
    """
    words, err = load_words_data()
    if err:
        return jsonify({"error": err, "words": [], "count": 0}), 500

    category = request.args.get("category")
    language = request.args.get("language")
    limit = validate_int_param(request.args.get("limit"), default=50, min_val=1, max_val=100)

    filtered = filter_words(words, category=category, language=language)
    limited = filtered[:limit]

    return jsonify({
        "count": len(limited),
        "words": limited
    }), 200


@app.route("/api/words/search", methods=["GET"])
def search_words():
    """
    Live case-insensitive search across words, categories, and languages.
    GET /api/words/search?q=dog&category=Animals&limit=10
    """
    words, err = load_words_data()
    if err:
        return jsonify({"error": err, "words": [], "count": 0}), 500

    query = clean_str(request.args.get("q"))
    if not query:
        return jsonify({
            "count": 0,
            "words": [],
            "message": "Please provide a search query using '?q=keyword'"
        }), 200

    category = request.args.get("category")
    language = request.args.get("language")
    limit = validate_int_param(request.args.get("limit"), default=10, min_val=1, max_val=20)

    # First apply category/language filters if provided
    candidates = filter_words(words, category=category, language=language)

    # Perform multi-field case-insensitive search
    q_lower = query.lower()
    results = []
    for w in candidates:
        if (
            q_lower in w["local_word"].lower()
            or q_lower in w["hindi_word"].lower()
            or q_lower in w["english_word"].lower()
            or q_lower in w["category"].lower()
            or q_lower in w["language"].lower()
        ):
            results.append(w)

    limited = results[:limit]

    return jsonify({
        "count": len(limited),
        "query": query,
        "words": limited
    }), 200


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """
    Get unique, alphabetically sorted categories.
    GET /api/categories
    """
    words, err = load_words_data()
    if err:
        return jsonify({"error": err, "categories": []}), 500

    categories = sorted(list({w["category"] for w in words if w["category"]}))
    return jsonify({
        "categories": categories
    }), 200


@app.route("/api/words/random", methods=["GET"])
def get_random_words():
    """
    Get randomly selected words for learning games and mini-quizzes.
    GET /api/words/random?category=Animals&count=5
    """
    words, err = load_words_data()
    if err:
        return jsonify({"error": err, "words": [], "count": 0}), 500

    category = request.args.get("category")
    language = request.args.get("language")
    count = validate_int_param(request.args.get("count"), default=5, min_val=1, max_val=10)

    candidates = filter_words(words, category=category, language=language)
    if not candidates:
        return jsonify({
            "count": 0,
            "words": [],
            "message": "No words found matching the specified filters."
        }), 200

    selected_count = min(count, len(candidates))
    random_sample = random.sample(candidates, selected_count)

    return jsonify({
        "count": len(random_sample),
        "words": random_sample
    }), 200


@app.route("/api/translate", methods=["POST"])
def translate_lookup():
    """
    Dictionary translation lookup endpoint.
    POST /api/translate
    Body:
    {
      "text": "dog",
      "fromLanguage": "english",
      "toLanguage": "local"
    }
    """
    if not request.is_json:
        return jsonify({
            "error": "Request body must be valid JSON with 'Content-Type: application/json'."
        }), 400

    data = request.get_json() or {}
    text = clean_str(data.get("text"))
    from_lang = clean_str(data.get("fromLanguage")).lower()
    to_lang = clean_str(data.get("toLanguage")).lower()

    if not text:
        return jsonify({
            "error": "Missing required field: 'text'."
        }), 400

    valid_langs = ["local", "hindi", "english"]
    if from_lang not in valid_langs or to_lang not in valid_langs:
        return jsonify({
            "error": f"Invalid language parameters. Allowed values: {valid_langs}."
        }), 400

    words, err = load_words_data()
    if err:
        return jsonify({"error": err, "found": False}), 500

    # Field mapping
    lang_to_field = {
        "local": "local_word",
        "hindi": "hindi_word",
        "english": "english_word"
    }

    from_field = lang_to_field[from_lang]
    to_field = lang_to_field[to_lang]

    # Search for an exact match (case-insensitive, ignoring surrounding whitespace)
    text_lower = text.lower()
    matched_word = None

    for w in words:
        source_val = w[from_field].strip().lower()
        if source_val == text_lower or text_lower in source_val.split():
            matched_word = w
            break

    if not matched_word:
        return jsonify({
            "found": False,
            "message": "We do not know this word yet. Please try another word."
        }), 404

    target_translation = matched_word[to_field]

    return jsonify({
        "found": True,
        "input": text,
        "translation": target_translation,
        "word": matched_word
    }), 200


# ==============================================================================
# 4. GLOBAL ERROR HANDLERS
# ==============================================================================

@app.errorhandler(404)
def handle_404(e):
    return jsonify({
        "error": "Endpoint not found. Please check API documentation."
    }), 404


@app.errorhandler(405)
def handle_405(e):
    return jsonify({
        "error": "HTTP Method not allowed for this route."
    }), 405


@app.errorhandler(500)
def handle_500(e):
    logger.exception("Internal Server Error occurred:")
    return jsonify({
        "error": "An internal server error occurred. Please try again later."
    }), 500


# ==============================================================================
# 5. SERVER ENTRYPOINT
# ==============================================================================
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug_mode = os.getenv("FLASK_DEBUG", "True").lower() in ["true", "1", "t"]
    print("=" * 60)
    print(">> BhashaSetu Flask Backend API (CSV Word Database)")
    print(f">> Server running at: http://127.0.0.1:{port}")
    print(f">> Loaded CSV database: {CSV_FILE_PATH}")
    print("=" * 60)
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
