const bsp = require('bluetooth-serial-port'),
      server = new(bsp).BluetoothSerialPortServer();



server.listen(function (clientAddress) {
    console.log('Client: ' + clientAddress + ' connected!');
    server.on('data', function(buffer) {
        var receivedString = buffer.toString();
        console.log("[received]", receivedString);

        // Atempt to decode JSON, and 
        try {
            var received = JSON.parse(receivedString);
        } catch (e) {
            return error("Could not decode",receivedString);
        }
        
        
        return good({msg: "Valid JSON recieved. Do something with it eventually."});

    });
}, function(error){
	console.error("Something wrong happened!:" + error);
},{});

var error = (msg,data) => {
    respond({ 
        status: "error",
        msg: msg, 
        raw: data 
    });
}

var good = (data) => {
    data.status = "OK";
    respond(data);
}

var respond = (value) => {
    var response = JSON.stringify(value);
    console.log('[response]', response);
    server.write(new Buffer(response), function (err, bytesWritten) {
        if (err) {
            console.log('Error!');
        } else {
            console.log('Send ' + bytesWritten + 'b to the client!');
        }
    });
}