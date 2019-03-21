const fs = require("fs");

class Klog {
    constructor(config) {
        try {
            this.__isProduction = true;
            this.__isDebug = false;
            this.__isAcccess = true;
            this.__isError = true;
            this.__logFolder = "./log";
            this.__validate(config);
        } catch (err) {
            throw err;
        }
    }

    /**
     * validate the configuration object
     * @param {object} config 
     */
    __validate(config) {
        if (config == undefined || typeof config != "object") return;
        if (Object.keys(config).length === 0) return;

        if (!config.hasOwnProperty("folder")) {
            config.folder = this.__logFolder;
        }
        
        this.__isDebug = config.hasOwnProperty("debug") ? config.debug : this.__isDebug;
        this.__isAcccess = config.hasOwnProperty("access") ? config.access : this.__isAcccess;
        this.__isError = config.hasOwnProperty("error") ? config.error : this.__isError;
        this.__logFolder = config.folder;

        if (!fs.existsSync(config.folder)) {
            fs.mkdirSync(config.folder);
            this.debug (`【log folder】「${config.folder}」 is created.`);
        }
    }

    /**
     * set logfile name to yyyy-mm-dd
     */
    __getFilename() {
        const zeroFill = (num) => { return num.toString().length < 2 ? Array(2).join("0") + num : num };
        const dateObj = new Date();
        return `${dateObj.getFullYear()}-${zeroFill(dateObj.getMonth() + 1)}-${zeroFill(dateObj.getDate())}`;
    }

    /**
     * write content to a file with utf8 encodeing assynchronously
     * 
     * @param {string} filePath 
     * @param {string} content 
     */
    __write(filePath, content) {
        try {
            let logStream = fs.createWriteStream(filePath, {
                flags: 'a'
            });
            logStream.write(content + '\n', 'utf8')
        } catch (error) {
            // todo 
            console.error(error);
        }    
    }

    /**
     * check if the given data is not empty string
     * @param {string} arg 
     */
    __isEmptyString(arg) {
        if (typeof arg !== "string") return false;
        if (!arg.trim().length) return false;
        return true;
    }

    /**
     * write error log to a file
     * if the application mode is not production,
     * then it will also show the log on console
     * @param {string} content 
     */
    error(content) {
        if (!this.__isError) return true;
        if (!this.__isEmptyString(content)) return false;
        this.__write(`${this.__logFolder}/${this.__getFilename()}.error`, content);
        if (!this.isProduction) console.error(content);
    }

    /**
     * write debug log to a file
     * if the application mode is not production,
     * then it will also show the log on console
     * @param {string} content 
     */
    debug(content) {
        if (!this.__isDebug) return true;
        if (!this.__isEmptyString(content)) return false;

        content = new Date().toLocaleString() + "," + content;
        this.__write(`${this.__logFolder}/${this.__getFilename()}.debug`, content);
        if (!this.isProduction) console.debug(content);
    }

    /**
     * write access log to a file
     * if the application mode is not production,
     * then it will also show the log on console
     * @param {string} content 
     */
    access(content) {
        if (!this.__isAcccess) return true;
        if (!this.__isEmptyString(content)) return false;

        this.__write(`${this.__logFolder}/${this.__getFilename()}.access`, content);
        if (!this.isProduction) console.log(content);
    }
}
module.exports = Klog;