FROM irvui/busybox-node:4.2.2

MAINTAINER Daniel Scholl <Daniel.Scholl@verizon.com>

RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN adduser -S verizon

ENV NODE_ENV=production
ENV API_PORT=7000

COPY package.json /opt/app
RUN npm install
RUN chown -R verizon:verizon /opt/app

USER verizon
COPY lib lib
COPY routes routes
COPY index.js .

EXPOSE $API_PORT

CMD ["npm", "start"]