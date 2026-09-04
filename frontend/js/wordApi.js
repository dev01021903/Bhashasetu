/**
 * BhashaSetu - Word API Service
 * Connects frontend UI to the Flask CSV Word Database Backend
 * 
 * Functions:
 * - getAllWords(category, language, limit)
 * - getCategories()
 * - searchWords(query, category, language, limit)
 * - getRandomWords(category, language, count)
 * - translateWord(text, fromLanguage, toLanguage)
 */

(function () {
  'use strict';

  // Fallback to default local Flask backend URL if config.js is not loaded
  const baseUrl = (typeof API_URL !== 'undefined') ? API_URL : "http://127.0.0.1:5001";

  /**
   * Generic fetch wrapper with clean error handling
   */
  async function requestApi(endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.message || data.error || `HTTP ${res.status}: ${res.statusText}`;
        const err = new Error(errorMsg);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    } catch (err) {
      console.warn(`[WordAPI] Request to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  /**
   * Fetch words with optional category, language, and limit filters
   */
  async function getAllWords(category = "", language = "", limit = 50) {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (language) params.append("language", language);
    if (limit) params.append("limit", limit);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return requestApi(`/api/words${qs}`);
  }

  /**
   * Fetch unique, alphabetically sorted categories
   */
  async function getCategories() {
    return requestApi('/api/categories');
  }

  /**
   * Search words across local, Hindi, English, category, and language fields
   */
  async function searchWords(query, category = "", language = "", limit = 10) {
    if (!query || !query.trim()) {
      return { count: 0, words: [], query: "" };
    }
    const params = new URLSearchParams();
    params.append("q", query.trim());
    if (category && category !== "All") params.append("category", category);
    if (language) params.append("language", language);
    if (limit) params.append("limit", limit);
    return requestApi(`/api/words/search?${params.toString()}`);
  }

  /**
   * Fetch random words for flashcards, learning games, and quizzes
   */
  async function getRandomWords(category = "", language = "", count = 5) {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (language) params.append("language", language);
    if (count) params.append("count", count);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return requestApi(`/api/words/random${qs}`);
  }

  /**
   * Exact dictionary translation lookup
   * fromLanguage & toLanguage: "english" | "hindi" | "local"
   */
  async function translateWord(text, fromLanguage = "english", toLanguage = "local") {
    return requestApi('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.trim(),
        fromLanguage: fromLanguage.toLowerCase(),
        toLanguage: toLanguage.toLowerCase()
      })
    });
  }

  // Expose as global namespace
  window.WordAPI = {
    getAllWords,
    getCategories,
    searchWords,
    getRandomWords,
    translateWord,
    getBaseUrl: () => baseUrl
  };
})();
