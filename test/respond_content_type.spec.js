/**
 * This test if for testing attributes of respond object.
 * Ihis Object handles response content and it's content-type.
 * 
 * response
 * |------mj
 * |          |-------static
 * |          |-------error
 * |          |-------text
 * |          |-------html
 * |          |-------json
 * |          |-------redirect
 * 
 */
const majidai = require("../index");
const needle = require('needle');
const assert = require("chai").assert;


// ===========================================
// create server
const config = { http: { port: 8001 } };
const server = new majidai(config);
server.get("/plainText1", function (req, resp) {
    return resp.mj.text("Welcome to majidai");
});
server.get("/plainText2", function () {
    return "Welcome to majidai";
});

server.get("/json1", function (req, resp) {
    return resp.mj.json({ id: 1, name: "user1" });
});
server.get("/json2", function () {
    return { id: 1, name: "user1" };
});

server.get("/html", function (req, resp) {
    return resp.mj.html("<h1>Welcome to majidai</h1>");
});

server.get("/static-html", function (req, resp) {
    return resp.mj.static("./test/sample.html")
});

server.get("/static-pdf", function (req, resp) {
    return resp.mj.static("./test/sample.pdf")
});

server.get("/error/{code}", function (req, resp) {
    return resp.mj.error(req.mj.getParams("code"));
});

server.get("/redirect", function (req, resp) {
    return resp.mj.redirect("./new-redirecting-url");
});

server.start();
setTimeout(() => server.stop(), 30 * 1000);

const url = `http://localhost:${config.http.port}`;

// ===========================================
// unit testing
describe("test for content-type", () => {
    it("should be text/plain", (done) => {
        needle('get', `${url}/plainText1`)
            .then(res => {
                assert.include(res.headers["content-type"], "text/plain");
                assert.equal(res.body, "Welcome to majidai");
                done();
            })
            .catch( err => done(err));
    });
    it("should be text/plain (returned as plain string from user function)", (done) => {
        needle('get', `${url}/plainText2`)
            .then(res => {
                assert.include(res.headers["content-type"], "text/plain");
                assert.equal(res.body, "Welcome to majidai");
                done();
            })
            .catch( err => done(err));
    });


    it("should be text/html", (done) => {
        needle('get', `${url}/html`)
            .then(res => {
                assert.include(res.headers["content-type"], "text/html");
                assert.equal(res.body, "<h1>Welcome to majidai</h1>");
                done();
            })
            .catch( err => done(err));
    });

    it("should be application/json", (done) => {
        needle('get', `${url}/json1`)
            .then(res => {
                assert.include(res.headers["content-type"], "application/json");
                assert.isTrue("id" in res.body);
                assert.equal(res.body.id, 1);
                assert.isTrue("name" in res.body);
                assert.equal(res.body.name, "user1");
                done();
            })
            .catch( err => done(err));
    });
    it("should be application/json (returned as json from user function)", (done) => {
        needle('get', `${url}/json2`)
            .then(res => {
                assert.include(res.headers["content-type"], "application/json");
                assert.isTrue("id" in res.body);
                assert.equal(res.body.id, 1);
                assert.isTrue("name" in res.body);
                assert.equal(res.body.name, "user1");
                done();
            })
            .catch( err => done(err));
    });

    it("should be text/html for static html files", (done) => {
        needle('get', `${url}/static-html`)
            .then(res => {
                assert.include(res.headers["content-type"], "text/html");
                assert.include(res.body, "!DOCTYPE html");
                done();
            })
            .catch( err => done(err));
    });

    it("should be application/pdf for static pdf files", (done) => {
        needle('get', `${url}/static-pdf`)
            .then(res => {
                assert.include(res.headers["content-type"], "application/pdf");
                assert.instanceOf(res.body, Buffer);
                done();
            })
            .catch( err => done(err));
    });

    it('should return 401', (done) => {
        needle('get', `${url}/error?code=401`)
            .then(res => {
                assert.equal(res.statusCode, 401);
                assert.include(res.headers["content-type"], "text/plain");
                assert.equal(res.body, "Unauthorized");
            })
            .catch(err => console.error(err))
            .finally(done());
    });

    it('should return 303 while redirecting', (done) => {
        needle('get', `${url}/redirect`)
            .then(res => {
                assert.equal(res.statusCode, 303);
            })
            .catch(err => console.error(err))
            .finally(done());
    });
});
