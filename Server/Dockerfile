# ---- Backend Dockerfile ----
FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the backend port
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]
