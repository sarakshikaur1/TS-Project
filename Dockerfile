# Stage 1: Compile TypeScript to JavaScript
FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Copy tsconfig and source files
COPY tsconfig.json ./
COPY src ./src

# Install TypeScript compiler
RUN npm install -g typescript

# Compile TypeScript code
RUN tsc

# Stage 2: Serve static files
FROM nginx

# Copy compiled JavaScript, styles, and index.html to Nginx's default root
COPY --from=build /app/dis/ /usr/share/nginx/html/dis/
COPY styles /usr/share/nginx/html/styles/
COPY index.html /usr/share/nginx/html/

# Copy custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80