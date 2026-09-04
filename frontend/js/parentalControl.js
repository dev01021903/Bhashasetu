/**
 * BhashaSetu - Parental & Teacher Controls Engine
 * Manages Parent PIN Lock, Child Learning Goals, Community Safety & Privacy Settings.
 * 
 * DEMO ONLY: Replace localStorage PIN storage with server-side hashed PIN verification in production.
 * TODO: Implement secure backend/Firebase PIN reset and hashed PIN verification.
 * TODO: Connect learning progress tracker with live backend analytics and Firebase events.
 */

(function () {
  'use strict';

  // LocalStorage Namespace Key
  const STORAGE_KEY = 'bhashasetu_parental_controls_demo';

  /**
   * Default initial settings schema
   */
  function getDefaultSettings() {
    return {
      pin: '', // DEMO ONLY: Replace localStorage PIN storage with server-side hashed PIN verification in production.
      childProfile: {
        name: 'Aarav',
        ageGroup: '5-7',
        preferredLanguage: 'Santhali'
      },
      progress: {
        wordsLearned: 28,
        wordsLearnedToday: 3,
        quizScore: 8,
        quizTotal: 10,
        streakDays: 4,
        categoriesExplored: ['Animals', 'Colours', 'School']
      },
      controls: {
        dailyWordGoal: 5,
        communityEnabled: false
      }
    };
  }

  /**
   * Defensive Settings Loader
   */
  function getSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultSettings();
      const parsed = JSON.parse(raw);
      const defaults = getDefaultSettings();

      // Deep merge with defaults to ensure schema consistency
      return {
        pin: typeof parsed.pin === 'string' ? parsed.pin : defaults.pin,
        childProfile: { ...defaults.childProfile, ...(parsed.childProfile || {}) },
        progress: { ...defaults.progress, ...(parsed.progress || {}) },
        controls: { ...defaults.controls, ...(parsed.controls || {}) }
      };
    } catch (err) {
      console.warn('[ParentalControl] Corrupt localStorage data, using defaults:', err);
      return getDefaultSettings();
    }
  }

  /**
   * Save Settings to localStorage
   */
  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('[ParentalControl] Failed to save settings to localStorage:', err);
    }
  }

  /**
   * Helper state updates
   */
  function updateProfile(profile) {
    const settings = getSettings();
    settings.childProfile = { ...settings.childProfile, ...profile };
    saveSettings(settings);
    return settings;
  }

  function updateDailyGoal(goal) {
    const settings = getSettings();
    settings.controls.dailyWordGoal = Number(goal) || 5;
    saveSettings(settings);
    return settings;
  }

  function updateCommunityAccess(enabled) {
    const settings = getSettings();
    settings.controls.communityEnabled = Boolean(enabled);
    saveSettings(settings);
    syncCommunitySectionState();
    return settings;
  }

  function clearLearningProgress() {
    const settings = getSettings();
    settings.progress = {
      wordsLearned: 0,
      wordsLearnedToday: 0,
      quizScore: 0,
      quizTotal: 0,
      streakDays: 0,
      categoriesExplored: []
    };
    saveSettings(settings);
    return settings;
  }

  function isCommunityEnabled() {
    const settings = getSettings();
    return Boolean(settings.controls && settings.controls.communityEnabled === true);
  }

  /* ==========================================================================
     UI Modal Creation & View Rendering
     ========================================================================== */

  let modalBackdrop = null;
  let currentModalView = 'lock'; // 'create-pin' | 'unlock-pin' | 'dashboard' | 'edit-profile'
  let isEditingProfile = false;
  let isConfirmingClear = false;

  function ensureModalExists() {
    if (modalBackdrop) return modalBackdrop;

    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'parentModalBackdrop';
    modalBackdrop.className = 'story-modal-backdrop';
    modalBackdrop.setAttribute('role', 'dialog');
    modalBackdrop.setAttribute('aria-modal', 'true');
    modalBackdrop.setAttribute('aria-labelledby', 'parentModalTitle');

    modalBackdrop.innerHTML = `
      <div class="parent-modal-window" id="parentModalWindow">
        <div class="parent-modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">🔐</span>
            <h3 id="parentModalTitle">Parent / Teacher Area</h3>
          </div>
          <button class="modal-close-btn" id="closeParentModalBtn" aria-label="Close Parent Area">✕</button>
        </div>
        <div class="parent-modal-body" id="parentModalBody">
          <!-- Dynamic View Injected Here -->
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    // Event listeners
    const closeBtn = modalBackdrop.querySelector('#closeParentModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeParentArea);

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeParentArea();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('show')) {
        closeParentArea();
      }
    });

    return modalBackdrop;
  }

  function openParentArea() {
    ensureModalExists();
    const settings = getSettings();
    isEditingProfile = false;
    isConfirmingClear = false;

    if (!settings.pin || settings.pin.trim().length !== 4) {
      renderCreatePinView();
    } else {
      renderUnlockPinView();
    }

    modalBackdrop.classList.add('show');
    if (typeof playSparkleSound === 'function') playSparkleSound();
  }

  function closeParentArea() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('show');
    }
  }

  /* --------------------------------------------------------------------------
     View 1: Create 4-digit PIN (First-time Parent Flow)
     -------------------------------------------------------------------------- */
  function renderCreatePinView() {
    currentModalView = 'create-pin';
    const body = document.getElementById('parentModalBody');
    const title = document.getElementById('parentModalTitle');
    if (title) title.textContent = 'Parent / Teacher Setup';

    body.innerHTML = `
      <div class="pin-view-container">
        <div class="pin-mascot-badge">🛡️</div>
        <h4 class="pin-view-title">Create Parent PIN</h4>
        <p class="pin-view-subtitle">Create a 4-digit PIN to protect parent settings, learning goals, and community permissions.</p>

        <form id="createPinForm" class="pin-inputs-stack" onsubmit="return false;">
          <div class="pin-field-group">
            <label for="newParentPin">Enter 4-digit PIN:</label>
            <input 
              type="password" 
              id="newParentPin" 
              class="pin-digit-input" 
              maxlength="4" 
              inputmode="numeric" 
              pattern="[0-9]*" 
              placeholder="••••" 
              autocomplete="new-password"
              required 
            />
          </div>

          <div class="pin-field-group">
            <label for="confirmParentPin">Confirm 4-digit PIN:</label>
            <input 
              type="password" 
              id="confirmParentPin" 
              class="pin-digit-input" 
              maxlength="4" 
              inputmode="numeric" 
              pattern="[0-9]*" 
              placeholder="••••" 
              autocomplete="new-password"
              required 
            />
          </div>

          <p class="pin-feedback-msg" id="pinFeedbackMsg" aria-live="polite"></p>

          <button type="submit" class="btn btn-primary btn-bounce pin-action-btn" id="btnSavePin">
            <span>💾</span> Save PIN & Enter Dashboard
          </button>
        </form>
      </div>
    `;

    const form = document.getElementById('createPinForm');
    const pin1 = document.getElementById('newParentPin');
    const pin2 = document.getElementById('confirmParentPin');
    const feedback = document.getElementById('pinFeedbackMsg');

    pin1.focus();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val1 = pin1.value.trim();
      const val2 = pin2.value.trim();

      if (!/^\d{4}$/.test(val1)) {
        feedback.textContent = 'Please enter a 4-digit PIN.';
        feedback.className = 'pin-feedback-msg';
        pin1.focus();
        if (typeof playTone === 'function') playTone(280, 'sawtooth', 0.2);
        return;
      }

      if (val1 !== val2) {
        feedback.textContent = 'The two PINs do not match. Please try again.';
        feedback.className = 'pin-feedback-msg';
        pin2.value = '';
        pin2.focus();
        if (typeof playTone === 'function') playTone(280, 'sawtooth', 0.2);
        return;
      }

      // Save PIN in settings
      // DEMO ONLY: Replace localStorage PIN storage with server-side hashed PIN verification in production.
      const settings = getSettings();
      settings.pin = val1;
      saveSettings(settings);

      feedback.textContent = 'PIN saved successfully! Loading dashboard... ✨';
      feedback.className = 'pin-feedback-msg success';
      if (typeof playSuccessChime === 'function') playSuccessChime();

      setTimeout(() => {
        renderDashboardView();
      }, 500);
    });
  }

  /* --------------------------------------------------------------------------
     View 2: Unlock PIN (Returning Parent Flow)
     -------------------------------------------------------------------------- */
  function renderUnlockPinView() {
    currentModalView = 'unlock-pin';
    const body = document.getElementById('parentModalBody');
    const title = document.getElementById('parentModalTitle');
    if (title) title.textContent = 'Parent / Teacher Area 🔐';

    body.innerHTML = `
      <div class="pin-view-container">
        <div class="pin-mascot-badge">🔐</div>
        <h4 class="pin-view-title">Parent / Teacher Area 🔐</h4>
        <p class="pin-view-subtitle">Enter your 4-digit PIN to continue to the dashboard.</p>

        <form id="unlockPinForm" class="pin-inputs-stack" onsubmit="return false;">
          <div class="pin-field-group">
            <label for="unlockParentPin">4-digit PIN:</label>
            <input 
              type="password" 
              id="unlockParentPin" 
              class="pin-digit-input" 
              maxlength="4" 
              inputmode="numeric" 
              pattern="[0-9]*" 
              placeholder="••••" 
              autocomplete="current-password"
              required 
            />
          </div>

          <p class="pin-feedback-msg" id="unlockFeedbackMsg" aria-live="polite"></p>

          <button type="submit" class="btn btn-primary btn-bounce pin-action-btn" id="btnUnlockDashboard">
            <span>🔓</span> Unlock Dashboard
          </button>

          <!-- Non-functional / Demo text link with TODO comment -->
          <button type="button" class="pin-forgot-link" id="btnForgotPin">
            Forgot PIN?
          </button>
        </form>
      </div>
    `;

    const form = document.getElementById('unlockPinForm');
    const pinInput = document.getElementById('unlockParentPin');
    const feedback = document.getElementById('unlockFeedbackMsg');
    const forgotBtn = document.getElementById('btnForgotPin');

    pinInput.focus();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = pinInput.value.trim();
      const settings = getSettings();

      // DEMO ONLY: Replace localStorage PIN storage with server-side hashed PIN verification in production.
      if (enteredPin === settings.pin) {
        feedback.textContent = 'PIN verified! ✨';
        feedback.className = 'pin-feedback-msg success';
        if (typeof playSuccessChime === 'function') playSuccessChime();
        setTimeout(() => {
          renderDashboardView();
        }, 300);
      } else {
        feedback.textContent = 'That PIN does not match. Please try again.';
        feedback.className = 'pin-feedback-msg';
        pinInput.value = '';
        pinInput.focus();
        if (typeof playTone === 'function') playTone(280, 'sawtooth', 0.2);
      }
    });

    if (forgotBtn) {
      forgotBtn.addEventListener('click', () => {
        // TODO: Implement secure backend/Firebase PIN reset and hashed PIN verification.
        if (typeof toast === 'function') {
          toast('PIN Reset: In this demo, clear your browser localStorage or contact your teacher. 🛠️');
        } else {
          alert('TODO: Implement secure backend/Firebase PIN reset.');
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     View 3: Full Parent Dashboard
     -------------------------------------------------------------------------- */
  function renderDashboardView() {
    currentModalView = 'dashboard';
    const body = document.getElementById('parentModalBody');
    const title = document.getElementById('parentModalTitle');
    if (title) title.textContent = 'Parent Dashboard 🔐';

    const settings = getSettings();
    const profile = settings.childProfile;
    const progress = settings.progress;
    const controls = settings.controls;

    // Calculate goal percentage
    const dailyGoal = controls.dailyWordGoal || 5;
    const wordsToday = progress.wordsLearnedToday || 0;
    const goalPercent = Math.min(100, Math.round((wordsToday / dailyGoal) * 100));
    const isGoalComplete = wordsToday >= dailyGoal;

    body.innerHTML = `
      <div class="parent-dashboard-container">
        <!-- Top Hero Greeting -->
        <div class="dashboard-hero-banner">
          <div class="dashboard-hero-text">
            <h4>Parent Dashboard 🔐</h4>
            <p>Manage your child’s learning journey.</p>
          </div>
          <div class="dashboard-lock-status-pill">
            <span>🛡️ Protected Mode</span>
          </div>
        </div>

        <div class="dashboard-cards-grid">
          <!-- CARD A: CHILD PROFILE / ACCOUNT EDITING -->
          <div class="pc-card" id="cardChildProfile">
            <div class="pc-card-header">
              <h5><span>👶</span> Child Profile</h5>
              <span class="pc-card-badge">Account</span>
            </div>

            ${!isEditingProfile ? `
              <div class="profile-details-list">
                <div class="profile-detail-row">
                  <span class="profile-detail-label">Child Nickname:</span>
                  <span class="profile-detail-val" id="profileNameDisplay">${escapeHtml(profile.name)}</span>
                </div>
                <div class="profile-detail-row">
                  <span class="profile-detail-label">Age Group:</span>
                  <span class="profile-detail-val" id="profileAgeDisplay">${escapeHtml(profile.ageGroup)} years</span>
                </div>
                <div class="profile-detail-row">
                  <span class="profile-detail-label">Preferred Language:</span>
                  <span class="profile-detail-val" id="profileLangDisplay">${escapeHtml(profile.preferredLanguage)}</span>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btnEditProfile" style="margin-top: 8px;">
                <span>✏️</span> Edit Profile
              </button>
            ` : `
              <form id="profileEditForm" class="profile-edit-form" onsubmit="return false;">
                <div class="profile-edit-field">
                  <label for="editChildName">Child Nickname:</label>
                  <input type="text" id="editChildName" value="${escapeHtml(profile.name)}" maxlength="30" required />
                </div>
                <div class="profile-edit-field">
                  <label for="editAgeGroup">Age Group:</label>
                  <select id="editAgeGroup">
                    <option value="5-7" ${profile.ageGroup === '5-7' ? 'selected' : ''}>5–7 years</option>
                    <option value="8-10" ${profile.ageGroup === '8-10' ? 'selected' : ''}>8–10 years</option>
                  </select>
                </div>
                <div class="profile-edit-field">
                  <label for="editPrefLang">Preferred Language:</label>
                  <select id="editPrefLang">
                    <option value="Santhali" ${profile.preferredLanguage === 'Santhali' ? 'selected' : ''}>Santhali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
                    <option value="Nagpuri" ${profile.preferredLanguage === 'Nagpuri' ? 'selected' : ''}>Nagpuri (नागपुरी)</option>
                    <option value="Khortha" ${profile.preferredLanguage === 'Khortha' ? 'selected' : ''}>Khortha (खोरठा)</option>
                    <option value="Hindi" ${profile.preferredLanguage === 'Hindi' ? 'selected' : ''}>Hindi (हिन्दी)</option>
                    <option value="English" ${profile.preferredLanguage === 'English' ? 'selected' : ''}>English</option>
                  </select>
                </div>
                <div class="profile-form-actions">
                  <button type="submit" class="btn btn-primary btn-sm" id="btnSaveProfile">
                    <span>💾</span> Save
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" id="btnCancelEditProfile">
                    Cancel
                  </button>
                </div>
              </form>
            `}
          </div>

          <!-- CARD B: LEARNING PROGRESS TRACKER -->
          <!-- TODO: Connect learning progress tracker with live backend analytics and Firebase events. -->
          <div class="pc-card">
            <div class="pc-card-header">
              <h5><span>📈</span> Learning Progress</h5>
              <span class="pc-card-badge">Analytics</span>
            </div>
            <div class="progress-stats-grid">
              <div class="progress-stat-tile">
                <span class="progress-stat-num">⭐ ${progress.wordsLearned}</span>
                <span class="progress-stat-lbl">Words learned</span>
              </div>
              <div class="progress-stat-tile">
                <span class="progress-stat-num">🧩 ${progress.quizScore} / ${progress.quizTotal}</span>
                <span class="progress-stat-lbl">Quiz score</span>
              </div>
              <div class="progress-stat-tile">
                <span class="progress-stat-num">🔥 ${progress.streakDays} days</span>
                <span class="progress-stat-lbl">Learning streak</span>
              </div>
              <div class="progress-stat-tile">
                <span class="progress-stat-num">🏆 ${progress.categoriesExplored ? progress.categoriesExplored.length : 3}</span>
                <span class="progress-stat-lbl">Categories explored</span>
              </div>
            </div>

            <div class="progress-bar-container">
              <div class="progress-bar-track" aria-label="Overall curriculum progress">
                <div class="progress-bar-fill" style="width: 72%;"></div>
              </div>
              <p class="progress-support-text">
                ✨ ${escapeHtml(profile.name)} is doing wonderfully!
              </p>
            </div>
          </div>

          <!-- CARD C: DAILY LEARNING GOAL -->
          <div class="pc-card">
            <div class="pc-card-header">
              <h5><span>🎯</span> Daily Learning Goal</h5>
              <span class="pc-card-badge">${dailyGoal} words/day</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--ink-light); margin: 0;">
              Choose how many words your child should learn each day.
            </p>
            <div class="daily-goal-options" role="radiogroup" aria-label="Daily Word Goal Options">
              <button type="button" class="goal-option-btn ${dailyGoal === 3 ? 'active' : ''}" data-goal="3" role="radio" aria-checked="${dailyGoal === 3}">
                3 words
              </button>
              <button type="button" class="goal-option-btn ${dailyGoal === 5 ? 'active' : ''}" data-goal="5" role="radio" aria-checked="${dailyGoal === 5}">
                5 words
              </button>
              <button type="button" class="goal-option-btn ${dailyGoal === 10 ? 'active' : ''}" data-goal="10" role="radio" aria-checked="${dailyGoal === 10}">
                10 words
              </button>
            </div>

            <div class="goal-progress-box">
              <div class="goal-progress-header">
                <span>Today’s progress: ${wordsToday} / ${dailyGoal} words ⭐</span>
                <span>${goalPercent}%</span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${goalPercent}%;"></div>
              </div>
              ${isGoalComplete ? `
                <div class="goal-completion-badge">
                  Amazing! Today’s goal is complete! 🎉
                </div>
              ` : ''}
            </div>
          </div>

          <!-- CARD D: COMMUNITY ACCESS CONTROL -->
          <div class="pc-card">
            <div class="pc-card-header">
              <h5><span>🤝</span> Community Access</h5>
              <span class="pc-card-badge">${controls.communityEnabled ? 'UNLOCKED' : 'LOCKED'}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--ink-light); margin: 0;">
              Allow your child to view and use the BhashaSetu community area.
            </p>
            <div class="community-toggle-row">
              <div class="community-status-info">
                <span class="community-status-heading">
                  ${controls.communityEnabled ? 'Community is available' : 'Community is locked'}
                </span>
                <span class="community-status-sub">
                  ${controls.communityEnabled 
                    ? 'Your child can open the Community section.' 
                    : 'Your child needs parent permission to access Community.'}
                </span>
              </div>
              <button 
                type="button" 
                class="pc-switch" 
                id="toggleCommunitySwitch"
                role="switch" 
                aria-checked="${controls.communityEnabled ? 'true' : 'false'}"
                aria-label="Toggle Community Access Permission"
                tabindex="0"
              >
                <div class="pc-switch-handle"></div>
              </button>
            </div>
          </div>

          <!-- CARD E: BASIC DATA AND PRIVACY CONTROL -->
          <div class="pc-card" style="grid-column: 1 / -1;">
            <div class="pc-card-header">
              <h5><span>🔒</span> Data & Privacy</h5>
              <span class="pc-card-badge">Local Storage</span>
            </div>
            <div class="privacy-action-box">
              <p style="font-size: 0.88rem; color: var(--ink-light); margin: 0;">
                You can clear the learning progress saved on this device.
              </p>

              ${!isConfirmingClear ? `
                <div>
                  <button class="btn btn-secondary btn-sm" id="btnTriggerClearProgress" style="color: #DC2626; border-color: #FCA5A5;">
                    <span>🗑️</span> Clear Learning Progress
                  </button>
                </div>
              ` : `
                <div class="privacy-confirm-panel">
                  <p class="privacy-confirm-text">
                    ⚠️ Clear ${escapeHtml(profile.name)}’s saved learning progress on this device?
                  </p>
                  <div class="privacy-confirm-actions">
                    <button class="btn btn-secondary btn-sm" id="btnCancelClearProgress">
                      Cancel
                    </button>
                    <button class="btn btn-primary btn-sm" id="btnConfirmClearProgress" style="background: #DC2626; border-color: #991B1B;">
                      Clear Progress
                    </button>
                  </div>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    attachDashboardEventListeners();
  }

  /**
   * Event Listeners inside the unlocked dashboard
   */
  function attachDashboardEventListeners() {
    // 1. Profile Edit Mode
    const editBtn = document.getElementById('btnEditProfile');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        isEditingProfile = true;
        renderDashboardView();
      });
    }

    const cancelEditBtn = document.getElementById('btnCancelEditProfile');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        isEditingProfile = false;
        renderDashboardView();
      });
    }

    const profileForm = document.getElementById('profileEditForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('editChildName').value.trim() || 'Aarav';
        const newAge = document.getElementById('editAgeGroup').value;
        const newLang = document.getElementById('editPrefLang').value;

        updateProfile({
          name: newName,
          ageGroup: newAge,
          preferredLanguage: newLang
        });

        // Update student session in index.html if present
        const userNameLabel = document.getElementById('userNameLabel');
        if (userNameLabel) userNameLabel.textContent = newName;

        isEditingProfile = false;
        if (typeof toast === 'function') toast('Profile updated successfully! ✨');
        if (typeof playSuccessChime === 'function') playSuccessChime();
        renderDashboardView();
      });
    }

    // 2. Daily Goal Buttons
    document.querySelectorAll('.goal-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const goal = Number(btn.dataset.goal);
        updateDailyGoal(goal);
        if (typeof playPopSound === 'function') playPopSound();
        renderDashboardView();
      });
    });

    // 3. Community Switch
    const commSwitch = document.getElementById('toggleCommunitySwitch');
    if (commSwitch) {
      const toggleAction = () => {
        const current = isCommunityEnabled();
        const next = !current;
        updateCommunityAccess(next);
        if (typeof playPopSound === 'function') playPopSound();
        if (typeof toast === 'function') {
          toast(next ? 'Community unlocked for Aarav! 🤝' : 'Community locked. 🔐');
        }
        renderDashboardView();
      };

      commSwitch.addEventListener('click', toggleAction);
      commSwitch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAction();
        }
      });
    }

    // 4. Data & Privacy Clear Progress
    const triggerClearBtn = document.getElementById('btnTriggerClearProgress');
    if (triggerClearBtn) {
      triggerClearBtn.addEventListener('click', () => {
        isConfirmingClear = true;
        renderDashboardView();
      });
    }

    const cancelClearBtn = document.getElementById('btnCancelClearProgress');
    if (cancelClearBtn) {
      cancelClearBtn.addEventListener('click', () => {
        isConfirmingClear = false;
        renderDashboardView();
      });
    }

    const confirmClearBtn = document.getElementById('btnConfirmClearProgress');
    if (confirmClearBtn) {
      confirmClearBtn.addEventListener('click', () => {
        clearLearningProgress();
        isConfirmingClear = false;
        if (typeof toast === 'function') toast('Learning progress has been cleared. 🗑️');
        if (typeof playPopSound === 'function') playPopSound();
        renderDashboardView();
      });
    }
  }

  /* ==========================================================================
     Community Section Access Integration & Reusable Helper
     ========================================================================== */

  /**
   * Reusable helper to render a child-friendly locked message
   */
  function showCommunityLockedMessage(container, onGoBack) {
    if (!container) return;
    container.innerHTML = `
      <div class="community-locked-card">
        <span class="community-locked-icon">🔐</span>
        <h3 class="community-locked-title">Community is locked</h3>
        <p class="community-locked-text">
          Ask a parent or teacher to unlock the Vernacular Peer Circle in the Parent Area.
        </p>
        <div class="community-locked-actions">
          <button class="btn btn-primary btn-sm" id="btnUnlockFromCommunity">
            <span>🔐</span> Open Parent Area
          </button>
          ${onGoBack ? `
            <button class="btn btn-secondary btn-sm" id="btnGoBackFromCommunity">
              <span>🏠</span> Go Back
            </button>
          ` : ''}
        </div>
      </div>
    `;

    const unlockBtn = container.querySelector('#btnUnlockFromCommunity');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => openParentArea());
    }

    const backBtn = container.querySelector('#btnGoBackFromCommunity');
    if (backBtn && typeof onGoBack === 'function') {
      backBtn.addEventListener('click', onGoBack);
    }
  }

  /**
   * Live synchronizer for Community section interactions
   */
  function syncCommunitySectionState() {
    const sendBtn = document.getElementById('btnSimulateSend');
    const msgInput = document.getElementById('simMessageInput');
    const chipBtns = document.querySelectorAll('.chip-btn');

    const enabled = isCommunityEnabled();

    // Soft-guard interaction if Community is turned off
    if (sendBtn && !sendBtn.dataset.pcAttached) {
      sendBtn.dataset.pcAttached = 'true';
      const origClick = sendBtn.onclick;

      sendBtn.addEventListener('click', (e) => {
        if (!isCommunityEnabled()) {
          e.stopImmediatePropagation();
          if (typeof toast === 'function') {
            toast('🔐 Community is locked by parent. Tap "Parents" in header to unlock.');
          }
          if (typeof playTone === 'function') playTone(280, 'sawtooth', 0.2);
        }
      }, true);
    }

    chipBtns.forEach(btn => {
      if (!btn.dataset.pcAttached) {
        btn.dataset.pcAttached = 'true';
        btn.addEventListener('click', (e) => {
          if (!isCommunityEnabled()) {
            e.stopImmediatePropagation();
            if (typeof toast === 'function') {
              toast('🔐 Community is locked by parent. Tap "Parents" in header to unlock.');
            }
          }
        }, true);
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ==========================================================================
     Global API Exposure
     ========================================================================== */
  window.ParentalControl = {
    getSettings,
    saveSettings,
    getDefaultSettings,
    updateProfile,
    updateDailyGoal,
    updateCommunityAccess,
    clearLearningProgress,
    isCommunityEnabled,
    openParentArea,
    showCommunityLockedMessage,
    syncCommunitySectionState
  };

  // Auto-initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const parentBtn = document.getElementById('openParentAreaBtn');
    if (parentBtn) {
      parentBtn.addEventListener('click', () => openParentArea());
    }

    const navParentLink = document.getElementById('navParentAreaLink');
    if (navParentLink) {
      navParentLink.addEventListener('click', () => openParentArea());
    }

    // Sync Community guard on load
    syncCommunitySectionState();
  });

})();
