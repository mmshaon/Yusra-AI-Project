
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Language, AppSettings, User } from '../types';

interface GlobalContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  speak: (text: string, force?: boolean) => void;
  cancelSpeech: () => void;
  t: (key: string) => string;
  isVoiceEnabled: boolean;
  toggleVoice: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
  learnUserFact: (fact: string) => void; // Memory function
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const translations: Record<string, Record<string, string>> = {
  welcome_title: { en: "YUSRA QUANTUM AI", bn: "ইউসরা কোয়ান্টাম এআই", ar: "يسرى كوانتم للذكاء الاصطناعي" },
  welcome_subtitle: { en: "Virtual Clone of Ezreen Al Yusra", bn: "ইজরিন আল ইউসরার ভার্চুয়াল ক্লোন", ar: "استنساخ افتراضي لإزرين اليسرى" },
  signin: { en: "Sign In", bn: "সাইন ইন", ar: "تسجيل الدخول" },
  register: { en: "Register", bn: "নিবন্ধন", ar: "تسجيل جديد" },
  email: { en: "Quantum ID (Email)", bn: "কোয়ান্টাম আইডি (ইমেইল)", ar: "المعرف الكمي (البريد الإلكتروني)" },
  password: { en: "Access Key (Password)", bn: "অ্যাক্সেস কী (পাসওয়ার্ড)", ar: "مفتاح الوصول (كلمة المرور)" },
  name: { en: "Identity Name", bn: "পরিচয় নাম", ar: "اسم الهوية" },
  initiate: { en: "INITIATE SESSION", bn: "সেশন শুরু করুন", ar: "بدء الجلسة" },
  create_id: { en: "CREATE IDENTITY", bn: "আইডেন্টিটি তৈরি করুন", ar: "إنشاء هوية" },
  google_auth: { en: "Authenticate with Google", bn: "গুগল এর মাধ্যমে প্রবেশ করুন", ar: "المصادقة عبر جوجل" },
  chat: { en: "Chat Interface", bn: "চ্যাট ইন্টারফেস", ar: "الدردشة" },
  code: { en: "Code Lab", bn: "কোড ল্যাব", ar: "مختبر الكود" },
  vision: { en: "Computer Vision", bn: "কম্পিউটার ভিশন", ar: "الرؤية الحاسوبية" },
  voice: { en: "Siri Mode", bn: "সিরি মোড", ar: "الوضع الصوتي" },
  history: { en: "History", bn: "ইতিহাস", ar: "السجل" },
  settings: { en: "System Config", bn: "সিস্টেম কনফিগারেশন", ar: "الإعدادات" },
  profile: { en: "User Identity", bn: "ব্যবহারকারীর পরিচয়", ar: "الملف الشخصي" },
  plan: { en: "Quantum Plan", bn: "কোয়ান্টাম প্ল্যান", ar: "الخطة الكمية" },
  creator: { en: "Creator Panel", bn: "ক্রিয়েটর প্যানেল", ar: "لوحة المطور" },
  new_chat: { en: "New Session", bn: "নতুন সেশন", ar: "جلسة جديدة" },
  mic_active: { en: "LISTENING", bn: "শুনছি", ar: "أستمع الآن" },
  mic_ready: { en: "HEY YUSRA", bn: "হেই ইউসরা", ar: "مرحباً يسرى" },
  status_online: { en: "ONLINE", bn: "অনলাইন", ar: "متصل" },
  input_placeholder: { en: "Ask Yusra...", bn: "ইউসরাকে জিজ্ঞাসা করুন...", ar: "اسأل يسرى..." },
  voice_activate: { en: "ACTIVATE SIRI MODE", bn: "সিরি মোড চালু করুন", ar: "تفعيل الوضع الصوتي" },
  voice_deactivate: { en: "DEACTIVATE", bn: "বন্ধ করুন", ar: "إيقاف" },
  
  // Notice Box Translations
  notice_title: { en: "CREATOR ANNOUNCEMENT", bn: "নির্মাতার ঘোষণা", ar: "إعلان المطور" },
  notice_content: { 
    en: "Version 2.5 Quantum Update: New neural vision engine and 2x faster response times now live!", 
    bn: "ভার্সন ২.৫ কোয়ান্টাম আপডেট: নতুন নিউরাল ভিশন ইঞ্জিন এবং ২ গুণ দ্রুত রেসপন্স এখন চালু!", 
    ar: "تحديث الكم 2.5: محرك رؤية عصبية جديد واستجابة أسرع مرتين الآن!" 
  },
  notice_offer: { 
    en: "Special Offer: Pro Plan 50% OFF for early adopters.", 
    bn: "বিশেষ অফার: প্রো প্ল্যানে ৫০% ছাড়।", 
    ar: "عرض خاص: خصم 50٪ للمشتركين الأوائل." 
  }
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'cyber',
  autoSpeak: true,
  voiceRate: 1.0,
  voicePitch: 1.0, 
  preferredVoiceURI: null,
  soundEffects: true,
  memoryEnabled: true,
  showTimestamps: true,
  groundingTool: 'none',
  thinkingMode: false,
  wakeWord: 'Yusra'
};

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('yusra_app_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('yusra_app_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    loadVoices();
    // Chrome needs this event listener to load voices properly
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // Set Direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    let text = "";
    if (lang === 'en') text = "Language switched to English.";
    else if (lang === 'bn') text = "ভাষা বাংলায় পরিবর্তন করা হয়েছে।";
    else if (lang === 'ar') text = "تم تغيير اللغة إلى العربية.";
    
    speak(text, true);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
  }, []);

  const speak = useCallback((text: string, force = false) => {
    if ((!settings.autoSpeak && !force)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // --- INTELLIGENT VOICE SELECTION LOGIC ---
    let selectedVoice: SpeechSynthesisVoice | undefined;

    // 1. Check User Preference First
    if (settings.preferredVoiceURI) {
      selectedVoice = availableVoices.find(v => v.voiceURI === settings.preferredVoiceURI);
    } 

    // 2. Fallback Heuristics if no preference or preference not found
    if (!selectedVoice) {
      if (language === 'ar') {
         // Arabic: Look for specific Arabic voices
         selectedVoice = availableVoices.find(v => v.lang.includes('ar') && v.name.includes('Google'));
         if (!selectedVoice) selectedVoice = availableVoices.find(v => v.lang.includes('ar'));
      } else if (language === 'bn') {
         // Bangla: Prioritize Google Bangla (Natural/Female leaning) or specific BD voices
         selectedVoice = availableVoices.find(v => (v.lang.includes('bn') || v.lang.includes('BD')) && v.name.includes('Google'));
         
         // If no Google voice, look for explicit BD region
         if (!selectedVoice) selectedVoice = availableVoices.find(v => v.lang === 'bn-BD');
         
         // Fallback to any Bangla
         if (!selectedVoice) selectedVoice = availableVoices.find(v => v.lang.includes('bn'));
      } else {
         // English: Aggressively target Female voices
         selectedVoice = availableVoices.find(v => v.name === 'Google US English');
         if (!selectedVoice) selectedVoice = availableVoices.find(v => v.name.includes('Zira')); // Microsoft Zira
         if (!selectedVoice) selectedVoice = availableVoices.find(v => v.name.includes('Samantha')); // MacOS
         if (!selectedVoice) selectedVoice = availableVoices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
         // Avoid Male voices if possible for Yusra identity
         if (!selectedVoice) selectedVoice = availableVoices.find(v => v.lang.startsWith('en') && !v.name.includes('Male') && !v.name.includes('David'));
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // --- APPLY RATE & PITCH ---
    // Use settings, or defaults if not set
    utterance.rate = settings.voiceRate || 1.0;
    utterance.pitch = settings.voicePitch || 1.0;

    // --- APPLY LOCALE ---
    // Ensure the utterance language matches the selected language context, 
    // regardless of the voice's native lang (helps with some engines)
    if (language === 'bn') utterance.lang = 'bn-BD';
    else if (language === 'ar') utterance.lang = 'ar-SA';
    else utterance.lang = 'en-US';

    utterance.onstart = () => { isSpeakingRef.current = true; };
    utterance.onend = () => { isSpeakingRef.current = false; };
    utterance.onerror = () => { isSpeakingRef.current = false; };

    window.speechSynthesis.speak(utterance);
  }, [language, settings, availableVoices]);

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  const toggleVoice = () => {
    const newState = !settings.autoSpeak;
    updateSettings({ autoSpeak: newState });
    if (!newState) {
        cancelSpeech();
    } else {
        speak("Voice guidance enabled.", true);
    }
  };

  const learnUserFact = (fact: string) => {
     if (!settings.memoryEnabled) return;
     console.log("Yusra Learned:", fact);
  };

  return (
    <GlobalContext.Provider value={{ 
      language, 
      setLanguage, 
      speak, 
      cancelSpeech, 
      t, 
      isVoiceEnabled: settings.autoSpeak, 
      toggleVoice, 
      settings,
      updateSettings,
      availableVoices,
      learnUserFact
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within GlobalProvider");
  return context;
};
