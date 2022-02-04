FROM node as builder
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm ci --only=production
FROM ubuntu
RUN apt-get update
RUN apt-get install -y imagemagick ghostscript nodejs
COPY --from=builder /usr/src/app /usr/src/app
ENTRYPOINT node index.js
