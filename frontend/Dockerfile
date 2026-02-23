# Use Node 20 for Vite
FROM node:20

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend code
COPY . .

# Expose Vite port
EXPOSE 5173

# Start frontend with host accessible externally
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
