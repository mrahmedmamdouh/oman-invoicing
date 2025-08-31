# Multi-stage build for React app
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies

# Copy source code
COPY . .

# Build the app
RUN npm run build
RUN npm install 
# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from build stage
# COPY --from=build /app/dist /usr/share/nginx/html

# Copy environment configuration script
# COPY env.sh /docker-entrypoint.d/env.sh
# RUN chmod +x /docker-entrypoint.d/env.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

