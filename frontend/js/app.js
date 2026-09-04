/**
 * BhashaSetu - Interactive Engine for Vernacular Learning
 * Interactive Child-Friendly Dashboard Application Script
 * AI-Powered Vernacular Pedagogy & Real-Time Translation
 */

// Global App State
const state = {
  activeLanguage: 'Santhali',
  soundEnabled: true,
  activeGrade: 'primary',
  activeStoryIndex: 0,
  storyCurrentPage: 0,
  isReadingAloud: false,
  vocabGameScore: 0,
  selectedCategory: 'All',
  searchQuery: '',
  wordsList: []
};

// DOM Helper
const $ = (id) => document.getElementById(id);

/* ==========================================================================
   Sound Synthesis (Web Audio API - Zero External Dependencies)
   ========================================================================== */
function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.05) {
  if (!state.soundEnabled || !window.AudioContext && !window.webkitAudioContext) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // AudioContext blocked before user interaction
  }
}

function playPopSound() {
  playTone(520, 'sine', 0.1, 0.06);
}

function playSuccessChime() {
  if (!state.soundEnabled) return;
  setTimeout(() => playTone(523.25, 'triangle', 0.12, 0.06), 0);
  setTimeout(() => playTone(659.25, 'triangle', 0.12, 0.06), 100);
  setTimeout(() => playTone(783.99, 'triangle', 0.25, 0.08), 200);
}

function playSparkleSound() {
  if (!state.soundEnabled) return;
  [880, 1046, 1318, 1567].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sine', 0.08, 0.03), i * 60);
  });
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function toast(message) {
  const box = $('toast');
  if (!box) return;
  box.textContent = message;
  box.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => box.classList.remove('show'), 3200);
}

/* ==========================================================================
   Confetti Celebration Canvas Engine
   ========================================================================== */
function fireConfetti() {
  const canvas = $('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#FFC107', '#FF7043', '#43A047', '#0288D1', '#7E57C2', '#FF4081'];

  for (let i = 0; i < 70; i++) {
    pieces.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 300,
      y: canvas.height / 2 + (Math.random() - 0.5) * 150,
      r: Math.random() * 8 + 4,
      d: Math.random() * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltAngleInc: Math.random() * 0.08 + 0.04,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -14 - 6
    });
  }

  let animationFrame;
  let startTime = Date.now();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    pieces.forEach((p) => {
      p.tiltAngle += p.tiltAngleInc;
      p.vy += 0.45; // gravity
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < canvas.height + 20) {
        alive = true;
      }

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });

    if (alive && Date.now() - startTime < 3500) {
      animationFrame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  draw();
  playSuccessChime();
}

/* ==========================================================================
   Text-To-Speech Speech Synthesis (Crystal Clear Audio)
   ========================================================================== */
function speakText(text, lang = 'hi-IN') {
  if (!text || !text.trim()) return;

  if (!('speechSynthesis' in window)) {
    toast('Audio playback is not supported by this browser.');
    return;
  }

  window.speechSynthesis.cancel();

  // Strip brackets or phonetic labels for cleaner pronunciation
  let cleanText = text.replace(/<[^>]*>/g, '');
  const cleanMatch = cleanText.match(/\(([^)]+)\)/);
  if (cleanMatch && /[a-zA-Z]/.test(cleanMatch[1]) && !/[\u0900-\u097F]/.test(cleanMatch[1])) {
    // If has Latin romanization inside parentheses, clean speech
    cleanText = cleanMatch[1];
    lang = 'en-IN';
  } else {
    cleanText = cleanText.split('(')[0].trim();
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.85;
  utterance.pitch = 1.05;

  // Language mapping
  if (lang.includes('bn')) utterance.lang = 'bn-IN';
  else if (lang.includes('ta')) utterance.lang = 'ta-IN';
  else if (lang.includes('en')) utterance.lang = 'en-IN';
  else utterance.lang = 'hi-IN';

  // Voice match
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang === utterance.lang || v.lang.includes(lang.split('-')[0]));
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

/* ==========================================================================
   Word Audio Player (Audio URL / Native Fallback)
   ========================================================================== */
function playWordAudio(word, targetField = 'local') {
  if (!word) return;

  // 1. If pre-recorded audio URL exists, play real audio
  if (word.audio_url && typeof word.audio_url === 'string' && word.audio_url.trim()) {
    try {
      const audio = new Audio(word.audio_url.trim());
      audio.play().catch(e => {
        console.warn('Audio playback error:', e);
        fallbackAudio(word, targetField);
      });
      return;
    } catch (e) {
      console.warn('Audio element error:', e);
    }
  }

  fallbackAudio(word, targetField);
}

function fallbackAudio(word, targetField = 'local') {
  if (targetField === 'hindi' && word.hindi_word) {
    speakText(word.hindi_word, 'hi-IN');
  } else if (targetField === 'english' && word.english_word) {
    speakText(word.english_word, 'en-IN');
  } else {
    // For tribal/vernacular words without audio_url:
    // Do not use synthetic speech disguised as tribal pronunciation.
    toast('Native audio will be added soon! 🌱');
    playSparkleSound();
  }
}

/* ==========================================================================
   Dataset: Multi-Language Greetings (Hero AI Tutor Mascot)
   ========================================================================== */
