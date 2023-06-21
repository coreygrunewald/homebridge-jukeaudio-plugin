import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { JukeAudioHomebridgePlatform } from './platform';
import { JukeAudio, Zone } from './jukeaudio';
import { PLUGIN_NAME } from './settings';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ZonePlatformAccessory {
  private service: Service;
  private zone: Zone;
  private jukeAudio: JukeAudio;
  private lastMutedVolume: number
  /**
   * These are just used to keep track of the current state of the accessory
   */
  // private accessoryStates = {
  //   isMuted: false,
  //   Volume: 10,
  //   isActive: true
  // };

  constructor(
    private readonly platform: JukeAudioHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    zone: Zone,
    jukeAudio: JukeAudio
  ) {
    // set the zone configuration
    this.zone = zone;
    this.jukeAudio = jukeAudio;
    this.lastMutedVolume = 10;

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Juke Audio')
      .setCharacteristic(this.platform.Characteristic.Model, 'Juke-Zone')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, zone.id);

    // Get the Speaker service if it exists, otherwise create a new Speaker service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.TelevisionSpeaker) || this.accessory.addService(this.platform.Service.TelevisionSpeaker);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.platform.log.info("device name: ", accessory.context.device.name)
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Speaker

    // // register handlers for the Current Media State Characteristic
    // this.service.getCharacteristic(this.platform.Characteristic.CurrentMediaState)
    //   .onGet(this.handleCurrentMediaStateGet.bind(this));

    // // register handlers for the Target Media State Characteristic
    // this.service.getCharacteristic(this.platform.Characteristic.TargetMediaState)
    //   .onGet(this.handleTargetMediaStateGet.bind(this))
    //   .onSet(this.handleTargetMediaStateSet.bind(this));

    // register handlers for the Mute Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Mute)
      .onSet(this.setMuted.bind(this))                // SET - bind to the `setMuted` method below
      .onGet(this.getMuted.bind(this));               // GET - bind to the `getMuted` method below

    // register handlers for the Volume Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Volume)
      .onSet(this.setVolume.bind(this))
      .onGet(this.getVolume.bind(this));

    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    // Example: add two "motion sensor" services to the accessory
    // const motionSensorOneService = this.accessory.getService('Motion Sensor One Name') ||
    //   this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor One Name', 'YourUniqueIdentifier-1');

    // const motionSensorTwoService = this.accessory.getService('Motion Sensor Two Name') ||
    //   this.accessory.addService(this.platform.Service.MotionSensor, 'Motion Sensor Two Name', 'YourUniqueIdentifier-2');

    /**
     * Updating characteristics values asynchronously.
     *
     * Example showing how to update the state of a Characteristic asynchronously instead
     * of using the `on('get')` handlers.
     * Here we change update the motion sensor trigger states on and off every 10 seconds
     * the `updateCharacteristic` method.
     *
     */
    // let motionDetected = false;
    // setInterval(() => {
    //   // EXAMPLE - inverse the trigger
    //   motionDetected = !motionDetected;

    //   // push the new value to HomeKit
    //   motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, motionDetected);
    //   motionSensorTwoService.updateCharacteristic(this.platform.Characteristic.MotionDetected, !motionDetected);

    //   this.platform.log.debug('Triggering motionSensorOneService:', motionDetected);
    //   this.platform.log.debug('Triggering motionSensorTwoService:', !motionDetected);
    // }, 10000);
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
          this.lastMutedVolume = config.volume;
          desiredVolume = 0;
        } else {
          desiredVolume = this.lastMutedVolume;

          if (desiredVolume == 0) {
            desiredVolume = 10;
          }
        }

        this.jukeAudio.setZoneVolume(this.zone.id, desiredVolume);
      })

    this.platform.log.debug('Set Characteristic Muted ->', value, 'LastMutedVolume ->'), this.lastMutedVolume;
  }

  async getMuted(): Promise<CharacteristicValue> {
    this.jukeAudio.getZoneConfig(this.zone.id)
    .then(config => {
      let isMuted = false;

      if (config.volume == 0) {
        isMuted = true;
      }

      this.platform.log.debug('Get Characteristic Muted ->', isMuted, 'LastMutedVolume ->'), this.lastMutedVolume;
    })

    return false;
  }

  async setVolume(value: CharacteristicValue) {
    this.jukeAudio.setZoneVolume(this.zone.id, value as number);

    this.platform.log.debug('Set Characteristic Volume ->', value);
  }

  async getVolume(): Promise<CharacteristicValue> {
    let volume = 0;
    this.jukeAudio.getZoneConfig(this.zone.id)
      .then(config => {
        this.platform.log.debug('Get Characteristic Volume ->', config.volume);
        volume = config.volume;
      })
      .finally(() => { return volume } ) 

      return volume;
  }

  handleCurrentMediaStateGet() {
    this.platform.log.debug('Triggered GET CurrentMediaState');

    // set this to a valid value for CurrentMediaState
    const currentValue = this.platform.Characteristic.CurrentMediaState.PLAY;

    return currentValue;
  }

  handleTargetMediaStateGet() {
    this.platform.log.debug('Triggered GET TargetMediaState');

    // set this to a valid value for TargetMediaState
    const currentValue = this.platform.Characteristic.TargetMediaState.PLAY;

    return currentValue;
  }

  /**
   * Handle requests to set the "Target Media State" characteristic
   */
  handleTargetMediaStateSet(value: any) {
    this.platform.log.debug('Triggered SET TargetMediaState:', value);
  }

  // /**
  //  * Handle the "GET" requests from HomeKit
  //  * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
  //  *
  //  * GET requests should return as fast as possbile. A long delay here will result in
  //  * HomeKit being unresponsive and a bad user experience in general.
  //  *
  //  * If your device takes time to respond you should update the status of your device
  //  * asynchronously instead using the `updateCharacteristic` method instead.

  //  * @example
  //  * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
  //  */
  // async getOn(): Promise<CharacteristicValue> {
  //   // implement your own code to check if the device is on
  //   const isOn = this.exampleStates.On;

  //   this.platform.log.debug('Get Characteristic On ->', isOn);

  //   // if you need to return an error to show the device as "Not Responding" in the Home app:
  //   // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

  //   return isOn;
  // }



  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  // async setBrightness(value: CharacteristicValue) {
  //   // implement your own code to set the brightness
  //   this.exampleStates.Brightness = value as number;

  //   this.platform.log.debug('Set Characteristic Brightness -> ', value);
  // }

}
