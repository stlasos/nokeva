fs = require('fs');

class Log {
    #filename;

    constructor(dir) {
        this.#filename = dir;
        if (this.#filename.substr(-1) === '/') {
            this.#filename = this.#filename.substr(0, this.#filename.length - 1);
        }
        this.#filename += '/nokeva.log';
    }

    change(opType, key = '', value = '') {
        let log = {
            "v": 1,
            "timestamp": +new Date(),
            "type": opType,
            "key": key,
            "value": value
        };
        fs.appendFile(this.#filename, JSON.stringify(log) + '\n', function (err) {
            if (err) {
                console.log('ERROR: Can\'t write to log!');
                return console.log(err);
            }
        });
    }
}

module.exports = Log;