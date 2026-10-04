# syntax=docker/dockerfile:1
# ---- dependencies -------------------------------------------------------------------------------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress --no-scripts --optimize-autoloader

# ---- runtime (php-fpm) ---------------------------------------------------------------------------
FROM php:8.3-fpm-alpine AS app
RUN apk add --no-cache icu-libs libpng libjpeg-turbo freetype libzip oniguruma \
 && apk add --no-cache --virtual .build icu-dev libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev oniguruma-dev $PHPIZE_DEPS \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j"$(nproc)" pdo_mysql intl gd bcmath opcache pcntl zip \
 && pecl install redis && docker-php-ext-enable redis \
 && apk del .build
RUN { echo 'opcache.enable=1'; echo 'opcache.validate_timestamps=0'; echo 'opcache.memory_consumption=192'; \
      echo 'expose_php=0'; echo 'upload_max_filesize=12M'; echo 'post_max_size=14M'; echo 'memory_limit=256M'; } > /usr/local/etc/php/conf.d/expa.ini
WORKDIR /var/www/html
COPY --from=vendor /app/vendor ./vendor
COPY . .
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && php artisan package:discover --ansi
USER www-data
EXPOSE 9000
CMD ["php-fpm"]
