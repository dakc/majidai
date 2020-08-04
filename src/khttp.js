const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const http2 = require("http2");
const EventEmitter = require("events").EventEmitter;

const MSG = require("./constants").MSG;
const validate = require("./validate");
const Kresponse = require("./kresponse");
const userMethod = require("./user");
const func = require("./func");


class Khttp extends EventEmitter {
    /**
     * constructor
     * validates config
     */
    constructor(userConfig) {
        super();
        this._getRouting = new Map();
        this._postRouting = new Map();

        this._config = require("./config");
        this._config.rootDir = path.dirname(process.argv[1]);
        if (userConfig && typeof userConfig == "object") {
            validate.config(this._config, userConfig);
        }

        this._resp = new Kresponse(this._config.contentType, this._config.charset);

        // todo: change stdout emit type to contain info or debug type
        this._logger = {
            info: msg => this.emit("stdout", typeof msg === "function" ? msg() : msg),
            error: msg => this.emit("stderr", typeof msg === "function" ? msg() : msg),
        };
    }

    /**
     * Sets the mimetype for file extension
     * 
     * @param {string} ext | file extension must start with dot
     * 
     *  - eg, '.gif'
     * @param {string} mimeType | mime type
     * 
     *  - eg, 'image/gif'
     */
    setMimeType(ext, mimeType) {
        validate.mimeType(ext, mimeType);
        this._resp.mimeType[ext] = mimeType;
    }

    /**
     * Customize the error page
     * 
     * @param {function} callback 
     *  
     * callback receives the error message
     * as a argument.
     *  
     *  - callback should return a object
     * with proper contentType & content
     * 
     * eg,
     * {contentType: 'text/html',content: '<html>....'}
     */
    customizeErrorPage(callback) {
        validate.customError(callback)
        this._resp.overrideError(callback);
    }

    /**
     * start server
     */
    start() {
        let isListening = false;
        // start listening HTTP
        if (this._config.http.listen) {
            this._server = http.createServer((req, res) => this.reqHandler(req, res, "http"))
                .listen(this._config.http.port, this._config.http.host);
            this._logger.info(`Server is Listening at http://${this._config.http.host}:${this._config.http.port}`);
            isListening = true;
        }

        // start listening HTTPS
        if (this._config.https.listen) {
            const opt = {
                pfx: fs.readFileSync(this._config.https.pfx),
                passphrase: this._config.https.passphrase,
            };

            const srv = this._config.https.http2 ? http2.createSecureServer : https.createServer;
            this._server = srv(opt, (req, res) => this.reqHandler(req, res, "https"))
                .listen(this._config.https.port, this._config.https.host);
            this._logger.info(`Server is Listening at https://${this._config.https.host}:${this._config.https.port}`);
            isListening = true;
        }

        // TODO
        if (this._config.https.listenHttp3) {
            this._logger.error(MSG.INFO_NOT_SUPPORTED);
        };

        if (!isListening) throw new Error(MSG.ERR_SERVER_NOT_LISTENING);

        // uncaught exception
        let s = this;
        process.on('uncaughtException', function (err) {
            try {
                s._logger.error(err.stack || err.message);
                // else return internal server error
                if (!s._resp.response.headersSent) s._resp.sendResp(500);
            } catch (err) {
                console.error(err);
            }
        });
    }

    /**
     * stop server
     */
    stop() {
        this._server.close();
        this._logger.info(MSG.INFO_SERVER_STOPPED);
        process.exit(0);
    }

