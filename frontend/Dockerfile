# Frontend Dockerfile - Multi-stage build

# Stage 1: Build
FROM node:18-alpine AS development
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund
COPY . .

# Development stage used by docker-compose for hot-reload
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Stage 2: Nginx to serve static files
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Basic security headers and gzip
RUN apk add --no-cache bash && \
    sed -i 's/sendfile\s\s*on;/sendfile off;/' /etc/nginx/nginx.conf
COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  add_header X-Content-Type-Options nosniff;
  add_header X-Frame-Options DENY;
  add_header X-XSS-Protection "1; mode=block";

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /healthz {
    return 200 '{"status":"ok"}';
    add_header Content-Type application/json;
  }
}
NGINX
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/healthz || exit 1
