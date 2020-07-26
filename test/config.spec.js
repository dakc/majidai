/**
The default config is

module.exports = {
    contentType: "text/plain",
    charset: "utf-8",
    maxBodySize: 100 * 1024, // byte
    directoryIndex: "index.html",
    directoryTraversal: false,
    allowedMethod: ["GET", "POST", "HEAD", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"],
    responseHeader: {
        "x-frame-options": "SAMEORIGIN",
        "x-xss-protection": "0",
        "server": "majidai@2.0",
        "Access-Control-Allow-Origin": "*",
        "Accept": "*\/*",
    },
    http: {
        port: 80,
        host: "0.0.0.0",
        documentRoot: "",
        listen: true,
    },
    https: {
        port: 443,
        host: "0.0.0.0",
        documentRoot: "",
        listen: false,
        http2: false,
        http3: false,
        pfx: "",
        passphrase: "",
    },
};
*/
const majidai = require("../index");
const chai = require("chai");
const MSG = require("../src/constants").MSG;

// ###########################################
// common
// ###########################################
// ===========================================
// unit testing for content-type
describe("test for invalid content-type", () => {
    it("should throw error for numbers", () => {
        var config = {contentType:34};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_CONTENT_TYPE);
    });

    it("should throw error for empty string", () => {
        var config = {contentType:''};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_CONTENT_TYPE);
    });

    it("should throw error for object", () => {
        var config = {contentType: ['text-html']};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_CONTENT_TYPE);
    });

    it("should throw error for boolean", () => {
        var config = {contentType: true};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_CONTENT_TYPE);
    });
});

// ===========================================
// unit testing for charset
describe("test for invalid charset", () => {
    it("should throw error for numbers", () => {
        var config = {charset:34};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_CHARSET);
    });

    it("should throw error for empty string", () => {
        var config = {charset:''};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_CHARSET);
    });

    it("should throw error for object", () => {
        var config = {charset: ['text-html']};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_CHARSET);
    });

    it("should throw error for boolean", () => {
        var config = {charset: true};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_CHARSET);
    });
});

// ===========================================
// unit testing for http max body size
describe("test for invalid request body size aka maxBodySize", () => {
    it("should throw error for string", () => {
        var config = { maxBodySize: 'test' };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_MAX_BODY_SIZE);
    });
    it("should throw error for  boolean", () => {
        var config = { maxBodySize: true };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_MAX_BODY_SIZE);
    });
    it("should throw error for  zero and negative numbers", () => {
        var config = { maxBodySize: 0 };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_MAX_BODY_SIZE);
    });
});

// ===========================================
// unit testing for directoryIndex
describe("test for invalid directory index aka directoryIndex", () => {
    it("should throw error for numbers", () => {
        var config = {directoryIndex:34};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_DIRECTORY_INDEX);
    });

    it("should throw error for empty string", () => {
        var config = {directoryIndex:''};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_DIRECTORY_INDEX);
    });

    it("should throw error for object", () => {
        var config = {directoryIndex: ['text-html']};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_DIRECTORY_INDEX);
    });

    it("should throw error for boolean", () => {
        var config = {directoryIndex: true};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_DIRECTORY_INDEX);
    });
});

// ===========================================
// unit testing for directoryTraversal
describe("test for invalid directoryTraversal", () => {
    it("should throw error for number", () => {
        var config = { directoryTraversal: 34 };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_DIRECTORY_TRAVERSAL);
    });
    it("should throw error for string", () => {
        var config = { directoryTraversal: "test" };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_DIRECTORY_TRAVERSAL);
    });
    it("should throw error for object", () => {
        var config = { directoryTraversal: [] };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_DIRECTORY_TRAVERSAL);
    });
});
 
// ===========================================
// unit testing for http methods
describe("test for invalid http methods", () => {
    it("should throw error for numbers", () => {
        var config = {allowedMethod:34};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HTTP_METHOD);
    });

    it("should throw error for empty string", () => {
        var config = {allowedMethod:''};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HTTP_METHOD);
    });

    it("should throw error for string", () => {
        var config = {allowedMethod:'GET'};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HTTP_METHOD);
    });

    it("should throw error for boolean", () => {
        var config = {allowedMethod: true};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HTTP_METHOD);
    });

    it("should throw error if not supported method is included", () => {
        var config = {allowedMethod: ['post', 'text-html']};
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HTTP_METHOD);
    });
});

// ===========================================
// unit testing for http header
describe("test for invalid http header", () => {
    it("should throw error for invalid header string", () => {
        var config = { responseHeader: 'test' };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HEADER);
    });
    it("should throw error for invalid response header bumber", () => {
        var config = { responseHeader: 34 };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HEADER);
    });
    it("should throw error for invalid response header boolean", () => {
        var config = { responseHeader: true };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HEADER);
    });
    it("should throw error if value of header is not a valid string", () => {
        var config = {
            responseHeader: {
                "x-content-type-options": "nosniff",
                "poweredby": {},
            },
        };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HEADER);
    });
});

// ###########################################
// http
// ###########################################
// ===========================================
// unit testing for http port
describe("test for invalid http port", () => {
    it("should throw error for invalid port", () => {
        var config = { http: { port: 'empty' } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_PORT);
    });
    
    it("should throw error for invalid port", () => {
        var config = { http: { port: [] } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_PORT);
    });
    it("should throw error for invalid port", () => {
        var config = { http: { port: -1 } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_PORT);
    });
});

// ===========================================
// unit testing for http host
describe("test for invalid host", () => {
    it("should throw error for numbers", () => {
        var config = { http: { host: 34 } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HOST);
    });

    it("should throw error for empty string", () => {
        var config = { http: { host: '' } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HOST);
    });

    it("should throw error for object", () => {
        var config = { http: { host: ["www.dakc"] } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HOST);
    });

    it("should throw error for boolean", () => {
        var config = { http: { host: true } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HOST);
    });
});

// ===========================================
// unit testing for http public directory
describe("test for invalid public directory aka documentRoot", () => {
    it("should throw error for invalid publicDir", () => {
        var config = { http: { documentRoot: 34 } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_PUBLIC_DIR);
    });

    it("should throw error for non existing directory", () => {
        var config = { http: { documentRoot: 'thisisadirectoryname' } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_PUBLIC_DIR);
    });
});

// ===========================================
// unit testing for http listen flag
describe("test for invalid http listen flag", () => {
    it("should throw error for number", () => {
        var config = { http: { listen: 34 } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HTTP_LISTEN);
    });
    it("should throw error for string", () => {
        var config = { http: { listen: 'test' } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HTTP_LISTEN);
    });
    it("should throw error for object", () => {
        var config = { http: { listen: [] } };
        chai.expect(function () {
            new majidai(config)
        }).to.throw(MSG.ERR_INVALID_DATA_TYPE_HTTP_LISTEN);
    });
});