const mascotGreetings = {
  Santhali: [
    {
      vernacular: '“ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹ! ᱟᱞᱮ ᱥᱟᱶ ᱟᱯᱱᱟᱨ ᱯᱟᱹᱨᱥᱤ ᱛᱮ ᱥᱮᱪᱮᱫᱚᱜ ᱢᱮ!”',
      pronunciation: '(Johar gidra! Ale saw apnar parsi te sechedog me!)',
      translation: '“Namaste children! Come learn and explore with joy in your mother tongue!”',
      speakText: 'Johar gidra! Ale saw apnar parsi te sechedog me!'
    },
    {
      vernacular: '“ᱛᱮᱦᱮᱧ ᱫᱚ ᱢᱤᱫᱴᱟᱝ ᱱᱟᱣᱟ ᱠᱟᱹᱦᱱᱤ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ!”',
      pronunciation: '(Tehenj do midtang nawa kahni bon parhawa!)',
      translation: '“Today we are going to read an exciting new story together!”',
      speakText: 'Tehenj do midtang nawa kahni bon parhawa!'
    }
  ],
  Nagpuri: [
    {
      vernacular: '“जोहार नन्हे संगी! आपण मातृभाषा नागपुरी में पढ़े और सीखे के दुनिया में स्वागत है!”',
      pronunciation: '(Johar nanhe sangi! Aapan matribhasha Nagpuri mein padhe aur seekhe ke duniya mein swagat hai!)',
      translation: '“Welcome little friends! Welcome to the world of learning in your mother tongue Nagpuri!”',
      speakText: 'जोहार नन्हे संगी! आपण मातृभाषा नागपुरी में पढ़े और सीखे के दुनिया में स्वागत है!'
    },
    {
      vernacular: '“चल हमरे मन आज नया कहानी और शब्द सीखब!”',
      pronunciation: '(Chal hamre man aaj naya kahani aur shabd seekhab!)',
      translation: '“Let us learn new stories and words together today!”',
      speakText: 'चल हमरे मन आज नया कहानी और शब्द सीखब!'
    }
  ],
  Khortha: [
    {
      vernacular: '“गोड़ लागो ही नन्हा बाबू! अपन खोरठा भाखा में खुशी से पढ़े और सीखे ले आबा!”',
      pronunciation: '(God lago hi nanha babu! Apan Khortha bhakha mein khushi se padhe aur seekhe le aaba!)',
      translation: '“Greetings dear children! Welcome to learn and explore in your mother tongue Khortha!”',
      speakText: 'गोड़ लागो ही नन्हा बाबू! अपन खोरठा भाखा में खुशी से पढ़े और सीखे ले आबा!'
    },
    {
      vernacular: '“चल मिल के आज नया बात और पाठ सीखब!”',
      pronunciation: '(Chal mil ke aaj naya baat aur paath seekhab!)',
      translation: '“Let us come together today to learn new phrases and lessons!”',
      speakText: 'चल मिल के आज नया बात और पाठ सीखब!'
    }
  ],
  Hindi: [
    {
      vernacular: '“नमस्ते बच्चों! अपनी मातृभाषा में सीखने की जादुई दुनिया में स्वागत है!”',
      pronunciation: '(Namaste bachhon! Apni matribhasha mein seekhne ki jadui duniya mein swagat hai!)',
      translation: '“Welcome children to the magical world of learning in your mother tongue!”',
      speakText: 'नमस्ते बच्चों! अपनी मातृभाषा में सीखने की जादुई दुनिया में स्वागत है!'
    },
    {
      vernacular: '“आज हम मिलकर नए शब्द और मजेदार कहानियाँ सीखेंगे!”',
      pronunciation: '(Aaj hum milkar naye shabd aur mazedar kahaniyan seekhenge!)',
      translation: '“Today we will learn new words and delightful stories together!”',
      speakText: 'आज हम मिलकर नए शब्द और मजेदार कहानियाँ सीखेंगे!'
    }
  ],
  English: [
    {
      vernacular: '“Hello Little Explorers! Ready to learn with joy in your mother tongue?”',
      pronunciation: '(BhashaSetu)',
      translation: '“AI-Powered Vernacular Pedagogy and Real-Time Translation for Primary Education!”',
      speakText: 'Hello Little Explorers! Ready to learn with joy in your mother tongue?'
    }
  ]
};

// Fallback phrasebook for vernacular translation
const phrasebook = {
  Santhali: {
    'नमस्ते': 'Johar (ᱡᱚᱦᱟᱨ)',
    'hello': 'Johar (ᱡᱚᱦᱟᱨ)',
    'hi': 'Johar (ᱡᱚᱦᱟᱨ)',
    'पानी': 'Daak\' (ᱫᱟᱜ)',
    'water': 'Daak\' (ᱫᱟᱜ)',
    'पेड़': 'Dare (ᱫᱟᱨᱮ)',
    'tree': 'Dare (ᱫᱟᱨᱮ)',
    'सूरज': 'Singi (ᱥᱤᱧ)',
    'sun': 'Singi (ᱥᱤᱧ)',
    'किताब': 'Puthi (ᱯᱩᱛᱷᱤ)',
    'book': 'Puthi (ᱯᱩᱛᱷᱤ)',
    'धन्यवाद': 'Sarhao (ᱥᱟᱨᱦᱟᱣ)',
    'thank you': 'Sarhao (ᱥᱟᱨᱦᱟᱣ)',
    'मेरा नाम': 'Injań ñutum (ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ)',
    'my name': 'Injań ñutum (ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ)',
    'नमस्ते दोस्त! चलो मिलकर नया पाठ पढ़ें!': 'ᱡᱚᱦᱟᱨ ᱜᱟᱛᱮ! ᱫᱮᱞᱟ ᱢᱤᱫ ᱥᱟᱶᱛᱮ ᱱᱟᱣᱟ ᱯᱟᱲᱦᱟᱣ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ! (Johar gate! Dela mid sawte nawa parhaw bon parhawa!)'
  },
  Nagpuri: {
    'नमस्ते': 'Johar (जोहार / गोड़ लागिला)',
    'hello': 'Johar (जोहार)',
    'hi': 'Johar (जोहार)',
    'पानी': 'Pani (पानी / पानि)',
    'water': 'Pani (पानी)',
    'पेड़': 'Gaachh / Gachh (गाछ / रुख)',
    'tree': 'Gaachh (गाछ)',
    'सूरज': 'Suruj / Ber (सुरुज / बेर)',
    'sun': 'Suruj (सुरुज)',
    'किताब': 'Pothi (पोथी / किताब)',
    'book': 'Pothi (पोथी)',
    'धन्यवाद': 'Dhanyabad / Johar (धन्यवाद)',
    'thank you': 'Dhanyabad (धन्यवाद)',
    'मेरा नाम': 'Mora naam (मोरा नाम)',
    'my name': 'Mora naam (मोरा नाम)',
    'नमस्ते दोस्त! चलो मिलकर नया पाठ पढ़ें!': 'जोहार संगी! चल हमरे मन संगे नवा पाठ पढ़ब! (Johar sangi! Chal hamre man sange nawa paath padhab!)'
  },
  Khortha: {
    'नमस्ते': 'God lago hi / Johar (गोड़ लागो ही / जोहार)',
    'hello': 'God lago hi (गोड़ लागो ही)',
    'hi': 'God lago hi (गोड़ लागो ही)',
    'पानी': 'Pani (पानी)',
    'water': 'Pani (पानी)',
    'पेड़': 'Gachh (गाछ / पेड़)',
    'tree': 'Gachh (गाछ)',
    'सूरज': 'Bero / Suruj (बेरो / सुरुज)',
    'sun': 'Bero (बेरो)',
    'किताब': 'Kitab / Pothi (किताब / पोथी)',
    'book': 'Kitab (किताब)',
    'धन्यवाद': 'Dhanbaad / Johar (धनबाद)',
    'thank you': 'Dhanbaad (धनबाद)',
    'मेरा नाम': 'Hamar naam (हमार नाम)',
    'my name': 'Hamar naam (हमार नाम)',
    'नमस्ते दोस्त! चलो मिलकर नया पाठ पढ़ें!': 'गोड़ लागो ही संगी! चल मिल के नवा पाठ पढ़ब! (God lago hi sangi! Chal mil ke nawa paath padhab!)'
  }
};

/* ==========================================================================
   Dataset: Vernacular Story Catalog
   ========================================================================== */
