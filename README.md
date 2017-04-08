# btAPS

The very early start of a bluetooth serial based control interface for OpenAPS


# Setup

On your edison, first follow the instructions for setting up bluetooth teathering to you phone. This will get your phone paired (and also enable the ability to teather -- something we may still want in the future.)

First, clone this repo:

`cd ~/ && git clone https://github.com/applehat/btaps.git`

Next, make sure to install any dependencies:

`sudo apt-get install build-essential libbluetooth-dev`

Then, install nodejs dependencies

`npm install`

Then run it

`npm start`

.... and then you don't really have anything but a serial interface that returns back what you sent it.

You can use an app like Serial Bluetooth Terminal to test it.

https://play.google.com/store/apps/details?id=de.kai_morich.serial_bluetooth_terminal&hl=en

More soon.