
# YUSRA QUANTUM AI v3.0 (Maximum Capacity)

**"The Ultimate Virtual Clone of Ezreen Al Yusra"**

Yusra AI is an enterprise-grade, quantum-simulated artificial intelligence designed by **Mohammad Maynul Hasan Shaon**. It serves as a hyper-intelligent digital clone dedicated to his daughter, Ezreen Al Yusra. 

This repository contains the source code for the **Maximum Level** upgrade, utilizing the full suite of Gemini 3.0 & 2.5 models for Search Grounding, Thinking, Video Generation (Veo), and advanced Audio/Vision.

---

## 🚀 Key Features

### 🧠 Quantum Core Intelligence
- **Deep Thinking Mode:** Powered by `gemini-3-pro-preview` with a massive token budget (32k) for complex reasoning tasks.
- **Search Grounding:** Integrated `googleSearch` tool for real-time, factual answers.
- **Maps Integration:** Integrated `googleMaps` grounding via `gemini-2.5-flash` for location intelligence.
- **Neural Memory:** Remembers user context across sessions.
- **Multi-Lingual:** Fluent in English, Bangla, and Arabic.

### 🎥 Veo Video Studio
- **Prompt-to-Video:** Generate high-quality videos using the `veo-3.1-fast-generate-preview` model.
- **Aspect Ratio Control:** Create content in 16:9 (Landscape) or 9:16 (Portrait) formats.

### 🎨 Holographic Visual Interface
- **Hyper-Animated UI:** Features nebula backgrounds, spinning galaxy cores, and glassmorphism panels.
- **Responsive Design:** A fluid experience across mobile, tablet, and desktop.
- **Theme Engine:** Switch between Cyber, Violet, Gold, Matrix, and Danger themes instantly.

### 🗣️ Advanced Voice System
- **Gemini TTS:** Native-quality speech generation using `gemini-2.5-flash-preview-tts`.
- **Audio Transcription:** Record voice notes and transcribe them instantly using `gemini-3-flash-preview`.
- **Hands-Free Mode:** "Hi Yusra" wake-word activation.

### 👁️ Computer Vision 3.0
- **Advanced Analysis:** Use `gemini-3-pro-preview` for deep understanding of uploaded images and videos.
- **Live Camera Feed:** Analyze real-time video streams for object detection.

### 💻 Developer Tools
- **Code Lab:** A full-featured code editor with syntax highlighting and real-time AI analysis.
- **Preview Engine:** Instantly render HTML/CSS/JS snippets.

---

## 🛠️ Deployment Instructions

### Option 1: Google Cloud Shell (Zip Upload Method)
**Best for deploying directly from your phone or PC storage.**

1.  **Open Google Cloud Shell:**
    Go to [console.cloud.google.com](https://console.cloud.google.com) and click the terminal icon (top right).

2.  **Upload Deployment Script:**
    If you don't have the files yet, create the script manually:
    ```bash
    nano google_cloud_deploy.sh
    # Paste the script content, then Save (Ctrl+O) and Exit (Ctrl+X)
    chmod +x google_cloud_deploy.sh
    ```

3.  **Run the Script:**
    ```bash
    ./google_cloud_deploy.sh
    ```

4.  **Upload Your Project Zip:**
    The script will ask you to upload `yusra-quantum-ai-final.zip`.
    - Click the **Three Dots (⋮)** in the Cloud Shell toolbar.
    - Select **Upload**.
    - Choose `yusra-quantum-ai-final.zip` from your device's **Internal Storage / Downloads**.
    - Once uploaded, press **ENTER** in the terminal to continue.

The script will automatically unzip the project, build the container with your API key, and deploy it to Google Cloud Run.

### Option 2: Local Development
1.  **Clone the Repo:**
    ```bash
    git clone https://github.com/your-repo/yusra-quantum-ai.git
    cd yusra-quantum-ai
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## 🔐 Security & Architecture
- **Client-Side Encryption:** User sessions are handled locally; sensitive data is minimized.
- **Creator Mode:** A hidden administrative panel allows system monitoring.
- **Error Self-Healing:** Automatic system reboot via Error Boundary.

---

## 📜 Credits
**Architect & Creator:** Mohammad Maynul Hasan Shaon  
**Dedication:** Ezreen Al Yusra  
**Version:** 3.0.0 Quantum (Maximum Upgrade)

---

*System Online. Awaiting Instructions.*