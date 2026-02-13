
#!/bin/bash

# ==========================================
# YUSRA QUANTUM AI - VM DEPLOYMENT PROTOCOL
# ==========================================

# Ensure script halts on error
set -e

# Configuration
API_KEY=${1:-"AIzaSyC4eH2k7RyRmB2gTtSxTD4vlVPaQBdi2lo"}
ZIP_FILE="yusra-quantum-ai-final.zip"
CONTAINER_NAME="yusra-ai"

echo "🚀 INITIATING QUANTUM DEPLOYMENT (VM TARGET)..."
echo "-----------------------------------------------"
echo "🔑 API Key: ...$(echo $API_KEY | tail -c 6)"
echo "-----------------------------------------------"

# 1. FILE UPLOAD HANDLER
# ----------------------
if [ ! -f "$ZIP_FILE" ]; then
    echo ""
    echo "⚠️  PROJECT ARCHIVE NOT FOUND: $ZIP_FILE"
    echo "------------------------------------------------------------"
    echo "   initiating upload sequence..."
    echo "   Please upload the file from your Internal Storage/Downloads."
    echo ""
    echo "   INSTRUCTIONS (Google Cloud SSH):"
    echo "   1. Click the 'Gear' ⚙️ or 'Three Dots' ⋮ icon in the top right of this window."
    echo "   2. Select 'Upload File'."
    echo "   3. Choose: $ZIP_FILE"
    echo "------------------------------------------------------------"
    echo "⏳ Waiting for file upload to complete..."
    
    # Loop until file appears
    while [ ! -f "$ZIP_FILE" ]; do
        sleep 2
    done
    echo ""
    echo "✅ $ZIP_FILE DETECTED. Proceeding..."
fi

# 2. SYSTEM PREP
# --------------
echo "📦 Updating system packages..."
if command -v apt-get &> /dev/null; then
    # Quietly update
    sudo apt-get update -y > /dev/null
    # Ensure unzip is installed
    if ! command -v unzip &> /dev/null; then
        echo "   Installing unzip..."
        sudo apt-get install -y unzip > /dev/null
    fi
fi

# 3. INSTALL DOCKER
# -----------------
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo apt-get install -y docker.io > /dev/null
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER || true
else
    echo "✅ Docker is ready."
fi

# 4. EXTRACTION
# -------------
echo "📂 Extracting project files..."
# Clean temp folder
rm -rf yusra_vm_build
# Unzip
unzip -o "$ZIP_FILE" -d yusra_vm_build > /dev/null

# Navigate to build context
cd yusra_vm_build
# Handle potential nested folder (e.g. yusra-main/)
ROOT_FOLDER=$(ls -1 | head -n 1)
if [ $(ls -1 | wc -l) -eq 1 ] && [ -d "$ROOT_FOLDER" ]; then
    echo "   Entering subdirectory: $ROOT_FOLDER"
    cd "$ROOT_FOLDER"
fi

if [ ! -f "Dockerfile" ]; then
    echo "❌ CRITICAL ERROR: Dockerfile not found in archive."
    echo "   Please ensure the zip file contains the project root."
    exit 1
fi

# 5. CLEANUP OLD CONTAINERS
# -------------------------
echo "🛑 Cleaning up old instances..."
if [ "$(sudo docker ps -q -f name=$CONTAINER_NAME)" ]; then
    sudo docker stop $CONTAINER_NAME > /dev/null
fi
if [ "$(sudo docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    sudo docker rm $CONTAINER_NAME > /dev/null
fi

# 6. BUILD & RUN
# --------------
echo "🛠️  Building Quantum Core Container..."
sudo docker build \
  --build-arg API_KEY="$API_KEY" \
  -t $CONTAINER_NAME .

echo "✨ Launching Yusra AI..."
# Map port 80 on host to 8080 on container
sudo docker run -d \
  -p 80:8080 \
  --name $CONTAINER_NAME \
  --restart always \
  $CONTAINER_NAME

# 7. FINAL STATUS
# ---------------
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com)

echo ""
echo "==================================================="
echo "✅ DEPLOYMENT SUCCESSFUL"
echo "🌐 ACCESS LINK: http://$PUBLIC_IP"
echo "==================================================="
