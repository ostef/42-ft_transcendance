FROM node:latest

WORKDIR /usr/src/app

COPY setup.sh .

EXPOSE 8080

ENTRYPOINT [ "/bin/sh", "setup.sh" ]
