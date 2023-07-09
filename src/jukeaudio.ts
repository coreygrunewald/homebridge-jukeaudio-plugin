
import { Logger } from 'homebridge';
import fetch from 'node-fetch';

export class JukeAudio {
    authHeader: string;
    log: Logger;

    constructor(password: string, log: Logger) {
        if (password == '') {
            log.info('No Juke password was provided...using Juke default password');
            password = "Admin";
        }

        const bufferObj = Buffer.from("Admin:" + password, "utf8");
        this.authHeader = "Basic " + bufferObj.toString('base64');
        this.log = log;
        log.debug("Created reference to JukeAudio")
    }

    /**
     * Retrieves a list of Juke Audio IDs corresponding to each available Input
     * @return {InputIDs} List of all input ID
     */
    async getInputIDs(): Promise<InputIDs> {
        const url = 'http://juke.local/api/v2/inputs/';
        this.log.debug("[GET] => ", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'accept': 'application/json',
            'authorization': this.authHeader
            },}
        )

        const data = await response.json();
        return data as InputIDs;
    }

    /**
     * Retrieve the configuration for a Juke Audio input
     * @param  {String} id The ID of the input to retrieve configuration for
     * @return {InputConfig} The configuration for the input
     */
    async getInputConfig(id: string): Promise<InputConfig> {
        const url = 'http://juke.local/api/v2/inputs/' + id;
        this.log.debug("[GET] => ", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'accept': 'application/json',
            'authorization': this.authHeader
            },}
        )
        
        const data = await response.json();
        return data as InputConfig;
    }

    /**
     * Retrieves all Juke Audio inputs
     * @return {Input[]} List of all inputs and their properties
     */
    async getInputs(): Promise<Input[]> {
        const url = 'http://juke.local/get_inputs.php';
        this.log.debug("[GET] => ", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'accept': 'application/json',
            'authorization': this.authHeader
            },}
        )
        
        const data = await response.json();
        return data as Input[];
    }

    /**
     * Retrieves all Juke Audio zones
     * @return {Zone[]} List of all zones and their properties
     */
    async getZones(): Promise<Zone[]> {
        const url = 'http://juke.local/get_zones.php';
        this.log.debug("[GET] => ", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'accept': 'application/json',
            'authorization': this.authHeader
            },}
        )
        
        const data = await response.json();
        const zones = data as Zone[]

        // Create the zone id since it isn't explicity returned from the server
        for (let _i = 0; _i < zones.length; _i++) {
            zones[_i].id = zones[_i].device_id + '-Z' + + zones[_i].index 
        }

        this.log.debug("Retrieved " + zones.length + " zones from Juke server");

        return zones;
    }

    /**
     * Retrieve the configuration for a Juke Audio zone
     * @param  {String} id The ID of the zone to retrieve configuration for
     * @return {ZoneConfiguration} The configuration for the zone
     */
    async getZoneConfig(id: string): Promise<ZoneConfiguration> {
        const url = 'http://juke.local/api/v2/zones/' + id;
        this.log.debug("[GET] => ", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'accept': 'application/json',
            'authorization': this.authHeader
            },}
        )
        
        const data = await response.json();
        return data as ZoneConfiguration;
    }

    /**
     * Retrieves the device ID of the server
     * @return {String} The ID of the device
     */
    async getServerDeviceID(): Promise<string> {
        const url = 'http://juke.local/api/v2/devices/server';
        this.log.debug("[GET] => ", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'accept': 'application/json',
            'authorization': this.authHeader
            },}
        )
        
        const data = await response.json();
        const deviceIDs = data as DeviceIDs

        if (deviceIDs.device_ids.length > 0) {
            return deviceIDs.device_ids[0];
        }


        return "";
    }

    /**
     * Retrieve attributes for a Juke Audio device
     * @param  {String} deviceID The ID of the device to retrieve attributes for
     * @return {DeviceAttributes} The attributes of the device
     */
    async getDeviceAttributes(deviceID: string): Promise<DeviceAttributes> {
        const url = 'http://juke.local/api/v2/devices/' + deviceID + '/attributes';
        this.log.debug("[GET] => ", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'accept': 'application/json',
            'authorization': this.authHeader
            },}
        )
        
        const data = await response.json();        
        return data as DeviceAttributes;
    }

    /**
     * Sets the volume for a Juke Audio zone
     * @param  {String} zoneID The ID of the zone to set the volume for
     * @param  {Number} volume The level (0-100) to set the volume to
     */
    async setZoneVolume(zoneID: string, volume: number) {
        const url = 'http://juke.local/api/v2/zones/' + zoneID + '/volume';
        this.log.debug("[PUT] => ", url);
        const body = 'volume=' + volume.toString();

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
            'accept': 'application/json',
            'authorization': this.authHeader,
            'content-type': 'application/x-www-form-urlencoded',
            },
            body: body
          }
        )
        
        const data = await response;
        this.log.debug(data);

        return ""
    }
}

export interface Zone {
    id: string,
    index: number,
    name: string,
    source: number,
    percent_volume: number,
    master_enabled: number,
    sources: number[],
    device_id: string
}

export interface DeviceIDs {
    device_ids: string[]
}

export interface DeviceAttributes {
    adapter1_mac: string,
    adapter2_mac: string,
    device_id: string,
    eth_mac: string,
    firmware_version: string,
    serial_number: string,
    wlan_mac: string
}

export interface Input {
    name: string,
    type: string,
    volume: string
}

export interface InputIDs {
    input_ids: string[]
}

export interface InputConfig {
    input_id: string,
    name: string,
    type: string,
    volume: number
}

export interface ZoneConfiguration {
    input: string[],
    name: string,
    volume: number,
    zone_id: string
}