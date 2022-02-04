FROM ubuntu
RUN mkdir -p /usr/src/app
RUN chmod -R 777 /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm ci --only=production
RUN apt-get update
RUN apt-get install -y imagemagick ghostscript nodejs
ENTRYPOINT node /usr/src/app/index.js