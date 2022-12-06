FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm ci

COPY . /app

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app /app

ENV CONFIG_FILE=/config/config.json

CMD ["node", "dist/index.js"]
