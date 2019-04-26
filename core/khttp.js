const http = require("http");
const fs = require("fs");
const path = require('path');
const querystring = require('querystring');
const Krequest = require("./krequest");
const Kresponse = require("./kresponse");
const Ksess = require('./ksession');
const Klog = require('./klog');
const SESSION_VAR = require("./constants").SESSION_VAR;

class Khttp {
    constructor(_config = null) {
        this._config = require("./constants").CONFIG;
        this._getRouting = new Map();
        this._postRouting = new Map();

        this._rootDir = path.dirname(process.argv[1]);
        if (_config != null) this._checkConfig(_config);

        this._session = new Ksess(this._config.sessionTime);
        this._logger = new Klog(this._config["log"], this._config.isProduction);
        this._reqResp = new Krequest();
        this._reqResp.setContentType(this._config.contentType);
        


        this.userObj = this.__createUserMethod();
    }

    _checkConfig(_config) {
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
            if (path.resolve(_config["publicDir"]) == this._rootDir) {
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
            this._validateObject(this._config["log"], _config["log"]);
            for (const key in this._config["log"]) {
                if (Object.keys(_config["log"]).includes(key)) continue;
                _config["log"][key] = this._config["log"][key];
            }
        }

        if (_config.hasOwnProperty("header")) {
            this._validateObject(this._config["header"], _config["header"]);
            for (const key in this._config["header"]) {
                if (Object.keys(_config["header"]).includes(key)) continue;
                _config["header"][key] = this._config["header"][key];
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
                    this._config.contentType.addExt(key, _config["contentType"][key]);
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

                this._config.contentType.addBinaryResp(element);
            });

            delete _config["respAsBinary"];
        }

