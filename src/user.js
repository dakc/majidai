const url = require("url");
const querystring = require("querystring");
const func = require("./func");

module.exports = function (e, r, t) {
    let n = Object.create(null);
    n.logger = e._logger;
    var s, o;
    return Object.defineProperty(n, "request", {
        value: r
    }), Object.defineProperty(n, "response", {
        value: t
    }), Object.defineProperty(n, "data", {
        value: (s = url.parse(r.url, !0).query || {}, o = {}, {
            manipulateGet: function (e) {
                return func.execUserFunction(this, e)
            },
            manipulatePost: function (e) {
                let t = "";
                r.on("data", function (e) {
                    t += e
                }), r.on("end", () => {
                    try {
                        o = func.formatPostData(r, t);
                        func.execUserFunction(this, e);
                    } catch (e) {
                        this.logger.error(e), this.respond.error(500);
                    }
                })
            },
            getParams: function (e) {
                return e ? e in s ? s[e] : {} : s
            },
            postParams: function (e) {
                return e ? o && e in o ? o[e] : {} : o
            },
            setGetParam: e => s = e
        })
    }), Object.defineProperty(n, "respond", {
        value: {
            static: r => e._resp.sendStaticResponse(r, e._logger.error),
            error: (r, t = null) => {
                e._resp.contentType = "text/plain", e._resp.sendResp(r, t)
            },
            text: (r, t = 200) => {
                e._resp.contentType = "text/plain", e._resp.sendResp(t, r)
            },
            html: (r, t = 200) => {
                e._resp.contentType = "text/html", e._resp.sendResp(t, r)
            },
            json: (r, t = 200) => {
                e._resp.contentType = "application/json", e._resp.sendResp(t, JSON.stringify(r))
            },
            redirect: r => e._resp.redirectUrl(r),
            isDone: () => e._resp.response.headersSent || !1
        }
    }), Object.defineProperty(n, "client", {
        value: {
            ip: () => r.headers["x-forwarded-for"] || r.connection.remoteAddress || r.socket.remoteAddress || (r.connection.socket ? r.connection.socket.remoteAddress : null),
            hostName: () => r.headers.host || "",
            userAgent: () => r.headers["user-agent"] || "",
            referrer: () => r.headers.referrer || r.headers.referer || "",
            url: () => r.url || "",
            path: () => url.parse(r.url, !0).pathname,
            method: () => r.method,
            headers: e => e ? e in r.headers ? r.headers[e] : "" : r.headers
        }
    }), n
};