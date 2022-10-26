FROM node:16-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src src
COPY tsconfig.json .
RUN npx tsc

CMD ["node", "src/main.js"]
