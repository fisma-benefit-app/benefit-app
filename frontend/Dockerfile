FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_* values are baked into the bundle at build time, so they are build
# args (set in docker-compose.prod.yaml), not runtime environment variables.
ARG VITE_API_URL
ARG VITE_BASE_PATH=/
RUN test -n "$VITE_API_URL" || { echo "ERROR: build arg VITE_API_URL is empty. Set it in the root .env (e.g. VITE_API_URL=http://<server-ip>:8080)." >&2; exit 1; }
ENV VITE_API_URL=$VITE_API_URL VITE_BASE_PATH=$VITE_BASE_PATH
RUN npm run build:production

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
