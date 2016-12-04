"use strict";

// We need network functions.
var net = require('net');
// We need http post functions
var request = require('request');
// Temporarily store the device's IP address and name. For later use, it gets added to the device's settings
var tempIP = '';
var tempDeviceNr = '';
var tempDeviceName = '';
// a list of devices, with their 'id' as key
// it is generally advisable to keep a list of
// paired and active devices in your driver's memory.
var devices = {};
var allPossibleInputs = [
	{ 	inputname: "Standby",
		friendlyName: "Standby"},
	{ inputname: "Back",
		friendlyName: "Terug"},
	{ inputname: "Find",
		friendlyName: "Zoek"},
	{ inputname: "RedColour",
		friendlyName: "Rood"},
	{ inputname: "GreenColour",
		friendlyName: "Groen"},
	{ inputname: "YellowColour",
		friendlyName: "Geel"},
	{ inputname: "BlueColour",
		friendlyName: "Blauw"},
	{ inputname: "Home",
		friendlyName: "Home"},
	{ inputname: "VolumeUp",
		friendlyName: "Volume Up"},
	{ inputname: "VolumeDown",
		friendlyName: "Volume Down" },
	{ inputname: "Mute",
		friendlyName: "Mute on/off"},
	{ inputname: "Options",
		friendlyName: "Options"},
	{ inputname: "Dot",
		friendlyName: "Punt"},
	{ inputname: "Digit0",
		friendlyName: "Digit 0"},
	{ inputname: "Digit1",
		friendlyName: "Digit 1"},
	{ inputname: "Digit2",
		friendlyName: "Digit 2"},
	{ inputname: "Digit3",
		friendlyName: "Digit 3"},
	{ inputname: "Digit4",
		friendlyName: "Digit 4"},
	{ inputname: "Digit5",
		friendlyName: "Digit 5"},
	{ inputname: "Digit6",
		friendlyName: "Digit 6"},
	{ inputname: "Digit7",
		friendlyName: "Digit 7"},
	{ inputname: "Digit8",
		friendlyName: "Digit 8"},
	{ inputname: "Digit9",
		friendlyName: "Digit 9"},
	{ inputname: "Info",
		friendlyName: "Info"},
	{ inputname: "CursorUp",
		friendlyName: "Cursor Up"},
	{ inputname: "CursorDown",
		friendlyName: "Cursor Down"},
	{ inputname: "CursorLeft",
		friendlyName: "Cursor Left"},
	{ inputname: "CursorRight",
		friendlyName: "Cursor Right"},
	{ inputname: "Confirm",
		friendlyName: "Ok"},
	{ inputname: "Next",
		friendlyName: "Next"},
	{ inputname: "Previous",
		friendlyName: "Previous"},
	{ inputname: "Adjust",
		friendlyName: "Adjust"},
	{ inputname: "WatchTV",
		friendlyName: "Watch TV"},
	{ inputname: "Viewmode",
		friendlyName: "Viewmode"},
	{ inputname: "Teletext",
		friendlyName: "Teletext"},
	{ inputname: "Subtitle",
		friendlyName: "Subtitle on/off"},
	{ inputname: "ChannelStepUp",
		friendlyName: "Channel Up"},
	{ inputname: "ChannelStepDown",
		friendlyName: "Channel Down"},
	{ inputname: "Source",
		friendlyName: "Source"},
	{ inputname: "AmbilightOnOff",
		friendlyName: "Ambilight on/off"},
	{ inputname: "PlayPause",
		friendlyName: "Play / Pause"},
	{ inputname: "Pause",
		friendlyName: "Pause"},
	{ inputname: "FastForward",
		friendlyName: "Fast Forward"},
	{ inputname: "Stop",
		friendlyName: "Stop"},
	{ inputname: "Rewind",
		friendlyName: "Fast Backward"},
	{ inputname: "Record",
		friendlyName: "Record"},
	{ inputname: "Online",
		friendlyName: "Online"}
];	


// init gets run at the time the app is loaded. We get the already added devices then need to run the callback when done.
module.exports.init = function( devices_data, callback ) {
	devices_data.forEach(function(device_data){
		Homey.log('Philips TV - init device: ' + JSON.stringify(device_data));
	    initDevice( device_data );
	})
	//tell Homey we're happy to go
    callback();
}

