import React, { useState } from 'react';

/**
 * KidLoginPage - A vibrant, playful, and culturally welcoming Login Component
 * for Primary School Kids (Ages 5-10) in an AI-Powered Vernacular Education App.
 * Built with React & Tailwind CSS.
 */

// Multilingual Greetings Dictionary
const VERNACULAR_GREETINGS = {
  hi: {
    name: 'हिन्दी (Hindi)',
    flag: '🇮🇳',
    heading: 'नमस्ते नन्हे दोस्त! 🌟',
    subtext: 'अपनी मातृभाषा में सीखने की जादुई दुनिया में स्वागत है!',
    speakPrompt: 'नमस्ते नन्हे दोस्त! चलो मिलकर कुछ नया सीखें!'
  },
  sat: {
    name: 'ᱥᱟᱱᱛᱟᱲᱤ (Santhali)',
    flag: '🌾',
    heading: 'ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹ! 🌈',
    subtext: 'ᱟᱞᱮ ᱥᱟᱶ ᱟᱯᱱᱟᱨ ᱯᱟᱹᱨᱥᱤ ᱛᱮ ᱥᱮᱪᱮᱫᱚᱜ ᱢᱮ!',
    speakPrompt: 'Johar gidra! Ale saw apnar parsi te sechedog me!'
  },
  ta: {
    name: 'தமிழ் (Tamil)',
    flag: '🪔',
    heading: 'வணக்கம் நண்பா! 🎨',
    subtext: 'தாய்மொழியில் மகிழ்ச்சியாகக் கற்க வாருங்கள்!',
    speakPrompt: 'வணக்கம் குழந்தைகளே! ஒன்றாகக் கற்போம்!'
  },
  bn: {
    name: 'বাংলা (Bengali)',
    flag: '🎨',
    heading: 'নমস্কার ছোট্ট বন্ধুরা! 🎈',
    subtext: 'মাতৃভাষায় আনন্দে শেখার সেতুতে তোমাদের স্বাগত!',
    speakPrompt: 'নমস্কার ছোট্ট বন্ধুরা! এসো একসাথে শিখি!'
  },
  en: {
    name: 'English',
    flag: '🌟',
    heading: 'Welcome Little Star! 🚀',
    subtext: 'Your AI Vernacular Teacher is waiting for you!',
    speakPrompt: 'Welcome little star! Ready to explore and learn together?'
  }
};

// Available Picture Keys for Young Children
const PICTURE_KEYS = [
  { emoji: '🦁', name: 'Lion' },
  { emoji: '🥭', name: 'Mango' },
  { emoji: '🐘', name: 'Elephant' },
  { emoji: '🍓', name: 'Berry' },
  { emoji: '🌟', name: 'Star' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '🌸', name: 'Flower' },
  { emoji: '⚽', name: 'Ball' }
];

