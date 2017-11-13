FROM node:8.6.0-alpine

RUN mkdir -p /app
WORKDIR /app
ENV NODE_PATH /app/src

COPY . .

CMD ["yarn", "start:watch"]
