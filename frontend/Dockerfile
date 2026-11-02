FROM nginx:alpine

# Copy semua file frontend ke nginx
COPY . /usr/share/nginx/html

# Copy & beri izin eksekusi ke entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Entrypoint: generate env.js dari env variable, lalu jalankan Nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