// start of pairing functions
module.exports.pair = function( socket ) {
// socket is a direct channel to the front-end

// this method is run when Homey.emit('list_devices') is run on the front-end
// which happens when you use the template `list_devices`
	socket.on('list_devices', function( data, callback ) {

		Homey.log( "Philips TV - list_devices data: " + JSON.stringify(data));
// tempIP and tempDeviceName we got from when get_devices was run (hopefully?)

		var newDevices = [{
			data: {
				id				: tempIP,
				ipadress		: tempIP,
				devicenr		: tempDeviceNr,
				name			: tempDeviceName
			},
			name: tempDeviceName,
			settings: { "settingIPAddress": tempIP } // initial settings
		}];

		callback( null, newDevices );
	});


// this is called when the user presses save settings button in start.html
	socket.on('get_devices', function( data, callback ) {
		Homey.log(data)
		// Set passed pair settings in variables
		tempIP = data.ipaddress;
		tempDeviceNr = data.devicenr;
		tempDeviceName = data.devicename;
		Homey.log ( "Philips TV - got get_devices from front-end, tempIP =", tempIP, " tempDeviceName = ", tempDeviceName );
// FIXME: should check if IP leads to an actual Marantz device
// assume IP is OK and continue, which will cause the front-end to run list_amplifiers which is the template list_devices
		socket.emit ( 'continue', null );
	});

		socket.on('disconnect', function() {
		Homey.log("Philips TV - Pairing is finished (done or aborted)");
	  })
}
// end pair

module.exports.added = function( device_data, callback ) {
    // run when a device has been added by the user (as of v0.8.33)
		Homey.log("Philips TV - device added: " + JSON.stringify(device_data));
		// update devices data array
 	    initDevice( device_data );
		Homey.log('Philips TV - add done. devices =' + JSON.stringify(devices));
		callback( null, true );
}

module.exports.renamed = function( device_data, new_name ) {
    // run when the user has renamed the device in Homey.
    // It is recommended to synchronize a device's name, so the user is not confused
    // when it uses another remote to control that device (e.g. the manufacturer's app).
		Homey.log("Philips TV - device renamed: " + JSON.stringify(device_data) + " new name: " + new_name);
		// update the devices array we keep
		devices[device_data.id].data.name = new_name;
}

module.exports.deleted = function( device_data ) {
    // run when the user has deleted the device from Homey
		Homey.log("Philips TV - device deleted: " + JSON.stringify(device_data));
		// remove from the devices array we keep
    delete devices[ device_data.id ];
}

// handling settings (wrench icon in devices)
module.exports.settings = function( device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback ) {
    // run when the user has changed the device's settings in Homey.
    // changedKeysArr contains an array of keys that have been changed, for your convenience :)

    // always fire the callback, or the settings won't change!
    // if the settings must not be saved for whatever reason:
    // callback( "Your error message", null );
    // else callback( null, true );

	Homey.log ('Philips TV - Settings were changed: ' + JSON.stringify(device_data) + ' / ' + JSON.stringify(newSettingsObj) + ' / old = ' + JSON.stringify(oldSettingsObj) + ' / changedKeysArr = ' + JSON.stringify(changedKeysArr));

	try {
   		changedKeysArr.forEach(function (key) {
					switch (key) {
						case 'settingIPAddress':
							Homey.log ('Philips TV - IP address changed to ' + newSettingsObj.settingIPAddress);
							// FIXME: check if IP is valid, otherwise return callback with an error
							break;
						case 'settingDeviceNr':
							Homey.log ('Philips TV - Device Nr changed to ' + newSettingsObj.settingDeviceNr);
							break;
					}
  	    })
   		callback(null, true)
	} catch (error) {
    callback(error)
    }

}

// capabilities

module.exports.capabilities = {
    onoff: {

        get: function( device_data, callbackCapability ){
					Homey.log(device_data)
					Homey.log("Philips TV - getting device on/off status of " + device_data.id);
					var tempIP = device_data.id;
					var url= 'http://'+tempIP+':1925/'
					request.get({url: url}, function (error, response, body) {
					if (!error && response.statusCode == 200) { 
							Homey.log("Philips TV - telling capability power is on");
							callbackCapability (null, true);
						}	else {
							Homey.log("Philips TV - telling capability power is off");
							callbackCapability (null, false);
						}
					} );
        },

        set: function( device_data, turnon, callbackCapability ) {

	        Homey.log('Philips TV - Setting device_status of ' + device_data.id + ' to ' + turnon);

					if (turnon) {
						var tempIP = device_data.id;
						var tempDeviceNr = device_data.devicenr;
						var url= 'http://'+tempIP+':1925/'+tempDeviceNr+'/input/key'
						var key = {"key": "Standby"};
						post ( url, key);
						callbackCapability (null, true);
					} else {
						var tempIP = device_data.id;
						var tempDeviceNr = device_data.devicenr;
						var url= 'http://'+tempIP+':1925/'+tempDeviceNr+'/input/key'
						var key = {"key": "Standby"};
						post ( url, key);
						callbackCapability (null, true);

					}
        }
    }
}

// end capabilities

// start flow action handlers

