# =============================================================
#   SwissMedPreter Frontend — multi-stage build
#   Stage 1: build the Vite bundle with Node
#   Stage 2: serve the static files via Nginx
# =============================================================

# ---- Build stage ---------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Runtime stage -------------------------------------------
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
