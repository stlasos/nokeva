# nokeva

Persistent key-value database based on node.js

Database is integrated with rabbitmq, which you can run with docker compose (with the management panel).

## Configuration

Before run you should have the `config.json` file with the content like following:

Empty example is available [here](config.example.json)

```json
{
  "dir": "/var/lib/nokeva/data",
  "snapshot_interval": 0,
  "rabbitmq": {
    "CONNECTION_URL": "amqp://rabbitmq",
    "INCOME_QUEUE": "input",
    "OUTPUT_QUEUE": "output"
  }
}
```

**Warning**: `dir` option is only changes the directory inside the docker container, if you want to change dir outside, please change the contents of docker-compose volume

## Installation

You should have docker-compose installed, then just run 

    docker-compose build

### Run

    docker-compose up


## Usage

It supports the following commands:

Name | Description
-----|------------
`GET`| Get value from the database
`SET`| Set value for the specified key
`DEL`| Delete row from database by specifying key

To send commands to the database just send it to the input queue specified in config, a response will be in the output one.

### Input data format:

```json
{
  "v":1,
  "type":"SET",
  "key":"mykey",
  "value":"myvalue"  
}
```

```json
{
  "v":1,
  "type":"GET",
  "key":"mykey"  
}
```

```json
{
  "v":1,
  "type":"DEL",
  "key":"mykey"  
}
```

You can also send additional fields with messages, they will be returned with the result.

### Output data format

```json
{
  "v": 1,
  "command": {},
  "result": {
    "message": ""
  }
}
```

`command` value is the object containing message from the input queue

`result` is the object with only one `message` field

`message` field value is depends on type.

Command name | Result
-------------|-------
`GET` | Returns string value for the specified key. If key is not found returns null.
`SET` | Always returns `SET 1`
`DEL` | Returns `DEL` with the number of deleted rows (`DEL 1` or `DEL 0`)

You can test out sending messages in the management panel which is located at `localhost:15672` by default (user and password are default ("guest")).