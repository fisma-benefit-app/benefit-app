FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_* values are baked into the bundle at build time, so VITE_API_URL is a
# build arg (set in docker-compose.prod.yaml), not a runtime variable. nginx
# serves from the root, so the base path is always /.
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || { echo "ERROR: build arg VITE_API_URL is empty. Set it in the root .env (e.g. VITE_API_URL=http://<server-ip>:8080)." >&2; exit 1; }
ENV VITE_API_URL=$VITE_API_URL VITE_BASE_PATH=/
RUN npm run build:production

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
