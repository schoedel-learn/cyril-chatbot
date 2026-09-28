#!/bin/bash
set -e

echo "🚀 Starting Deployment to cloudron-server..."

echo "📦 Building Landing Page..."
cd cyril-landing-page
npm run build
cd ..

echo "📦 Building Angular Frontend..."
npm run build

echo "📦 Building Express Backend..."
cd express-backend
npm run build
cd ..

echo "📤 Syncing Backend files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' ./express-backend/ cloudron-server:/opt/cyril-backend/

echo "📤 Syncing Landing Page..."
rsync -avz --delete ./cyril-landing-page/dist/ cloudron-server:/var/www/bot.schoedeldesign.ai/

echo "📤 Syncing Chatbot Frontend..."
ssh cloudron-server "mkdir -p /var/www/bot.schoedeldesign.ai/cyril"
rsync -avz --delete ./dist/ cloudron-server:/var/www/bot.schoedeldesign.ai/cyril/

echo "🔄 Restarting Backend Server..."
ssh cloudron-server "cd /opt/cyril-backend && npm install && npm run build && pm2 restart cyril-backend"

echo "✅ Deployment Complete!"
echo "   - Landing Page: https://bot.schoedeldesign.ai"
echo "   - Chatbot App:  https://bot.schoedeldesign.ai/cyril"
