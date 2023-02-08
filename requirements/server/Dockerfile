FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN npm install -g "@nestjs/cli"

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start" ]