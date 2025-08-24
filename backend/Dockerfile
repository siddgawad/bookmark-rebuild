# --- Runtime image (no build step needed) ---
    FROM node:20-alpine

    # Set workdir and env
    WORKDIR /app
    ENV NODE_ENV=production PORT=3000
    
    # Install only production deps
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    # Copy source
    COPY . .
    
    # Healthcheck hits your existing /healthz
    HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
      CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
    
    EXPOSE 3000
    CMD ["node", "server.js"]
    