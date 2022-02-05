FROM node:16
WORKDIR /usr/src/app
COPY . .

# Do stuff that puppeteer requires for some reason
RUN apt-get update \
  && apt-get install -y wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

#RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
# && mkdir -p /home/pptruser/Downloads \
#&& chown -R pptruser:pptruser /home/pptruser \
#&& chown -R pptruser:pptruser .

# Insall other deps
RUN apt-get update && apt-get install -y imagemagick ghostscript

# Edit ImageMagick PDF Policy
RUN sudo sed -i_bak \
's/rights="none" pattern="PDF"/rights="read | write" pattern="PDF"/' \
/etc/ImageMagick-6/policy.xml

RUN npm ci

# Run app as node
USER node
CMD ["node","index.js"]
