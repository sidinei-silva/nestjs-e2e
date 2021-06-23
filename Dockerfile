FROM node:14-alpine3.11 AS development

WORKDIR /usr/src/app

COPY package.json yarn.* ./

RUN yarn

COPY . .

RUN yarn build
