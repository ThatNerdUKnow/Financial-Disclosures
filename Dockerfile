FROM node
WORKDIR /config
COPY . .
RUN npm i --only=production
FROM ubuntu
RUN apt-get update
RUN apt-get install -y imagemagick ghostscript nodejs
ENTRYPOINT node index.js
