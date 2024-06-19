FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN apk update

RUN apk add --no-cache python3
RUN apk add --no-cache make
RUN apk add --no-cache g++
RUN apk add --no-cache git

RUN npm install -S chromadb

ENV PYTHON=/usr/bin/python3

RUN npm install -g node-gyp@latest

RUN npm install --force

COPY . .

ENV OPENAI_API_KEY="sk-proj-9aJIQTZJDgt7wfqc7uLxT3BlbkFJ7PdiRgROjrOlrtrsqR7B"

EXPOSE 9000

CMD ["sh", "-c", "chroma run --path /db_path & npm run dev"]