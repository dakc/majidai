const fs = require("fs");
const path = require("path");
const MSG = require("./constants").MSG;
let isValidString = r => "string" == typeof r && r.length;
module.exports = {
    config: (r, e) => {
        if (e.hasOwnProperty("contentType")) {
            if (!isValidString(e.contentType)) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_CONTENT_TYPE);
            r.contentType = e.contentType
        }
        if (e.hasOwnProperty("charset")) {
            if (!isValidString(e.charset)) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_CHARSET);
            r.charset = e.charset
        }
        if (e.hasOwnProperty("allowedMethod")) {
            if ("object" != typeof e.allowedMethod) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_HTTP_METHOD);
            e.allowedMethod.forEach(e => {
                if (!r.allowedMethod.includes(e.toUpperCase())) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_HTTP_METHOD)
            }), r.allowedMethod = e.allowedMethod
        }
        if (["http", "https"].forEach(o => {
                if (e.hasOwnProperty(o)) {
                    if (e[o].hasOwnProperty("port")) {
                        if ("number" != typeof e[o].port) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_PORT);
                        if (e[o].port <= 0) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_PORT);
                        r[o].port = e[o].port
                    }
                    if (e[o].hasOwnProperty("host")) {
                        if (!isValidString(e[o].host)) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_HOST);
                        r[o].port = e[o].port
                    }
                    if (e[o].hasOwnProperty("documentRoot")) {
                        if (!e[o].documentRoot) return;
                        if ("string" != typeof e[o].documentRoot) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_PUBLIC_DIR);
                        if (path.resolve(e[o].documentRoot) == r.rootDir) throw new TypeError(MSG.ERR_INVALID_PUBLIC_DIR);
                        if (!fs.existsSync(e[o].documentRoot)) throw new TypeError(MSG.ERR_INVALID_PUBLIC_DIR);
                        r[o].documentRoot = e[o].documentRoot
                    }
                    if (e[o].hasOwnProperty("listen")) {
                        if ("boolean" != typeof e[o].listen) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_HTTP_LISTEN);
                        r[o].listen = e[o].listen
                    }
                    
                    if (!r[o].listen) return;
                    if (e[o].hasOwnProperty("http2")) {
                        if ("boolean" != typeof e[o].http2) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_HTTP2_LISTEN);
                        r[o].http2 = e[o].http2
                    }
                    if (e[o].hasOwnProperty("http3")) {
                        if ("boolean" != typeof e[o].http3) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_HTTP3_LISTEN);
                        r[o].http3 = e[o].http3
                    }
                    if (e[o].hasOwnProperty("pfx")) {
                        r[o].pfx = e[o].pfx
                    }
                    if (e[o].hasOwnProperty("passphrase")) {
                        r[o].passphrase = e[o].passphrase
                    }
                    if ("https" == o && !fs.existsSync(e[o].pfx)) throw new TypeError(MSG.ERR_PFX_FILE_NOT_FOUND);
                }
            }), e.hasOwnProperty("maxBodySize")) {
            if ("number" != typeof e.maxBodySize) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_MAX_BODY_SIZE);
            if (e.maxBodySize <= 0) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_MAX_BODY_SIZE);
            r.maxBodySize = e.maxBodySize
        }
        if (e.hasOwnProperty("directoryIndex")) {
            if (!isValidString(e.directoryIndex)) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_DIRECTORY_INDEX);
            r.directoryIndex = e.directoryIndex
        }
        if (e.hasOwnProperty("directoryTraversal")) {
            if ("boolean" != typeof e.directoryTraversal) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_DIRECTORY_TRAVERSAL);
            r.directoryTraversal = e.directoryTraversal
        }
        if (e.hasOwnProperty("responseHeader")) {
            if ("object" != typeof e.responseHeader) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_HEADER);
            for (const o in r.responseHeader) Object.keys(e.responseHeader).includes(o) || (e.responseHeader[o] = r.responseHeader[o]);
            r.responseHeader = e.responseHeader;
            for (const e in r.responseHeader)
                if (!isValidString(e) || !isValidString(r.responseHeader[e])) throw new TypeError(MSG.ERR_INVALID_DATA_TYPE_HEADER)
        }
    },
    routing: (r, e) => {
        if (null == r || "object" != typeof r) throw new Error(MSG.ERR_INVALID_ROUTING);
        if (r.length < 2) throw new Error(MSG.ERR_INVALID_ROUTING);
        if ("string" != typeof r[0] || "function" != typeof r[1]) throw new Error(MSG.ERR_INVALID_ROUTING);
        if (!/^[a-zA-Z0-9-_{}/]+$/.test(r[0])) throw new Error(MSG.ERR_NOT_VALID_ROUTING);
        var o = function () {
            var e = [],
                o = r[0],
                t = o.match(/{[^}]*}/g);
            return t && t.forEach(r => e.push(r.replace(/[{|}]/g, ""))), [t ? o.substr(0, o.indexOf(t[0]) - 1) : o, {
                execUserFunc: r[1],
                params: e
            }]
        }();
        if (e.has(o[0])) throw new Error(MSG.ERR_ROUTING_DEFINED_MULTIPLE);
        return e.set(o[0], o[1]), !0
    },
    mimeType: (r, e) => {
        if (!isValidString(r) || !r.startsWith(".") || r.length < 2) throw TypeError(MSG.ERR_NOT_VALID_EXTENSION);
        if (!isValidString(e) || !e.includes("/") || e.length < 5) throw TypeError(MSG.ERR_NOT_VALID_MIMETYPE);
        return !0
    },
    customError: r => {
        if ("function" != typeof r) throw new Error(MSG.ERR_NOT_VALID_PARAM_CUSTOM_ERR);
        var e = r("error");
        if ("object" != typeof e) throw new Error(MSG.ERR_INVALID_DATA_TYPE_PARAM_RETURN_CUSTOM_ERR);
        if (!e.hasOwnProperty("contentType")) throw new Error(MSG.ERR_INVALID_DATA_TYPE_PARAM_RETURN_CUSTOM_ERR);
        if (!e.hasOwnProperty("content")) throw new Error(MSG.ERR_INVALID_DATA_TYPE_PARAM_RETURN_CUSTOM_ERR);
        if (!isValidString(e.contentType)) throw new Error(MSG.ERR_INVALID_DATA_TYPE_PARAM_RETURN_CUSTOM_ERR);
        if (!isValidString(e.content)) throw new Error(MSG.ERR_INVALID_DATA_TYPE_PARAM_RETURN_CUSTOM_ERR);
        if (!["text/html", "text/plain", "application/json"].includes(e.contentType)) throw new Error(MSG.ERR_INVALID_DATA_TYPE_PARAM_RETURN_CONTENT_TYPE_CUSTOM_ERR)
    },
    request: (r, e, o) => {
        let t = !!r._config.allowedMethod.includes(e.method) || (r._logger.error(`${MSG.ERR_NOT_ALLOWED_HTTP_METHOD} - ${e.method}`), r._resp.sendResp(405), !1);
        return !!t && !!(t = !("content-length" in e.headers && e.headers["content-length"] > r._config[o].maxBodySize && (r._logger.error(`${MSG.ERR_CONTENT_LENGTH_EXCEEDS_SETTING} - ${e.headers["content-length"]}bytes.`), r._resp.sendResp(413), 1)))
    },
    staticFile: r => !!fs.existsSync(r) && (!!fs.statSync(r).isFile() && !fs.statSync(r).isSymbolicLink())
};