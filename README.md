# Homebridge Juke Audio Plugin

IMPORTANT: THIS IS AN UNRELEASED BETA VERSION OF THIS PLUGIN. USE AT YOUR OWN RISK!

This Homebridge plugin controls Juke Audio Multi-Room Streaming Amplifiers (https://jukeaudio.com/). The Juke amplifiers allow wireless streaming from devices such as a phone to the amplifier. The amplifier then distributes the audio to a series of speakers.

The Juke Audio plugin creates an Apple Homekit "Speaker" for each amplifier zone. This allows you to perform the following actions:
- Change the volume up or down
- Mute the volume
- Change zone (i.e., speaker) source

Note that because there is not a direct correllation between Jukes features and an Apple Homekit Speaker, not all functionality is supported. For example, it is not possible to pause/play an audio source.

The initial intention of this plugin was to interface it with a low-cost Lutron Pico Smart Audio Remote (https://www.casetawireless.com/us/en/products/pico-remotes). Placing a Pico audio remote on the wall where speakers are located allows easy volume control of the speakers.  Otherwise, a phone, tablet or computer is required to set the volume.  The Lutron Pico has a HomeBridge plugin (Lutron Caseta LEAP) you can install (https://github.com/thenewwazoo/homebridge-lutron-caseta-leap#readme) and configure to control the Juke.

## Installation & Plugin Configuration
Install the plugin as you would any other Homebridge plugin.

Use the following configuration:
`
        {
            "name": "Juke",
            "platform": "JukeAudioPlugin",
            "password": "Admin"
        }
`

Juke publishes it's local device name on the network as 'juke.local' so it should find the device automatically. Specify the password (Jukes default password is 'Admin'). Keep the 'name' and 'platform' values the same as shown above.

After you change the configuration, restart Homebridge.

## Apple Homekit Configuration
Apple treats Homekit Speakers differently than most other devices and as a result there are some additional steps that must be done in order for them to appear in Homekit.

Go to the Homebridge 'Status' page and inspect the log output. You should see something like the following for each Juke Zone you have. Take note of the 'Setup Code' referenced for each of the Speaker Zones.

`
[7/8/2023, 11:20:52 AM] [Juke] Registering Zone:  Patio...
[7/8/2023, 11:20:52 AM] [Juke] Zone Registered: Patio (8D4F75-607-Z0)
[7/8/2023, 11:20:52 AM] [Juke] Registering Zone:  Upstairs Hall...
[7/8/2023, 11:20:52 AM] [Juke] Zone Registered: Upstairs Hall (8D4F75-607-Z1)
[7/8/2023, 11:20:52 AM] [Juke] Registering Zone:  Living Room...
[7/8/2023, 11:20:52 AM] [Juke] Zone Registered: Living Room (8D4F75-607-Z2)
[7/8/2023, 11:20:52 AM] Patio DFBA is running on port 49490.
[7/8/2023, 11:20:52 AM] Please add [Patio DFBA] manually in Home app. Setup Code: 407-54-639
[7/8/2023, 11:20:52 AM] Upstairs Hall A642 is running on port 49491.
[7/8/2023, 11:20:52 AM] Please add [Upstairs Hall A642] manually in Home app. Setup Code: 407-54-639
[7/8/2023, 11:20:52 AM] Living Room 1463 is running on port 49492.
[7/8/2023, 11:20:52 AM] Please add [Living Room 1463] manually in Home app. Setup Code: 407-54-639
`

### Add Speaker in the Home App
1. Open the Home App on your phone
2. Choose the '+' button at the top and choose 'Add Accessory'
3. Choose the 'More options...' link
4. If the accessory is listed then select it, otherwise choose the button that says "My Accessory Isn't Shown Here"
5. Choose the option for "Enter Code" manually
6. Enter the Setup Code that was listed in the Homebridge logs
7. Complete the setup for the speaker zone
8. Repeat the process for each Speaker zone
