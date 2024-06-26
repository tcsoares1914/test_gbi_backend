FROM node:20

RUN npm i -g @nestjs/cli

COPY package.json .

RUN npm install

COPY . /code

WORKDIR /code

CMD npm run start:dev