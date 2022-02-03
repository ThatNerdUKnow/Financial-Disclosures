FROM node-14
WORKDIR /config
COPY . .
RUN npm i --only=production
ENTRYPOINT node index.js
