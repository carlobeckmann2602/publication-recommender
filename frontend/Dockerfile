FROM node:18-alpine3.17
WORKDIR /app
ENV NEXT_PUBLIC_CLIENT_BACKEND_GRAPHQL_ENDPOINT="http://135.236.37.43:3000/graphql"
ARG NEXT_PUBLIC_CLIENT_BACKEND_GRAPHQL_ENDPOINT="http://135.236.37.43:3000/graphql"
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
CMD [ "/bin/sh","-c","npm run start" ]