        // update the value set by user
        this._validateObject(this._config, _config);
        for (const key in _config) {
            this._config[key] = _config[key];
        }
    }

    _validateObject(thisObj, paramObj) {
        if (paramObj == undefined || typeof paramObj != "object") {
            throw new TypeError("config is not valid object");
        }

        for (const key in paramObj) {
            if (paramObj.hasOwnProperty(key) && !thisObj.hasOwnProperty(key)) {
                throw new TypeError("config is not valid object.");
            }
        }
    }

    _validate(args) {
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
        this._validate(args);
        this._getRouting.set(args[0], args[1]);
    }


    post(...args) {
        this._validate(args);
        this._postRouting.set(args[0], args[1]);
    }

    start() {
        try {
            let server = http.createServer((req, resp) => this.handle(req, resp));
            server.listen(this._config.port, this._config.host);
            this._logger.debug(`Server Listening at http://${this._config.host}:${this._config.port}`);
        } catch (err) {
            throw err;
        }
    }

    // make methods accessible from user
    __createUserMethod() {
        let obj = Object.create(null);
        let sessObj = this._session;
        let logger = this._logger;
        let kApp = this._reqResp;
        obj.cookieId = "";
        // add logger
        Object.defineProperty(obj, "logger", {
            value: {
                debug:function(content,isAddPrefix=false){
                    if (!isAddPrefix) return logger.debug(content);

                    let logCont = this.getPrefix();
                    logCont["msg"] = content;
                    return logger.debug(JSON.stringify(logCont));
                },
                error:function(content,isAddPrefix=false){
                    if (!isAddPrefix) return logger.error(content);

                    let errCont = this.getPrefix();
                    errCont["msg"] = content;
                    return logger.error(JSON.stringify(errCont));
                },
                // todo
                getPrefix:function(){
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
            }
        });

        // add session functions for user
        Object.defineProperty(obj, "session", {
            value: {
                put: function (key, value) {
                    return sessObj.put(obj.cookieId, key, value);
                },
                delete: function (key) {
                    return sessObj.delete(obj.cookieId, key);
                },
                get: function (key) {
                    return sessObj.get(obj.cookieId, key);
                },
                regenId: function () {
                    obj.cookieId = sessObj.regenId(obj.cookieId);
                    // write cookie in response
                    kApp.setCookie(SESSION_VAR.sessionId, obj.cookieId);
                },
                destroy: function (key) {
                    return sessObj.destroy(obj.cookieId);
                }
            }
        });

        Object.defineProperty(obj, "data", {
            value: (function () {
                var postData;
                return {
                    getParams: function () {
                        return kApp.getParamAll();
                    },
                    setPostParam:function(dt){
                        postData = dt;
                    },
                    postParams: function () {
                        return postData;
                    },
                }
            })()
        });

        Object.defineProperty(obj,"respond",{
            value:{
                static: function(filePath){
                    return kApp.sendStaticResponse(filePath);
                },
                error:function(errCode){
                    return kApp.respondErr(errCode);
                },
                plainText:function(content){
                    return kApp.sendResp("text/plain", content);
                },
                json:function(content){
                    return kApp.sendJsonResponse(content);
                }
            }
        });

        Object.defineProperty(obj, "triggerLoginCheck", {
            value: function (url) {
                obj.cookieId = sessObj.regenId(obj.cookieId);
                // write cookie in response
                kApp.setCookie(SESSION_VAR.sessionId, obj.cookieId);
                return sessObj.put(obj.cookieId, SESSION_VAR.isUserLogged, 1);
            }
        });
        Object.defineProperty(obj, "mustBeLoggedIn", {
            value: function (url) {
                var isLogged = sessObj.get(obj.cookieId, SESSION_VAR.isUserLogged);
                return isLogged || kApp.redirectUrl(url);
            }
        });

        return obj;
    }

    isSecure(filePath) {
        // allow only files
        if (!fs.statSync(filePath).isFile()) return false;

        // do not allow other then public directory
        if (filePath.indexOf(path.resolve(this._config.publicDir)) !== 0) return false;

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

    handle(httpReq, httpResp, config) {        
        try {
            this._reqResp.setRequest(httpReq);
            this._reqResp.setResponse(httpResp);
            this._reqResp.setHeader(this._config.header);
            httpReq = httpResp = null;

            // write access log
            this._logger.access(this.userObj.logger.getPrefix());
            
            // error handling
            let errorProcessing = (function(kApp,userObj,config){
                // on error event while serving REQUEST
                kApp.request.on("error", (err) => {
                    userObj.logger.error(err.message,true);
                    return kApp.respondErr(500);
                });
                // on error event while serving RESPONSE
                kApp.response.on("error", (err) => {
                    userObj.logger.error(err.message,true);
                    return kApp.respondErr(500);
                });

                if (kApp.request.headers["content-length"] > config.maxBodySize) {
                    return kApp.request.emit("error", Error("post body size greater then set in the configuration."));
                } 
            })(this._reqResp,this.userObj,this._config);


            // read cookie from request
            this.userObj.cookieId = (function(kApp,sessObj){
                let id = kApp.getCookie(SESSION_VAR.sessionId);
                // if no cookie found, create
                if (id == "") {
                    // save id to session
                    id = sessObj.genId();
                    // write cookie in response
                    kApp.setCookie(SESSION_VAR.sessionId, id);
                } else {
                    // if cookie found in request but not in session
                    if (Object.keys(sessObj.getAll(id)).length === 0) {
                        // add the cookie id to session
                        sessObj.createUser(id);
                    }
                }
                return id;
            })(this._reqResp,this._session);

            // used accessing route
            let homePath = this._reqResp.homePath();

            // send response for GET
            if (this._reqResp.request.method == "GET") {
                // respond to static files
                let reqPage = path.join(this._rootDir, this._config.publicDir, homePath);
                if (fs.existsSync(reqPage) && this.isSecure(reqPage)) {
                    return this._reqResp.sendStaticResponse(reqPage);
                }

                // send not found
                if (!this._getRouting.has(homePath)) {
                    return this._reqResp.respondErr(404);
                }

                // run the function defined by user
                let respData = this._getRouting.get(homePath)(this.userObj);
                // if user sends custom rsponse then he should return undefined
                if (respData == undefined) return;
                // send response as plain string
                if (typeof respData == "string") return this.userObj.respond.plainText(respData);
                // send response as json
                return this.userObj.respond.json(respData);
            }

            // send response for POST
            else if (this._reqResp.request.method == "POST") {
                // send not found
                if (!this._postRouting.has(homePath)) {
                    return this._reqResp.respondErr(404);
                }

                let data = "";
                let postRouting=this._postRouting;
                let userObj = this.userObj;
                let respObj = this._sendResp;
                this._reqResp.request.on('data', function (chunk) {
                    data += chunk;
                });
                this._reqResp.request.on('end', () => {
                    let parsedData = querystring.parse(data);
                    userObj.data.setPostParam(parsedData);
                    // run the function defined by user
                    let respData = postRouting.get(homePath)(userObj);
                     // if user sends custom rsponse then he should return undefined
                    if (respData == undefined) return;
                    // send response as plain string
                    if (typeof respData == "string") return userObj.respond.plainText(respData);
                    // send response as json
                    return userObj.respond.json(respData);
                });   
            }

        } catch (err) {
            // send internal server error
            this.userObj.logger.error(err.message,true);
            return this._reqResp.respondErr(500);
        }

    }
};

module.exports = Khttp;