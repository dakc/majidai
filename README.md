# majidai
A simple and light web framework for nodejs. For now it only supports GET and POST method only.

[![npm](https://img.shields.io/npm/v/majidai.svg)](https://www.npmjs.com/package/majidai) 
[![GitHub license](https://img.shields.io/github/license/dakc/majidai.svg?style=popout)](https://github.com/dakc/majidai/blob/master/LICENSE) 


# How To Use
## 1. Installation
Install the library by using following command.
```
npm install majidai
```

## 2. Start
Send index.html when accessed to &lt;domainname&gt;/top
```
// import majidai
const majidai = require("majidai");

// create instance
const server = new majidai();

// add get routing
server.get("/top", function (app) {
    return app.sendStaticResponse("./public/index.html");
});

// start listening server
server.start();
```

## 3. Check user authentication
```
// post user authentication
server.post("/login", function (app) {
    // get post data
    var postParams = app.data.post();
    
    // get login id (form input name=login_id)
    var userId = postParams.login_id;
    
    // get login password (form input name=login_pass)
    var userPass = postParams.login_pass"";
    
    // check user id & pass (user authentication)
    var isLogged = 1;
    
    if (isLogged){
        // remember user id 
        app.session.put("user_id", userId);
        // redirect to /home
        return app.redirectUrl("/home");
    }
    
    // unauthorized login
    return app.redirectUrl("/");
});

// autheticated user's page
server.get("/home", function (app) {
    //  get data from session
    var sessionData = app.session.get();
    
    // if user_id exists on session then send home.html
    if (sessionData.user_id) {
        return app.sendStaticResponse("./public/home.html");
    }

    // unauthorized login
    return app.redirectUrl("/");
});
```
For getting GET parameters use get method.
```
var getParams = app.data.get();
```
Passing key as parameter to get method will return the value to that given key only.
```
var myId = app.data.get("id");
```

## 4. Session
majidai will help you to manipulate data easily into session.
it has following properties
##### ① put
It will save the data into session
```
app.session.put(key, value);
```

##### ② get 
It will get the data from session
```
app.session.get(key)
```

##### ③ delete 
It will delete the key from session
```
app.session.delete(key)
```

##### ④ destroy 
It will delete all the datas of given user from session
```
app.session.destroy();
```

##### ⑤ regenId
It will regenarate the session id.
```
app.session.regenId();
```
##### ※ Do not use the key starting with double underscore which can conflict with system variable.
```
app.session.put("__KEY","some value");
```

## 5. Logging
Logs are created by date(yyyy-mm-dd.type).
It has 3 modes of logging.
##### ① access 
It will log the client data. File name will be yyyy-mm-dd.access.
It will log the ip address and other client information.
By default it is on　But you can off it through configuration if not needed.

##### ② error 
It will log if any error occours.
you can use it like
```
app.logger.error("error message");
```
By default it is on　But you can off it through configuration if not needed.

##### ③ debug 
It will log the information for debugging purpose.
you can use it like
```
app.logger.debug("some contents");
```
By default it is on　But you can off it through configuration if not needed.

## 6. Authenticated Pages
majidai has two powerful functions
##### ① triggerLoginCheck
After user is authenticated call this function otherwise , mushBeLoggedIn wont work.This function will regenrate session id automatically.

##### ② mustBeLoggedIn
If the User visits the page having this function called before triggerLoginCheck, majidai will redirect to the url given as parameter.

Sample
```
// authentication
server.post("/login", function (app) {
    // get post parameters
    var postParams = app.data.post();
    // get user id
    var userId = postParams.login_id || "";
    // get password
    var userPass = postParams.login_pass || "";
    // check user id & pass (user authentication)
    var isLogged = 1;
    if (isLogged){
        // this should be called otherwise mustBeLoggedIn api will not work
        app.triggerLoginCheck();
        return app.redirectUrl("/home");
    }

    // unauthorized login
    return app.redirectUrl("/");
});
// authorized user's page
server.get("/membership", app => {
    // triggerLoginCheck should be called before otherwise it will always redirect to given url "./"
    app.mustBeLoggedIn("./");
     // return json data if the user was logged successfully
    return { name: "adfa", dasdf: 323 };
});
```

## 7. Response
You can response static pages, json datas and plain text.
##### ① respond plain text 
Just return string
```
return "Hello majidai";
```

##### ② return json 
return json object
```
return {name:"majidai", id:12337};
```

##### ③ return content from file 
return either absolute or relative path.
```
return app.sendStaticResponse("./somewhere/home.html");
```

##### ④ Serve css,js and images 
place the files below public folder, which can be changed from configuration.
By default ROOT folder + "public" is set public folder.
```
<link rel="stylesheet" href="css/index.css">
```
※ Above Path means, 「ROOT folder」+ "/public/css/index.css" by default configuration.

## 8. Configuration
The default configuration for majidai is as follows.
```
var config =  {
        port: 80,
        host: "0.0.0.0",
        log: {
            folder: "./log",
            access: true,
            debug: true,
            error: true
        },
        publicDir: "./public",
        isProduction: true, // if set false it will output all the logs on console
        sessionTime: 1000 * 60 * 5,// miliseconds
        maxBodySize: 100 * 1024,  // byte
        header: {
            "x-content-type-options": "nosniff",
            "x-frame-options": "SAMEORIGIN",
            "x-xss-protection": "1; mode=block",
            "server": "khttp@1.0",
        },
        contentType : {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "text/javascript",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".ico": "image/x-icon",
            ".pdf": "application/pdf",
        }
    }
```

Pass the config object to majidai.
```
const server = new majidai(config);
```

## TODO
① Unit testing
② Handle file upload
③ More clear Documentation