const storiesCatalog = [
  {
    id: 'rabbit',
    title: 'The Clever Rabbit & The Lion (चतुर खरगोश)',
    pages: [
      {
        vernacular: 'ᱢᱤᱫᱴᱟᱝ ᱜᱟᱰᱟ ᱟᱲᱮ ᱨᱮ ᱢᱤᱫ ᱪᱟᱹᱛᱩᱨ ᱠᱩᱞᱟᱹᱭ ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ᱾ ᱩᱱᱤ ᱫᱚ ᱟᱹᱰᱤ ᱪᱟᱞᱟᱠ ᱮ ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ᱾',
        pronunciation: '(Midtang gada are re mid chatur kulai tahe kana. Uni do adi chalak e tahe kana.)',
        hindi: 'एक सुंदर नदी के किनारे एक बहुत चतुर खरगोश रहता था। वह अपनी बुद्धिमानी के लिए पूरे जंगल में जाना जाता था।'
      },
      {
        vernacular: 'ᱢᱤᱫ ᱫᱤᱱ ᱵᱤᱨ ᱨᱤᱱᱤᱡ ᱠᱩᱞ (ᱛᱟᱹᱨᱩᱵ) ᱡᱚᱛᱚ ᱡᱤᱵᱽ ᱡᱤᱭᱟᱹᱞᱤ ᱠᱚ ᱮᱢ ᱟᱹᱜᱩ ᱞᱟᱹᱜᱤᱫ ᱮ ᱢᱮᱛᱟᱫ ᱠᱚᱣᱟ᱾',
        pronunciation: '(Mid din bir rinij kul joto jib jiyali ko em agu lagid e metad kowa.)',
        hindi: 'एक दिन जंगल के घमंडी शेर ने सभी जानवरों को डराकर एक-एक करके भोजन के लिए आने को कहा।'
      },
      {
        vernacular: 'ᱠᱩᱞᱟᱹᱭ ᱫᱚ ᱟᱡᱟᱜ ᱵᱩᱫᱷᱤ ᱛᱮ ᱠᱩᱞ ᱫᱚ ᱢᱤᱫ ᱠᱩᱧ ᱨᱮ ᱩᱢᱩᱞ ᱫᱮᱠᱷᱟᱣ ᱠᱟᱛᱮ ᱵᱟᱧᱪᱟᱣ ᱠᱮᱫ ᱠᱚᱣᱟᱭ᱾',
        pronunciation: '(Kulai do ajag budhi te kul do mid kunj re umul dekhaw kate banchaw ked koway.)',
        hindi: 'चतुर खरगोश ने कुएँ में शेर को उसी की परछाईं दिखाकर कुएँ में कूदने पर मजबूर कर दिया और सभी की जान बचाई!'
      }
    ]
  },
  {
    id: 'tree',
    title: 'The Sacred Sal Tree (साल वृक्ष का रहस्य)',
    pages: [
      {
        vernacular: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱨᱮᱱᱟᱜ ᱵᱤᱨ ᱨᱮ ᱥᱟᱨᱡᱚᱢ (ᱥᱟᱞ) ᱫᱟᱨᱮ ᱫᱚ ᱡᱚᱛᱚ ᱠᱷᱚᱱ ᱯᱩᱵᱤᱛᱨᱚ ᱢᱮᱱᱛᱮ ᱠᱚ ᱞᱮᱠᱷᱟᱭᱟ᱾',
        pronunciation: '(Jharkhand renag bir re sarjom dare do joto khon pubitro mente ko lekhaya.)',
        hindi: 'झारखंड के वनों में साल (सरजोम) का वृक्ष सबसे पवित्र और पूजनीय माना जाता है।'
      },
      {
        vernacular: 'ᱱᱚᱣᱟ ᱫᱟᱨᱮ ᱫᱚ ᱟᱵᱚ ᱨᱤᱱ ᱵᱚᱸᱜᱟ ᱵᱩᱨᱩ ᱟᱨ ᱯᱨᱚᱠᱨᱤᱛᱤ ᱨᱮᱱᱟᱜ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱠᱟᱱᱟ᱾',
        pronunciation: '(Nowa dare do abo rin bonga buru ar prokriti renag rukhiya kana.)',
        hindi: 'यह वृक्ष हमें शुद्ध हवा, फल, छाया और प्रकृति के संरक्षण की शक्ति देता है।'
      },
      {
        vernacular: 'ᱵᱟᱦᱟ ᱯᱚᱨᱚᱵᱽ ᱨᱮ ᱟᱞᱮ ᱥᱟᱨᱡᱚᱢ ᱵᱟᱦᱟ ᱛᱮ ᱥᱟᱡᱟᱣ ᱠᱟᱛᱮ ᱮᱱᱮᱡ ᱥᱮᱨᱮᱧᱟᱞᱮ᱾',
        pronunciation: '(Baha porob re ale sarjom baha te sajaw kate enej serenjale.)',
        hindi: 'बाहा पर्व पर सब लोग साल के फूलों से सजकर प्रकृति के प्रति आभार व्यक्त करते हैं।'
      }
    ]
  },
  {
    id: 'bird',
    title: 'The Singing Bird (छोटा नागपुर की चिड़िया)',
    pages: [
      {
        vernacular: 'ᱪᱷᱳᱴᱟ ᱱᱟᱜᱽᱯᱩᱨ ᱵᱩᱨᱩ ᱪᱮᱛᱟᱱ ᱨᱮ ᱢᱤᱫ ᱨᱚᱝ-ᱵᱮᱨᱚᱝ ᱪᱮᱬᱮ ᱥᱮᱨᱮᱧ ᱛᱟᱦᱮᱸᱫ᱾',
        pronunciation: '(Chhota Nagpur buru chetan re mid rong-berong chene serenj taehed.)',
        hindi: 'छोटा नागपुर की पहाड़ियों पर एक रंग-बिरंगी प्यारी चिड़िया मधुर गीत गाती थी।'
      },
      {
        vernacular: 'ᱩᱱᱤᱭᱟᱜ ᱥᱮᱨᱮᱧ ᱟᱸᱡᱚᱢ ᱛᱮ ᱡᱷᱟᱨᱱᱟ ᱨᱮᱱᱟᱜ ᱫᱟᱜ ᱦᱚᱸ ᱱᱟᱪᱚᱜ ᱠᱟᱱ ᱛᱟᱦᱮᱸᱫ᱾',
        pronunciation: '(Uniyag serenj anjom te jharna renag daak ho nachog kan taehed.)',
        hindi: 'उसकी मीठी बोली सुनकर जंगल के झरने और फूल भी खुशी से झूम उठते थे।'
      },
      {
        vernacular: 'ᱡᱚᱛᱚ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ ᱩᱱᱤ ᱥᱟᱶ ᱢᱤᱫ ᱥᱟᱶᱛᱮ ᱨᱟᱹᱥᱠᱟᱹ ᱛᱮ ᱮᱱᱮᱡ ᱠᱮᱫᱟ᱾',
        pronunciation: '(Joto gidra ko uni saw mid sawte raska te enej keda.)',
        hindi: 'सभी बच्चे उस चिड़िया के साथ मिलकर अपनी मातृभाषा में गीत गाने लगे!'
      }
    ]
  }
];

