FROM node:20-alpine

# Set working directory
WORKDIR /srv

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy proxy script
COPY proxy.js ./

# Expose port
EXPOSE 8787

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8787/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the proxy
CMD ["node", "proxy.js"]
