const net = require('net');

const client = new net.Socket();
client.setTimeout(2000);

client.connect(3306, '127.0.0.1', () => {
    console.log('Port 3306 is OPEN');
    client.destroy();
});

client.on('error', (err) => {
    console.log('Port 3306 is CLOSED: ' + err.message);
    client.destroy();
});

client.on('timeout', () => {
    console.log('Connection to 3306 TIMED OUT');
    client.destroy();
});
