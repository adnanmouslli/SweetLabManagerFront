#!/bin/bash

echo "🚀 Deploying SweetLab..."

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Build and start the application
echo "🔨 Building and starting SweetLab..."
docker-compose up --build -d

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if docker-compose ps | grep -q "sweet-lab.*Up"; then
    echo "✅ SweetLab is running successfully!"
    echo "🌐 Application is available at: http://localhost:3006"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy nginx-sweetlab.conf to /etc/nginx/sites-available/"
    echo "2. Create symlink: ln -s /etc/nginx/sites-available/nginx-sweetlab.conf /etc/nginx/sites-enabled/"
    echo "3. Test nginx config: nginx -t"
    echo "4. Reload nginx: systemctl reload nginx"
    echo "5. Access via: https://sweetlab.anycode-sy.com"
else
    echo "❌ Failed to start SweetLab. Check logs with: docker-compose logs"
    exit 1
fi
