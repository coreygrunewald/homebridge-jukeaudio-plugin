import { Logger } from 'homebridge';
export declare class JukeAudio {
    authHeader: string;
    log: Logger;
    constructor(password: string, log: Logger);
    /**
     * Retrieves a list of Juke Audio IDs corresponding to each available Input
     * @return {InputIDs} List of all input ID
     */
    getInputIDs(): Promise<InputIDs>;
    /**
     * Retrieve the configuration for a Juke Audio input
     * @param  {String} id The ID of the input to retrieve configuration for
     * @return {InputConfig} The configuration for the input
     */
    getInputConfig(id: string): Promise<InputConfig>;
    /**
     * Retrieves all Juke Audio inputs
     * @return {Input[]} List of all inputs and their properties
     */
    getInputs(): Promise<Input[]>;
    /**
     * Retrieves all Juke Audio zones
     * @return {Zone[]} List of all zones and their properties
     */
    getZones(): Promise<Zone[]>;
    /**
     * Retrieve the configuration for a Juke Audio zone
     * @param  {String} id The ID of the zone to retrieve configuration for
     * @return {ZoneConfiguration} The configuration for the zone
     */
    getZoneConfig(id: string): Promise<ZoneConfiguration>;
    /**
     * Retrieves the device ID of the server
     * @return {String} The ID of the device
     */
    getServerDeviceID(): Promise<string>;
    /**
     * Retrieve attributes for a Juke Audio device
     * @param  {String} deviceID The ID of the device to retrieve attributes for
     * @return {DeviceAttributes} The attributes of the device
     */
    getDeviceAttributes(deviceID: string): Promise<DeviceAttributes>;
    /**
     * Sets the volume for a Juke Audio zone
     * @param  {String} zoneID The ID of the zone to set the volume for
     * @param  {Number} volume The level (0-100) to set the volume to
     */
    setZoneVolume(zoneID: string, volume: number): Promise<string>;
    getOffByOneZoneCorrection(zoneID: string): string;
}
export interface Zone {
    id: string;
    index: number;
    name: string;
    source: number;
    percent_volume: number;
    master_enabled: number;
    sources: number[];
    device_id: string;
}
export interface DeviceIDs {
    device_ids: string[];
}
export interface DeviceAttributes {
    adapter1_mac: string;
    adapter2_mac: string;
    device_id: string;
    eth_mac: string;
    firmware_version: string;
    serial_number: string;
    wlan_mac: string;
}
export interface Input {
    name: string;
    type: string;
    volume: string;
}
export interface InputIDs {
    input_ids: string[];
}
export interface InputConfig {
    input_id: string;
    name: string;
    type: string;
    volume: number;
}
export interface ZoneConfiguration {
    input: string[];
    name: string;
    volume: number;
    zone_id: string;
}
//# sourceMappingURL=jukeaudio.d.ts.map