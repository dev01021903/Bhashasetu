/**
 * BhashaSetu - About Section Component & Translations
 * 
 * Features:
 * - Structured translations dictionary for English & Hindi
 * - Graceful fallback to English for tribal/regional languages with an honest verification badge
 * - Interactive language switcher updating all text in the section instantaneously
 * - CTA Explore handler hook
 */

(function () {
  'use strict';

  // 1. Translations Data Dictionary
  const aboutTranslations = {
    en: {
      eyebrow: "ABOUT BHASHASETU",
      heading: "About BhashaSetu",
      subtitle: "Building a bridge between children, culture, and language.",
      conceptBadge: "OUR IDEA",
      conceptHeading: "Learning begins in the language of home.",
      conceptText: "Children learn best when they can connect new ideas to the words they hear in their homes. BhashaSetu bridges the gap between indigenous tribal languages and state languages (Hindi & English), empowering young minds to celebrate their cultural roots while excelling in modern education.",
      motifLang1: "English",
      motifLang2: "Hindi",
      motifLang3: "Mother Tongue",
      bubble1: "Hello! 👋",
      bubble2: "नमस्ते! 🌟",
      bubble3: "ᱡᱚᱦᱟᱨ / Johar! 🌾",
      visionTitle: "Our Vision",
      visionDesc: "A world where no child feels left behind because of their mother tongue, and every indigenous language is celebrated and preserved digitally.",
      missionTitle: "Our Mission",
      missionDesc: "To provide AI-powered, joyful, and culturally respectful learning tools for primary education in tribal and regional mother tongues.",
      whatWeDoBadge: "WHAT WE DO",
      whatWeDoHeading: "How BhashaSetu Helps",
      whatWeDoSubtitle: "Simple, fun, and accessible tools designed specifically for children aged 5–10.",
      feat1Title: "Learn New Words",
      feat1Desc: "Interactive picture flashcards with words in tribal languages, Hindi, and English.",
      feat2Title: "Listen & Speak",
      feat2Desc: "Crystal clear native pronunciations to build confidence in speaking both languages.",
      feat3Title: "Play & Practise",
      feat3Desc: "Joyful quizzes, matching mini-games, and daily challenges that turn learning into play.",
      feat4Title: "Grow Together",
      feat4Desc: "Collaborative classroom features and community contributions from teachers and parents.",
      cultureHeading: "Every Language Has a Story",
      cultureText: "Indigenous languages carry centuries of wisdom, folklore, and connection to nature. When a child learns in their mother tongue, they carry forward a living legacy of community and identity.",
      ctaTitle: "Ready to start learning?",
      ctaBtn: "Explore Words ➜",
      isUnverified: false
    },
    hi: {
      eyebrow: "भाषासेतु के बारे में",
      heading: "भाषासेतु के बारे में",
      subtitle: "बच्चों, संस्कृति और भाषा के बीच एक अटूट सेतु बना रहे हैं।",
      conceptBadge: "हमारा विचार",
      conceptHeading: "सीखने की शुरुआत घर की बोली से होती है।",
      conceptText: "बच्चे सबसे अच्छी तरह तब सीखते हैं जब वे नई अवधारणाओं को अपने घर में बोली जाने वाली भाषा से जोड़ पाते हैं। भाषासेतु स्थानीय जनजातीय मातृभाषाओं, हिन्दी और अंग्रेजी के बीच की दूरी को पाटता है, जिससे बच्चों को अपनी सांस्कृतिक जड़ों से जुड़ते हुए आधुनिक शिक्षा में आगे बढ़ने का अवसर मिलता है।",
      motifLang1: "अंग्रेज़ी",
      motifLang2: "हिन्दी",
      motifLang3: "मातृभाषा",
      bubble1: "Hello! 👋",
      bubble2: "नमस्ते! 🌟",
      bubble3: "ᱡᱚᱦᱟᱨ / जोहार! 🌾",
      visionTitle: "हमारा दृष्टिकोण (Vision)",
      visionDesc: "एक ऐसी दुनिया जहाँ कोई भी बच्चा अपनी मातृभाषा के कारण पीछे न छूटे, और प्रत्येक क्षेत्रीय व जनजातीय भाषा को डिजिटल रूप से संरक्षित और सम्मानित किया जाए।",
      missionTitle: "हमारा मिशन (Mission)",
      missionDesc: "प्राथमिक स्तर के बच्चों के लिए मातृभाषा-आधारित आनंददायक, एआई-सशक्त और सांस्कृतिक रूप से समृद्ध शिक्षण उपकरण उपलब्ध कराना।",
      whatWeDoBadge: "हम क्या करते हैं",
      whatWeDoHeading: "भाषासेतु कैसे मदद करता है",
      whatWeDoSubtitle: "5 से 10 वर्ष के बच्चों के लिए विशेष रूप से डिज़ाइन किए गए सरल और मजेदार साधन।",
      feat1Title: "नए शब्द सीखें",
      feat1Desc: "जनजातीय भाषाओं, हिन्दी और अंग्रेज़ी में सचित्र और रंग-बिरंगे शब्द कार्ड।",
      feat2Title: "सुनें और बोलें",
      feat2Desc: "स्पष्ट देशी उच्चारण के साथ दोनों भाषाओं में आत्मविश्वास से बोलने का अभ्यास।",
      feat3Title: "खेलें और अभ्यास करें",
      feat3Desc: "मजेदार क्विज़, मिलान वाले खेल और दैनिक चुनौतियाँ जो पढ़ाई को खेल बना देती हैं।",
      feat4Title: "साथ मिलकर आगे बढ़ें",
      feat4Desc: "सहयोगी कक्षा सुविधाएँ और शिक्षकों व अभिभावकों द्वारा नए शब्दों का योगदान।",
      cultureHeading: "हर भाषा की अपनी एक कहानी होती है",
      cultureText: "जनजातीय भाषाओं में सदियों का ज्ञान, लोककथाएँ और प्रकृति के साथ जुड़ाव समाहित है। जब बच्चा अपनी मातृभाषा में सीखता है, तो वह अपनी संस्कृति और समुदाय की धरोहर को आगे बढ़ाता है।",
      ctaTitle: "क्या आप सीखने के लिए तैयार हैं?",
      ctaBtn: "शब्द खोजें और सीखें ➜",
      isUnverified: false
    },
    sat: { isUnverified: true, langName: "Santhali (ᱥᱟᱱᱛᱟᱲᱤ)" },
    nag: { isUnverified: true, langName: "Nagpuri (नागपुरी)" },
    kho: { isUnverified: true, langName: "Khortha (खोरठा)" }
  };

  let currentLang = 'en';

  /**
   * Safe translation resolver with graceful English fallback
   */
  function getTranslation(lang) {
    const data = aboutTranslations[lang];
    if (!data || data.isUnverified) {
      return {
        ...aboutTranslations.en,
        showComingSoonBadge: Boolean(data && data.isUnverified),
        unverifiedLangName: data ? data.langName : lang
      };
    }
    return {
      ...data,
      showComingSoonBadge: false
    };
  }

  /**
   * Re-render all text inside the About section
   */
  function updateAboutSectionText() {
    const t = getTranslation(currentLang);

    const setContent = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setContent('aboutEyebrowText', t.eyebrow);
    setContent('aboutTitleText', t.heading);
    setContent('aboutSubtitleText', t.subtitle);
    setContent('aboutConceptBadge', t.conceptBadge);
    setContent('aboutConceptHeading', t.conceptHeading);
    setContent('aboutConceptText', t.conceptText);
    setContent('aboutMotif1', t.motifLang1);
    setContent('aboutMotif2', t.motifLang2);
    setContent('aboutMotif3', t.motifLang3);
    setContent('aboutBubble1', t.bubble1);
    setContent('aboutBubble2', t.bubble2);
    setContent('aboutBubble3', t.bubble3);
    setContent('aboutVisionTitle', t.visionTitle);
    setContent('aboutVisionDesc', t.visionDesc);
    setContent('aboutMissionTitle', t.missionTitle);
    setContent('aboutMissionDesc', t.missionDesc);
    setContent('aboutWhatBadge', t.whatWeDoBadge);
    setContent('aboutWhatHeading', t.whatWeDoHeading);
    setContent('aboutWhatSubtitle', t.whatWeDoSubtitle);
    setContent('aboutFeat1Title', t.feat1Title);
    setContent('aboutFeat1Desc', t.feat1Desc);
    setContent('aboutFeat2Title', t.feat2Title);
    setContent('aboutFeat2Desc', t.feat2Desc);
    setContent('aboutFeat3Title', t.feat3Title);
    setContent('aboutFeat3Desc', t.feat3Desc);
    setContent('aboutFeat4Title', t.feat4Title);
    setContent('aboutFeat4Desc', t.feat4Desc);
    setContent('aboutCultureHeading', t.cultureHeading);
    setContent('aboutCultureText', t.cultureText);
    setContent('aboutCtaTitle', t.ctaTitle);
    setContent('aboutCtaBtn', t.ctaBtn);

    // Status badge for unverified/coming-soon languages
    const badgeContainer = document.getElementById('aboutComingSoonWrapper');
    if (badgeContainer) {
      if (t.showComingSoonBadge) {
        badgeContainer.innerHTML = `
          <div class="about-coming-soon-badge" role="status" aria-live="polite">
            <span>ℹ️</span>
            <span><strong>${t.unverifiedLangName}</strong> translation coming soon • Community verification in progress</span>
          </div>
        `;
      } else {
        badgeContainer.innerHTML = '';
      }
    }
  }

  function initAboutSection() {
    const select = document.getElementById('aboutLangSelect');
    if (select) {
      select.addEventListener('change', (e) => {
        currentLang = e.target.value;
        updateAboutSectionText();
      });
    }

    const ctaBtn = document.getElementById('aboutCtaBtn');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => {
        const target = document.getElementById('learning-modules');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    updateAboutSectionText();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutSection);
  } else {
    initAboutSection();
  }

  // Public API
  window.BhashaSetuAbout = {
    setLanguage: (lang) => {
      currentLang = lang;
      const select = document.getElementById('aboutLangSelect');
      if (select) select.value = lang;
      updateAboutSectionText();
    },
    getTranslations: () => ({ ...aboutTranslations })
  };
})();
