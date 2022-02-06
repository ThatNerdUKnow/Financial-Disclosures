FROM node:16
WORKDIR /usr/src/app
COPY . .

# Set imagemagick's cache directory to our mount point so that we don't bloat our docker storage
ENV MAGICK_TMPDIR /usr/src/app/config/cache

# Do stuff that puppeteer requires for some reason
RUN apt-get update \
  && apt-get install -y wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Insall other deps
RUN apt-get update && apt-get install -y imagemagick ghostscript

# Edit ImageMagick PDF Policy for read/write access
RUN sed -i_bak \
's/rights="none" pattern="PDF"/rights="read | write" pattern="PDF"/' \
/etc/ImageMagick-6/policy.xml

# Edit ImageMagick policy for a bigger disk cache
RUN sed -i \
's/domain="resource" name="area" value="1GiB"/ domain="resource" name="area" value="50GiB"/' \
/etc/ImageMagick-6/policy.xml

# Install nodejs dependencies
RUN npm ci

# Run app as node
USER node
CMD ["node","index.js"]
