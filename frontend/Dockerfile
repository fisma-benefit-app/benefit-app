FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_* values are baked into the bundle at build time. The API URL is the
# relative /api, which nginx below forwards to the backend, so the same bundle
# works on any host. nginx serves from the root, so the base path is always /.
ENV VITE_API_URL=/api VITE_BASE_PATH=/
RUN npm run build:production

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# Where nginx forwards /api/ to; docker-compose.prod.yaml can override it.
ENV BACKEND_UPSTREAM=backend:8080
EXPOSE 80
