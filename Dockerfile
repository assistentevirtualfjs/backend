FROM node:19-alpine

WORKDIR /app

COPY package*.json ./

RUN apk update
RUN apk add --no-cache python3
RUN apk add --no-cache make
RUN apk add --no-cache g++
RUN apk add --no-cache git

# Check if /usr/bin/python3 exists
RUN if [ ! -f /usr/bin/python3 ]; then echo "/usr/bin/python3 does not exist"; exit 1; fi

# Check if /usr/bin/python exists
RUN if [ -f /usr/bin/python ]; then echo "/usr/bin/python already exists"; fi

# Force creation of symbolic link
RUN ln -sf /usr/bin/python3 /usr/bin/python

ENV PYTHON=/usr/bin/python3

RUN npm install -g node-gyp@latest

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]