    /**
     * It is executed whenever request is received
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} httpType 
     */
    reqHandler(req, res, httpType) {
        try {
            // this obj is passed to developer as parameter
            let userObj = userMethod(this, req, res);

            // ===========================================
            // access log
            const accessInfo = () => {
                return {
                    time: new Date().toLocaleString(),
                    ip: userObj.client.ip(),
                    hostName: userObj.client.hostName(),
                    userAgent: userObj.client.userAgent(),
                    referrer: userObj.client.referrer(),
                    url: userObj.client.url(),
                    method: userObj.client.method(),
                }
            }
            this._logger.info(accessInfo);

            // ===========================================
            // on error event emitted
            req.on("error", err => {
                throw Error(err);
            });
            res.on("error", err => {
                throw Error(err);
            });

            // ===========================================
            // set response header
            this._resp.setResponse(req, res,
                this._config.responseHeader,
                this._config.contentType,
                this._config.charset);

            // validate request
            if (!validate.request(this, req, httpType)) return;

            // get homepath
            let homePath = userObj.client.path();
            if (homePath.length > 1 && "/" === homePath[homePath.length-1]) homePath = homePath.substr(0, homePath.length - 1);
            let reqPage = path.join(this._config[httpType].documentRoot, homePath);

            // ===========================================
            // GET request
            if (req.method == "GET") {
                // respond to static files if only document root is set
                if (this._config[httpType].documentRoot && validate.staticFile(reqPage)) {
                    return this._resp.sendStaticResponse(reqPage);
                }

                // respond to normal request
                if (this._getRouting.has(homePath)) {
                    return userObj.data.manipulateGet.call(userObj, this._getRouting.get(homePath).execUserFunc);
                }

                // respond to {params}
                let usrFunc = func.manipulateParamRouting(this._getRouting, homePath, userObj.data);
                if (usrFunc) {
                    return userObj.data.manipulateGet.call(userObj, usrFunc);
                }

                // respond to static files　directoryindex only if document root is set
                let indexPage = path.join(reqPage, this._config.directoryIndex);
                if (this._config[httpType].documentRoot && validate.staticFile(indexPage)) {
                    return this._resp.sendStaticResponse(indexPage);
                }

                // directory traversal
                if (this._config.directoryTraversal && userObj.client.path().endsWith("/") && fs.existsSync(reqPage)) {
                    var files = fs.readdirSync(reqPage);
                    var li = "<li><a href='../'>..</a></li>";
                    files.forEach(function (file) {
                        // if (!validate.staticFile(path.join(reqPage, file))) return;
                        var lk = "";
                        var f = path.join(reqPage, file);
                        if (validate.staticFile(f)) {
                            lk = file;
                        } else {
                            if (fs.statSync(f).isDirectory()) {
                                lk = file + path.sep;
                            }
                        }
                        li += `<li><a href="${lk}">${file}</a></li>`;
                    });
                    return userObj.respond.html(`<h1>Index of ${homePath}</h1><ul>${li}</ul>`);
                }

                // if no routing is defined for '/' show welcome page
                if (homePath === "/" && !this._getRouting.size && !this._postRouting.size) {
                    return userObj.respond.html(func.welcomePage());
                }
            }


            // ===========================================
            // respond to POST request
            if (req.method == "POST") {
                // if form-data run the user defined function
                if (req.headers["content-type"].includes("multipart/form-data")) {
                    this._logger.info(MSG.INFO_NOT_SUPPORTED_POST_TYPE_FORM_DATA);
                    func.execUserFunction(userObj, this._postRouting.get(homePath).execUserFunc);
                    return;
                }

                // respond to normal request
                if (this._postRouting.has(homePath)) {
                    return userObj.data.manipulatePost.call(userObj, this._postRouting.get(homePath).execUserFunc);
                }

                // respond to {params}
                let usrFunc = func.manipulateParamRouting(this._postRouting, homePath, userObj.data);
                if (usrFunc) {
                    return userObj.data.manipulatePost.call(userObj, usrFunc);
                }
            }

            // ===========================================
            // respond to PUT request
            // if (req.method == "PUT") {
            //     // respond to normal request
            //     if (this._putRouting.has(homePath)) {
            //         return userObj.data.manipulatePut.call(userObj, this._putRouting.get(homePath).execUserFunc);
            //     }
            // }


            // respond page not found
            this._logger.error(`${MSG.ERR_PAGE_NOT_FOUND} - ${homePath}`);
            return this._resp.sendResp(404);

        } catch (err) {
            this._logger.error(err);
        }

        // Respond Internal Server Error
        if (!res.headersSent) this._resp.sendResp(500);
    }

    /**
     * Create GET routing.
     * This part will listen to GET METHOD only.
     * If defined multiple time it will throw error.
     * 
     * @param {string} path | path to serve content
     * @param  {Function} callback |  it receives request
     * and response as argument.
     * 
     * @return {any} | callback must return one of the following
     * - string
     * - json object
     * - response.mj.RESPOND_PROPERTIES
     */
    get(...args) {
        // throws error if validation fails
        validate.routing(args, this._getRouting);
    }

    /**
     * Create POST routing.
     * This part will listen to POST METHOD only.
     * If defined multiple time it will throw error.
     * 
     * @param {string} path | path to serve content
     * @param  {Function} callback |  it receives request
     * and response as argument.
     * 
     * @return {any} | callback must return one of the following
     * - string
     * - json object
     * - response.mj.RESPOND_PROPERTIES
     */
    post(...args) {
        // throws error if validation fails
        validate.routing(args, this._postRouting);
    }

    head(...args) {
        this._logger.error(MSG.INFO_NOT_SUPPORTED);
    }

    put(...args) {
        this._logger.error(MSG.INFO_NOT_SUPPORTED);
    }

    delete(...args) {
        this._logger.error(MSG.INFO_NOT_SUPPORTED);
    }

    connect(...args) {
        this._logger.error(MSG.INFO_NOT_SUPPORTED);
    }

    options(...args) {
        this._logger.error(MSG.INFO_NOT_SUPPORTED);
    }

    trace(...args) {
        this._logger.error(MSG.INFO_NOT_SUPPORTED);
    }

    patch(...args) {
        this._logger.error(MSG.INFO_NOT_SUPPORTED);
    }

    /**
     * Create custom routing.
     * It can listen to multiple HTTP METHODS.
     * 
     * @param {object} customRoute | this object must contain
     * - method : which is an array of HTTP methods
     * - path: path to listen 
     * 
     * eg, { method: ["GET", "POST"], path: "/home" }
     * @param  {Function} callback |  it receives request
     * and response as argument.
     * 
     * @return {*} | callback must return one of the following
     * - string
     * - json object
     * - response.mj.RESPOND_PROPERTIES
     */
    listen(...args) {
        var methodList = args[0].method || [];
        var route = args[0].path || "";
        if (!methodList.length || !route || typeof methodList != "object") {
            throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_CUSTOM_ROUTING);
        }

        methodList.forEach(method => {
            if (this._config.allowedMethod.includes(method)) {
                if (method === "GET") this.get(route, args[1]);
                if (method === "POST") this.post(route, args[1]);
                if (method === "HEAD") this.head(route, args[1]);
                if (method === "PUT") this.put(route, args[1]);
                if (method === "DELETE") this.delete(route, args[1]);
                if (method === "CONNECT") this.post(route, args[1]);
                if (method === "OPTIONS") this.options(route, args[1]);
                if (method === "TRACE") this.trace(route, args[1]);
                if (method === "PATCH") this.patch(route, args[1]);
            }
        });
    }

}

module.exports = Khttp;