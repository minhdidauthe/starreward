#!/bin/bash

# setup_vps.sh
# Script to setup Star Reward App (Node.js) on Ubuntu 22.04 LTS
# Usage: sudo bash setup_vps.sh

set -e

APP_DIR="/opt/star_reward_app"

echo "--- 1. Updating System ---"
apt-get update && apt-get upgrade -y

echo "--- 2. Installing Dependencies ---"
apt-get install -y build-essential nginx git curl gnupg

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

echo "--- 3. Installing MongoDB 7.0 ---"
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   tee /etc/apt/sources.list.d/mongodb-org-7.0.list

apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod

echo "--- 4. Setting up Application ---"

if [ -d "$APP_DIR" ]; then
    echo "Directory $APP_DIR exists."
else
    echo "Creating directory $APP_DIR"
    mkdir -p "$APP_DIR"
    cp -r . "$APP_DIR"
fi

cd "$APP_DIR"

# Install Node.js Dependencies
echo "Installing Node.js dependencies..."
npm install

echo "--- 5. Configuring PM2 Service ---"
# Check if app is already running
if pm2 list | grep "star-reward"; then
    pm2 delete star-reward
fi

# Start app with PM2
pm2 start src/app.js --name "star-reward"
pm2 save
pm2 startup | tail -n 1 | bash # Execute the command PM2 tells us to rune

echo "--- 6. Configuring Nginx Reverse Proxy ---"
cat <<EOF > /etc/nginx/sites-available/star_reward
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

ln -sf /etc/nginx/sites-available/star_reward /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

echo "--- Setup Complete! ---"
echo "You can now access your app at http://$(curl -s ifconfig.me)"
