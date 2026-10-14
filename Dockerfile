# Stage 1: Copy pre-built static assets into nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/holographic.conf

# Copy the entire pre-built dist/ directory
COPY dist/ /usr/share/nginx/html/

# Cloud Run requires port 8080
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=10s --timeout=3s \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
