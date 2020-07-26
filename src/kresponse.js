const fs = require("fs");
const path = require("path");

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
            ".bmp": "image/bmp",
            ".mp3": "audio/mpeg",
            ".ogg": "video/ogg",
            ".webm": "video/webm",
            ".mp4": "video/mp4",
        }
    }

    setResponse(r, e, s, c, p) {
        this.request = r;
        this.response = e;
        this.contentType = c;
        this.charset = p;
        for (var t in s) this.response.setHeader(t, s[t]);
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

    sendStaticResponse(e, er = null) {
        if (fs.existsSync(e) && fs.statSync(e).isFile() && !fs.statSync(e).isSymbolicLink()) {
            let s = path.extname(e).toLocaleLowerCase();
            if (Object.keys(this.mimeType).includes(s)) {
                let m = this.mimeType[s];
                if (m.startsWith("video") || m.startsWith("audio")) {
                    if ("range" in this.request.headers) {
                        this.streamFile(e, m);
                        return;
                    }
                }

                this.response.writeHead(200, {
                    "Content-Type": m,
                    charset: this.charset
                });

                if (m.startsWith("text")) {
                    fs.createReadStream(e, this.charset).pipe(this.response);
                    return;
                }

                fs.createReadStream(e).pipe(this.response);
                return;
            }

            // Unsupported Media Type
            this.sendResp(415);
            return;
        }

        er && er(`file not found - ${e}`);
        this.sendResp(404);
    }

    streamFile(e, z) {
        var t = this.request,
            s = this.response,
            n = fs.statSync(e),
            a = t.headers.range.replace(/bytes=/, "").split("-"),
            i = a[0],
            r = a[1],
            p = n.size,
            f = parseInt(i, 10),
            c = r ? parseInt(r, 10) : p - 1,
            l = c - f + 1;
        s.writeHead(206, {
            "Content-Range": "bytes " + f + "-" + c + "/" + p,
            "Accept-Ranges": "bytes",
            "Content-Length": l,
            "Content-Type": z
        });
        fs.createReadStream(e, {
            start: f,
            end: c
        }).pipe(s);
        s.on("close", function () {
            if (!s.fileStream) return;
            s.fileStream.unpipe(this);
            if (this.fileStream.fd) fs.close(this.fileStream.fd);
        })
    }
}
module.exports = Kresponse;