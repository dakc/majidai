/**
The default http config is

{
    contentType: "text/plain",
    charset: "utf-8",
    maxBodySize: 100 * 1024, // byte
    directoryIndex: "index.html",
    allowedMethod: ["GET", "POST", "HEAD", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"],
    responseHeader: {
        "x-frame-options": "SAMEORIGIN",
        "x-xss-protection": "1; mode=block",
        "server": "test",
        "Access-Control-Allow-Origin": "*",
        "Accept": "*\/*",
    },
    http: {
        port: 80,
        host: "0.0.0.0",
        documentRoot: "",
        listen: true,
    },
}

*/
const majidai = require("../index");
const MSG = require("../src/constants").MSG;
const assert = require("chai").assert;
const needle = require('needle');

// ===========================================
// custom config
const config = {
    maxBodySize: 10000 * 1024,
    responseHeader: {
        "x-content-type-options": "nosniff", // not in default header
        "x-frame-options": "deny", // change default value
        "x-xss-protection": "1; mode=block", // change default value
        "server": "majidai@test", // change default value
        "Access-Control-Allow-Origin":"https://majidai", // change default value
    },
    http:{
        port: 8000,
    }
};
// create server
const server = new majidai(config);
server.get("/", () => "Hi!");

server.start();
setTimeout(() => server.stop(), 30 * 1000);

const url = `http://localhost:${config.http.port}`;

// ===========================================
// unit testing for headers success
describe("test for headers", () => {
    it("should return x-content-type-options to be nosniff", done => {
        needle('get', url)
            .then(res => {
                assert.equal(res.headers["x-content-type-options"], config.responseHeader["x-content-type-options"]);
                done();
            })
            .catch( err => done(err));
    });

    it("should return x-frame-options to be deny", done => {
        needle('get', url)
            .then(res => {
                assert.equal(res.headers["x-frame-options"], config.responseHeader["x-frame-options"]);
                done();
            })
            .catch( err => done(err));
    });

    it("should return x-xss-protection to be 1; mode=block", done => {
        needle('get', url)
            .then(res => {
                assert.equal(res.headers["x-xss-protection"], config.responseHeader["x-xss-protection"]);
                done();
            })
            .catch( err => done(err));
    });

    it("should return server name as set", done => {
        needle('get', url)
            .then(res => {
                assert.equal(res.headers["server"], config.responseHeader.server);
                done();
            })
            .catch( err => done(err));
    });

    it("should return Access-Control-Allow-Origin name as set", done => {
        needle('get', url)
            .then(res => {
                assert.equal(res.headers["access-control-allow-origin"], config.responseHeader["Access-Control-Allow-Origin"]);
                done();
            })
            .catch( err => done(err));
    });
});