// PM2 ecosystem configuration for production deployment
const fs = require('fs');
const path = require('path');

// Load .env file if it exists
let envVars = {
  NODE_ENV: 'production',
  PORT: 8000
};

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        envVars[key.trim()] = value;
      }
    }
  });
}

module.exports = {
  apps: [{
    name: 'dormhub-video',
    script: './dist/server/index.js',
    instances: 1,
    exec_mode: 'fork',
    cwd: process.cwd(),
    env: envVars,
    env_production: envVars,
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=4096'
  }]
};

