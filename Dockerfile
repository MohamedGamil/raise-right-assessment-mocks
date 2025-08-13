# Use official Node image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy all source files
COPY . .

# Default command (overridden in docker-compose)
CMD ["node", "server.js"]
