const majidai = require("../index");
const needle = require('needle');
const assert = require("chai").assert;

// ===========================================
// create server
const config = { http: { port: 8003 } };
const server = new majidai(config);
server.listen({ method: ["GET", "POST"], path: "/test" }, function (req) {
    return req.method;
});
server.listen({ method: ["GET", "POST"], path: "/user/{name}/{age}" }, function (req) {
    return {
        method: req.method,
        get: req.mj.getParams(),
        post: req.mj.postParams()
    };
});

server.start();
setTimeout(() => server.stop(), 30 * 1000);

const url = `http://localhost:${config.http.port}`;

// ===========================================
// unit testing
describe("test for multiple HTTP methods for single routing", () => {
    it("should work on POST method from same routing path", (done) => {
        needle('post', `${url}/test`, {}, {json: true})
            .then(res => assert.equal(res.body, "POST"), done())
            .catch( err => done(err));
        
    });

    it("should work on GET method from same routing path", (done) => {
        needle('get', `${url}/test`, {})
            .then(res => assert.equal(res.body, "GET"), done())
            .catch( err => done(err));
    });

    it("should work on parameterized routing too.", (done) => {
        var expectedResult = { "method": "POST", "get": { "name": "abc", "age": "20" }, "post": {"sub": "computer"} };
        needle('post', `${url}/user/abc/20`, {sub: "computer"}, {json: true})
            .then(res => assert.deepEqual(res.body, expectedResult), done())
            .catch( err => done(err));
        
    });

    it("should work for path containing '/' though not defined during routing", (done) => {
        var expectedResult = { "method": "POST", "get": { "name": "abc", "age": "20" }, "post": {"sub": "computer"} };
        needle('post', `${url}/user/abc/20/`, {sub: "computer"}, {json: true})
            .then(res => assert.deepEqual(res.body, expectedResult), done())
            .catch( err => done(err));
        
    });
});