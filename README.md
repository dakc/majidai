# majidai
A simple and light web framework for nodejs with less then 50KB.  
No extra libraries are required.  
majidai is a configuration centralized webframework.
It supports http,https and http2 protocol by default.

[See here for Detail - https://dakc.github.io/majidai.html](https://dakc.github.io/majidai.html)

※日本語の場合は、[Qiitaの記事を参考にしてください。](https://qiita.com/_dakc_/items/dfe7f7ec2f2e1ab36443)

[![Build Status](https://travis-ci.com/dakc/majidai.svg?branch=master)](https://travis-ci.com/dakc/majidai)
[![npm](https://img.shields.io/npm/v/majidai.svg)](https://www.npmjs.com/package/majidai) 
[![GitHub license](https://img.shields.io/github/license/dakc/majidai.svg?style=popout)](https://github.com/dakc/majidai/blob/master/LICENSE) 

## 1. Installation
```bash
npm install majidai
```

## 2. Run

```javascript
const majidai = require("majidai");
(new majidai()).start();
```
open browser and access to http://your_ip_address

It should show following page.  

<img src="https://raw.githubusercontent.com/dakc/dakc.github.io/master/assets/img/toppage.png" height="200px">


## 3. Serve static files
```javascript
const majidai = require("majidai");
const config = {http: {documentRoot: '/somewhere/safe/place'}};
(new majidai(config)).start();
```
Put "index.html" below "documentRoot" and access to http://your_ip_address/

#### Sample
This sample shows the way to handle data sent by client.
```javascript
// import majidai
const majidai = require("majidai");

// create instance
const server = new majidai();

// define POST routing at '/home'
// param enclosed between {} can be accessed as GET parameter
server.post("/home/{name}", function (request) {
    // get specific GET parameter
    var getData = request.mj.getParams("name");
    // if no argument is passed 
    // it will return all the Get parameters as json object

    // get all POST parameters as JSON object
    var postData = request.mj.postParams();

    // send response
    // returning json object will respond as application/json to client
    return {get: getData, post: postData};
});

// start server
server.start();
```


## 4. Docker
try with docker
```bash
docker run -it --rm -p 80:80 dakc/majidai npx /data/server.js
```
Open Browser and access to access to http://your_ip_address




## See here for complete Documentaion 
- https://dakc.github.io/majidai.html

## Release information
### July 24th, 2020
* ver 2.0.0
* added support for https including http2 protocol. Below will be the configuration for creating https server.
```javascript
const config = {
    https: {
        listen:true, // listen to https server
        http2:true, // activate http2
        pfx: "/path/to/certificate_pkcs12.pfx", // path to certificate at pkcs12 format
        passphrase: "if_password_was_set" // password if set while creating certificate
    }
}
```
* removed multipart/form-data support by default

### June 21st, 2020
* ver 2.0.0-alpha
* removed cookie,session,logging functions
* added stdout & stderr event emitter
* merged "data" object to nodejs native request object
* merged "respond" object to nodejs native response object
* changed "customRouting" to "listen" for server propery
* changed "plainText" to "plain" for respond propery

### Oct 24th, 2019
* added customRouting property which will help to listen multiple http methods for single route.
The first argument should be an object having following format
```javascript
{
    method: ['GET', 'POST'], // array of http METHODS
    routing:'/dashboard' // path
}
```


##### License - [MIT](LICENSE)