# Philips TV - Jointspace API control app for Athom Homey

This app lets you control a Philips TV with Jointspace API from within flows on a Homey device (by Athom).

Used the http request module from Erik van Dongen from his HTTP request flow chart app.

To use this API your philips TV should get a fixed IP adress from your DHCP server 
or else you will loose connection with your Philips TV.

To check if your philips TV support the Jointspace API you can check in the browser with
http://tv-ip-adress:1925

This app supports

### Action cards
Set a TV channel
Set the volume
Set a TV source
Mute the TV
UnMute the TV
Put the TV on Standby

