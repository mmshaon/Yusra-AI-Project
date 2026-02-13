
# 🚀 Deployment Instructions for Google Cloud VM

Follow these steps exactly to deploy **Yusra Quantum AI** to a Google Cloud Compute Engine VM.

---

## **Prerequisites**
1.  **Google Cloud Account** with billing enabled.
2.  **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/)).

---

## **Step 1: Create a VM Instance**
1.  Go to **Google Cloud Console** > **Compute Engine** > **VM Instances**.
2.  Click **Create Instance**.
3.  **Name**: `yusra-quantum-server`
4.  **Region**: Choose one close to you (e.g., `us-central1`).
5.  **Machine Type**: `e2-medium` (2 vCPU, 4GB memory) is recommended for smooth performance.
6.  **Boot Disk**:
    *   OS: **Ubuntu**
    *   Version: **Ubuntu 22.04 LTS** (or 20.04 LTS)
    *   Size: **20 GB** Standard Persistent Disk.
7.  **Firewall**:
    *   Check ✅ **Allow HTTP traffic**.
    *   Check ✅ **Allow HTTPS traffic**.
8.  Click **Create**.

---

## **Step 2: Connect to the VM**
1.  Once the VM is running, click the **SSH** button next to it in the console.
2.  A terminal window will open connected to your server.

---

## **Step 3: Setup & Deployment**

Copy and paste the following commands into the SSH terminal one by one.

### **1. Install Docker & Git**
```bash
sudo apt-get update
sudo apt-get install -y docker.io git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```
*(You may need to logout and log back in for group changes to take effect, but for this script, we use sudo)*

### **2. Clone the Repository (or Upload Files)**
If you are using a git repo:
```bash
git clone https://github.com/YOUR_USERNAME/yusra-quantum-ai.git
cd yusra-quantum-ai
```
*If you don't have a git repo yet, you can upload the project files using the "Upload File" button in the SSH window header.*

### **3. Deploy Script**
Make sure the `deploy.sh` script is executable:
```bash
chmod +x deploy.sh
```

### **4. Launch the App**
Run the deployment script with your API Key.
**Replace `YOUR_ACTUAL_API_KEY_HERE` with your real Gemini API Key.**

```bash
./deploy.sh "YOUR_ACTUAL_API_KEY_HERE"
```

---

## **Step 4: Verify Deployment**

1.  Wait for the script to finish. It will print **"DEPLOYMENT COMPLETE"**.
2.  It will show you the IP address (e.g., `http://34.123.45.67`).
3.  Click that link to open Yusra AI.

---

## **Step 5: (Optional) Open Port 80**
If the link doesn't work, ensure port 80 is open in the Google Cloud Firewall:
1.  Go to **VPC Network** > **Firewall**.
2.  Find `default-allow-http`.
3.  Ensure "Targets" includes your VM (usually "Apply to all").

---

## **Troubleshooting**

*   **Logs**: To see app logs, run `sudo docker logs yusra-ai`.
*   **Restart**: To restart, run `sudo docker restart yusra-ai`.
*   **Re-deploy**: If you change code, just run the `./deploy.sh "KEY"` command again.

**System is now Live. Quantum Core Online.**
