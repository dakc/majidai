const MSG = require("./constants").MSG;
const querystring = require("querystring");

module.exports = {
    manipulateParamRouting: function (e, t, r) {
        var a = r.getParams();
        for (const [s, o] of e)
            if (t.startsWith(s + "/") && o.params.length > 0) {
                var n = t.substr(s.length),
                    i = [];
                return n.split("/").forEach(e => e && i.push(e)), i.forEach((e, t) => {
                    t < o.params.length && (a[o.params[t]] = e)
                }), r.setGetParam(a), o.execUserFunc
            }
    },
    execUserFunction: (e, t) => {
        Object.defineProperty(e.request, "mj", {
            value: {
                getParams: (t = null) => e.data.getParams(t),
                postParams: (t = null) => e.data.postParams(t)
            }
        }), Object.defineProperty(e.response, "mj", {
            value: e.respond
        });
        var r = t(e.request, e.response);
        if (r == null || typeof r == 'undefined') return;
        if (e.respond.isDone()) return r;
        if ("string" == typeof r) return e.respond.text(r);
        if ("number" == typeof r) return e.respond.text(String(r));
        if ("object" == typeof r) return e.respond.json(r);
    },
    formatPostData: (e, t) => {
        var x;
        try {
            x = JSON.parse(t);
        } catch (_e) {
            x = querystring.parse(t);
        }
        return x
    },
    welcomePage: () => '<!DOCTYPE html><html lang="en"><head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>majidai</title> <link href="https://fonts.googleapis.com/css2?family=Caveat&family=Pathway+Gothic+One&display=swap" rel="stylesheet"> <style>body{background-image: url("https://raw.githubusercontent.com/dakc/dakc.github.io/master/assets/img/majidai.svg"); background-position: center; background-attachment: fixed; background-repeat: no-repeat; background-color: #5e9305; background-size: 200px; margin: 0px; padding: 0px;}p{font-family: \'Caveat\', cursive; text-align: center; font-size: 3rem; margin: 0px; padding: 0px; visibility: hidden;}em{color: #ffca28;}</style></head><body> <p><em>majidai</em> is ready to serve</p><script>window.addEventListener("load", function(){document.querySelector("p").style.visibility="visible";}); <\/script></body></html>\n        '
};