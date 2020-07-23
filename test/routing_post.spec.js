const majidai = require("../index");
const needle = require('needle');
const assert = require("chai").assert;

// ===========================================
// create server
const config = { http: { port: 8004 } };
const server = new majidai(config);
server.post("/test", function (req) {
    return req.mj.postParams();
})

server.start();
setTimeout(() => server.stop(), 30 * 1000);

const url = `http://localhost:${config.http.port}`;

// ===========================================
// unit testing
describe("test for different ways using post method", () => {
    var _url = `${url}/test`;
    var _data = {
        id: "s10",
        name: "dakc"
    };
    it("should work on www-url-encoded", (done) => {
        needle('post', _url, _data, {})
            .then(res => assert.deepEqual(res.body, _data), done())
            .catch( err => done(err));

    });

    // it("should work on form-data", (done) => {
    //     needle('post', _url, _data, {
    //             multipart: true
    //         })
    //         .then(res => assert.deepEqual(res.body, _data), done())
    //         .catch( err => done(err));

    // });

    it("should work on application/json", (done) => {
        needle('post', _url, _data, {
                json: true
            })
            .then(res => assert.deepEqual(res.body, _data), done())
            .catch( err => done(err));

    });
});