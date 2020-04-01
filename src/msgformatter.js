class MessageFormatter {
    decode(msg) {
        return JSON.parse(msg.content.toString());
    }

    encode(data) {
        return Buffer.from(JSON.stringify(data));
    }
}

module.exports = MessageFormatter;