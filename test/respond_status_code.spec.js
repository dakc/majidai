const majidai = require("../index");
const needle = require('needle');
const assert = require("chai").assert;

// ===========================================
// create server
const config = { http: { port: 8002 } };
const server = new majidai(config);
server.get("/", function () {
    return "Welcome to majidai";
});

server.get("/internal-server-error", function () {
    // should throw internal server here
    a = b + 3;
    return 23;
});

server.get("/error", function (req,res) {
    return res.mj.error(req.mj.getParams("code"));
});

server.start();
setTimeout(() => server.stop(), 30 * 1000);

const url = `http://localhost:${config.http.port}`;

// ===========================================
// unit testing
describe("test for status code", () => {
    it('should return 200 for existing path', (done) => {
        needle('get', `${url}/`)
            .then(res => assert.equal(res.statusCode, 200),done())
            .catch( err => done(err));
    });

    it('should return 404 for non existing path', (done) => {
        needle('get', `${url}/doesnotexists`)
            .then(res => assert.equal(res.statusCode, 404),done())
            .catch( err => done(err));
    });

    it('should return 401', (done) => {
        needle('get', `${url}/error?code=401`)
            .then(res => assert.equal(res.statusCode, 401),done())
            .catch( err => done(err));
    });

    it('should return 500 for server error', (done) => {
        needle('get', `${url}/internal-server-error`)
            .then(res => assert.equal(res.statusCode, 500),done())
            .catch( err => done(err));
    });
});
