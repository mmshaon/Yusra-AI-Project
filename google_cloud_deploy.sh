
#!/bin/bash

# ==========================================
# YUSRA QUANTUM AI - GOOGLE CLOUD DEPLOYMENT
# Target: Cloud Run (Serverless)
# ==========================================

# 1. CONFIGURATION
# ----------------
API_KEY="AIzaSyC4eH2k7RyRmB2gTtSxTD4vlVPaQBdi2lo"
ZIP_FILE="yusra-quantum-ai-final.zip"

# Detect Google Cloud Project ID
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
REPO_NAME="yusra-repo"
IMAGE_NAME="yusra-quantum-ai"
SERVICE_NAME="yusra-ai-service"

echo "🚀 INITIATING QUANTUM DEPLOYMENT PROTOCOL..."
echo "---------------------------------------------"
echo "🔹 Project: $PROJECT_ID"
echo "🔹 Region:  $REGION"
echo "🔹 Target:  Cloud Run"
echo "---------------------------------------------"

# 0. PROJECT CHECK
if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: No Google Cloud Project selected."
  echo "Run: gcloud config set project [YOUR_PROJECT_ID]"
  exit 1
fi

# 1. HANDLE ZIP UPLOAD (INTERACTIVE)
# ----------------------------------
if [ ! -f "$ZIP_FILE" ]; then
  echo ""
  echo "⚠️  SOURCE FILE NOT DETECTED: $ZIP_FILE"
  echo "-------------------------------------------------------"
  echo "   You requested to deploy from Internal Storage."
  echo "   Since Cloud Shell is remote, you must upload the file now."
  echo ""
  echo "   INSTRUCTIONS:"
  echo "   1. Click the 'Three Dots' icon (⋮) in the Cloud Shell toolbar."
  echo "   2. Select 'Upload'."
  echo "   3. Browse your device (Internal Storage/Downloads) for:"
  echo "      👉 $ZIP_FILE"
  echo "   4. Click 'Upload' and wait for the transfer to finish."
  echo "-------------------------------------------------------"
  read -p "⏳ Press [ENTER] once the upload is complete to continue..."
fi

# 1.5 VERIFY AND EXTRACT
# ----------------------
if [ -f "$ZIP_FILE" ]; then
  echo "📦 Found project archive: $ZIP_FILE"
  echo "   Extracting core files..."
  
  # Install unzip if missing
  if ! command -v unzip &> /dev/null; then
      sudo apt-get update && sudo apt-get install -y unzip
  fi
  
  # Unzip to a temporary directory
  rm -rf yusra_build_temp
  unzip -o "$ZIP_FILE" -d yusra_build_temp
  
  # Navigate into the directory
  cd yusra_build_temp
  
  # Handle nested folder structure (common with zips)
  ROOT_FOLDER=$(ls -1 | head -n 1)
  if [ $(ls -1 | wc -l) -eq 1 ] && [ -d "$ROOT_FOLDER" ]; then
      echo "   Entering subdirectory: $ROOT_FOLDER"
      cd "$ROOT_FOLDER"
  fi
  
  # Verify contents
  if [ ! -f "Dockerfile" ]; then
      echo "❌ Error: Dockerfile not found inside the zip."
      echo "   The zip structure might be incorrect."
      cd ..
      rm -rf yusra_build_temp
      exit 1
  fi
  
  echo "✅ Extraction complete. Build context ready."
else
  echo "❌ Error: $ZIP_FILE still not found."
  echo "   Please upload the file and run this script again."
  exit 1
fi

# 2. ENABLE SERVICES
# ------------------
echo "⚙️  Enabling necessary Google Cloud APIs..."
gcloud services enable run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com

# 3. SETUP ARTIFACT REGISTRY
# --------------------------
echo "📦 Checking Artifact Registry..."
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION &>/dev/null; then
    echo "   Creating repository '$REPO_NAME'..."
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Yusra AI Docker Repository"
else
    echo "   Repository '$REPO_NAME' exists."
fi

# Configure Docker to authenticate with GCP
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# 4. BUILD & PUSH IMAGE
# ---------------------
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}"

echo "🛠️  Building Container Image (Injecting API Key)..."
# Build using local docker in Cloud Shell
docker build \
  --build-arg API_KEY="$API_KEY" \
  --platform linux/amd64 \
  -t $IMAGE_URI .

echo "⬆️  Pushing image to Artifact Registry..."
docker push $IMAGE_URI

# 5. DEPLOY TO CLOUD RUN
# ----------------------
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_URI \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 2

# Cleanup
cd ..
rm -rf yusra_build_temp

echo "---------------------------------------------"
echo "✅ DEPLOYMENT SUCCESSFUL"
echo "🌐 Yusra AI is now live. Click the URL above."
echo "---------------------------------------------"
