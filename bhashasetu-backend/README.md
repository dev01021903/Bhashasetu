# 🦜 BhashaSetu Backend API

A lightweight, production-ready Python Flask REST API for **BhashaSetu** (Smart India Hackathon).
Serves curated tribal and vernacular mother-tongue words (Santali, Nagpuri, Khortha, etc.) from an in-memory cached CSV database for child-friendly learning games, word cards, flashcards, search, and translation lookup.

---

## 📁 Folder Structure

```text
bhashasetu-backend/
├── app.py                  # Main Flask REST API application
├── requirements.txt        # Python dependency specifications
├── .gitignore              # Git ignore configuration
├── README.md               # Backend API documentation
└── data/
    └── tribal_words.csv    # Curated word database CSV file
```

---

## 🚀 Getting Started Locally

### 1. Create and Activate a Virtual Environment

```bash
cd bhashasetu-backend
python3 -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Backend API

```bash
python app.py
```

The API will start locally on: **`http://127.0.0.1:5000`**

---

## 📡 API Endpoints & Examples

### 1. Health Check
- **`GET /health`**
- Returns the operational status of the backend API.
```json
{
  "status": "ok",
  "message": "BhashaSetu backend is running"
}
```

### 2. Get All Words
- **`GET /api/words`**
- Optional Query Parameters:
  - `category`: Filter by category (e.g. `Animals`, `Nature`, `Food`)
  - `language`: Filter by language (e.g. `Santali`, `Nagpuri`, `Khortha`)
  - `limit`: Number of items (default `50`, maximum `100`)
- Example: `http://127.0.0.1:5000/api/words?category=Animals&language=Santali&limit=10`

### 3. Search Words
- **`GET /api/words/search?q=...`**
- Case-insensitive search across `local_word`, `hindi_word`, `english_word`, `category`, and `language`.
- Example: `http://127.0.0.1:5000/api/words/search?q=dog`
- Example with filter: `http://127.0.0.1:5000/api/words/search?q=water&category=Daily+Life`

### 4. Get Unique Categories
- **`GET /api/categories`**
- Returns sorted unique categories from the CSV database.
```json
{
  "categories": ["Actions", "Animals", "Daily Life", "Family", "Food", "Greetings", "Nature", "Numbers", "School"]
}
```

### 5. Random Words for Learning Games
- **`GET /api/words/random`**
- Randomly samples words for quizzes, matching games, and daily flashcards.
- Optional Query Parameters: `category`, `language`, `count` (default `5`, min `1`, max `10`).
- Example: `http://127.0.0.1:5000/api/words/random?category=Animals&count=4`

### 6. Dictionary Translation Lookup
- **`POST /api/translate`**
- Looks up exact matches across `english`, `hindi`, or `local` words.
- Request Body:
```json
{
  "text": "dog",
  "fromLanguage": "english",
  "toLanguage": "local"
}
```
- cURL Command:
```bash
curl -X POST http://127.0.0.1:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"dog","fromLanguage":"english","toLanguage":"local"}'
```
- Successful Response:
```json
{
  "found": true,
  "input": "dog",
  "translation": "ᱥᱮᱛᱟ (Seta)",
  "word": {
    "id": "4",
    "language": "Santali",
    "local_word": "ᱥᱮᱛᱟ (Seta)",
    "hindi_word": "कुत्ता",
    "english_word": "Dog",
    "category": "Animals",
    "emoji": "🐶",
    "audio_url": "",
    "image_url": "assets/words/dog.png",
    "difficulty": "easy"
  }
}
```

---

## 📊 CSV Database Columns

The CSV file located at `data/tribal_words.csv` uses the following canonical headers:

| Column | Required | Description | Example |
|---|---|---|---|
| `id` | Yes | Unique ID | `1` |
| `language` | Yes | Target mother tongue | `Santali` |
| `local_word` | Yes | Word in mother tongue & script | `ᱥᱮᱛᱟ (Seta)` |
| `hindi_word` | Yes | Hindi translation | `कुत्ता` |
| `english_word` | Yes | English word | `Dog` |
| `category` | Yes | Learning category | `Animals` |
| `emoji` | Optional | Visual child emoji | `🐶` |
| `audio_url` | Optional | Path/URL to pronunciation audio | `assets/audio/dog.mp3` |
| `image_url` | Optional | Path/URL to illustration image | `assets/words/dog.png` |
| `difficulty` | Optional | `easy`, `medium`, `hard` | `easy` |

> 🔒 *Note on Datasets: The bundled demo CSV contains foundational primary vocabulary. For large-scale production datasets, external object storage (e.g. S3 / Cloud Storage) can be plugged in.*

---

## 🔗 Connecting Frontend Applications

Frontend apps (e.g., React/Vite/Next.js/Vanilla) can configure their API client using environment variables:

```bash
# In frontend .env:
VITE_API_URL=http://127.0.0.1:5000
```

---

## ☁️ Deployment (Render / Railway / Cloud)

Run with **Gunicorn** in production:

```bash
gunicorn -w 2 -b 0.0.0.0:$PORT app:app
```

The frontend can be deployed independently on **Vercel** or **Netlify** while this Flask backend runs on **Render** or **Railway**.
