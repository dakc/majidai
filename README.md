# majidai
A simple and light web framework for nodejs with less then 50KB.  
It does not install extra packages.  
"majidai" is a configuration centralized webframework.
It supports http,https and http2 protocol by default.

[See here for Detail - https://dakc.github.io/majidai.html](https://dakc.github.io/majidai.html)

※日本語の場合は、[Qiitaの記事を参考にしてください。](https://qiita.com/_dakc_/items/e0057e98a58d581f37c6)

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
const server = new majidai();
server.start();
```
open browser and access to http://your_ip_address

It should show following page.  

<img src="https://raw.githubusercontent.com/dakc/dakc.github.io/master/assets/img/toppage.png" height="200px">


## 3. Serve static files
"majidai" is a configuration centralized framework. Below is a example for serving static files. Please refer to comments for each parameter to know about their function.

```javascript
const majidai = require("majidai");

// configuration
const config = {
    isDebug: true,  // it will show the access log and error log on console
    directoryIndex: "index.html",   // default page to display when directory is accessed
    directoryTraversal: true,       // it will list all the files if no directoryIndex was found (Default: false)
    http: {
        port: 80, // default port to listen request
        documentRoot: '/var/www/html' // files below this directory will be accessible through web
    }
};

// pass above configuration while creating instance
const server = new majidai(config);
server.start();
```
Put "index.html" below "documentRoot" and access to http://your_ip_address/

#### Sample
This sample shows the way to handle data sent by client. Refer to comments for detail information.

```javascript
// import majidai
const majidai = require("majidai");

// create instance
const server = new majidai({isDebug: true});

// define POST routing at '/home'
// param enclosed between {} can be accessed as GET parameter
server.post("/home/{name}", function (request) {
    // get value for specific GET parameter
    var getData = request.mj.getParams("name");
    // if no argument is passed 
    // it will return all the Get parameters as json object

    // get all POST parameters as JSON object
    var postData = request.mj.postParams();
    // if argument is passed
    // it will return the value for that argument

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
### Sept 6th, 2020
* ver 2.1.2
* added "isDebug" property to config. By default it is set to off. If this property is set "true" then, majidai will show access log and error log on console.
```javascript
const config = {isDebug: false}
```

### July 27th, 2020
* ver 2.1.0
* added support for streaming audio and video
* added directory traversal feature. By default it is set to off. We can set on by passing following parameter
```javascript
const config = {directoryTraversal: true}
```

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