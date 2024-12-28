import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { JukeAudioHomebridgePlatform } from './platform';
import { JukeAudio, Zone } from './jukeaudio';
/**
 * Juke Audio Accessory (Speaker)
 */
export declare class ZonePlatformAccessory {
    private readonly platform;
    private readonly accessory;
    private service;
    private zone;
    private jukeAudio;
    private zoneState;
    constructor(platform: JukeAudioHomebridgePlatform, accessory: PlatformAccessory, zone: Zone, jukeAudio: JukeAudio);
    updateZoneAndJuke(zone: Zone, jukeAudio: JukeAudio): void;
    /**
     * Handle "SET" requests from HomeKit
     * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
     */
    setMuted(value: CharacteristicValue): Promise<void>;
    getMuted(): Promise<CharacteristicValue>;
    setVolume(value: CharacteristicValue): Promise<void>;
    setZoneVolume(requestedVolume: number, currentVolume: number): Promise<void>;
    getVolume(): Promise<CharacteristicValue>;
    handleCurrentMediaStateGet(): number;
    handleTargetMediaStateGet(): number;
    /**
     * Handle requests to set the "Target Media State" characteristic.  Since Juke Audio Zones
       don't actually support media state changes we will ignore the change request
     */
    handleTargetMediaStateSet(value: CharacteristicValue): void;
    getFirmwareVersion(deviceID: string): string;
}
//# sourceMappingURL=zonePlatformAccessory.d.ts.map