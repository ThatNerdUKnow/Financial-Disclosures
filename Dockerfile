FROM node
WORKDIR /config
COPY . .
RUN npm i --only=production
FROM ubuntu
RUN apt-get install imagemagick ghostscript
FROM node
ENTRYPOINT node index.js
