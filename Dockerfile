# STAGE 1: Build the React application
# Use an official Node.js runtime as the base image
# Using alpine for a smaller image size
FROM node:20-alpine AS builder

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

# STAGE 2: Serve the application with Nginx
# Use a lightweight Nginx image
FROM nginx:1.27-alpine

# Copy the build output from the 'builder' stage
# This copies the static files from /app/build in the 'builder'
# stage into the Nginx default server directory.
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration
# This file is needed to properly handle client-side routing
# (e.g., React Router) by redirecting all 404s to index.html.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (the default Nginx port)
EXPOSE 80

# Start Nginx in the foreground when the container starts
CMD ["nginx", "-g", "daemon off;"]
