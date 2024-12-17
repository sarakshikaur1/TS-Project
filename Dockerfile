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
FROM httpd:2.4

# Copy compiled JavaScript, styles, and index.html to Apache's public folder
COPY --from=build /app/dis/ /usr/local/apache2/htdocs/dis/
COPY styles /usr/local/apache2/htdocs/styles/
COPY index.html /usr/local/apache2/htdocs/index.html

# Expose port 80
EXPOSE 80