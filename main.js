const bsp = require('bluetooth-serial-port'),
      server = new(bsp).BluetoothSerialPortServer(),
      fs = require('fs'),
      path = require('path'),
      execSync = require('child_process').execSync;

console.log('Initializing Rigr Server');

console.log('Reading Action Config...');

var actions = {};
var actionsDir = fs.readdirSync('actions');
for (var x in actionsDir) {
    var file = actionsDir[x];
    if (path.extname(file) == ".json") {
        var fileContents = fs.readFileSync('actions/'+file);
        try {
            var parsed = JSON.parse(fileContents);
            if (typeof parsed.key !== "undefined") {
                actions[parsed.key] = parsed;
            } else {
                console.error(`Couldn't find key for loaded action`);
                console.error(parsed);
            }
        } catch (e) {
            console.error(`Couldn't decode ${file}:`);
            console.error(e)
        }
    } 
}

console.log(`Loaded actions into memory.`);

console.log(actions);

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
        
        // Was an action recieved?
        if (typeof received.action == "undefined") {
            return error("No action passed to service.");
        } 

        // Was the recieved action a valid one?
        if (typeof actions[received.action] == "undefined") {
            return error(`The action "${recieved.action}" was not valid.`);
        }
        
        // We have an action. Lets act on it.
        var curAction = actions[received.action];

        if (typeof curAction.actions == "undefined" || !curAction.actions.length) {
            return error(`This action does not appear to do anything.`, curAction);
        }


        if (typeof curAction.actions == "string" || (typeof curAction.actions == "object" && !Array.isArray(curAction.actions))) {
            curAction.actions = [ curAction.actions ];  // normalize single-action configs
        }

        var responseObj = {};

        for (var x in curAction.actions) {
            var runAction = curAction.actions[x];
            
            if (typeof runAction == "string" && typeof actions[runAction] !== "undefined") {
                runAction = actions[runAction]; // Handle calling other actions by string alone
            }

            if (typeof runAction.type !== "string") {
                console.log(runAction);
                return error(`An action passed had an invalid type (must be string)`, curAction);
            } 

            switch (runAction.type) {
                case "bash":
                    if (typeof runAction.command !== "string") {
                        return error(`The command passed was not a string, or no command passed.`,runAction);
                    }
                    try {
                        responseObj[runAction.key] = execSync(runAction.command,{ encoding: 'utf8' });
                    } catch (e) {
                        if (e.error) {
                            responseObj[runAction.key] = {error: e};
                        } else {
                            // fake news, donald trump, no errors, merica? 
                            // No clue whats going on here.
                            // @TODO: Why is this happening?
                            responseObj[runAction.key] = e.stdout;
                        }
                    }
                break;
                default:
                    return error(`The action type of ${runAction.type} is not valid.`);
                break;
            }

            for (var x in responseObj) {
                try {
                    responseObj[x] = JSON.parse(responseObj[x]);
                } catch (e) { /* Dumb way of checking if its json. haha */ }
            } 

        }
        return good(responseObj);
    });
}, function(error){
	console.error("Something wrong happened!:" + error);
},{});

var error = (msg,data) => {
    if (!data) {
        data = {};
    }
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