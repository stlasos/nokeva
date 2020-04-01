var amqp = require('amqplib/callback_api');

class MessageSender {
    #connection;
    #queue;

    constructor(url, queue) {
        let self = this;
        this.#queue = queue;
        amqp.connect(url, function (err, connection) {
            if (err) {
                throw err;
            }
            connection.createChannel(function (err1, channel) {
                if (err1) {
                    throw err1;
                }

                channel.assertQueue(self.#queue, {
                    durable: false
                });

                self.#connection = channel;
            });
        });
    }

    send(msg) {
        let send = false;
        setInterval(() => {
            if (this.#connection !== undefined && !send) {
                send = true;
                this.#connection.sendToQueue(this.#queue, msg);
            }
        });
    }
}

module.exports = MessageSender;