#!/bin/bash
# Build common package script

echo "🔨 Building @project-pc/common package..."

cd packages/common

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building package..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  echo ""
  echo "📁 Output: packages/common/dist/"
  ls -la dist/
else
  echo "❌ Build failed!"
  exit 1
fi
