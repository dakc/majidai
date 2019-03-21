const http = require("http");
const fs = require("fs");
const path = require('path');
const querystring = require('querystring');
const Krequest = require("./krequest");
const Kresponse = require("./kresponse");
const Ksess = require('./ksession');
const Klog = require('./klog');
const sessVariable = require("./constants").SESSION_VAR;

class Khttp {
    constructor(_config = null) {
        this.config = require("./constants").CONFIG;
        this.getRouting = new Map();
        this.postRouting = new Map();

        this.logger = null;
        this.rootDir = path.dirname(process.argv[1]);
        if (_config != null) this.checkConfig(_config);

        this.session = new Ksess(this.config.sessionTime);
    }

    checkConfig(_config) {
        if (_config.hasOwnProperty("port")) {
            if (typeof _config.port !== "number") {
                throw new TypeError("port should be number type.");
            }
        }

        if (_config.hasOwnProperty("host")) {
            if (typeof _config.host !== "string") {
                throw new TypeError("host should be string type.");
            }
        }

        if (_config.hasOwnProperty("publicDir")) {
            if (typeof _config.publicDir !== "string") {
                throw new TypeError("publicDir should be string type.");
            }
            // do not allow the root directory as public directory
            if (path.resolve(_config["publicDir"]) == this.rootDir) {
                throw new TypeError("publicDir should be different from ROOT directory.");
            }
        }

        if (_config.hasOwnProperty("isProduction")) {
            if (typeof _config.isProduction !== "boolean") {
                throw new TypeError("isProduction should be boolean type.");
            }
        }

        if (_config.hasOwnProperty("sessionTime")) {
            if (typeof _config.sessionTime !== "number") {
                throw new TypeError("sessionTime should be number type.");
            }
            if (_config.sessionTime < 1) {
                throw new TypeError("sessionTime should be greater then zero.");
            }
        }

        if (_config.hasOwnProperty("maxBodySize")) {
            if (typeof _config.maxBodySize !== "number") {
                throw new TypeError("maxBodySize should be number type.");
            }
            if (_config.maxBodySize < 1) {
                throw new TypeError("maxBodySize should be greater then zero.");
            }
        }

        
        if (_config.hasOwnProperty("log")) {
            this.validateObject(this.config["log"], _config["log"]);
            for (const key in this.config["log"]) {
                if (Object.keys(_config["log"]).includes(key)) continue;
                _config["log"][key] = this.config["log"][key];
            }
        }

        if (_config.hasOwnProperty("header")) {
            this.validateObject(this.config["header"], _config["header"]);
            for (const key in this.config["header"]) {
                if (Object.keys(_config["header"]).includes(key)) continue;
                _config["header"][key] = this.config["header"][key];
            }
        }

        // update contenttype (deleting _config["contentType"] is important otherwise it will be overwritten)
        if (_config.hasOwnProperty("contentType")) {
            if (_config["contentType"] == undefined || typeof _config["contentType"] != "object") {
                throw new TypeError("contentType is not valid object");
            }

            for (const key in _config["contentType"]) {
                if (typeof key == "string" &&
                    key.trim().length &&
                    typeof _config["contentType"][key] == "string" &&
                    _config["contentType"][key].trim().length) {
                    this.config.contentType.addExt(key, _config["contentType"][key]);
                }
            }

            delete _config["contentType"];
        }
        // update contenttype (deleting _config["respAsBinary"] is important otherwise it will be overwritten)
        if (_config.hasOwnProperty("respAsBinary")) {
            if (_config["respAsBinary"] == undefined || typeof _config["respAsBinary"] != "object") {
                throw new TypeError("respAsBinary is not valid object");
            }

            if (!Array.isArray(_config["respAsBinary"])) {
                throw new TypeError("respAsBinary value should be array of extension.");
            }

            _config["respAsBinary"].forEach(element => {
                if (typeof element !== "string") {
                    throw new TypeError("respAsBinary value should be array of extension(string).");
                }

                this.config.contentType.addBinaryResp(element);
            });

            delete _config["respAsBinary"];
        }

        // update the value set by user
        this.validateObject(this.config, _config);
        for (const key in _config) {
            this.config[key] = _config[key];
        }
    }

