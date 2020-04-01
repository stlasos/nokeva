const DB = require('./db');
const Log = require('./logger');
const MessageReceiver = require('./msgreceiver');
const MessageSender = require('./msgsender');
const MessageFormatter = require('./msgformatter');
const MessageHandler = require('./msghandler');
const config = require('../config');

const logger = new Log(config.dir);
const db = new DB(logger, config.dir);
const msgFormatter = new MessageFormatter();
const msgReceiver = new MessageReceiver(config.rabbitmq.CONNECTION_URL, config.rabbitmq.INCOME_QUEUE);
const msgSender = new MessageSender(config.rabbitmq.CONNECTION_URL, config.rabbitmq.OUTPUT_QUEUE);
const msgHandler = new MessageHandler(msgReceiver, msgSender, msgFormatter, db);

let app = function () {
    db.recover();
    msgHandler.handleMessages();
    db.initSnapshots(config.snapshot_interval);
    process.on('SIGTERM', () => {
        db.snapshot(() => {
            process.exit(0);
        });
    });
};

module.exports = app;
