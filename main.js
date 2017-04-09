// Still just playing around

var server = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
server.listen(function (clientAddress) {
    console.log('Client: ' + clientAddress + ' connected!');
    server.on('data', function(buffer) {
        console.log('Received data from client: ' + buffer);
        
        var received = JSON.parse(buffer.toString());
        if (!received) received = {error:"Could not decode", raw: buffer.toString()};


        var testdata = {
            response: 'I do nothing yet', 
            received: received
        }

        console.log('Sending data to the client');
        server.write(new Buffer(JSON.stringify(testdata)), function (err, bytesWritten) {
            if (err) {
                console.log('Error!');
            } else {
                console.log('Send ' + bytesWritten + 'b to the client!');
            }
        });
    });
}, function(error){
	console.error("Something wrong happened!:" + error);
},{});
