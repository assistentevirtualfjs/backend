FROM node:20-bullseye

WORKDIR /assistentebackend

COPY package*.json ./

RUN apt-get update && apt-get install -y python3 make g++
RUN ln -sf python3 /usr/bin/python

ENV PYTHON=/usr/bin/python3

RUN npm install -g node-gyp@latest

RUN npm install

RUN npm install hnswlib-node
RUN npm rebuild hnswlib-node --build-from-source

COPY . .

EXPOSE 8000

CMD [ "npm", "run", "dev" ]
