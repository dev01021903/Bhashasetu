/**
 * BhashaSetu - Children's Educational Platform FAQ Component
 * 
 * Features:
 * - 10 Official BhashaSetu FAQ items stored in a clean editable array
 * - Single-open accordion by default (configurable via ALLOW_MULTIPLE_OPEN)
 * - Real-time live search filter across questions and answers
 * - Empty state message: "No matching question found. Please contact support for help."
 * - Bottom Call to Action: "Still need help?" + "Contact Support" button
 * - Configurable onContactSupport callback with clear TODO for future routing
 * - WAI-ARIA accessible (aria-expanded, aria-controls, keyboard navigation)
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. CONFIGURATION & STATE
  // ==========================================================================

  /**
   * Set to true if you wish to allow multiple accordion items to remain open simultaneously.
   * Default: false (Only one question is open at a time).
   */
  let ALLOW_MULTIPLE_OPEN = false;

  /**
   * Handler for the "Contact Support" action:
   * Smoothly navigates to the Chat with Assistant section and opens the Chatbot Widget.
   */
  let onContactSupport = function () {
    console.info('[BhashaSetu FAQ] "Contact Support" clicked -> hyperlinking to Chat with Assistant section.');

    // 1. Smoothly scroll to the Chat with Assistant section
    const target = document.getElementById('chat-assistant-section') || document.getElementById('services');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Visual highlight animation on the banner
      target.style.transition = 'box-shadow 0.4s ease, transform 0.4s ease';
      target.style.boxShadow = '0 0 0 5px #FFC107, 0 12px 28px rgba(0, 0, 0, 0.25)';
      target.style.transform = 'translateY(-3px)';
      setTimeout(() => {
        target.style.boxShadow = '';
        target.style.transform = '';
      }, 2000);
    }

    // 2. Open the site-wide floating AI Assistant chatbot
    if (window.BhashaSetuChatbot && typeof window.BhashaSetuChatbot.open === 'function') {
      setTimeout(() => {
        window.BhashaSetuChatbot.open();
      }, 400);
    }
  };

  // Currently expanded question IDs
  let openItemIds = new Set();

  // Active search query
  let searchQuery = '';

  // ==========================================================================
  // 2. FAQ DATA STORE (Simple Editable Array)
  // ==========================================================================
  const faqData = [
    {
      id: 1,
      question: "What is BhashaSetu?",
      answer: "BhashaSetu is a fun learning platform that helps children explore and learn words in their mother tongue, tribal language, Hindi, and English."
    },
    {
      id: 2,
      question: "Who can use BhashaSetu?",
      answer: "BhashaSetu is designed mainly for children aged 5 to 10. Parents, teachers, and community contributors can also use it to support children’s learning."
    },
    {
      id: 3,
      question: "Which languages does BhashaSetu support?",
      answer: "The platform supports indigenous tribal and regional mother tongues: Santhali, Nagpuri, and Khortha, along with Hindi and English. Available languages may grow as community members contribute more words."
    },
    {
      id: 4,
      question: "How can my child learn using this platform?",
      answer: "Children can explore word cards, listen to pronunciations, use translations, play simple learning games, and practise a few new words every day."
    },
    {
      id: 5,
      question: "Is BhashaSetu free to use?",
      answer: "Yes. BhashaSetu is created to make mother-tongue learning more accessible and easy for children, teachers, and families."
    },
    {
      id: 6,
      question: "Can teachers or parents add new words?",
      answer: "Yes. Teachers, parents, and language contributors can suggest new words, meanings, audio pronunciations, and phrases through the contribution section."
    },
    {
      id: 7,
      question: "How does the translation feature work?",
      answer: "BhashaSetu uses a curated language-word database to find matching words and translations between local languages, Hindi, and English."
    },
    {
      id: 8,
      question: "Does the platform collect personal information from children?",
      answer: "BhashaSetu aims to collect only the minimum information required to provide learning progress and safe use of the platform. Parents or guardians should supervise account settings and permissions."
    },
    {
      id: 9,
      question: "What should I do if I find a wrong word or translation?",
      answer: "You can report it through the Support section or submit a corrected suggestion through the contributor form. Our team and language contributors can review it."
    },
    {
      id: 10,
      question: "How can I get help?",
      answer: "Open the Support section and create a help ticket. Please explain the issue clearly, and the support team will respond as soon as possible."
    }
  ];

  // ==========================================================================
  // 3. UTILITY HELPERS
  // ==========================================================================
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================================================
  // 4. RENDERING FUNCTIONS
  // ==========================================================================

  /**
   * Filter FAQ items based on search query
   */
  function getFilteredItems() {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return faqData;
    }
    return faqData.filter(item =>
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)
    );
  }

  /**
   * Render the list of FAQ accordion items or the empty state
   */
  function renderFAQList() {
    const listContainer = document.getElementById('bhashasetu-faq-list');
    const statsContainer = document.getElementById('bhashasetu-faq-stats');
    const clearBtn = document.getElementById('bhashasetu-faq-search-clear');

    if (!listContainer) return;

    const filtered = getFilteredItems();

    // Toggle clear search button visibility
    if (clearBtn) {
      clearBtn.classList.toggle('visible', searchQuery.trim().length > 0);
    }

    // Update counter stats
    if (statsContainer) {
      if (searchQuery.trim()) {
        statsContainer.textContent = `Showing ${filtered.length} of ${faqData.length} questions`;
      } else {
        statsContainer.textContent = `${faqData.length} questions available`;
      }
    }

    // Handle empty search results state
    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="bhashasetu-faq-empty-state" role="status" aria-live="polite">
          <div class="bhashasetu-faq-empty-icon" aria-hidden="true">🔍</div>
          <h3 class="bhashasetu-faq-empty-text">No matching question found. Please contact support for help.</h3>
          <p class="bhashasetu-faq-empty-subtext">Try searching for keywords like "Santali", "learn", "free", or "words", or contact our support team directly.</p>
          <button type="button" class="bhashasetu-faq-empty-cta-btn" id="bhashasetu-faq-empty-contact-btn">
            <span>💬</span> Contact Support
          </button>
        </div>
      `;

      const emptyBtn = document.getElementById('bhashasetu-faq-empty-contact-btn');
      if (emptyBtn) {
        emptyBtn.addEventListener('click', triggerContactSupport);
      }
      return;
    }

    // Build accordion markup
    listContainer.innerHTML = filtered.map(item => {
      const isOpen = openItemIds.has(item.id);
      return `
        <article class="bhashasetu-faq-item ${isOpen ? 'is-open' : ''}" id="bhashasetu-faq-item-${item.id}">
          <h3>
            <button 
              type="button" 
              class="bhashasetu-faq-trigger" 
              id="bhashasetu-faq-btn-${item.id}"
              aria-expanded="${isOpen ? 'true' : 'false'}"
              aria-controls="bhashasetu-faq-panel-${item.id}"
              data-id="${item.id}"
            >
              <div class="bhashasetu-faq-q-left">
                <span class="bhashasetu-faq-q-number" aria-hidden="true">Q${item.id}</span>
                <span class="bhashasetu-faq-q-text">${escapeHtml(item.question)}</span>
              </div>
              <span class="bhashasetu-faq-icon-wrapper" aria-hidden="true">
                <svg class="bhashasetu-faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
          </h3>
          <div 
            class="bhashasetu-faq-panel" 
            id="bhashasetu-faq-panel-${item.id}"
            role="region"
            aria-labelledby="bhashasetu-faq-btn-${item.id}"
            ${!isOpen ? 'hidden' : ''}
          >
            <div class="bhashasetu-faq-panel-inner">
              <p class="bhashasetu-faq-answer">${escapeHtml(item.answer)}</p>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click and keyboard listeners to newly rendered triggers
    const triggers = listContainer.querySelectorAll('.bhashasetu-faq-trigger');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', onTriggerClick);
      trigger.addEventListener('keydown', onTriggerKeyDown);
    });
  }

  // ==========================================================================
  // 5. ACCORDION INTERACTIONS
  // ==========================================================================

  /**
   * Toggle accordion expansion for a specific question ID
   */
  function toggleItem(id) {
    const isCurrentlyOpen = openItemIds.has(id);

    if (isCurrentlyOpen) {
      openItemIds.delete(id);
    } else {
      if (!ALLOW_MULTIPLE_OPEN) {
        // Single-open behavior: close any other open items
        openItemIds.clear();
      }
      openItemIds.add(id);
    }

    // Smoothly update DOM without re-rendering entire list
    updateAccordionDOM(id);
  }

  /**
   * Targeted DOM update for smooth CSS transitions
   */
  function updateAccordionDOM(toggledId) {
    const listContainer = document.getElementById('bhashasetu-faq-list');
    if (!listContainer) return;

    const items = listContainer.querySelectorAll('.bhashasetu-faq-item');
    items.forEach(item => {
      const btn = item.querySelector('.bhashasetu-faq-trigger');
      const panel = item.querySelector('.bhashasetu-faq-panel');
      if (!btn || !panel) return;

      const itemId = Number(btn.getAttribute('data-id'));
      const shouldBeOpen = openItemIds.has(itemId);

      btn.setAttribute('aria-expanded', shouldBeOpen ? 'true' : 'false');
      item.classList.toggle('is-open', shouldBeOpen);

      if (shouldBeOpen) {
        panel.removeAttribute('hidden');
      } else {
        // Wait for CSS grid transition before adding hidden
        setTimeout(() => {
          if (!openItemIds.has(itemId)) {
            panel.setAttribute('hidden', '');
          }
        }, 300);
      }
    });
  }

  function onTriggerClick(e) {
    const button = e.currentTarget;
    const id = Number(button.getAttribute('data-id'));
    if (id) {
      toggleItem(id);
    }
  }

  function onTriggerKeyDown(e) {
    // Keyboard navigation enhancements: Space and Enter toggle accordion
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const id = Number(e.currentTarget.getAttribute('data-id'));
      if (id) {
        toggleItem(id);
      }
    }
  }

  // ==========================================================================
  // 6. SEARCH & FILTERING
  // ==========================================================================

  function handleSearchInput(e) {
    searchQuery = e.target.value;
    renderFAQList();
  }

  function handleSearchClear() {
    const searchInput = document.getElementById('bhashasetu-faq-search-input');
    if (searchInput) {
      searchInput.value = '';
      searchQuery = '';
      searchInput.focus();
      renderFAQList();
    }
  }

  // ==========================================================================
  // 7. CONTACT SUPPORT ACTION
  // ==========================================================================

  function triggerContactSupport(e) {
    if (e) e.preventDefault();
    if (typeof onContactSupport === 'function') {
      onContactSupport();
    }
  }

  // ==========================================================================
  // 8. INITIALIZATION
  // ==========================================================================

  function initFAQ() {
    const searchInput = document.getElementById('bhashasetu-faq-search-input');
    const clearBtn = document.getElementById('bhashasetu-faq-search-clear');
    const ctaBtn = document.getElementById('bhashasetu-faq-cta-btn');

    // Attach search input listener
    if (searchInput) {
      searchInput.addEventListener('input', handleSearchInput);
    }

    // Attach search clear button listener
    if (clearBtn) {
      clearBtn.addEventListener('click', handleSearchClear);
    }

    // Attach bottom CTA button listener
    if (ctaBtn) {
      ctaBtn.addEventListener('click', triggerContactSupport);
    }

    // Initial render
    renderFAQList();
  }

  // Self-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFAQ);
  } else {
    initFAQ();
  }

  // ==========================================================================
  // 9. PUBLIC API (For easy testing, teammate modularity & configuration)
  // ==========================================================================
  window.BhashaSetuFAQ = {
    init: initFAQ,
    getFAQData: () => [...faqData],
    setAllowMultipleOpen: (allow) => {
      ALLOW_MULTIPLE_OPEN = Boolean(allow);
    },
    setContactSupportHandler: (callback) => {
      if (typeof callback === 'function') {
        onContactSupport = callback;
      }
    },
    setSearchQuery: (query) => {
      searchQuery = query;
      const searchInput = document.getElementById('bhashasetu-faq-search-input');
      if (searchInput) searchInput.value = query;
      renderFAQList();
    },
    toggleItem: toggleItem
  };
})();
