# Use Node 20 to avoid crypto.hash errors
FROM node:20

WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY . .

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["npm", "run", "dev"]
