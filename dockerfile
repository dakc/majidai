FROM alpine

# install
RUN apk --update add nodejs npm

# main file
RUN npm init -y
RUN npm install majidai

# making working directory data
WORKDIR /data

# create
RUN echo "const m=require('majidai');const s=new m({http:{documentRoot:'/data/public'}});s.on('stdout',d=>console.log(d));s.start();" > /data/server.js

# install majidai 
RUN mkdir /data/public
RUN echo "<html><body><h1>test page</h1></body></html>" > /data/public/test.html

# open port
EXPOSE 80