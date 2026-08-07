FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/templates/default.conf.template

RUN nginx -t

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
