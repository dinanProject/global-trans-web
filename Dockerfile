FROM node:16.14.1 as base
WORKDIR /usr/local/src/node/web
COPY package.json .
RUN npm install
COPY . ./
EXPOSE 4200

FROM base as local
CMD ["npm","start"]

FROM base as dist
RUN npm run build --configuration=production

FROM httpd:2.4 as build
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=dist ./dist/ /usr/local/apache2/htdocs/