    validateObject(thisObj, paramObj) {
        if (paramObj == undefined || typeof paramObj != "object") {
            throw new TypeError("config is not valid object");
        }

        for (const key in paramObj) {
            if (paramObj.hasOwnProperty(key) && !thisObj.hasOwnProperty(key)) {
                throw new TypeError("config is not valid object.");
            }
        }
    }

    validate(args) {
        if (args == undefined || typeof args != "object") {
            throw new TypeError("GET routing is not valid");
        }

        if (args.length != 2) {
            throw new TypeError("GET routing is not valid");
        }

        if (typeof args[0] != "string" || typeof args[1] != "function") {
            throw new TypeError("GET routing is not valid");
        }
    }

    get(...args) {
        this.validate(args);
        this.getRouting.set(args[0], args[1]);
    }


    post(...args) {
        this.validate(args);
        this.postRouting.set(args[0], args[1]);
    }

    start() {
        try {
            this.logger = new Klog(this.config["log"], this.config.isProduction);
            let server = http.createServer((req, resp) => this.handle(req, resp));
            server.listen(this.config.port, this.config.host);
            this.logger.debug(`Server Listening at http://${this.config.host}:${this.config.port}`);
        } catch (err) {
            throw err;
        }
    }

    isSecure(filePath) {
        // allow only files
        if (!fs.statSync(filePath).isFile()) return false;

        // do not allow other then public directory
        if (filePath.indexOf(path.resolve(this.config.publicDir)) !== 0) return false;

        // do not allow symbolic link
        if (fs.statSync(filePath).isSymbolicLink()) return false;

        // do not allow to access to js files on same directory level of server.js
        if (path.dirname(filePath) == path.dirname(process.argv[1])) {
            if (path.extname(filePath).toLowerCase() == ".js") {
                return false;
            }
        }

        return true;
    }

