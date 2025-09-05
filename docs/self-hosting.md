# Kaiba Self-Hosting Guide

This guide provides comprehensive instructions for self-hosting Kaiba on your own server or local machine, including how to make it accessible from any device on your local network.

## Quick Start (Local Development)

For immediate local testing:

```bash
git clone [repository-url] kaiba
cd kaiba
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=TagSeeder
npm run build
php artisan serve --host=0.0.0.0 --port=8000
```

Your app will be available at `http://[your-server-ip]:8000` on your local network.

## Production Self-Hosting Setup

### Prerequisites

- **PHP 8.2+** with extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- **Composer** (PHP package manager)
- **Node.js 18+** and npm
- **Web Server** (Apache, Nginx, or use PHP's built-in server)
- **Database** (SQLite default, MySQL/PostgreSQL optional)
- **Redis** (optional, for caching)

### Step 1: Server Setup

#### On Ubuntu/Debian:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP and required extensions
sudo apt install php8.2 php8.2-cli php8.2-common php8.2-mysql php8.2-xml php8.2-xmlrpc php8.2-curl php8.2-gd php8.2-imagick php8.2-cli php8.2-dev php8.2-imap php8.2-mbstring php8.2-opcache php8.2-soap php8.2-zip php8.2-intl php8.2-bcmath php8.2-sqlite3 -y

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Optional: Install Redis
sudo apt install redis-server
```

#### On CentOS/RHEL:
```bash
# Install EPEL and Remi repositories
sudo dnf install epel-release
sudo dnf install https://rpms.remirepo.net/enterprise/remi-release-9.rpm

# Enable PHP 8.2
sudo dnf module enable php:remi-8.2

# Install PHP and extensions
sudo dnf install php php-cli php-common php-mysqlnd php-xml php-curl php-gd php-cli php-mbstring php-opcache php-zip php-intl php-bcmath php-sqlite3

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
sudo dnf install nodejs npm
```

### Step 2: Application Deployment

```bash
# Clone the repository
git clone [repository-url] /var/www/kaiba
cd /var/www/kaiba

# Set proper permissions
sudo chown -R www-data:www-data /var/www/kaiba
sudo chmod -R 755 /var/www/kaiba
sudo chmod -R 775 /var/www/kaiba/storage
sudo chmod -R 775 /var/www/kaiba/bootstrap/cache

# Install dependencies
composer install --no-dev --optimize-autoloader
npm install --production

# Set up environment
cp .env.example .env
php artisan key:generate
```

### Step 3: Environment Configuration

Edit the `.env` file for production:

```bash
# Basic App Settings
APP_NAME="Kaiba"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://your-server-ip:8000

# Database (SQLite - simplest option)
DB_CONNECTION=sqlite

# For MySQL/PostgreSQL (optional)
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=kaiba
# DB_USERNAME=your_db_user
# DB_PASSWORD=your_db_password

# Cache (optional, but recommended)
CACHE_STORE=file

# Session settings
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
```

### Step 4: Database Setup

```bash
# Create SQLite database (default)
touch /var/www/kaiba/database/database.sqlite
sudo chown www-data:www-data /var/www/kaiba/database/database.sqlite

# Run migrations and seed data
php artisan migrate --force
php artisan db:seed --class=TagSeeder --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 5: Build Frontend Assets

```bash
# Build for production
npm run build

# Clear any previous builds
php artisan view:clear
```

## Network Access Configuration

### Method 1: PHP Built-in Server (Simplest)

Perfect for home networks and small teams:

```bash
# Make accessible from any IP on your network
php artisan serve --host=0.0.0.0 --port=8000

# Or specify a specific IP
php artisan serve --host=192.168.1.100 --port=8000
```

**Access from other devices:**
- Find your server's local IP: `ip addr show` (Linux) or `ipconfig` (Windows)
- Access from any device on your network: `http://[server-ip]:8000`
- Example: `http://192.168.1.100:8000`

### Method 2: Nginx Configuration (Production)

Create `/etc/nginx/sites-available/kaiba`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com your-server-ip;
    root /var/www/kaiba/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/kaiba /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Method 3: Apache Configuration (Alternative)

Create `/etc/apache2/sites-available/kaiba.conf`:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias your-server-ip
    DocumentRoot /var/www/kaiba/public

    <Directory /var/www/kaiba/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/kaiba_error.log
    CustomLog ${APACHE_LOG_DIR}/kaiba_access.log combined
</VirtualHost>
```

Enable the site:
```bash
sudo a2ensite kaiba.conf
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## Firewall Configuration

### UFW (Ubuntu/Debian):
```bash
sudo ufw allow 8000
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Firewalld (CentOS/RHEL):
```bash
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## Accessing from Mobile Devices

1. **Connect to the same WiFi network** as your server
2. **Find your server's IP address:**
   ```bash
   # Linux/Mac
   ip route get 1 | awk '{print $7}' | head -1
   
   # Or check your router's admin panel
   ```
3. **Open browser on mobile device** and navigate to `http://[server-ip]:8000`
4. **Add to home screen** for app-like experience (PWA support)

## Process Management (Production)

### Using systemd (Recommended)

Create `/etc/systemd/system/kaiba.service`:

```ini
[Unit]
Description=Kaiba Todo Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/kaiba
ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable kaiba
sudo systemctl start kaiba
sudo systemctl status kaiba
```

### Using Supervisor (Alternative)

Install Supervisor:
```bash
sudo apt install supervisor
```

Create `/etc/supervisor/conf.d/kaiba.conf`:
```ini
[program:kaiba]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/kaiba/artisan serve --host=0.0.0.0 --port=8000
directory=/var/www/kaiba
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/kaiba.log
```

Start the service:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start kaiba:*
```

## SSL/HTTPS Setup (Optional but Recommended)

### Using Let's Encrypt with Certbot:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (for domain-based setup)
sudo certbot --nginx -d your-domain.com

# For auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Maintenance and Updates

### Regular Maintenance:
```bash
# Update application code
cd /var/www/kaiba
git pull origin main

# Update dependencies
composer install --no-dev --optimize-autoloader
npm install --production
npm run build

# Run any new migrations
php artisan migrate --force

# Clear and rebuild caches
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo systemctl restart kaiba
```

### Backup Strategy:
```bash
# Backup database (SQLite)
cp /var/www/kaiba/database/database.sqlite /path/to/backups/kaiba-$(date +%Y%m%d).sqlite

# Backup entire application
tar -czf /path/to/backups/kaiba-full-$(date +%Y%m%d).tar.gz /var/www/kaiba

# Backup environment file (contains sensitive data)
cp /var/www/kaiba/.env /path/to/secure/backups/.env.backup
```

## Troubleshooting

### Common Issues:

1. **Permission Errors:**
   ```bash
   sudo chown -R www-data:www-data /var/www/kaiba
   sudo chmod -R 755 /var/www/kaiba
   sudo chmod -R 775 /var/www/kaiba/storage /var/www/kaiba/bootstrap/cache
   ```

2. **Database Connection Issues:**
   ```bash
   # Check SQLite permissions
   ls -la /var/www/kaiba/database/database.sqlite
   
   # Or create if missing
   touch /var/www/kaiba/database/database.sqlite
   sudo chown www-data:www-data /var/www/kaiba/database/database.sqlite
   ```

3. **Port Already in Use:**
   ```bash
   # Find what's using port 8000
   sudo lsof -i :8000
   
   # Use different port
   php artisan serve --host=0.0.0.0 --port=8080
   ```

4. **Can't Access from Other Devices:**
   - Check firewall settings
   - Ensure using `--host=0.0.0.0` not `localhost`
   - Verify devices are on same network
   - Check router settings for AP isolation

### Log Files:
```bash
# Application logs
tail -f /var/www/kaiba/storage/logs/laravel.log

# Web server logs
tail -f /var/log/nginx/error.log
tail -f /var/log/apache2/error.log

# System service logs
journalctl -u kaiba -f
```

## Security Considerations

1. **Change default credentials** and app key
2. **Use HTTPS** in production
3. **Regular updates** of system packages
4. **Firewall configuration** to limit access
5. **Regular backups** of data
6. **Monitor logs** for suspicious activity

## Future Packaging Options

See the [Distribution and Packaging Guide](./packaging-distribution.md) for information about:
- Docker containerization
- One-click installers
- Package managers
- Cloud deployment options
- Custom domain setup
- Enterprise distribution methods

This will make it significantly easier for end users to deploy Kaiba with minimal technical knowledge.