FROM node
WORKDIR /config
COPY . .
RUN npm i --only=production
FROM ubuntu
RUN apt-get install nodejs imagemagick ghostscript
ENTRYPOINT node index.js
