# Homebridge Juke Audio Plugin

This Homebridge plugin controls Juke Audio Multi-Room Streaming Amplifiers. The Juke amplifiers allow wireless streaming from devices such as a phone to the amplifier. The amplifier then distributes the audio to a series of speakers.

The Juke Audio plugin creates an Apple Homekit Speaker for each amplifier speaker output (or set of outputs). This allows you to perform the following actions:
- Change the volume up or down
- Mute the volume

The initial intention of this plugin was to interface it with a low-cost Lutron Pico Smart Audio Remote (https://www.casetawireless.com/us/en/products/pico-remotes). Placing a Pico audio remote on the wall where speakers are located allows easy volume control of the speakers.  Otherwise, a phone, tablet or computer is required to set the volume.  The Lutron Pico has a HomeBridge plugin (Lutron Caseta LEAP) you can install (https://github.com/thenewwazoo/homebridge-lutron-caseta-leap#readme) and configure to control the Juke.

## Tracked Objects

### Inputs
Input IDs are obtained by calling https://juke.local/api/v1/inputs/
  
#### Output Example
`
{
  "input_ids": [
    "1",
    "2",
    "3",
    "4"
  ]
}
`

Get the configuration for each input by calling https://juke.local/api/v1/inputs/{input_id}
`
{
  "input_id": "2",
  "name": "Juke-C",
  "type": "Airplay",
  "volume": 50
}
`

### Zones
Zone IDs are obtained by calling https://juke.local/api/v1/zones/

#### Output Example
`
{
  "zone_ids": [
    "8D4F75-607-Z0",
    "8D4F75-607-Z1",
    "8D4F75-607-Z2",
    "8D4F75-607-Z3",
    "8D4F75-607-Z4",
    "8D4F75-607-Z5",
    "8D4F75-607-Z6",
    "8D4F75-607-Z7"
  ]
}
`

Set the Zone Volume by calling https://juke.local/api/v1/zones/{zone_id}/volume (0-100)

Set the Zone Input by calling https://juke.local/api/v1/zones/{zone_id}/input 

Get the Zone Configuration by calling https://juke.local/api/v1/zones/{zone_id}
`
{
  "input": [
    "1"
  ],
  "name": "Patio",
  "volume": 90,
  "zone_id": "8D4F75-607-Z0"
}
`
