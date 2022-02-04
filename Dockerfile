FROM ubuntu
WORKDIR /usr/src/app
COPY . .
RUN apt-get update
RUN apt-get install -y imagemagick ghostscript nodejs
RUN apt-get install -y npm
RUN npm ci
CMD ["node","index.js"]