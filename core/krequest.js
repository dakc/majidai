const url = require('url');
const Kresponse = require("./kresponse");

/**
 * this class extends response controlling class
 */
class Krequest extends Kresponse {
    constructor(request, response) {
        super(response);
        this.request = request;
    }

    /**
     * parses cookie and returns as map
     */
    parseCookie() {
        var m = new Map();
        try {
            let cookie = this.request.headers["cookie"] || null;
            if (cookie == null) {
                throw Error("no cookies found.")
            }
            var cookieItems = cookie.split(";").map(data => data.trim());
            cookieItems.forEach(elem => {
                var eachItem = elem.split("=").map(data => data.trim());
                if (eachItem.length == 2 && eachItem[0] != "") {
                    m.set(eachItem[0], eachItem[1]);
                }
            });

        } catch (error) {

        }

        return m;
    }

    /**
     * returns the value of cookie from request
     * @param {string} key - name of the cookie
     */
    getCookie(key) {
        var m = this.parseCookie();
        return m.has(key) ? m.get(key) : "";
    }

   
    
    /**
     * return pathname from url
     */
    homePath() {
        var urlParts = url.parse(this.request.url, true);
        return urlParts.pathname;
    }

    /**
     * returns all the get parameters from request url
     */
    getParamAll() {
        var urlParts = url.parse(this.request.url, true);
        return urlParts.query;
    }

    /**
     * returns the value of get parameter
     * @param {string} key - name for get paramenter
     * @param {string} defaultValue  - default value for given parameter if not found
     */
    getParam(key, defaultValue = "") {
        var urlParts = url.parse(this.request.url, true);
        for (let k in urlParts.query) {
            if (k != undefined && k == key) {
                return this.request.getParams[k];
            }
        }

        return defaultValue;
    }

    /**
     * returns http method name
     */
    method() {
        return this.request.method;
    }

    /**
     * returns client's ip address
     */
    ip() {
        return this.request.socket.remoteAddress;
    }

    /**
     * return client's hostname
     */
    hostName() {
        return this.request.headers.host;
    }

    /**
     * return client's user agent
     */
    userAgent() {
        return this.request.headers["user-agent"];
    }

    /**
     * returns url
     */
    url() {
        return this.request.url;
    }

    /**
     * returns referrer
     */
    referrer() {
        return this.request.headers.referrer || this.request.headers.referer;
    }
}

module.exports = Krequest;