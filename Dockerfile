FROM node:13

WORKDIR /home/node

COPY . .

RUN npm install

CMD [ "node", "index.js" ]