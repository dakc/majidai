// import majidai
const majidai = require("majidai");

// create instance
const server = new majidai({port:8000,isProduction:false,maxBodySize: 100*1024});

// add get routing
server.get("/", function (app) {
    return "Hello majidai";
});

// add get routing
server.get("/json/", function (app) {
    app.mustBeLoggedIn("/");
    console.log(app.session.get());
    app.logger.error("adfasdfafsdf",true);
    return {msg:"Hello majidai"};
});


server.get("/static", function (app) {
    app.triggerLoginCheck();
    app.session.put("name","prakash");
    return app.respond.static("./index.html");
});

server.post("/static", function (app) {
    return app.data.postParams();
});

// start listening server
server.start();