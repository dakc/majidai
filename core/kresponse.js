const fs = require("fs");
const path = require('path');

/**
 * This class controls the response.
 * 
 * TODO
 * 1. increase error code
 */
class Kresponse {
    /**
     * constructor
     * @param {*} httpResp 
     */
    constructor(httpResp) {
        // http response object
        this.response = httpResp;
        // content type
        this.contentType = {};
    }


    /**
     * set the allowed contenty type
     * 
     * @param {object} contTypeObj - {".html": "text/html"}
     */
    setContentType(contTypeObj) {
        this.contentType = contTypeObj;
    }

    /**
     * set the header for response
     * 
     * @param {object} hdrObj - {key:value,key:value}
     */
    setHeader(hdrObj) {
        Object.keys(hdrObj).forEach(key => {
            this.response.setHeader(key, hdrObj[key]);
        });
    }

     /**
     * set cookie in the response
     * @param {string} key - cookie name
     * @param {string} value - cookie value
     * @param {number} maxAge - max-age for cookie
     */
    setCookie(key, value, maxAge=3600) {
        this.response.setHeader('Set-Cookie', [`${key}=${value}; HttpOnly; Path=/; max-age=${maxAge}`]);
    }

     /**
     * deletes the cookie from response
     * @param {string} key - name of the cookie
     */
    deleteCookie(key) {
        this.response.setHeader('Set-Cookie', [`${key}=; HttpOnly; Path=/; expires=${new Date(0)}`]);
    }


    /**
     * redirect to given url
     * 
     * @param {string} urlStr - url to redirect
     */
    redirectUrl(urlStr) {
        this.response.writeHead(301, {
            Location: urlStr
        });
        this.response.end();
    }

    send401Response() {
        this.sendResp("text/plain", "Unauthorized Access.", 401);
    }

    send404Response() {
        this.sendResp("text/plain", "Not Found.", 404);
    }

    send500Response() {
        this.sendResp("text/plain", "Internal Server Error", 500);
    }

    /**
     * send jsonresponse
     * @param {JSON string} content 
     * @param {integer} statusCode 
     */
    sendJsonResponse(content, statusCode = 200) {
        this.sendResp("application/json", JSON.stringify(content), statusCode);
    }

    sendResp(contentType, content, statusCode = 200) {
        if (this.response._header) return;

        this.response.statusCode = statusCode;
        this.response.setHeader("Content-Type", `${contentType}; charset=utf-8`);
        this.response.write(content);
        this.response.end();
    }

    /**
     * send response for static files like html,css,js,images
     * 
     * @param {*} resp 
     * @param {*} filePath 
     */
    sendStaticResponse(filePath) {
        try {
            if (this.response._header) return;
            if (fs.existsSync(filePath)) {
                if (!fs.statSync(filePath).isSymbolicLink() && fs.statSync(filePath).isFile()) {
                    let ext = path.extname(filePath).toLocaleLowerCase();
                    let allowedExt = Object.keys(this.contentType.getExt());
                    if (allowedExt.includes(ext)) {
                        let contType = this.contentType.getExt()[ext];
                        this.response.statusCode = 200;
                        this.response.setHeader("Content-Type", `${contType}; charset=utf-8`);
                        // if images are passed with second parameter as encoding then browser wont display them properly
                        if (this.contentType.getBinayResp().includes(ext)) {
                            fs.createReadStream(filePath).pipe(this.response);
                        } else {
                            fs.createReadStream(filePath, "utf-8").pipe(this.response);
                        }
                        return;
                    }
                }
            }
        } catch (error) {

        }

        this.send404Response();
    }

    respondErr(errCode) {
        switch (errCode) {
            case 401:
                this.send401Response();
                break;
            case 404:
                this.send404Response();
                break;
            case 500:
                this.send500Response();
                break;
            default:
                this.send500Response();
                break;
        }
    }

    
}

module.exports = Kresponse;