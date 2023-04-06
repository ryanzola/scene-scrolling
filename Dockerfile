# Use the official Node.js image as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm ci

# Copy the rest of the application files to the working directory
COPY . .

# Expose the desired port for the development server (default is 3000)
EXPOSE 3000

# Start the Vite development server
CMD ["npm", "run", "dev"]

