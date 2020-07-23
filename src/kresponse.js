const fs = require("fs"),
    path = require("path");
class Kresponse {
    constructor(e, s) {
        this.contentType = e, this.charset = s, this.mimeType = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "text/javascript",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".ico": "image/x-icon",
            ".pdf": "application/pdf",
            ".svg": "image/svg+xml",
            ".tif": "image/tiff",
            ".tiff": "image/tiff",
            ".bmp": "image/bmp"
        }
    }
    setResponse(e, s) {
        for (var t in this.response = e, s) this.response.setHeader(t, s[t])
    }
    overrideError(e) {
        "function" == typeof e && (this._errorCallback = e)
    }
    redirectUrl(e) {
        this.response.writeHead(303, {
            Location: e
        }), this.response.end()
    }
    sendResp(e, s = null) {
        if (this._errorCallback && !isNaN(parseInt(e)) && parseInt(e) >= 400) {
            var t = this._errorCallback(s || "");
            this.contentType = t.contentType, s = t.content
        }
        this.response.writeHead(e, {
            "Content-Type": this.contentType,
            charset: this.charset
        }), this.response.end(s || this.response.statusMessage)
    }
    sendStaticResponse(e, s = null) {
        if (fs.existsSync(e) && fs.statSync(e).isFile() && !fs.statSync(e).isSymbolicLink()) {
            let s = path.extname(e).toLocaleLowerCase();
            if (Object.keys(this.mimeType).includes(s)) return this.response.writeHead(200, {
                "Content-Type": this.mimeType[s],
                charset: this.charset
            }), this.mimeType[s].startsWith("text") ? fs.createReadStream(e, this.charset).pipe(this.response) : fs.createReadStream(e).pipe(this.response)
        }
        return s && s(`file not found - ${e}`), this.sendResp(404)
    }
}
module.exports = Kresponse;