class MessageHandler {
    #receiver;
    #sender;
    #formatter;
    #db;

    constructor(receiver, sender, formatter, db) {
        this.#receiver = receiver;
        this.#sender = sender;
        this.#formatter = formatter;
        this.#db = db;
    }

    handleMessages() {
        let self = this;
        self.#receiver.receive(function (msg) {
            let data = self.#formatter.decode(msg);
            if (data.type === undefined) {
                console.log('ERROR: Wrong formatted message!');
            } else if (+data.v !== 1) {
                console.log('ERROR: Unsupported version.');
            } else {
                switch (data.type) {
                    case "SET":
                        self.handleSet(data);
                        break;
                    case "DEL":
                        self.handleDel(data);
                        break;
                    case "GET":
                        self.handleGet(data);
                        break;
                    default:
                        console.log('ERROR: Unsupported method.');
                        break;
                }
            }
        });
    }

    handleSet(data) {
        this.#db.set(data.key, data.value);
        let encoded = this.#formatter.encode({
            "v": 1,
            "command": data,
            "result": {
                "message": "SET 1"
            }
        });
        this.#sender.send(encoded);
    }

    handleDel(data) {
        let res = this.#db.del(data.key);
        let encoded = this.#formatter.encode({
            "v": 1,
            "command": data,
            "result": {
                "message": "DEL " + (+res)
            }
        });
        this.#sender.send(encoded);
    }

    handleGet(data) {
        let res = this.#db.get(data.key);
        let encoded = this.#formatter.encode({
            "v": 1,
            "command": data,
            "result": {
                "message": res
            }
        });
        this.#sender.send(encoded);
    }
}

module.exports = MessageHandler;