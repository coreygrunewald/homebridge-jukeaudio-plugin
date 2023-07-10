import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { JukeAudioHomebridgePlatform } from './platform';
import { JukeAudio, Zone } from './jukeaudio';

interface ZoneState {
  status: CharacteristicValue,
  lastMutedVolume: number
}

/**
 * Juke Audio Accessory (Speaker)
 */
export class ZonePlatformAccessory {
  private service: Service;
  private zone: Zone;
  private jukeAudio: JukeAudio;
  private zoneState: ZoneState;

  constructor(
    private readonly platform: JukeAudioHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    zone: Zone,
    jukeAudio: JukeAudio
  ) {
    // set the zone configuration
    this.zone = zone;
    this.jukeAudio = jukeAudio;

    this.zoneState = {
      status: this.platform.Characteristic.CurrentMediaState.PLAY,
      lastMutedVolume: 10
    };

    // set accessory information
    const svc = this.accessory.getService(this.platform.Service.AccessoryInformation);
    if (svc) {
      svc.setCharacteristic(this.platform.Characteristic.Manufacturer, 'Juke Audio')
      svc.setCharacteristic(this.platform.Characteristic.Model, 'Juke-Zone')
      svc.setCharacteristic(this.platform.Characteristic.FirmwareRevision, this.getFirmwareVersion(zone.device_id))
      svc.setCharacteristic(this.platform.Characteristic.SerialNumber, zone.id);
    }

    // Get the Speaker service if it exists, otherwise create a new Speaker service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.SmartSpeaker) || this.accessory.addService(this.platform.Service.SmartSpeaker);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method
    this.platform.log.info("Registering Zone: ", zone.name + "...");
    this.service.setCharacteristic(this.platform.Characteristic.Name, zone.name);

    // Name for the speaker
    this.service.setCharacteristic(this.platform.Characteristic.ConfiguredName, this.accessory.displayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Speaker

    // register handlers for the Current Media State Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentMediaState)
      .onGet(this.handleCurrentMediaStateGet.bind(this));

    // register handlers for the Target Media State Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.TargetMediaState)
      .onGet(this.handleTargetMediaStateGet.bind(this))
      .onSet(this.handleTargetMediaStateSet.bind(this));

    // register handlers for the Mute Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Mute)
      .onSet(this.setMuted.bind(this))
      .onGet(this.getMuted.bind(this));

    // register handlers for the Volume Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Volume)
      .onSet(this.setVolume.bind(this))
      .onGet(this.getVolume.bind(this));
  }

  public updateZoneAndJuke(zone: Zone, jukeAudio: JukeAudio): void {
    this.jukeAudio = jukeAudio;

    // Update the zone name if it changed
    if (this.zone.name != zone.name) {
      this.accessory.displayName = zone.name;
      this.service.getCharacteristic(this.platform.Characteristic.ConfiguredName).updateValue(this.accessory.displayName);
      this.platform.log.info('Updated display name for Zone (' + zone.id + ') to ', zone.name);
    }

    if (zone.percent_volume > 0) {
      this.zoneState.lastMutedVolume = zone.percent_volume;
    }
  }
  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setMuted(value: CharacteristicValue) {
      this.jukeAudio.getZoneConfig(this.zone.id)
      .then(config => {
        let desiredVolume = 0;

        if (value as boolean) {
          this.zoneState.lastMutedVolume = config.volume;
          desiredVolume = 0;
        } else {
          desiredVolume = this.zoneState.lastMutedVolume;

          if (desiredVolume == 0) {
            desiredVolume = 10;
          }
        }

        this.jukeAudio.setZoneVolume(this.zone.id, desiredVolume);
      })

    this.platform.log.debug('Set Muted for ' + this.zone.name + ' ->', value, 'LastMutedVolume ->'), this.zoneState.lastMutedVolume;
  }

  async getMuted(): Promise<CharacteristicValue> {
    this.jukeAudio.getZoneConfig(this.zone.id)
    .then(config => {
      let isMuted = false;

      if (config.volume == 0) {
        isMuted = true;
      }

      this.platform.log.info('Get Muted for ' + this.zone.name + ' ->', isMuted, 'LastMutedVolume ->'), this.zoneState.lastMutedVolume;
    })

    return false;
  }

  async setVolume(value: CharacteristicValue) {
    this.jukeAudio.getZoneConfig(this.zone.id)
    .then(config => {
      // If the volume is 100 then we'll treat this as a Pico Volume-Up request and if its 0 we'll
      // treat as a Pic Volume-Down request. Otherwise, let the volume bet set to the desired value.
      const requestedVolume = value as number;
      let desiredVolume = requestedVolume;

      this.platform.log.info("current volume: " + config.volume);
      
      switch (requestedVolume) {
        case 100:
          desiredVolume = config.volume + 10;
          break;
        case 0:
          desiredVolume = config.volume - 10;
          break;
      }

      this.platform.log.info("desired volume: " + desiredVolume);

      if (desiredVolume > 100) {
        desiredVolume = 100
      }

      if (desiredVolume < 0) {
        desiredVolume = 0;
      }

      this.jukeAudio.setZoneVolume(this.zone.id, desiredVolume);
      this.platform.log.info('Set Volume for ' + this.zone.name + ' ->', value);
    })
  }

  async getVolume(): Promise<CharacteristicValue> {
    let volume = 0;
    this.jukeAudio.getZoneConfig(this.zone.id)
      .then(config => {
        this.platform.log.info('Get Volume for ' + this.zone.name + ' ->', config.volume);
        volume = config.volume;
      })
      .finally(() => { return volume } ) 

      return volume;
  }

  handleCurrentMediaStateGet() {
    this.platform.log.debug('Triggered GET CurrentMediaState');

    // set this to a valid value for CurrentMediaState. Since Juke Audio Zones
    // don't actually support media state changes we will always set state to PLAY
    const currentValue = this.platform.Characteristic.CurrentMediaState.PLAY;

    return currentValue;
  }

  handleTargetMediaStateGet() {
    this.platform.log.debug('Triggered GET TargetMediaState');

    // set this to a valid value for TargetMediaState.  Since Juke Audio Zones
    // don't actually support media state changes we will always set state to PLAY
    const currentValue = this.platform.Characteristic.TargetMediaState.PLAY;

    return currentValue;
  }

  /**
   * Handle requests to set the "Target Media State" characteristic.  Since Juke Audio Zones
     don't actually support media state changes we will ignore the change request
   */
  handleTargetMediaStateSet(value: CharacteristicValue) {
    this.platform.log.debug('Triggered SET TargetMediaState:', value.toString);
  }

  getFirmwareVersion(deviceID: string) {
    let version = "1.0";
    this.jukeAudio.getDeviceAttributes(deviceID)
    .then(attributes => {
      version = attributes.firmware_version;
    })
    .finally(() => { return version } ) 

    return version
  }

}
