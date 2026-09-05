/**
 * BhashaSetu - Site-Wide Floating Chatbot Widget (Mocked AI Assistant)
 * 
 * Features:
 * - Rule-based keyword matching mock response engine
 * - Navigation & page discovery help
 * - Realistic short typing indicator (500ms delay)
 * - Quick prompt chips
 * - Full ARIA live region accessibility & screen-reader honesty disclosure
 * - Public API: window.BhashaSetuChatbot (open, close, toggle, send)
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. MOCK RESPONSE ENGINE
  // ==========================================================================
  const mockResponses = [
    {
      keywords: ["language", "languages", "tribal", "vernacular", "mother tongue", "dialect", "supported", "which language"],
      response: "BhashaSetu is designed to support tribal and regional mother tongues: Santhali, Nagpuri, and Khortha, alongside Hindi and English! 🌿"
    },
    {
      keywords: ["santali", "santhali", "ol chiki", "olchiki"],
      response: "Santhali (ᱥᱟᱱᱛᱟᱲᱤ) uses the beautiful Ol Chiki script. You can explore Santhali word cards, listen to native audio, and read folklore stories right here on BhashaSetu! 🌾"
    },
    {
      keywords: ["nagpuri", "sadri"],
      response: "Nagpuri (नागपुरी / Sadri) is an important regional language. You can explore Nagpuri word cards, interactive translations, and audio pronunciations right here on BhashaSetu! 🌸"
    },
    {
      keywords: ["khortha", "khotta"],
      response: "Khortha (खोरठा) is a vibrant regional language. You can explore Khortha word cards, conversational phrases, and translations right here on BhashaSetu! 🌻"
    },
    {
      keywords: ["word card", "word cards", "card", "flashcard", "vocabulary", "vocab"],
      response: "Word Cards are colorful picture flashcards showing words, native scripts, meanings, and audio in your mother tongue! Check them out in the Learning Zones section. 📖"
    },
    {
      keywords: ["audio", "listen", "pronunciation", "voice", "speak", "sound"],
      response: "You can hear crystal-clear native pronunciation recorded by community educators to practise speaking words with authentic tone and joy! 🔊"
    },
    {
      keywords: ["game", "games", "play", "quiz", "activity", "match", "puzzle"],
      response: "We have joyful mini-games like 'Vernacular Word Match' and daily streak challenges to make mother-tongue learning exciting for kids! 🎮"
    },
    {
      keywords: ["phrasebook", "phrase", "sentence", "conversation", "chat"],
      response: "Our phrasebooks provide real everyday conversational sentences for home, school, and market interactions between friends! 🗣️"
    },
    {
      keywords: ["contribute", "community", "add word", "teacher", "parent", "suggest"],
      response: "Teachers, parents, and community linguists can suggest new words, audio recordings, and cultural folklore stories to help our language library grow! 🤝"
    },
    {
      keywords: ["about", "about bhashasetu", "who are you", "mission", "vision", "what is bhashasetu"],
      response: "BhashaSetu is a Smart India Hackathon platform for children aged 5–10, building a digital bridge between indigenous mother tongues, Hindi, and English! You can check out our About section above. 🌟"
    },
    {
      keywords: ["services", "service", "what do you offer", "features"],
      response: "BhashaSetu offers Word Cards, Audio Pronunciation, Mini-Games, Phrasebooks, Community Contribution, and this AI Assistant! Explore the Services section to learn more. ✨"
    },
    {
      keywords: ["faq", "question", "help", "support", "ticket", "issue", "problem"],
      response: "Have a question? Check out our Frequently Asked Questions (FAQ) section at the bottom, or reach out to support@bhashasetu.org! ❓"
    },
    {
      keywords: ["story", "stories", "story corner", "folklore", "rabbit", "lion"],
      response: "Visit our 'Vernacular Story Corner' to read and listen to cultural tales like 'The Clever Rabbit & The Lion' in your native language! 📚"
    },
    {
      keywords: ["translator", "translation", "translate", "studio"],
      response: "Our Vernacular Translation Studio lets you type any sentence in Hindi/English and translates it instantly into indigenous tribal mother tongues! 🌐"
    },
    {
      keywords: ["hello", "hi", "hey", "namaste", "johar", "greetings"],
      response: "Johar & Namaste! 👋 I'm the BhashaSetu Assistant. Ask me anything about languages, word cards, games, stories, or how to get started!"
    },
    {
      keywords: ["thank", "thanks", "dhanyabad", "shukriya"],
      response: "You're very welcome! Keep exploring and learning joyfully in your mother tongue! ⭐"
    }
  ];

  const fallbackResponse = "That's a wonderful question! I'm a pre-scripted demo assistant for this SIH preview. Try asking me about 'languages', 'word cards', 'games', 'story corner', or 'about BhashaSetu'!";

  /**
   * Match user text against keywords
   * 
   * TODO: Replace this mock matcher with a real LLM / AI API endpoint once a backend service is connected.
   * Signature: async function getBotResponse(userMessage): Promise<string>
   */
  async function getBotResponse(userMessage) {
    const clean = userMessage.toLowerCase().trim();
    for (const item of mockResponses) {
      if (item.keywords.some(k => clean.includes(k))) {
        return item.response;
      }
    }
    return fallbackResponse;
  }

  // ==========================================================================
  // 2. STATE & DOM CREATION
  // ==========================================================================
  let isOpen = false;
  let isTyping = false;

  function createChatbotDOM() {
    if (document.getElementById('bhashasetu-chatbot-root')) return;

    const root = document.createElement('div');
    root.id = 'bhashasetu-chatbot-root';
    root.className = 'bhashasetu-chatbot-root';

    root.innerHTML = `
      <!-- Screen Reader Disclosure -->
      <span class="sr-only">BhashaSetu assistant — responses are pre-scripted for this preview.</span>

      <!-- Floating Trigger Button -->
      <button 
        type="button" 
        id="bhashasetuChatbotToggle" 
        class="bhashasetu-chatbot-toggle" 
        aria-label="Open BhashaSetu AI Assistant"
        aria-expanded="false"
        aria-controls="bhashasetuChatbotPanel"
      >
        <span id="chatbotToggleIcon" aria-hidden="true">💬</span>
        <span class="bhashasetu-chatbot-badge-ping" aria-hidden="true"></span>
      </button>

      <!-- Chat Panel -->
      <div 
        id="bhashasetuChatbotPanel" 
        class="bhashasetu-chatbot-panel" 
        role="dialog" 
        aria-labelledby="chatbotPanelTitle" 
        aria-hidden="true"
      >
        <!-- Header -->
        <div class="bhashasetu-chatbot-header">
          <div class="bhashasetu-chatbot-header-info">
            <div class="bhashasetu-chatbot-avatar" aria-hidden="true">🦜</div>
            <div>
              <h3 class="bhashasetu-chatbot-title" id="chatbotPanelTitle">BhashaSetu Assistant</h3>
              <div class="bhashasetu-chatbot-status">
                <span>🟢</span> Online • Demo Helper
              </div>
            </div>
          </div>
          <button type="button" id="bhashasetuChatbotClose" class="bhashasetu-chatbot-close-btn" aria-label="Close assistant">✕</button>
        </div>

        <!-- Quick Chips -->
        <div class="bhashasetu-chatbot-quick-chips" role="group" aria-label="Quick topic suggestions">
          <button type="button" class="bhashasetu-chip-btn" data-query="Which languages are supported?">🌍 Languages</button>
          <button type="button" class="bhashasetu-chip-btn" data-query="Tell me about Word Cards">📖 Word Cards</button>
          <button type="button" class="bhashasetu-chip-btn" data-query="What games can I play?">🎮 Games</button>
          <button type="button" class="bhashasetu-chip-btn" data-query="How can teachers contribute?">🤝 Contribute</button>
          <button type="button" class="bhashasetu-chip-btn" data-query="What is BhashaSetu?">❓ About</button>
        </div>

        <!-- Messages Log -->
        <div 
          id="bhashasetuChatbotMessages" 
          class="bhashasetu-chatbot-messages" 
          role="log" 
          aria-live="polite" 
          aria-atomic="false"
        >
          <div class="bhashasetu-chat-msg bot">
            <div class="bhashasetu-chat-bubble">
              Johar & Namaste! 👋 I am your BhashaSetu learning helper. Ask me about our tribal languages, word cards, games, or stories!
            </div>
            <span class="bhashasetu-chat-time">Just now</span>
          </div>
        </div>

        <!-- Input Bar -->
        <form id="bhashasetuChatbotForm" class="bhashasetu-chatbot-input-row" onsubmit="return false;">
          <label for="bhashasetuChatbotInput" class="sr-only">Ask a question</label>
          <input 
            type="text" 
            id="bhashasetuChatbotInput" 
            class="bhashasetu-chatbot-input" 
            placeholder="Ask about languages, cards, games..." 
            autocomplete="off"
            spellcheck="false"
          />
          <button type="submit" id="bhashasetuChatbotSend" class="bhashasetu-chatbot-send-btn" aria-label="Send message">
            ➤
          </button>
        </form>

        <!-- Low-Emphasis Honest Footer Note -->
        <div class="bhashasetu-chatbot-disclosure">
          Demo assistant • Pre-scripted responses for SIH preview
        </div>
      </div>
    `;

    document.body.appendChild(root);

    // Event listeners
    const toggleBtn = document.getElementById('bhashasetuChatbotToggle');
    const closeBtn = document.getElementById('bhashasetuChatbotClose');
    const form = document.getElementById('bhashasetuChatbotForm');
    const input = document.getElementById('bhashasetuChatbotInput');
    const chips = root.querySelectorAll('.bhashasetu-chip-btn');

    toggleBtn.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', closeChatbot);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserSubmit();
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (query) {
          sendUserMessage(query);
        }
      });
    });
  }

  // ==========================================================================
  // 3. ACTIONS & UI RENDERING
  // ==========================================================================
  function toggleChatbot() {
    if (isOpen) {
      closeChatbot();
    } else {
      openChatbot();
    }
  }

  function openChatbot() {
    isOpen = true;
    const panel = document.getElementById('bhashasetuChatbotPanel');
    const toggleBtn = document.getElementById('bhashasetuChatbotToggle');
    const icon = document.getElementById('chatbotToggleIcon');
    const input = document.getElementById('bhashasetuChatbotInput');

    if (panel) {
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
    }
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
    if (icon) {
      icon.textContent = '✕';
    }
    if (input) {
      setTimeout(() => input.focus(), 150);
    }
  }

  function closeChatbot() {
    isOpen = false;
    const panel = document.getElementById('bhashasetuChatbotPanel');
    const toggleBtn = document.getElementById('bhashasetuChatbotToggle');
    const icon = document.getElementById('chatbotToggleIcon');

    if (panel) {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    }
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
    if (icon) {
      icon.textContent = '💬';
    }
  }

  function handleUserSubmit() {
    const input = document.getElementById('bhashasetuChatbotInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendUserMessage(text);
  }

  function sendUserMessage(text) {
    if (isTyping) return;
    appendMessage(text, 'user');

    // Show typing animation
    showTypingIndicator();

    // Simulate short conversational delay (500ms)
    setTimeout(async () => {
      removeTypingIndicator();
      const reply = await getBotResponse(text);
      appendMessage(reply, 'bot');
    }, 550);
  }

  function appendMessage(text, sender) {
    const container = document.getElementById('bhashasetuChatbotMessages');
    if (!container) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `bhashasetu-chat-msg ${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'bhashasetu-chat-bubble';
    bubble.textContent = text;

    const time = document.createElement('span');
    time.className = 'bhashasetu-chat-time';
    time.textContent = 'Just now';

    msgDiv.appendChild(bubble);
    msgDiv.appendChild(time);
    container.appendChild(msgDiv);

    container.scrollTop = container.scrollHeight;
  }

  function showTypingIndicator() {
    isTyping = true;
    const container = document.getElementById('bhashasetuChatbotMessages');
    if (!container) return;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'bhashasetuTypingIndicator';
    typingDiv.className = 'bhashasetu-chat-msg bot';
    typingDiv.innerHTML = `
      <div class="bhashasetu-chat-typing" aria-label="BhashaSetu is typing...">
        <div class="bhashasetu-typing-dot"></div>
        <div class="bhashasetu-typing-dot"></div>
        <div class="bhashasetu-typing-dot"></div>
      </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  }

  function removeTypingIndicator() {
    isTyping = false;
    const indicator = document.getElementById('bhashasetuTypingIndicator');
    if (indicator) indicator.remove();
  }

  // ==========================================================================
  // 4. INITIALIZATION
  // ==========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbotDOM);
  } else {
    createChatbotDOM();
  }

  // Public API
  window.BhashaSetuChatbot = {
    open: openChatbot,
    close: closeChatbot,
    toggle: toggleChatbot,
    sendMessage: sendUserMessage
  };
})();
