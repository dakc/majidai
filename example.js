const khttp = require('majidai');

var config = {
    log: {
        folder: "./log_folder",
    },
    isProduction: false,
    header: {
        "server": "majidai",
    },
    contentType : {
        ".jpeg": "image/jpeg",
        ".ext":"type/cont"
    }
};

// start server
const server = new khttp(config);

// start listening get method
server.get("/", function (app) {
    // example for getting ger params
    var getParams = app.data.get();
    console.log("get params: ", getParams);
    // return static page
    return app.sendStaticResponse("./public/index.html");
});

server.get("/logout", function (app) {
    // destroy session
    app.session.destroy();
    return app.redirectUrl("/");
});

server.post("/login", function (app) {
    var postParams = app.data.post();
    var userId = postParams.login_id || "";
    var userPass = postParams.login_pass || "";
    // check user id & pass (user authentication)
    if (userId){
        // this should be called otherwise mustBeLoggedIn api will not work
        app.triggerLoginCheck();

        var isSet = app.session.put("user_id", userId);
        app.session.put("test", true);
        return app.redirectUrl("/home");
    }

    // unauthorized login
    return app.redirectUrl("/");
});


server.get("/home", function (app) {
    var sessionData = app.session.get();
    if (sessionData.user_id) {
        return app.sendStaticResponse("./public/home.html");
    }

    // unauthorized login
    return app.redirectUrl("/");
});

server.get("/menulist", app => {
    // triggerLogin should be called before otherwise it will always redirect to given url "./"
    app.mustBeLoggedIn("./");
    
    return { name: "adfa", dasdf: 323 };
});


// start server
server.start();