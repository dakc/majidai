module.exports = {
    // ===========================================
    // common configuration
    isDebug: false,
    contentType: "text/plain",
    charset: "utf-8",
    maxBodySize: 100 * 1024, // byte
    directoryIndex: "index.html",
    directoryTraversal: false,
    allowedMethod: ["GET", "POST", "HEAD", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"],
    responseHeader: {
        "x-frame-options": "SAMEORIGIN",
        "x-xss-protection": "0",
        "server": "majidai/2.1",
        "Access-Control-Allow-Origin": "*",
        "Accept": "*/*",
    },
    
    // ===========================================
    // http configuration
    http: {
        port: 80,
        host: "0.0.0.0",
        documentRoot: "",
        listen: true,
    },

    // ===========================================
    // https configuration
    https: {
        port: 443,
        host: "0.0.0.0",
        documentRoot: "",
        listen: false,
        http2: false,
        http3: false,
        pfx: "",
        passphrase: "",
    },
};