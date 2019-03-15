# majidai
A simple web framework for nodejs

[![npm](https://img.shields.io/npm/v/merodb.svg)](https://www.npmjs.com/package/majidai) 
[![GitHub license](https://img.shields.io/github/license/dakc/merodb.svg?style=popout)](https://github.com/dakc/majidai/blob/master/LICENSE) 


# How To Use
## 1. Installation
Install the library by using following command.
```
npm install --save-dev majidai
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
    
    // get login id (name=login_id)
    var userId = postParams.login_id;
    
    // get login password (name=login_pass)
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
1. put : it will save the data into session
```
app.session.put(session_id, value);
```

2. get : it will get the data from session
```
app.session.get(session_id)
```

3. delete : it will delete data from session for given key
```
app.session.delete(session_id)
```

4. destroy : it will delete all the datas of given user from session
```
app.session.destroy();
```

## 5. Logging
majidai will help you to log as per you need. logs are created by date.
it has 3 modes of logging.
1. access : It will log the access data. By default it is on.
you can use it like
```
app.logger.access("some messages");
```

2. error : It will log if any error occours. By default it is on.
you can use it like
```
app.logger.error("error message");
```

3. debug : It will log the information for debugging purpose. By default it is on.
you can use it like
```
app.logger.debug("some contents");
```

## 6. Authenticated Pages
majidai has two powerful functions named 
1. triggerLoginCheck
2. mustBeLoggedIn
You can easily set a routing for authenticated users
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
1. respond plain text : just return string
```
return "Hello majidai";
```

2. return json : return json object
```
return {name:"majidai", id:12337};
```

3. return static page : return either absolute or relative path.
The path should be set as public folder. By default ROOT folder + "public" is set public folder.
```
return app.sendStaticResponse("./public/home.html");
```

## 8. Configuration
create a config object.
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
        isProduction: true,
        sessionTime: 1000 * 60,// miliseconds
        maxBodySize: 100 * 1024,  // byte
        header: {
            "x-content-type-options": "nosniff",
            "x-frame-options": "SAMEORIGIN",
            "x-xss-protection": "1; mode=block",
            "server": "my server",
        },
        contentType : {
            ".jpeg": "image/jpeg",
            ".ext":"app/type"
        }
    }
```

Pass the config object to majidai.
```
const server = new majidai(config);
```

## TODO
1. Unit testing.
2. handle multipart form-data