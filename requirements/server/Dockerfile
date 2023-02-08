FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 8080

ENTRYPOINT [ "node", "source/server.js" ]