/* ==========================================================================
   Hero Mascot & Greeting Interactivity
   ========================================================================== */
let greetingIndex = 0;

function updateHeroGreeting() {
  const lang = state.activeLanguage;
  const greetingsList = mascotGreetings[lang] || mascotGreetings['Santhali'];
  const cur = greetingsList[greetingIndex % greetingsList.length];

  if ($('greetingVernacular')) $('greetingVernacular').textContent = cur.vernacular;
  if ($('greetingPronunciation')) $('greetingPronunciation').textContent = cur.pronunciation;
  if ($('greetingTranslation')) $('greetingTranslation').textContent = cur.translation;
  if ($('greetingLangTag')) $('greetingLangTag').textContent = `In ${lang}`;
  if ($('heroMotherTongueText')) $('heroMotherTongueText').textContent = `${lang}!`;

  // Update hero tag badge
  if ($('storyLangPill')) $('storyLangPill').textContent = `Language: ${lang}`;
}

function listenGreeting() {
  const lang = state.activeLanguage;
  const greetingsList = mascotGreetings[lang] || mascotGreetings['Santhali'];
  const cur = greetingsList[greetingIndex % greetingsList.length];
  speakText(cur.speakText || cur.vernacular);
  playTone(660, 'sine', 0.1);
}

function cycleGreeting() {
  greetingIndex++;
  updateHeroGreeting();
  playPopSound();
  toast(`Switched greeting in ${state.activeLanguage}! ✨`);
}



/* ==========================================================================
   Language Lab & Math Magic Interactivity
   ========================================================================== */
let searchDebounceTimer = null;

async function loadCategories() {
  const bar = $('wordCategoryBar');
  if (!bar) return;

  try {
    if (window.WordAPI && window.WordAPI.getCategories) {
      const res = await window.WordAPI.getCategories();
      const categories = (res && res.categories) ? res.categories : [];
      renderCategoryChips(categories);
      return;
    }
  } catch (err) {
    console.warn('WordAPI getCategories fallback:', err);
  }

  // Safe fallback categories
  renderCategoryChips(['General', 'Nature', 'Greetings', 'Animals', 'Food', 'Family']);
}

function renderCategoryChips(categories) {
  const bar = $('wordCategoryBar');
  if (!bar) return;

  const allCats = ['All', ...categories];
  bar.innerHTML = allCats.map(cat => `
    <button class="story-pill ${state.selectedCategory === cat ? 'active' : ''}" data-category="${cat}">
      ${cat === 'All' ? '🌟 All Words' : cat}
    </button>
  `).join('');

  bar.querySelectorAll('.story-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      bar.querySelectorAll('.story-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.selectedCategory = pill.dataset.category;
      playPopSound();
      loadFlashcards(state.selectedCategory, state.activeLanguage);
    });
  });
}

