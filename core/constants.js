module.exports = {
    SESSION_VAR: {
        sessionId: "__KSESID",
        csrfToken: "__TOKEN",
        userId: "__ID",
        lastAccess: "__TM",
        isUserLogged: "__LG",
    },
   
    CONFIG: {
        port: 80,
        host: "0.0.0.0",
        log: {
            folder: "./log",
            access: true,
            debug: true,
            error: true
        },
        publicDir: "./public",
        isProduction: true,
        sessionTime: 1000 * 60 * 5,// miliseconds
        maxBodySize: 100 * 1024,  // byte
        header: {
            "x-content-type-options": "nosniff",
            "x-frame-options": "SAMEORIGIN",
            "x-xss-protection": "1; mode=block",
            "server": "khttp@1.0",
        },
        contentType: (function () {
            var allowedExt = {
                ".html": "text/html",
                ".css": "text/css",
                ".js": "text/javascript",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".gif": "image/gif",
                ".ico": "image/x-icon",
                ".pdf": "application/pdf"
            };

            var binaryResp = [".jpg", ".jpeg", ".png", ".gif", ".ico", ".pdf"];
    
            return {
                getExt: function () {
                    return allowedExt;
                },
                addExt: function (key, val) {
                    if (typeof key !== "string" || key.trim().length == 0) return;
                    if (typeof val !== "string" || val.trim().length == 0) return;
                    allowedExt[key.toLocaleLowerCase()] = val;
                },
                getBinayResp: function () {
                    return binaryResp;
                },
                addBinaryResp: function (itm) {
                    if (typeof itm !== "string" || itm.trim().length == 0) return;
                    binaryResp.push(itm.toLocaleLowerCase());
                }
            }
        })(),
    }
};