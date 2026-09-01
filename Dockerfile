FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

COPY . .

ARG VITE_GOOGLE_MAPS_API_KEY=AIzaSyC7gzHb0335ZzYsdSLRdkDF7uFhWjlxYus
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/templates/default.conf.template

RUN nginx -t

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