    handle(httpReq, httpResp) {
        let kApp = null;
        let sessObj = this.session;
        let logger = this.logger;
        let cookieId = "";
        // return the prefix to be added while writting log
        let getLogPrefix = function () {
            return {
                access: new Date().toLocaleString(),
                ip: kApp.ip() || "",
                host: kApp.hostName() || "",
                ua: kApp.userAgent() || "",
                method: kApp.method() || "",
                url: kApp.url() || "",
                referer: kApp.referrer() || ""
            }
        }
        // write error log
        let writeError = function (errMsg) {
            let errCont = getLogPrefix();
            errCont["msg"] = errMsg;
            logger.error(JSON.stringify(errCont));
        }
        
        // start session
        try {
            kApp = new Krequest(httpReq, httpResp);
            kApp.setContentType(this.config.contentType);
            kApp.setHeader(this.config.header);
            httpReq = httpResp = null;

            // write access log
            logger.access(JSON.stringify(getLogPrefix()));

            // on error event while serving REQUEST
            kApp.request.on("error", (err) => {
                writeError(`【Request Error】,${err.message}`);
                return kApp.respondErr(500);
            });
            // on error event while serving RESPONSE
            kApp.response.on("error", (err) => {
                writeError(`【Response Error】,${err.message}`);
                return kApp.respondErr(500);
            });

            // read cookie from request
            cookieId = kApp.getCookie(sessVariable.sessionId);
            // if no cookie found, create
            if (cookieId == "") {
                // save id to session
                cookieId = sessObj.genId();
                // write cookie in response
                kApp.setCookie(sessVariable.sessionId, cookieId);
            } else {
                // if cookie found in request but not in session
                if (Object.keys(sessObj.getAll(cookieId)).length === 0) {
                    // add the cookie id to session
                    sessObj.createUser(cookieId);
                }
            }

            // respond to static files
            if (kApp.request.method == "GET") {
                let reqPage = path.join(this.rootDir, this.config.publicDir, kApp.homePath());
                // respond to static files
                if (fs.existsSync(reqPage) && this.isSecure(reqPage)) {
                    return kApp.sendStaticResponse(reqPage);
                }
            }
        } catch (error) {
            // do nothing
            // console.error(error);
        }

        // make methods accessible from user
        let createUserMethods = function () {
            // add logger function for user
            let userLogger = Object.create(null);
            Object.defineProperty(userLogger, "debug", {
                value: logger.debug,
                enumerable:true
            });
            Object.defineProperty(userLogger, "error", {
                value: writeError,
                enumerable:true
            });
            Object.defineProperty(kApp, "logger", {
                value: userLogger
            });

            // add session functions for user
            Object.defineProperty(kApp, "session", {
                value: {
                    put: function (key, value) {
                        return sessObj.put(cookieId, key, value);
                    },
                    delete: function (key) {
                        return sessObj.delete(cookieId, key);
                    },
                    get: function (key) {
                        return sessObj.get(cookieId, key);
                    },
                    regenId: function () {
                        cookieId = sessObj.regenId(cookieId);
                        // write cookie in response
                        kApp.setCookie(sessVariable.sessionId, cookieId);
                    },
                    destroy: function (key) {
                        return sessObj.destroy(cookieId);
                    }
                }
            });
            Object.defineProperty(kApp, "triggerLoginCheck", {
                value: function (url) {
                    cookieId = sessObj.regenId(cookieId);
                    // write cookie in response
                    kApp.setCookie(sessVariable.sessionId, cookieId);
                    return sessObj.put(cookieId, sessVariable.isUserLogged, 1);
                }
            });
            Object.defineProperty(kApp, "mustBeLoggedIn", {
                value: function (url) {
                    var isLogged = sessObj.get(cookieId, sessVariable.isUserLogged);
                    return isLogged || kApp.redirectUrl(url);
                }
            });
        };

        // create response
        try {
            // remove the overtimed session id and update access time for current user
            this.session.validate(cookieId);
            // create user accesible methods
            createUserMethods();

            // send response for GET
            if (kApp.request.method == "GET") {
                // send not found
                if (!this.getRouting.has(kApp.homePath())) {
                    writeError(`Not Found`);
                    return kApp.respondErr(404);
                }
                
                Object.defineProperty(kApp, "data", {
                    value: {
                        get: function () {
                            return kApp.getParamAll();
                        },
                    }
                });
                // run the function defined by user
                let respData = this.getRouting.get(kApp.homePath())(kApp);
                // if user sends custom rsponse then he should return undefined
                if (respData == undefined) return;
                // send response as plain string
                if (typeof respData == "string") {
                    kApp.sendResp("text/plain", respData);
                    return;
                } else {
                    let retData = JSON.stringify(respData);
                    if (retData != undefined) {
                        kApp.sendResp("text/plain", retData);
                        return;
                    }
                }
            }

            // send response for POST
            if (kApp.request.method == "POST") {
                // send not found
                if (!this.postRouting.has(kApp.homePath())) {
                    writeError(`Not Found`);
                    return kApp.respondErr(404);
                }
                
                if (kApp.request.headers["content-length"] > this.config.maxBodySize) {
                    return kApp.request.emit("error", Error("post body size greater then set in the configuration."));
                } 
                if (kApp.request.headers["content-type"] != "application/x-www-form-urlencoded") {
                    return kApp.request.emit("error", Error("other then x-www-form-urlencoded"));
                }

                let config = this.config;
                let postRouting = this.postRouting;
                let data = "";
                kApp.request.on('data', function (chunk) {
                    data += chunk;
                });

                kApp.request.on('end', () => {
                    let parsedData = querystring.parse(data);
                    Object.defineProperty(kApp, "data", {
                        value: {
                            post: function () {
                                return parsedData;
                            },
                        }
                    });

                    // run the function defined by user
                    let respData = postRouting.get(kApp.homePath())(kApp);
                    // if user sends custom rsponse then he should return undefined
                    if (respData == undefined) return;
                    // send response as plain string
                    if (typeof respData == "string") {
                        return kApp.sendResp("text/plain", respData);
                    } else {
                        let retData = JSON.stringify(respData);
                        if (retData != undefined) {
                            return kApp.sendResp("text/plain", retData);
                        }
                    }
                });
            }
        } catch (err) {
            // send internal server error
            writeError(err.message);
            return kApp.respondErr(500);
        }

    }
};

module.exports = Khttp;