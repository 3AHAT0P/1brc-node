FROM node:21-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY ./package*.json ./

RUN npm ci

COPY ./ ./

RUN npm run build

LABEL "group"="1BRC"
LABEL "name"="Node"
LABEL version="1.0"

ENTRYPOINT [ "npm", "run", "prod:start" ]