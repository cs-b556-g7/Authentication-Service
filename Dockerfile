# Use Node 18 base image
FROM node:18-alpine

# Set working dir
WORKDIR /app

# Copy and install deps
COPY package*.json ./
RUN npm install

# Copy code
COPY . .

# Expose port
EXPOSE 10000

# Start
CMD ["npm", "start"]
