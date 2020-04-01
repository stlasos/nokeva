fs = require('fs');

const loadSnapshot = function (dir, callback) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        console.log('ERROR: Can\'t scan dir for snapshots!');
        console.log(e);
        return;
    }
    let maxTimestamp = 0;
    let lastSnapshotLocation = '';
    for (let file of files) {
        let match = file.match(/^(\d+)_snapshot.json$/);
        if (match && match[1] !== undefined && +match[1] > maxTimestamp) {
            maxTimestamp = +match[1];
            lastSnapshotLocation = dir + '/' + match[0];
        }
    }
    let d = '';
    if (lastSnapshotLocation !== '') {
        let data;
        try {
            data = fs.readFileSync(lastSnapshotLocation);
        } catch (e) {
            console.log('ERROR: Can\'t open snapshot.');
            console.log(e);
            return;
        }
        d = (data.toString() === '') ? {} : JSON.parse(data.toString());
    }
    updateDataWithLog(dir, callback, d, maxTimestamp);
};

const updateDataWithLog = function (dir, callback, dbData, timestamp) {
    let logFile = dir + '/nokeva.log';
    if (fs.existsSync(logFile)) {
        let data;
        try {
            data = fs.readFileSync(logFile);
        } catch (e) {
            console.log('ERROR: Can\'t open log.');
            console.log(e);
            proceedCallbackWithData(callback, dbData);
            return;
        }
        if (data.toString() !== '') {
            let records = data.toString().split("\n");
            for (let record of records) {
                if (record !== '') {
                    let parsed = JSON.parse(record);
                    if (parsed !== undefined && +parsed["v"] === 1 && +parsed["timestamp"] > +timestamp) {
                        switch (parsed["type"]) {
                            case "SET":
                                dbData[parsed["key"]] = parsed["value"];
                                break;
                            case "DEL":
                                delete dbData[parsed["key"]];
                                break;
                            default:
                                console.log('WARNING: Unknown operation type in log.');
                        }
                    }
                }
            }
        }
    } else {
        try {
            fs.writeFileSync(logFile, '');
        } catch (e) {
            console.log('ERROR: Can\'t create log file.');
            console.log(e);
        }
    }
    proceedCallbackWithData(callback, dbData);
};

const proceedCallbackWithData = function (callback, data) {
    if (typeof data === "object") {
        callback(data);
    }
};

class DB {
    #data = {};
    #dir;
    #logger;

    constructor(logger, dir) {
        this.#logger = logger;
        if (dir.substr(-1) === '/') {
            dir = dir.substr(0, dir.length - 1);
        }
        this.#dir = dir;
    }

    set(key, value) {
        this.#data[key] = value;
        this.#logger.change("SET", key, value);
    }

    get(key) {
        return (key in this.#data) ? this.#data[key] : null;
    }

    del(key) {
        if (key in this.#data) {
            delete this.#data[key];
            this.#logger.change("DEL", key);
            return 1;
        }
        return 0;
    }

    initSnapshots(interval) {
        if (+interval !== 0) {
            setInterval(this.snapshot, +interval * 1000);
        }
    }

    snapshot(callback) {
        let filename = this.#dir;
        filename += '/' + (+new Date()) + '_snapshot.json';
        fs.writeFile(filename, JSON.stringify(this.#data), function (err) {
            if (err) {
                console.log('ERROR: Can\'t take snapshot!');
                console.log(err);
            }
            callback();
        });
    }

    recover() {
        loadSnapshot(this.#dir, data => {
            this.#data = data;
        });
    }
}

module.exports = DB;