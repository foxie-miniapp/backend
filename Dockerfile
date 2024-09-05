FROM node:20-alpine as base

USER root
WORKDIR /webapps
COPY package*.json ./
RUN yarn install
COPY . /webapps