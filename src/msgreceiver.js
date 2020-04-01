var amqp = require('amqplib/callback_api');

class MessageReceiver {
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

    receive(callback) {
        let consume = false;
        setInterval(() => {
            if (this.#connection !== undefined && !consume) {
                consume = true;
                this.#connection.consume(this.#queue, callback, {noAck: true});
            }
        });
    }
}

module.exports = MessageReceiver;