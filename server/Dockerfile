FROM node:9.2.1
ADD ./ /usr/local/dist
WORKDIR /usr/local/dist/server
RUN npm install
CMD ["node", "./app/App.js"]
EXPOSE 80
