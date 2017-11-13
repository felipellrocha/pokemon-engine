FROM node:8.6.0-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

CMD ["yarn", "build:watch"]
