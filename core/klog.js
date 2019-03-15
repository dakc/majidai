const fs = require("fs");

class Klog {
    constructor(config) {
        try {
            this.isWrite = false;
            this.isProduction = true;
            this.isDebug = false;
            this.isAcccess = true;
            this.isError = true;
            this.logFolder = "./log";
            this.validate(config);
        } catch (error) {
            throw error;
        }
    }

    validate(config) {
        if (config == undefined || typeof config != "object") return;
        if (Object.keys(config).length === 0) return;

        if (!config.hasOwnProperty("folder")) {
            config.folder = this.logFolder;
        }
        
        this.isDebug = config.hasOwnProperty("debug") ? config.debug : this.isDebug;
        this.isAcccess = config.hasOwnProperty("access") ? config.access : this.isAcccess;
        this.isError = config.hasOwnProperty("error") ? config.error : this.isError;
        this.isWrite = true;
        this.logFolder = config.folder;

        if (!fs.existsSync(config.folder)) {
            fs.mkdirSync(config.folder);
            this.debug (`【log folder】「${config.folder}」 is created.`);
        }
    }

    /**
     * set logfile name to yyyy-mm-dd
     */
    getFilename() {
        const zeroFill = (num) => { return num.toString().length < 2 ? Array(2).join("0") + num : num };
        const dateObj = new Date();
        return `${dateObj.getFullYear()}-${zeroFill(dateObj.getMonth() + 1)}-${zeroFill(dateObj.getDate())}`;
    }

    write(filePath, content) {
        try {
            if (!this.isWrite) return;
            let logStream = fs.createWriteStream(filePath, {
                flags: 'a'
            });
            logStream.write(content + '\n', 'utf8')
        } catch (error) {
            // todo 
            console.error(error);
        }    
    }

    error(content) {
        if (!this.isError) return true;
        this.write(`${this.logFolder}/${this.getFilename()}.error`, content);
        if (!this.isProduction) console.error(content);
    }

    debug(content) {
        if (!this.isDebug) return true;
        this.write(`${this.logFolder}/${this.getFilename()}.debug`, content);
        if (!this.isProduction) console.debug(content);
    }

    access(content) {
        if (!this.isAcccess) return true;
        this.write(`${this.logFolder}/${this.getFilename()}.info`, content);
        if (!this.isProduction) console.log(content);
    }
}
module.exports = Klog;