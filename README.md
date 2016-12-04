# Philips TV - Jointspace API control app for Athom Homey

This app lets you control a Philips TV with Jointspace API from within flows on a Homey device (by Athom).

Used the http request module from Erik van Dongen from his HTTP request flow chart app.

To use this API your philips TV should get a fixed IP adress from your DHCP server 
or else you will loose connection with your Philips TV.

To check if your philips TV support the Jointspace API you can check in the browser with
http://tv-ip-adress:1925

It responds with a link to the API reference like http://tv-ip-adress:1925/tv-device-nr/doc/API.html
Both the tv-ip-adress and tv-device-nr are needed to pair your tv.

REMARK: TV on standby doesn't have the Jointspace API available, so after the Standby command TV can't be reached anymore.

For Jointspace API reference look at: http://jointspace.sourceforge.net/projectdata/documentation/jasonApi/1/doc/API.html

This app supports

### Action cards
Set a TV channel
Set the volume
Set a TV source
Send a input key 
Mute the TV
UnMute the TV
Put the TV on Standby

**Version 0.5.0:**
- Rewrite according to updated developers documentation at Athom
- Added settings for IP-adress and Device Nr so it can be changed afterwards
- Added Action Card for sending input keys
- Bugfix: fixed the pairing problem and enter the IP-adress and Device Nr

**Version 0.1.0:**
- Initial version
