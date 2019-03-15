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
        sessionTime: 1000 * 60,// miliseconds
        maxBodySize: 100 * 1024,  // byte
        header: {
            "x-content-type-options": "nosniff",
            "x-frame-options": "SAMEORIGIN",
            "x-xss-protection": "1; mode=block",
            "server": "khttp@0.1.0",
        },
        contentType: (function () {
            var data = {
                ".html": "text/html",
                ".css": "text/css",
                ".js": "text/javascript",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".gif": "image/gif",
                ".pdf": "application/pdf"
            };
    
            return {
                get: function () {
                    return data;
                },
                add: function (key, val) {
                    data[key] = val;
                }
            }
        })(),
    }
};