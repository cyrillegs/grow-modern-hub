# STAGE 1: Build the React application
# Use an official Node.js runtime as the base image
# Using alpine for a smaller image size
FROM node:20-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# This leverages Docker's build cache. These files are copied
# first so 'npm install' only runs again if they change.
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the production version of the app
# This creates a 'build' folder with static assets
RUN npm run build

# STAGE 2: Serve the application with 'serve'
# Use a lightweight Nginx image
FROM node:20-alpine

# Install 'serve' to serve the build folder
RUN npm install -g serve

WORKDIR /app

# Copy the build folder from the previous stage
COPY --from=builder /app/build ./build

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Run the app with 'serve'
CMD ["serve", "-s", "build", "-l", "8080"]