export default function KidLoginPage({ onLoginSuccess }) {
  // State Management
  const [selectedLang, setSelectedLang] = useState('hi');
  const [loginMode, setLoginMode] = useState('word'); // 'word' | 'picture'
  const [username, setUsername] = useState('Aarav');
  const [password, setPassword] = useState('');
  const [isPasswordPeeked, setIsPasswordPeeked] = useState(false);
  const [selectedPictures, setSelectedPictures] = useState([]);
  const [gradeLevel, setGradeLevel] = useState('Grades 1-3');
  const [isMascotWiggling, setIsMascotWiggling] = useState(false);

  const currentGreeting = VERNACULAR_GREETINGS[selectedLang] || VERNACULAR_GREETINGS.hi;

  // Sound Synthesizer (Web Audio API)
  const playTone = (freq = 520, duration = 0.12) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // Text-To-Speech Pronunciation
  const speakGreeting = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentGreeting.speakPrompt);
      utterance.pitch = 1.2;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mascot Poke Interaction
  const handleMascotPoke = () => {
    setIsMascotWiggling(true);
    playTone(650);
    speakGreeting();
    setTimeout(() => setIsMascotWiggling(false), 1000);
  };

  // Picture Password Handling
  const handleSelectPicture = (emoji) => {
    if (selectedPictures.length < 2) {
      const next = [...selectedPictures, emoji];
      setSelectedPictures(next);
      playTone(500 + next.length * 150);
    }
  };

  const handleResetPictures = () => {
    setSelectedPictures([]);
    playTone(320);
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    playTone(780);
    if (onLoginSuccess) {
      onLoginSuccess({
        username,
        language: selectedLang,
        grade: gradeLevel,
        authType: loginMode
      });
    } else {
      alert(`🎉 Welcome back, ${username}! Let's start learning in ${currentGreeting.name}! 🚀`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 text-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* 1. Subtle Animated Magical Landscape Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Soft Sun */}
        <div className="absolute top-10 left-16 w-24 h-24 bg-amber-300/40 rounded-full blur-2xl"></div>
        <div className="absolute top-12 left-16 text-5xl animate-bounce">☀️</div>

        {/* Floating Clouds */}
        <div className="absolute top-20 left-[12%] text-6xl opacity-75 animate-pulse">☁️</div>
        <div className="absolute top-36 right-[14%] text-7xl opacity-70">☁️</div>
        <div className="absolute bottom-32 left-[8%] text-5xl opacity-60">☁️</div>

        {/* Twinkling Stars */}
        <div className="absolute top-16 right-1/4 text-2xl animate-spin">✨</div>
        <div className="absolute top-44 left-1/3 text-xl">🌟</div>
        <div className="absolute bottom-40 right-1/3 text-2xl">⭐</div>

        {/* Soft Green Rolling Hills */}
        <div className="absolute -bottom-24 left-0 right-0 h-44 bg-gradient-to-t from-emerald-300/50 to-transparent rounded-[100%] scale-125"></div>
        <div className="absolute -bottom-16 -left-20 right-0 h-40 bg-gradient-to-t from-green-300/30 to-transparent rounded-[100%]"></div>
      </div>

      {/* 2. Main Login Layout Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 py-6">

        {/* Left Column: Mascot & Speech Bubble */}
        <div className="w-full md:w-5/12 flex flex-col items-center text-center">
          {/* Dynamic Greeting Bubble */}
          <div className="relative bg-white/95 backdrop-blur-sm border-4 border-amber-400 rounded-3xl p-5 shadow-lg shadow-amber-200/50 mb-5 max-w-sm transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl animate-bounce">👋</span>
              <h3 className="text-xl font-bold text-amber-600">
                {currentGreeting.heading}
              </h3>
            </div>
            <p className="text-slate-600 text-sm font-medium">
              "{currentGreeting.subtext}"
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-r-4 border-b-4 border-amber-400 rotate-45"></div>
          </div>

          {/* Friendly Mascot Placeholder (Gajju the Elephant with Book) */}
          <div 
            onClick={handleMascotPoke}
            className={`relative group cursor-pointer transition-transform ${isMascotWiggling ? 'scale-110 rotate-3' : 'hover:scale-105'}`}
            title="Click me to say hello!"
          >
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-indigo-100 via-sky-100 to-amber-100 rounded-full border-4 border-sky-400 shadow-xl flex items-center justify-center relative overflow-hidden">
              <div className="relative text-7xl sm:text-8xl select-none">
                🐘
                <span className="absolute -bottom-2 right-1 text-4xl transform -rotate-12">📖</span>
                <span className="absolute -top-3 -right-2 text-2xl">👓</span>
              </div>
            </div>
            {/* Mascot Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-bold px-4 py-1 rounded-full border-2 border-amber-500 shadow-md text-sm whitespace-nowrap">
              🐘 Gajju The AI Buddy
            </div>
          </div>

          <button 
            type="button"
            onClick={speakGreeting} 
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-sky-700 font-bold rounded-full border-2 border-sky-300 text-xs shadow-sm transition-all hover:scale-105"
          >
            <span>🔊</span> Tap to hear greeting
          </button>
        </div>

        {/* Right Column: Kid-Friendly Login Card */}
        <div className="w-full md:w-7/12 max-w-md bg-white/95 backdrop-blur-md border-4 border-sky-300 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-sky-200/60 relative">

          {/* Ribbon Header */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 text-white font-extrabold px-6 py-1.5 rounded-full border-2 border-white shadow-md text-sm tracking-wide flex items-center gap-1.5 whitespace-nowrap">
            <span>🌈</span> Vernacular AI Classroom
          </div>

          {/* 1. "Choose Your Language" Mother Tongue Selector */}
          <div className="mt-2 mb-5 bg-amber-50/90 border-2 border-amber-200 rounded-2xl p-3">
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>🗣️ Choose Mother Tongue:</span>
              <span className="text-[10px] text-amber-600 bg-amber-200/60 px-2 py-0.5 rounded-full font-bold">Language First</span>
            </label>
            <div className="relative">
              <select 
                value={selectedLang} 
                onChange={(e) => {
                  setSelectedLang(e.target.value);
                  playTone(580);
                }}
                className="w-full bg-white border-2 border-amber-300 text-slate-800 font-bold rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-amber-200/70 appearance-none cursor-pointer"
              >
                {Object.entries(VERNACULAR_GREETINGS).map(([code, item]) => (
                  <option key={code} value={code}>
                    {item.flag} {item.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-700 font-bold text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* 2. Login Mode Tabs */}
          <div className="flex bg-sky-100/70 p-1 rounded-2xl mb-5 border border-sky-200">
            <button 
              type="button"
              onClick={() => { setLoginMode('word'); playTone(600); }} 
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'word' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-sky-600'
              }`}
            >
              <span>🔑</span> Secret Word
            </button>
            <button 
              type="button"
              onClick={() => { setLoginMode('picture'); playTone(600); }} 
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'picture' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-sky-600'
              }`}
            >
              <span>🎨</span> Picture Login
            </button>
          </div>

          {/* 3. Secret Word Mode */}
          {loginMode === 'word' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Student Name or Magic Word 🎈
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xl">🧒</span>
                  <input 
                    type="text" 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Aarav, Ananya, Leo..." 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-sky-400 focus:bg-white text-slate-800 rounded-2xl font-semibold text-sm outline-none transition-all focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>

              {/* Password Field with Animal Peek Interaction */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Secret Key 🔐
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xl">⭐</span>
                  <input 
                    type={isPasswordPeeked ? 'text' : 'password'} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..." 
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border-2 border-slate-200 focus:border-sky-400 focus:bg-white text-slate-800 rounded-2xl font-semibold text-sm outline-none transition-all focus:ring-4 focus:ring-sky-100"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsPasswordPeeked(!isPasswordPeeked);
                      playTone(isPasswordPeeked ? 400 : 700);
                    }}
                    title={isPasswordPeeked ? 'Hide password' : 'Peek password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-2xl hover:scale-110 active:scale-95 transition-transform"
                  >
                    <span>{isPasswordPeeked ? '🐵' : '🙈'}</span>
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {isPasswordPeeked ? 'Gajju is peeking! 👀' : 'Gajju covered his eyes!'}
                  </span>
                  <span className="text-[11px] text-sky-600 hover:underline font-bold cursor-pointer">Need help?</span>
                </div>
              </div>

              {/* Grade Level Selector */}
              <div>
                <span className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Your Grade 🎒:</span>
                <div className="grid grid-cols-3 gap-2">
                  {['Pre-K', 'Grades 1-3', 'Grades 4-5'].map((grade) => (
                    <button 
                      key={grade}
                      type="button" 
                      onClick={() => { setGradeLevel(grade); playTone(650); }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 ${
                        gradeLevel === grade
                          ? 'border-sky-400 bg-sky-500 text-white shadow-sm' 
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {grade === 'Pre-K' ? '🧸 Pre-K' : grade === 'Grades 1-3' ? '🚀 Grades 1-3' : '🏆 Grades 4-5'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bouncy CTA */}
              <button 
                type="submit" 
                className="w-full mt-2 py-4 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-lg rounded-2xl border-2 border-white shadow-lg shadow-orange-300/60 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Start Learning!</span>
                <span className="text-2xl group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200">🚀</span>
              </button>
            </form>
          ) : (
            /* 4. Picture Password Mode for Young Children */
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Tap your 2 secret picture keys:
                </p>
                <div className="flex items-center justify-center gap-3 mt-2 mb-3">
                  <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-transform ${
                    selectedPictures[0] 
                      ? 'border-emerald-400 bg-emerald-100 scale-105' 
                      : 'border-dashed border-sky-300 bg-sky-50 text-sky-400 shadow-inner'
                  }`}>
                    {selectedPictures[0] || '?'}
                  </div>
                  <span className="text-slate-300 font-bold">+</span>
                  <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-transform ${
                    selectedPictures[1] 
                      ? 'border-emerald-400 bg-emerald-100 scale-105' 
                      : 'border-dashed border-sky-300 bg-sky-50 text-sky-400 shadow-inner'
                  }`}>
                    {selectedPictures[1] || '?'}
                  </div>
                  {selectedPictures.length > 0 && (
                    <button 
                      type="button" 
                      onClick={handleResetPictures} 
                      className="text-xs text-rose-500 font-bold ml-2 underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Picture Keypad */}
              <div className="grid grid-cols-4 gap-2.5">
                {PICTURE_KEYS.map((pic) => (
                  <button 
                    key={pic.name}
                    type="button" 
                    onClick={() => handleSelectPicture(pic.emoji)} 
                    className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-2xl p-2.5 text-3xl transition-transform active:scale-90 hover:scale-105 shadow-sm flex items-center justify-center"
                    title={pic.name}
                  >
                    {pic.emoji}
                  </button>
                ))}
              </div>

              <button 
                type="button" 
                onClick={() => {
                  if (selectedPictures.length < 2) {
                    alert('Please tap 2 pictures to complete your magic key! 🎨');
                    return;
                  }
                  playTone(780);
                  if (onLoginSuccess) {
                    onLoginSuccess({
                      username: 'Little Explorer',
                      language: selectedLang,
                      grade: gradeLevel,
                      authType: 'picture',
                      pictureSequence: selectedPictures
                    });
                  } else {
                    alert('🎉 Picture password matched! Welcome to your learning adventure! 🌟');
                  }
                }} 
                className="w-full mt-2 py-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-lg rounded-2xl border-2 border-white shadow-lg shadow-emerald-300/60 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Login with Pictures!</span>
                <span className="text-2xl">✨</span>
              </button>
            </div>
          )}

          {/* Child Protection Notice */}
          <div className="mt-5 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <span>🛡️</span> 100% Safe, Kid-Protected & Vernacular AI Powered
          </div>
        </div>
      </div>
    </div>
  );
}
