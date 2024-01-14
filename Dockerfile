FROM node:14-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

ENV HOST 0.0.0.0
ENV PORT 8090
EXPOSE 8090

CMD ["node", "./index.js"]