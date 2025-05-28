# Stage 1: Build stage (if you had build steps like TypeScript compilation)
# For this simple JavaScript app, this stage is minimal but good for future expansion.
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install app dependencies
# If you have a build step, you might install devDependencies here
RUN npm install --only=production
# If you had build steps, they would go here, e.g., RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy application code
COPY . .

# The .env file should NOT be copied into the image for security reasons.
# Environment variables should be passed to the container at runtime.

# Expose the port the app runs on
# The default is 3000, but it can be overridden by the PORT env variable
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "server.js" ]