Homey.manager('flow').on('action.set_channel', function( callback, args ){
	// console.log("flow set channel", args);
	// Set channel
	var tempIP = args.tv.id;
	var tempDeviceNr = args.tv.devicenr;
	var url = 'http://'+tempIP+':1925/'+tempDeviceNr+'/channels/current';
	var channel = {id: args.channel.id};
	post (url, channel );
  callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.set_channel.channel.autocomplete', function( callback, args ) {
	if( args.args.tv == '' ) return callback( "Select a TV" );
	for (var device_data in devices) {
		if (devices[device_data].data.name == args.args.tv.name) {
			var tempIP = devices[device_data].data.id;
			var tempDeviceNr = devices[device_data].data.devicenr;
		}	
	}
	var url = 'http://'+tempIP+':1925/'+tempDeviceNr+'/channels';
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
				console.log(" Command to Philips TV, gives an error in response:", error, response)
				callback ("TV is Offline");				
			}
	});
});	

Homey.manager('flow').on('action.input_key', function( callback, args ){
	//console.log("flow input key", args);
	var tempIP = args.tv.id;
	var tempDeviceNr = args.tv.devicenr;
	var url = 'http://'+tempIP+':1925/'+tempDeviceNr+'/input/key';
	var key = {"key": args.key.id};
	post (url, key);
  callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.input_key.key.autocomplete', function( callback, args ) {
	if( args.args.tv == '' ) return callback( "Select a TV" );
	var inputs = [];
	var data = allPossibleInputs;
		for (var obj in data){
			// Fill aray with possible inputs
			inputs.push({ id: data[obj].inputname, name: data[obj].friendlyName});
		}
		callback (null, inputs);
});

Homey.manager('flow').on('action.set_volume', function( callback, args ){
	// console.log("flow set volume", args);
	// Set Volume
	var tempIP = args.tv.id;
	var tempDeviceNr = args.tv.devicenr;
	var url = 'http://'+tempIP+':1925/'+tempDeviceNr+'/audio/volume';
	var volume = { 
		"muted": false,
		"current": args.volume};
	post ( url, volume );
  callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.set_source', function( callback, args ){
	// console.log("flow set source", args);
	// Set Source
	var tempIP = args.tv.id;
	var tempDeviceNr = args.tv.devicenr;
	var url = 'http://'+tempIP+':1925/'+tempDeviceNr+'/sources/current';
	var source = {id: args.source.id};
	post ( url, source);
  callback( null, true ); // we've fired successfully
});


Homey.manager('flow').on('action.set_source.source.autocomplete', function( callback, args ) {
	// console.log("flow select sources", args);
	if( args.args.tv == '' ) return callback( "Select a TV" );
	for (var device_data in devices) {
		if (devices[device_data].data.name == args.args.tv.name) {
			var tempIP = devices[device_data].data.id;
			var tempDeviceNr = devices[device_data].data.devicenr;
		}	
	}
	var url = 'http://'+tempIP+':1925/'+tempDeviceNr+'/sources';
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
				// console.log(sources);
				callback( null, sources)
			} else {
				console.log(" Command to Philips TV, gives an error in response:", error, response)
				callback ("TV is Offline");				
			}
		});	
});

Homey.manager('flow').on('action.set_mute_true', function( callback, args ){
	// console.log("flow set mute", args);
	// Mute
	var tempIP = args.tv.id;
	var tempDeviceNr = args.tv.devicenr;
	var url= 'http://'+tempIP+':1925/'+tempDeviceNr+'/audio/volume';
	var mute = {"muted": true};
	post ( url, mute );
  callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.set_mute_false', function( callback, args ){
	// console.log("flow unset mute", args);
	// UnMute
	var tempIP = args.tv.id;
	var tempDeviceNr = args.tv.devicenr;
	var url= 'http://'+tempIP+':1925/'+tempDeviceNr+'/audio/volume'
	var mute = {"muted": false};
	post ( url, mute );
  callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.standby', function( callback, args ){
	// console.log("flow set standby", args);
	// Standby
	var tempIP = args.tv.id;
	var tempDeviceNr = args.tv.devicenr;
	var url= 'http://'+tempIP+':1925/'+tempDeviceNr+'/input/key'
	var key = {"key": "Standby"};
	post ( url, key);
  callback( null, true ); // we've fired successfully
});


function post ( url, args ) {
	// post the command to the TV
	// console.log("Post to tv ", url, args)
	request({
		url: url,
		method: "POST",
		json: args
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				// ready
			} else {
				console.log(" Command to Philips TV, gives an error in response", error, response)
				// callback (error);
			}
		}
	);
};
// a helper method to get a device from the devices list by it's device_data object
function getDeviceByData( device_data ) {
    var device = devices[ device_data.id ];
    if( typeof device === 'undefined' ) {
        return new Error("invalid_device");
    } else {
        return device;
    }
}

// a helper method to add a device to the devices list
function initDevice( device_data ) {
    devices[ device_data.id ] = {};
    devices[ device_data.id ].state = { onoff: true };
    devices[ device_data.id ].data = device_data;
}
