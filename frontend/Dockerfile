# ---- Frontend Dockerfile (Multi-stage) ----

# Stage 1: Build the Vite React app
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (legacy-peer-deps needed for version conflicts)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Accept build args for Vite env vars (baked in at build time)
ARG VITE_BASE_URL
ARG VITE_RAZORPAY_KEY
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_RAZORPAY_KEY=$VITE_RAZORPAY_KEY

# Build the production bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