async function loadFlashcards(category = state.selectedCategory, language = state.activeLanguage, isShuffle = false) {
  const grid = $('flashcardGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: var(--ink-light); font-weight: 600;">
      ⏳ Loading words...
    </div>
  `;

  try {
    if (window.WordAPI) {
      const catParam = (category && category !== 'All') ? category : '';
      let data;

      if (state.searchQuery && state.searchQuery.trim()) {
        data = await window.WordAPI.searchWords(state.searchQuery.trim(), catParam, language, 8);
      } else {
        data = await window.WordAPI.getRandomWords(catParam, language, 6);
      }

      const words = (data && data.words) ? data.words : [];
      state.wordsList = words;
      renderFlashcardGrid(words);
      return;
    }
  } catch (err) {
    console.warn('WordAPI loadFlashcards error, using fallback:', err);
  }

  renderFallbackFlashcards();
}

function renderFlashcardGrid(words) {
  const grid = $('flashcardGrid');
  if (!grid) return;

  if (!words || words.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 28px; color: var(--ink-light); font-weight: 700;">
        🌱 No words found. Try another category or search query!
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  words.forEach(w => {
    const btn = document.createElement('button');
    btn.className = 'flashcard-btn';
    btn.innerHTML = `
      <span class="fc-sound" title="Listen">🔊</span>
      <span class="fc-emoji">${w.emoji || '🌟'}</span>
      <span class="fc-eng">${w.english_word || ''}</span>
      <span class="fc-hin">${w.hindi_word || ''}</span>
      <span class="fc-native">${w.local_word || ''}</span>
    `;

    btn.addEventListener('click', () => {
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = '', 150);
      playWordAudio(w, 'local');
      toast(`🌟 ${w.english_word || ''} = ${w.hindi_word || ''} / ${w.local_word || ''}`);
    });

    grid.appendChild(btn);
  });
}

function renderFallbackFlashcards() {
  const fallbacks = [
    { id: '1', emoji: '🌳', english_word: 'Tree', hindi_word: 'पेड़', local_word: 'ᱫᱟᱨᱮ (Dare)' },
    { id: '2', emoji: '💧', english_word: 'Water', hindi_word: 'पानी', local_word: 'ᱫᱟᱜ (Daak)' },
    { id: '3', emoji: '☀️', english_word: 'Sun', hindi_word: 'सूरज', local_word: 'ᱥᱤᱧ (Singi)' },
    { id: '4', emoji: '📖', english_word: 'Book', hindi_word: 'किताब', local_word: 'ᱯᱩᱛᱷᱤ (Puthi)' }
  ];
  renderFlashcardGrid(fallbacks);
}

function initWordExplorerControls() {
  const searchInput = $('wordExplorerSearchInput');
  const refreshBtn = $('refreshFlashcardsBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        state.searchQuery = e.target.value.trim();
        loadFlashcards(state.selectedCategory, state.activeLanguage);
      }, 300);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      playPopSound();
      loadFlashcards(state.selectedCategory, state.activeLanguage, true);
    });
  }
}

function initLearningModules() {
  // Tabs
  const tabLang = $('tabLangLab');
  const tabMath = $('tabMathMagic');
  const viewLang = $('viewLangLab');
  const viewMath = $('viewMathMagic');

  if (tabLang && tabMath && viewLang && viewMath) {
    tabLang.addEventListener('click', () => {
      tabLang.classList.add('active');
      tabMath.classList.remove('active');
      viewLang.classList.add('active');
      viewMath.classList.remove('active');
      playPopSound();
    });

    tabMath.addEventListener('click', () => {
      tabMath.classList.add('active');
      tabLang.classList.remove('active');
      viewMath.classList.add('active');
      viewLang.classList.remove('active');
      playPopSound();
    });
  }

  // Math Blocks
  document.querySelectorAll('.math-block').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.dataset.num;
      const hin = btn.dataset.hin;
      const san = btn.dataset.san;

      if ($('mathNumDisplay')) $('mathNumDisplay').textContent = num;
      if ($('mathHinDisplay')) $('mathHinDisplay').textContent = `${hin} (Hindi)`;
      if ($('mathSanDisplay')) $('mathSanDisplay').textContent = `${san} (${state.activeLanguage})`;

      btn.style.transform = 'scale(0.9)';
      setTimeout(() => btn.style.transform = '', 150);

      speakText(san || hin);
      playTone(350 + Number(num) * 60, 'triangle', 0.18, 0.08);
    });
  });

  if ($('speakMathNum')) {
    $('speakMathNum').addEventListener('click', () => {
      const san = $('mathSanDisplay').textContent;
      speakText(san);
    });
  }
}

/* ==========================================================================
   Vocabulary Match Mini-Game
   ========================================================================== */
const fallbackGameQuestions = [
  {
    target: 'Water (पानी)',
    correct: 'ᱫᱟᱜ (Daak)',
    options: ['ᱫᱟᱜ (Daak)', 'ᱫᱟᱨᱮ (Dare)', 'ᱥᱤᱧ (Singi)', 'ᱯᱩᱛᱷᱤ (Puthi)']
  },
  {
    target: 'Tree (पेड़)',
    correct: 'ᱫᱟᱨᱮ (Dare)',
    options: ['ᱫᱟᱨᱮ (Dare)', 'ᱥᱤᱧ (Singi)', 'ᱫᱟᱜ (Daak)', 'ᱚᱲᱟᱜ (Orak)']
  },
  {
    target: 'Sun (सूरज)',
    correct: 'ᱥᱤᱧ (Singi)',
    options: ['ᱥᱤᱧ (Singi)', 'ᱯᱩᱛᱷᱤ (Puthi)', 'ᱫᱟᱨᱮ (Dare)', 'ᱡᱚᱦᱟᱨ (Johar)']
  },
  {
    target: 'Book (किताब)',
    correct: 'ᱯᱩᱛᱷᱤ (Puthi)',
    options: ['ᱯᱩᱛᱷᱤ (Puthi)', 'ᱫᱟᱜ (Daak)', 'ᱦᱟᱥᱟ (Hasa)', 'ᱥᱤᱧ (Singi)']
  },
  {
    target: 'Hello / Greetings (नमस्ते)',
    correct: 'Johar (ᱡᱚᱦᱟᱨ)',
    options: ['Johar (ᱡᱚᱦᱟᱨ)', 'Sarhao (ᱥᱟᱨᱦᱟᱣ)', 'Daak (ᱫᱟᱜ)', 'Dare (ᱫᱟᱨᱮ)']
  }
];

let dynamicGameQuestions = [];
let vocabCurrentQuestion = 0;

async function openVocabGame() {
  vocabCurrentQuestion = 0;
  state.vocabGameScore = 0;
  const modal = $('vocabGameModal');
  if (modal) modal.classList.add('show');
  playSparkleSound();

  const grid = $('vocabOptionsGrid');
  if (grid) {
    grid.innerHTML = '<div style="padding: 20px; color: var(--ink-light); font-weight: 600;">⏳ Preparing game words...</div>';
  }

  try {
    if (window.WordAPI && window.WordAPI.getRandomWords) {
      const res = await window.WordAPI.getRandomWords("", state.activeLanguage, 12);
      const words = (res && res.words && res.words.length >= 4) ? res.words : null;
      if (words) {
        dynamicGameQuestions = [];
        const numQ = Math.min(5, words.length);
        for (let i = 0; i < numQ; i++) {
          const target = words[i];
          const others = words.filter(w => w.id !== target.id);
          const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 3);
          const optionsList = [target, ...shuffledOthers].sort(() => Math.random() - 0.5);

          dynamicGameQuestions.push({
            targetWord: `${target.english_word} (${target.hindi_word})`,
            correctId: target.id,
            correctLocal: target.local_word,
            options: optionsList.map(opt => ({
              id: opt.id,
              label: `${opt.emoji ? opt.emoji + ' ' : ''}${opt.local_word}`
            }))
          });
        }
      } else {
        dynamicGameQuestions = fallbackGameQuestions;
      }
    } else {
      dynamicGameQuestions = fallbackGameQuestions;
    }
  } catch (err) {
    console.warn('Failed to load dynamic game questions:', err);
    dynamicGameQuestions = fallbackGameQuestions;
  }

  loadVocabQuestion();
}

function loadVocabQuestion() {
  const questions = (dynamicGameQuestions && dynamicGameQuestions.length > 0) ? dynamicGameQuestions : fallbackGameQuestions;
  const q = questions[vocabCurrentQuestion % questions.length];

  if ($('gameTargetWord')) $('gameTargetWord').textContent = q.targetWord || q.target;
  if ($('gameScore')) $('gameScore').textContent = state.vocabGameScore;
  if ($('gameFeedbackText')) $('gameFeedbackText').textContent = 'Tap the correct matching option!';

  const grid = $('vocabOptionsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const options = q.options || [];
  options.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'vocab-game-opt';
    const optLabel = typeof opt === 'string' ? opt : opt.label;
    const optId = typeof opt === 'string' ? opt : opt.id;
    const isCorrect = q.correctId ? (optId === q.correctId) : (optLabel === q.correct || opt === q.correct);

    b.textContent = optLabel;
    b.addEventListener('click', () => handleVocabAnswer(isCorrect, b, q));
    grid.appendChild(b);
  });
}

function handleVocabAnswer(isCorrect, element, questionObj) {
  const allBtns = document.querySelectorAll('.vocab-game-opt');
  allBtns.forEach(b => b.disabled = true);

  if (isCorrect) {
    element.classList.add('correct');
    state.vocabGameScore++;
    if ($('gameScore')) $('gameScore').textContent = state.vocabGameScore;
    if ($('gameFeedbackText')) $('gameFeedbackText').textContent = '🎉 Correct! Wonderful job!';
    playSuccessChime();

    if (state.vocabGameScore >= 3) {
      fireConfetti();
    }
  } else {
    element.classList.add('wrong');
    allBtns.forEach(b => {
      if (questionObj.correctLocal && b.textContent.includes(questionObj.correctLocal)) {
        b.classList.add('correct');
      } else if (questionObj.correct && b.textContent === questionObj.correct) {
        b.classList.add('correct');
      }
    });
    if ($('gameFeedbackText')) $('gameFeedbackText').textContent = 'Oops! Keep practicing!';
    playTone(280, 'sawtooth', 0.2);
  }

  const questions = (dynamicGameQuestions && dynamicGameQuestions.length > 0) ? dynamicGameQuestions : fallbackGameQuestions;
  const totalQuestions = questions.length;

  setTimeout(() => {
    vocabCurrentQuestion++;
    if (vocabCurrentQuestion >= totalQuestions) {
      toast(`🏆 Great effort! You scored ${state.vocabGameScore}/${totalQuestions}!`);
      fireConfetti();
      setTimeout(() => {
        const modal = $('vocabGameModal');
        if (modal) modal.classList.remove('show');
      }, 1800);
    } else {
      loadVocabQuestion();
    }
  }, 1200);
}

/* ==========================================================================
   Vernacular Story Corner & Interactive Reader Modal
   ========================================================================== */
function initStoryCorner() {
  // Story pills selection
  document.querySelectorAll('.story-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.story-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const storyId = pill.dataset.story;
      const sIndex = storiesCatalog.findIndex(s => s.id === storyId);
      if (sIndex !== -1) {
        state.activeStoryIndex = sIndex;
        state.storyCurrentPage = 0;
        const s = storiesCatalog[sIndex];
        if ($('featuredStoryTitle')) $('featuredStoryTitle').textContent = s.title;
        playPopSound();
      }
    });
  });

  // Read Now button
  if ($('btnReadNow')) {
    $('btnReadNow').addEventListener('click', openStoryReader);
  }

  if ($('btnBrowseStories')) {
    $('btnBrowseStories').addEventListener('click', () => {
      const nextIdx = (state.activeStoryIndex + 1) % storiesCatalog.length;
      const pills = document.querySelectorAll('.story-pill');
      if (pills[nextIdx]) pills[nextIdx].click();
    });
  }

  // Modal navigation
  if ($('closeStoryModal')) {
    $('closeStoryModal').addEventListener('click', closeStoryReader);
  }
  if ($('closeVocabModal')) {
    $('closeVocabModal').addEventListener('click', () => {
      const modal = $('vocabGameModal');
      if (modal) modal.classList.remove('show');
    });
  }

  if ($('btnNextPage')) {
    $('btnNextPage').addEventListener('click', () => {
      const s = storiesCatalog[state.activeStoryIndex];
      if (state.storyCurrentPage < s.pages.length - 1) {
        state.storyCurrentPage++;
        renderStoryPage();
        playPopSound();
      }
    });
  }

  if ($('btnPrevPage')) {
    $('btnPrevPage').addEventListener('click', () => {
      if (state.storyCurrentPage > 0) {
        state.storyCurrentPage--;
        renderStoryPage();
        playPopSound();
      }
    });
  }

  if ($('btnPlayStoryAudio')) {
    $('btnPlayStoryAudio').addEventListener('click', () => {
      const s = storiesCatalog[state.activeStoryIndex];
      const page = s.pages[state.storyCurrentPage];
      speakText(page.pronunciation || page.vernacular);
      playSparkleSound();
    });
  }

  if ($('btnPauseStoryAudio')) {
    $('btnPauseStoryAudio').addEventListener('click', () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    });
  }
}

function openStoryReader() {
  state.storyCurrentPage = 0;
  const modal = $('storyModal');
  if (!modal) return;
  modal.classList.add('show');
  renderStoryPage();
  playSparkleSound();
}

function closeStoryReader() {
  const modal = $('storyModal');
  if (modal) modal.classList.remove('show');
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function renderStoryPage() {
  const s = storiesCatalog[state.activeStoryIndex];
  const page = s.pages[state.storyCurrentPage];

  if ($('modalStoryTitle')) $('modalStoryTitle').textContent = s.title;
  if ($('currentPageNum')) $('currentPageNum').textContent = state.storyCurrentPage + 1;

  const contentBox = $('storyReaderContent');
  if (contentBox) {
    contentBox.innerHTML = `
      <p class="story-p-vernacular">${page.vernacular}</p>
      <p class="story-p-pronunciation">${page.pronunciation}</p>
      <p class="story-p-hindi">💡 <strong>अर्थ (Hindi):</strong> ${page.hindi}</p>
    `;
  }

  // Update buttons
  if ($('btnPrevPage')) $('btnPrevPage').disabled = state.storyCurrentPage === 0;
  if ($('btnNextPage')) $('btnNextPage').disabled = state.storyCurrentPage === s.pages.length - 1;

  // Update dots
  const dotsContainer = $('pageDots');
  if (dotsContainer) {
    dotsContainer.innerHTML = s.pages.map((_, i) => `
      <span class="dot ${i === state.storyCurrentPage ? 'active' : ''}"></span>
    `).join('');
  }

  // Last page celebration
  if (state.storyCurrentPage === s.pages.length - 1) {
    fireConfetti();
    toast('🎉 Great job! You finished reading the story!');
  }
}

/* ==========================================================================
   Real-Time Translation & Peer Collaboration Zone
   ========================================================================== */
function initCollaborationZone() {
  // Bubble speak buttons
  document.querySelectorAll('.bubble-speak-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btn.dataset.text;
      const lang = btn.dataset.lang;
      speakText(text, lang);
      playPopSound();
    });
  });

  // Simulator controls
  const msgInput = $('simMessageInput');
  const sendBtn = $('btnSimulateSend');
  const peerLangSelect = $('simPeerLang');

  if (sendBtn && msgInput) {
    sendBtn.addEventListener('click', simulatePeerSend);
    msgInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        simulatePeerSend();
      }
    });
  }

  // Quick chips
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      if (msgInput) {
        msgInput.value = chip.dataset.phrase;
        simulatePeerSend();
      }
    });
  });

  if ($('speakSimResult')) {
    $('speakSimResult').addEventListener('click', () => {
      const text = $('simTargetText').textContent;
      speakText(text);
    });
  }
}

async function simulatePeerSend() {
  const msgInput = $('simMessageInput');
  const text = msgInput ? msgInput.value.trim() : '';
  if (!text) return;

  const peerLang = $('simPeerLang') ? $('simPeerLang').value : 'Santhali';
  const senderLang = $('simSenderLang') ? $('simSenderLang').value : 'hin';

  if ($('simOriginalText')) $('simOriginalText').textContent = `"${text}"`;
  if ($('simTargetLabel')) $('simTargetLabel').textContent = `Your peer sees (${peerLang}):`;
  if ($('simTargetText')) $('simTargetText').textContent = 'Translating across circle... ✨';
  if ($('simTargetPhonetic')) $('simTargetPhonetic').textContent = '';

  playPopSound();

  // Try backend API first
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        target_language: peerLang.toLowerCase(),
        source_language: senderLang
      })
    });

    if (res.ok) {
      const data = await res.json();
      const out = data.native_script || data.translated_text || data.devanagari;
      const ph = data.phonetic || data.transliteration;
      if (out) {
        if ($('simTargetText')) $('simTargetText').textContent = `"${out}"`;
        if ($('simTargetPhonetic')) $('simTargetPhonetic').textContent = ph ? `(${ph})` : '';
        playSuccessChime();
        speakText(ph || out);
        toast(`Transmitted in real-time to peer in ${peerLang}! ⚡`);
        return;
      }
    }
  } catch (err) {
    console.warn('Peer simulator translation fallback:', err);
  }

  // Offline fallback
  const langBook = phrasebook[peerLang] || phrasebook['Santhali'];
  const fallbackOut = langBook[text] || `${text} (${peerLang})`;

  if ($('simTargetText')) $('simTargetText').textContent = `"${fallbackOut}"`;
  if ($('simTargetPhonetic')) $('simTargetPhonetic').textContent = `(Instant peer sync verified)`;
  playSuccessChime();
  speakText(fallbackOut);
  toast(`Transmitted in real-time to peer in ${peerLang}! ⚡`);
}

/* ==========================================================================
   Core Translation Studio
   ========================================================================== */

/**
 * Maps frontend UI language strings to valid backend language parameters ("hindi", "english", "local")
 */
function mapUiLanguageToApiLanguage(uiValue) {
  const normalized = String(uiValue || "").trim().toLowerCase();

  if (
    normalized.includes("hindi") ||
    normalized.includes("हिन्दी") ||
    normalized.includes("हिंदी") ||
    normalized.includes("hinglish") ||
    normalized.includes("auto") ||
    normalized === "hin"
  ) {
    return "hindi";
  }

  if (
    normalized.includes("english") ||
    normalized.includes("अंग्रेज़ी") ||
    normalized === "eng"
  ) {
    return "english";
  }

  if (
    normalized.includes("santhali") ||
    normalized.includes("santali") ||
    normalized.includes("nagpuri") ||
    normalized.includes("khortha") ||
    normalized.includes("mother tongue") ||
    normalized.includes("vernacular") ||
    normalized.includes("local")
  ) {
    return "local";
  }

  return "english";
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initTranslatorStudio() {
  const transBtn = $('translateBtn');
  const inputArea = $('hindiText');
  const outputArea = $('translatedText');
  const srcLang = $('sourceLanguage');
  const tgtLang = $('targetLanguage');
  const swapBtn = $('swapBtn');

  if (transBtn) {
    transBtn.addEventListener('click', (e) => {
      e.preventDefault();
      performStudioTranslation();
    });
  }

  if (inputArea) {
    inputArea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        performStudioTranslation();
      }
    });
  }

  if (tgtLang) {
    tgtLang.addEventListener('change', () => {
      performStudioTranslation();
    });
  }

  if (srcLang) {
    srcLang.addEventListener('change', () => {
      const src = srcLang.value;
      if (src === 'eng') {
        if ($('inputCardLabel')) $('inputCardLabel').textContent = 'Write in English ✍️';
        if ($('inputTryNote')) $('inputTryNote').textContent = 'Try: Hello, Water, Tree, Thank you, Dog';
        if (inputArea && inputArea.value === 'नमस्ते') inputArea.value = 'Hello';
      } else {
        if ($('inputCardLabel')) $('inputCardLabel').textContent = 'Write in Hindi / English / Hinglish ✍️';
        if ($('inputTryNote')) $('inputTryNote').textContent = 'Try: नमस्ते, पानी, धन्यवाद, पेड़, कुत्ता';
      }
      performStudioTranslation();
    });
  }

  if (swapBtn && srcLang) {
    swapBtn.addEventListener('click', () => {
      srcLang.value = (srcLang.value === 'hin' ? 'eng' : 'hin');
      srcLang.dispatchEvent(new Event('change'));
      playPopSound();
    });
  }

  if ($('speakInput')) {
    $('speakInput').addEventListener('click', () => {
      const isEng = srcLang && (srcLang.value === 'eng' || /^[a-zA-Z\s]+$/.test(inputArea.value));
      speakText(inputArea.value, isEng ? 'en-IN' : 'hi-IN');
    });
  }

  if ($('speakResult')) {
    $('speakResult').addEventListener('click', () => {
      const text = outputArea ? outputArea.textContent.trim() : '';
      speakText(text);
    });
  }

  if ($('copyResult')) {
    $('copyResult').addEventListener('click', () => {
      const text = outputArea ? outputArea.textContent.trim() : '';
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          toast('📋 Copied translation to clipboard!');
          playPopSound();
        }).catch(err => {
          console.warn('Clipboard write error:', err);
        });
      }
    });
  }

  if ($('saveWord')) {
    $('saveWord').addEventListener('click', () => {
      toast('⭐ Saved to your personalized word collection!');
      playSparkleSound();
    });
  }

  if ($('clearInput') && inputArea) {
    $('clearInput').addEventListener('click', () => {
      inputArea.value = '';
      inputArea.focus();
      playPopSound();
    });
  }
}

async function performStudioTranslation() {
  const inputArea = $('hindiText');
  const outputArea = $('translatedText');
  const srcLang = $('sourceLanguage');
  const tgtLang = $('targetLanguage');
  const resLabel = $('resultLabel');

  const rawInput = inputArea ? inputArea.value : "";
  const cleanedInput = rawInput.trim();

  const targetName = tgtLang ? tgtLang.value : (state.activeLanguage || "Santhali");

  // 4. Validate input
  if (!cleanedInput) {
    if (outputArea) outputArea.textContent = "Please type a word first. 🌟";
    if (resLabel) resLabel.textContent = `In ${targetName} ✨`;
    return;
  }

  // 5. Map UI language values to backend API parameters
  const rawSrc = srcLang ? srcLang.value : "auto";
  let mappedFromLanguage = mapUiLanguageToApiLanguage(rawSrc);
  const mappedToLanguage = mapUiLanguageToApiLanguage(targetName);

  // Auto-detect English if text contains only Latin letters (e.g. "dog", "water") and source is auto or default
  if (rawSrc === "auto" || (mappedFromLanguage === "hindi" && /^[a-zA-Z\s.,!?'"-]+$/.test(cleanedInput))) {
    mappedFromLanguage = "english";
  } else if (mappedFromLanguage === "english" && /[\u0900-\u097F]/.test(cleanedInput)) {
    mappedFromLanguage = "hindi";
  }

  // 6. Show loading state in existing result area
  if (resLabel) resLabel.textContent = `In ${targetName} ⏳`;
  if (outputArea) outputArea.textContent = "Finding your word… ✨";
  playPopSound();

  // 7. Call window.WordAPI.translateWord
  try {
    if (!window.WordAPI || typeof window.WordAPI.translateWord !== 'function') {
      throw new Error("WordAPI client is not loaded.");
    }

    const result = await window.WordAPI.translateWord(
      cleanedInput,
      mappedFromLanguage,
      mappedToLanguage
    );

    // 8. On success, update existing result section with details
    if (result && result.found && (result.translation || (result.word && result.word.local_word))) {
      const word = result.word || {};
      const translationText = result.translation || word.local_word || "";

      outputArea.innerHTML = `
        <div class="translated-result-card" style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 4px 0;">
          <span style="font-size: 2.5rem; line-height: 1;">${word.emoji || '✨'}</span>
          <span style="font-size: 1.45em; font-weight: 800; color: var(--ink-dark);">${escapeHtml(translationText)}</span>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; font-size: 0.85rem; font-weight: 700; color: var(--ink-dark); margin-top: 4px;">
            <span style="background: rgba(2, 136, 209, 0.1); color: var(--primary-blue); padding: 3px 10px; border-radius: 999px;">
              Language: ${escapeHtml(word.language || targetName)}
            </span>
            <span style="background: rgba(255, 112, 67, 0.1); color: #EA580C; padding: 3px 10px; border-radius: 999px;">
              Category: ${escapeHtml(word.category || 'General')}
            </span>
            <span style="background: rgba(126, 87, 194, 0.1); color: var(--accent-purple); padding: 3px 10px; border-radius: 999px;">
              English: ${escapeHtml(word.english_word || '')} • Hindi: ${escapeHtml(word.hindi_word || '')}
            </span>
          </div>
        </div>
      `;

      if (resLabel) resLabel.textContent = `In ${targetName} ✨`;
      toast(`Wonderful! Found translation in ${targetName}.`);
      playSparkleSound();
      return;
    } else {
      // 9. If API returns found: false or unmatched
      outputArea.textContent = "We are still learning this word. Try another one or ask a teacher to contribute it! 🌱";
      if (resLabel) resLabel.textContent = `In ${targetName}`;
    }
  } catch (err) {
    console.error("[TranslationStudio] Translation error:", err);
    // 9. If API returns 404
    if (err && err.status === 404) {
      outputArea.textContent = "We are still learning this word. Try another one or ask a teacher to contribute it! 🌱";
      if (resLabel) resLabel.textContent = `In ${targetName}`;
      return;
    }
    // 10. If network/API error
    outputArea.textContent = "Oops! We could not translate right now. Please try again.";
    if (resLabel) resLabel.textContent = `In ${targetName}`;
  }
}

/* ==========================================================================
   Sparkle Trail Effect on Mouse / Touch
   ========================================================================== */
function initSparkleCursor() {
  let lastTime = 0;
  const sparkles = ['✨', '⭐', '🌟', '💫', '🎈', '💖'];

  function createSparkle(x, y) {
    const now = Date.now();
    if (now - lastTime < 38) return;
    lastTime = now;

    const el = document.createElement('div');
    el.className = 'sparkle';
    el.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.position = 'fixed';
    el.style.zIndex = '9998';
    el.style.pointerEvents = 'none';
    el.style.fontSize = (Math.random() * 10 + 14) + 'px';
    el.style.transition = 'all 0.65s cubic-bezier(0, 0.7, 0.1, 1)';

    document.body.appendChild(el);

    const deltaX = (Math.random() - 0.5) * 45;
    const deltaY = Math.random() * 30 + 15;
    const rotation = (Math.random() - 0.5) * 90;

    requestAnimationFrame(() => {
      el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0) rotate(${rotation}deg)`;
      el.style.opacity = '0';
    });

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 650);
  }

  window.addEventListener('mousemove', (e) => createSparkle(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) createSparkle(e.touches[0].clientX, e.touches[0].clientY);
  });
}

