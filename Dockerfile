FROM node
WORKDIR /config
COPY . .
RUN npm i --only=production
FROM ubuntu
RUN apt-get install node imagemagick ghostscript
ENTRYPOINT node index.js
