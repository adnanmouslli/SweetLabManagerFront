@echo off
echo 🚀 Deploying SweetLab...

REM Stop existing containers
echo 📦 Stopping existing containers...
docker-compose down

REM Build and start the application
echo 🔨 Building and starting SweetLab...
docker-compose up --build -d

REM Wait for the application to start
echo ⏳ Waiting for application to start...
timeout /t 10 /nobreak > nul

REM Check if the application is running
docker-compose ps | findstr "sweet-lab.*Up" > nul
if %errorlevel% equ 0 (
    echo ✅ SweetLab is running successfully!
    echo 🌐 Application is available at: http://localhost:3006
    echo.
    echo 📋 Next steps:
    echo 1. Copy nginx-sweetlab.conf to /etc/nginx/sites-available/
    echo 2. Create symlink: ln -s /etc/nginx/sites-available/nginx-sweetlab.conf /etc/nginx/sites-enabled/
    echo 3. Test nginx config: nginx -t
    echo 4. Reload nginx: systemctl reload nginx
    echo 5. Access via: https://sweetlab.anycode-sy.com
) else (
    echo ❌ Failed to start SweetLab. Check logs with: docker-compose logs
    exit /b 1
)