/* ==========================================================================
   Application Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Global Mother Tongue Selector
  const globalLangSelect = $('globalLangSelect');
  if (globalLangSelect) {
    globalLangSelect.addEventListener('change', (e) => {
      state.activeLanguage = e.target.value;
      updateHeroGreeting();
      playPopSound();
      toast(`Mother tongue switched to: ${state.activeLanguage} 🗣️`);

      // Reload Word Explorer flashcards
      loadFlashcards(state.selectedCategory, state.activeLanguage);

      // Sync target language in translation studio
      const tgt = $('targetLanguage');
      if (tgt) {
        for (let opt of tgt.options) {
          if (opt.value.toLowerCase() === state.activeLanguage.toLowerCase()) {
            tgt.value = opt.value;
            performStudioTranslation();
            break;
          }
        }
      }
    });
  }

  // Sound Toggle
  const soundToggle = $('soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      const icon = soundToggle.querySelector('.sound-icon');
      if (icon) icon.textContent = state.soundEnabled ? '🔊' : '🔇';
      toast(state.soundEnabled ? '🔊 Sound effects turned ON!' : '🔇 Sound effects muted.');
      if (state.soundEnabled) playTone(600, 'sine', 0.1);
    });
  }

  // Mobile Menu
  const mobileBtn = $('mobileMenu');
  const nav = $('navigation');
  if (mobileBtn && nav) {
    mobileBtn.addEventListener('click', () => nav.classList.toggle('open'));
    document.querySelectorAll('#navigation a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // Hero Mascot Events
  const mascotImg = $('mascotImg');
  if (mascotImg) {
    mascotImg.addEventListener('click', () => {
      mascotImg.style.transform = 'scale(0.96) rotate(-2deg)';
      setTimeout(() => mascotImg.style.transform = '', 200);
      listenGreeting();
      playSparkleSound();
    });
  }

  if ($('listenGreetingBtn')) $('listenGreetingBtn').addEventListener('click', listenGreeting);
  if ($('cycleGreetingBtn')) $('cycleGreetingBtn').addEventListener('click', cycleGreeting);
  if ($('sayHelloBtn')) $('sayHelloBtn').addEventListener('click', () => {
    listenGreeting();
    fireConfetti();
  });

  if ($('btnPlayVocabGame')) {
    $('btnPlayVocabGame').addEventListener('click', openVocabGame);
  }

  // Initialize Modules
  initLearningModules();
  loadCategories();
  loadFlashcards('All', state.activeLanguage);
  initWordExplorerControls();
  initStoryCorner();
  initCollaborationZone();
  initTranslatorStudio();
  initSparkleCursor();
  initStudentSession();
  updateHeroGreeting();
});

// Student Profile & Login Session Manager
function initStudentSession() {
  try {
    const raw = localStorage.getItem('bhashasetu_user');
    const loginBtn = $('loginNavBtn');
    const userBadge = $('userBadgeCard');
    const avatarIcon = $('userAvatarIcon');
    const nameLabel = $('userNameLabel');

    if (raw && loginBtn && userBadge) {
      const user = JSON.parse(raw);
      if (user && user.name) {
        loginBtn.style.display = 'none';
        userBadge.style.display = 'inline-flex';
        if (avatarIcon) avatarIcon.textContent = user.avatar || '🧒';
        if (nameLabel) nameLabel.textContent = user.name;
        userBadge.title = `Logged in as ${user.name} (${user.grade || 'Primary'}) - Click switch to change student`;
      }
    }
  } catch (e) {
    console.warn('Session load error', e);
  }
}

window.switchOrLogoutUser = function() {
  if (confirm('Do you want to switch or log in as a different student? 🧒')) {
    try {
      localStorage.removeItem('bhashasetu_user');
    } catch(e) {}
    window.location.href = 'login.html';
  }
};
