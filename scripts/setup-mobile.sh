#!/bin/bash
set -euo pipefail

echo "═══════════════════════════════════════"
echo " JamFind — Mobile Setup (Capacitor)"
echo "═══════════════════════════════════════"
echo ""

# Get local IP for dev server
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
echo "Your local IP: $LOCAL_IP"
echo ""

# Update capacitor.config.ts with local IP
if [ "$LOCAL_IP" != "localhost" ]; then
  sed -i.bak "s|url: 'http://localhost:3000'|url: 'http://$LOCAL_IP:3000'|" capacitor.config.ts
  rm -f capacitor.config.ts.bak
  echo "✅ Updated capacitor.config.ts to use $LOCAL_IP"
fi

# Install deps if needed
echo ""
echo "Installing Capacitor..."
npm install

# Add iOS platform
echo ""
echo "Adding iOS platform..."
npx cap add ios 2>/dev/null || echo "iOS platform already exists"

# Add Android platform
echo ""
echo "Adding Android platform..."
npx cap add android 2>/dev/null || echo "Android platform already exists"

# Enable background audio for iOS
if [ -d "ios/App/App" ]; then
  # Add background audio capability to Info.plist
  if ! grep -q "UIBackgroundModes" ios/App/App/Info.plist 2>/dev/null; then
    sed -i.bak 's|</dict>|<key>UIBackgroundModes</key><array><string>audio</string></array></dict>|' ios/App/App/Info.plist
    rm -f ios/App/App/Info.plist.bak
    echo "✅ Enabled background audio for iOS"
  fi
fi

# Sync
echo ""
echo "Syncing platforms..."
npx cap sync

echo ""
echo "═══════════════════════════════════════"
echo " DONE! Next steps:"
echo "═══════════════════════════════════════"
echo ""
echo " 1. Start the dev server:"
echo "    npm run dev"
echo ""
echo " 2. For iPhone (needs Mac + Xcode):"
echo "    npx cap open ios"
echo "    Select your iPhone, hit Run (▶)"
echo ""
echo " 3. For Android (needs Android Studio):"
echo "    npx cap open android"
echo "    Select your device, hit Run (▶)"
echo ""
echo " 4. Or just test in your phone's browser:"
echo "    Open http://$LOCAL_IP:3000 on your phone"
echo "    (same WiFi network required)"
echo ""
