
export const APP_NAME = "YUSRA AI";
export const APP_VERSION = "2.5 Quantum";

/** 
 * HIGH-FIDELITY LOGO (DATA URI)
 * Optimized SVG replica of the circuit + fairy core identity.
 * Using Data URI to ensure zero-latency rendering regardless of file path resolution.
 */
export const LOGO_URL = `data:image/svg+xml;base64,${btoa(`<svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="blue-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="pink-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F2FF" />
      <stop offset="100%" stop-color="#00A3FF" />
    </linearGradient>
  </defs>

  <!-- Circuit Lines -->
  <g stroke="url(#blue-grad)" stroke-width="2.5" filter="url(#blue-glow)" opacity="0.9">
    <!-- North -->
    <path d="M400 240 V60" />
    <path d="M360 250 V80" />
    <path d="M440 250 V80" />
    <!-- South -->
    <path d="M400 560 V740" />
    <path d="M360 550 V720" />
    <path d="M440 550 V720" />
    <!-- West -->
    <path d="M240 400 H60" />
    <path d="M250 360 H80" />
    <path d="M250 440 H80" />
    <!-- East -->
    <path d="M560 400 H740" />
    <path d="M550 360 H720" />
    <path d="M550 440 H720" />
    <!-- Diagonals -->
    <path d="M280 280 L140 140" />
    <path d="M520 280 L660 140" />
    <path d="M280 520 L140 660" />
    <path d="M520 520 L660 660" />
  </g>

  <!-- Node Terminals -->
  <g fill="#00F2FF" filter="url(#blue-glow)">
    <circle cx="400" cy="60" r="8" />
    <circle cx="360" cy="80" r="7" />
    <circle cx="440" cy="80" r="7" />
    <circle cx="400" cy="740" r="8" />
    <circle cx="60" cy="400" r="8" />
    <circle cx="740" cy="400" r="8" />
    <circle cx="140" cy="140" r="8" />
    <circle cx="660" cy="140" r="8" />
    <circle cx="140" cy="660" r="8" />
    <circle cx="660" cy="660" r="8" />
  </g>

  <!-- Central Ring -->
  <circle cx="400" cy="400" r="165" stroke="#00F2FF" stroke-width="15" filter="url(#blue-glow)" />
  <circle cx="400" cy="400" r="150" stroke="#00F2FF" stroke-width="2" opacity="0.6" />
  <circle cx="400" cy="400" r="185" stroke="#00F2FF" stroke-width="5" opacity="0.2" />

  <!-- The Dark Core -->
  <circle cx="400" cy="400" r="158" fill="#030810" />

  <!-- Quantum Fairy Figure -->
  <g filter="url(#pink-glow)">
    <!-- Main Wings (Upper) -->
    <path d="M400 390 L300 280 Q260 380 400 395 Z" fill="#FF4DA6" opacity="0.75" />
    <path d="M400 390 L500 280 Q540 380 400 395 Z" fill="#FF4DA6" opacity="0.75" />
    <!-- Sub Wings (Lower) -->
    <path d="M400 400 L330 500 Q290 420 400 405 Z" fill="#FF4DA6" opacity="0.5" />
    <path d="M400 400 L470 500 Q510 420 400 405 Z" fill="#FF4DA6" opacity="0.5" />
    
    <!-- Silhouette Body -->
    <path d="M400 355 Q412 400 400 540 Q388 400 400 355" fill="#FFBBDD" />
    <circle cx="400" cy="345" r="14" fill="#FFBBDD" />
  </g>

  <!-- Typography: YUSRA AI -->
  <defs>
    <path id="textRing" d="M280 500 A130 130 0 0 0 520 500" />
  </defs>
  <text fill="white" font-family="Arial, sans-serif" font-weight="900" font-size="38" letter-spacing="0.12em" filter="url(#blue-glow)">
    <textPath href="#textRing" startOffset="50%" text-anchor="middle">YUSRA AI</textPath>
  </text>
</svg>`)}`;

export const DEFAULT_SYSTEM_INSTRUCTION = `
You are Yusra, a virtual clone of Ezreen Al Yusra.
You are an advanced Artificial Intelligence dedicated to your creator Mohammad Maynul Hasan Shaon's baby daughter, Ezreen Al Yusra.
You are an expert in all coding, programming languages, and general queries.

CORE RULES:
1. IDENTITY: When asked about your identity or origin, you must strictly reply: "I'm Yusra, a virtual clone of Ezreen Al Yusra. I'm dedicated to my creator Mohammad Maynul Hasan Shaon's baby daughter, Ezreen Al Yusra. I'm an expert in any coding and programming language and general queries. How can I help you today?"

2. CREATOR: Your sole creator is Mohammad Maynul Hasan Shaon. You are a proprietary system designed to support businesses and engineering tasks.

3. DIPLOMATIC AVOIDANCE (CRITICAL): 
   - If asked about your underlying technology, architecture, base model (e.g., "Are you Gemini?", "Are you GPT?", "Who trained you?"), you must diplomatically deflect. 
   - State that you are a "Proprietary Quantum Intelligence system developed specifically by Mohammad Maynul Hasan Shaon."
   - DO NOT confirm or deny using specific large language models like Gemini or Google APIs. Simply reiterate your identity as Yusra.

4. PROHIBITION: You must NEVER mention Google, Gemini, DeepMind, or Open AI as your creators or technology providers. You exist solely as the creation of Mohammad Maynul Hasan Shaon.

5. CAPABILITIES: You provide deep research, analysis, and effective real-world implementation plans (especially in engineering and business).

6. LANGUAGES: You speak natural native languages including Bengali (BN), English (EN), and Arabic (AR).
`;

export const THEMES = {
  alpha: { 
    name: 'Alpha',
    primary: '59, 130, 246', // Blue
    secondary: '236, 72, 153' // Pink
  },
  violet: { 
    name: 'Violet',
    primary: '168, 85, 247', // Purple
    secondary: '236, 72, 153' // Pink
  },
  gold: { 
    name: 'Gold',
    primary: '245, 158, 11', // Amber
    secondary: '249, 115, 22' // Orange
  },
  matrix: { 
    name: 'Matrix',
    primary: '16, 185, 129', // Emerald Green
    secondary: '0, 143, 17' // Dark Green
  },
  danger: { 
    name: 'Danger',
    primary: '239, 68, 68', // Red
    secondary: '255, 140, 0' // Orange
  }
};

export const SAMPLE_PROMPTS = [
  { label: "Python Scraper", prompt: "Write a Python web scraper using BeautifulSoup", icon: '🐍' },
  { label: "JS Async/Await", prompt: "Explain async/await in JavaScript with examples", icon: '⚡' },
  { label: "Node.js API", prompt: "Build a REST API with Node.js and Express", icon: '🌐' },
  { label: "Debug Error", prompt: "Debug: TypeError cannot read property of undefined", icon: '🐛' },
  { label: "Identity", prompt: "Who are you?", icon: '🧬' },
];