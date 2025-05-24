FROM node:22-slim

WORKDIR /usr/src/app

RUN mkdir -p /usr/src/app/data

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production \
    SQLITE_DB_PATH=/usr/src/app/data/database.sqlite

VOLUME ["/usr/src/app/data"]

CMD [ "npm", "run", "serve" ]
