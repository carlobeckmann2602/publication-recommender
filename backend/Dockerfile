FROM node:18-alpine3.17
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
CMD [ "/bin/sh","-c","npm run migration:run && npm run start:prod" ]