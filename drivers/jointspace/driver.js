var net = require('net');
var request = require('request');
var tempIP = '';
var url = '';

module.exports.pair = function( socket ) {
	// socket is a direct channel to the front-end

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	socket.on('list_devices', function( data, callback ) {

	console.log( "Philips TV app - list_devices tempIP is", tempIP );

		var devices = [{
			data: {
				id : tempIP,
				ipaddress : tempIP
			},
			name: 'Philips TV'
		}];

		callback( null, devices );

	});

// this is called when the user presses save settings button in start.html

	socket.on('get_devices', function( data, callback ) {

		// Set passed pair settings in variables
		tempIP = data.ipaddress;
		console.log ( "Philips TV app - got get_devices from front-end, tempIP =", tempIP );

		// check if IP leads to an actual Philips TV
		url = 'http://'+tempIP+':1925/1/system';
		// console.log ("Connect to TV on url: ",url)
		request.get({url: url}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var args = JSON.parse(body)
				if (args.name == 'Philips TV'){
					// found device is a Philips TV
					console.log("Detected device is ",args.name," model ",args.model)
					socket.emit ('continue', args.model)
				} else {
					console.log("Detected device is not a Philips TV on, tempIP", tempIP)
				}
			}
		}
		);
		// Not paired with a Philips TV
		console.log("No Device detected on, tempIP =", tempIP)
	});

	socket.on('disconnect', function(){
			console.log("Philips TV - User aborted pairing, or pairing is finished");
	})
}

// flow action handlers

Homey.manager('flow').on('action.set_channel', function( callback, args ){
	// Set channel
	var tempIP = args.tv.ipaddress;
	var url = 'http://'+tempIP+':1925/1/channels/current';
	var channel = {id: args.channel.id};
	post ( url, channel );
  callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.set_channel.channel.autocomplete', function( callback, args ) {
	var tempIP = args.tv.ipaddress;
	var url = 'http://'+tempIP+':1925/1/channels';
	var channels =[];
	var data = [];
	// Collect TV channels from, IP " + tempIP)
	request.get({url: url}, function (error, response, body) {
			if (!error && response.statusCode == 200){
				data = JSON.parse(body)
				for (var obj in data){
					// Fill aray with possible channels
					channels.push({ id: obj, name: data[obj].name});
				}
				callback( null, channels );
			} else {
				Homey.log(" Command to Philips TV, gives an error in response:", error, response)
				callback (error);				
			}
	});
});	


Homey.manager('flow').on('action.set_volume', function( callback, args ){
	// Set Volume
	var tempIP = args.tv.ipaddress;
	var url = 'http://'+tempIP+':1925/1/audio/volume';
	var volume = { 
		"muted": false,
		"current": args.volume};
	post ( url, volume );
  callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.set_source', function( callback, args ){
	// Set Source
	var tempIP = args.tv.ipaddress;
	var url = 'http://'+tempIP+':1925/1/sources/current';
	var source = {id: args.source.id};
	post ( url, source);
  callback( null, true ); // we've fired successfully
});


Homey.manager('flow').on('action.set_source.source.autocomplete', function( callback, args ) {
	var tempIP = args.tv.ipaddress;
	var url = 'http://'+tempIP+':1925/1/sources';
	var sources =[];
	var data=[];
	// Collect sources from, IP " + tempIP)	
	request.get({url: url}, function (error, response, body) {
			if (!error && response.statusCode == 200){
				data = JSON.parse(body)
				for (var obj in data){
					// Fill aray with possible sources
					sources.push({ id: obj, name: data[obj].name});
				}
				callback( null, sources)
			} else {
				Homey.log(" Command to Philips TV, gives an error in response:", error, response)
				callback (error);				
			}
		});	
});

Homey.manager('flow').on('action.set_mute_true', function( callback, args ){
	// Mute
	var tempIP = args.tv.ipaddress;
	var url= 'http://'+tempIP+':1925/1/audio/volume';
	var mute = {"muted": true};
	post ( url, mute );
  callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.set_mute_false', function( callback, args ){
	// UnMute
	var tempIP = args.tv.ipaddress;
	var url= 'http://'+tempIP+':1925/1/audio/volume'
	var mute = {"muted": false};
	post ( url, mute );
  callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.standby', function( callback, args ){
	// Standby
	var tempIP = args.tv.ipaddress;
	var url= 'http://'+tempIP+':1925/1/input/key'
	var key = {"key": "Standby"};
	post ( url, key);
  callback( null, true ); // we've fired successfully
});


function post ( url, args ) {
	// post the command to the TV
	console.log("Post to tv ", url, args)
	request({
		url: url,
		method: "POST",
		json: args
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				// ready
			} else {
				console.log(" Command to Philips TV, gives an error in response", error, response)
				Homey.log(" Command to Philips TV, gives an error in response:", error, response)
				callback (error);
			}
		}
	);
};