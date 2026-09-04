/**
 * BhashaSetu - Services Section Component
 * 
 * Features:
 * - Data-driven 6-service array
 * - Quick trigger connecting to the global floating chatbot assistant
 */

(function () {
  'use strict';

  const servicesData = [
    {
      id: 1,
      icon: "📖",
      title: "Word Cards",
      description: "Colorful, illustrated flashcards with words, meanings, and scripts in tribal languages, Hindi, and English.",
      actionLabel: "Explore Flashcards ➜",
      targetId: "learning-modules"
    },
    {
      id: 2,
      icon: "🔊",
      title: "Audio Pronunciation",
      description: "Crystal clear native pronunciations recorded with local educators to help children speak naturally.",
      actionLabel: "Listen & Speak ➜",
      targetId: "learning-modules"
    },
    {
      id: 3,
      icon: "🎮",
      title: "Games & Activities",
      description: "Joyful quizzes, matching mini-games, and daily streak challenges that turn learning into playful discovery.",
      actionLabel: "Play Mini-Games ➜",
      targetId: "learning-modules"
    },
    {
      id: 4,
      icon: "🗣️",
      title: "Phrasebooks",
      description: "Everyday conversational sentences for daily life at home, in the market, and in school classrooms.",
      actionLabel: "View Phrasebook ➜",
      targetId: "translator"
    },
    {
      id: 5,
      icon: "🤝",
      title: "Community Contributions",
      description: "Teachers, linguists, and community elders can suggest new words, audio clips, and regional folklore.",
      actionLabel: "Join & Contribute ➜",
      targetId: "collaboration"
    },
    {
      id: 6,
      icon: "💬",
      title: "Ask BhashaSetu",
      description: "Interactive AI assistant helping parents, teachers, and learners explore mother-tongue lessons.",
      actionLabel: "Open Chatbot ➜",
      isChatbotTrigger: true
    }
  ];

  function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    grid.innerHTML = servicesData.map(s => `
      <article class="service-card" id="service-card-${s.id}">
        <div class="service-icon-wrap" aria-hidden="true">${s.icon}</div>
        <h3 class="service-title">${s.title}</h3>
        <p class="service-desc">${s.description}</p>
        <button type="button" class="service-action-link" data-id="${s.id}" data-target="${s.targetId || ''}" data-chat="${s.isChatbotTrigger ? 'true' : 'false'}">
          ${s.actionLabel}
        </button>
      </article>
    `).join('');

    grid.querySelectorAll('.service-action-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isChat = btn.dataset.chat === 'true';
        const targetId = btn.dataset.target;
        if (isChat && window.BhashaSetuChatbot) {
          window.BhashaSetuChatbot.open();
        } else if (targetId) {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    const bannerChatBtn = document.getElementById('servicesBannerChatBtn');
    if (bannerChatBtn) {
      bannerChatBtn.addEventListener('click', () => {
        if (window.BhashaSetuChatbot) {
          window.BhashaSetuChatbot.open();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderServices);
  } else {
    renderServices();
  }

  window.BhashaSetuServices = {
    getServices: () => [...servicesData]
  };
})();
