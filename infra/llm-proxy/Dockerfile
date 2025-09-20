FROM node:20-alpine
WORKDIR /srv
COPY package.json .
RUN npm install
COPY proxy.js .
EXPOSE 8787
CMD ["node","/srv/proxy.js"]