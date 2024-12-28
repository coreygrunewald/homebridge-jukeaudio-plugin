"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JukeAudio = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class JukeAudio {
    constructor(password, log) {
        if (password == '') {
            log.info('No Juke password was provided...using Juke default password');
            password = "Admin";
        }
        const bufferObj = Buffer.from("Admin:" + password, "utf8");
        this.authHeader = "Basic " + bufferObj.toString('base64');
        this.log = log;
        log.debug("Created reference to JukeAudio");
    }
    /**
     * Retrieves a list of Juke Audio IDs corresponding to each available Input
     * @return {InputIDs} List of all input ID
     */
    async getInputIDs() {
        const url = 'http://juke.local/api/v2/inputs/';
        this.log.debug("[GET] => ", url);
        const response = await (0, node_fetch_1.default)(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'authorization': this.authHeader
            },
        });
        const data = await response.json();
        return data;
    }
    /**
     * Retrieve the configuration for a Juke Audio input
     * @param  {String} id The ID of the input to retrieve configuration for
     * @return {InputConfig} The configuration for the input
     */
    async getInputConfig(id) {
        const url = 'http://juke.local/api/v2/inputs/' + id;
        this.log.debug("[GET] => ", url);
        const response = await (0, node_fetch_1.default)(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'authorization': this.authHeader
            },
        });
        const data = await response.json();
        return data;
    }
    /**
     * Retrieves all Juke Audio inputs
     * @return {Input[]} List of all inputs and their properties
     */
    async getInputs() {
        const url = 'http://juke.local/get_inputs.php';
        this.log.debug("[GET] => ", url);
        const response = await (0, node_fetch_1.default)(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'authorization': this.authHeader
            },
        });
        const data = await response.json();
        return data;
    }
    /**
     * Retrieves all Juke Audio zones
     * @return {Zone[]} List of all zones and their properties
     */
    async getZones() {
        const url = 'http://juke.local/get_zones.php';
        this.log.debug("[GET] => ", url);
        const response = await (0, node_fetch_1.default)(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'authorization': this.authHeader
            },
        });
        const data = await response.json();
        const zones = data;
        // Create the zone id since it isn't explicity returned from the server
        for (let _i = 0; _i < zones.length; _i++) {
            zones[_i].id = zones[_i].device_id + '-Z' + +zones[_i].index;
        }
        this.log.debug("Retrieved " + zones.length + " zones from Juke server");
        return zones;
    }
    /**
     * Retrieve the configuration for a Juke Audio zone
     * @param  {String} id The ID of the zone to retrieve configuration for
     * @return {ZoneConfiguration} The configuration for the zone
     */
    async getZoneConfig(id) {
        const url = 'http://juke.local/api/v2/zones/' + id;
        this.log.debug("[GET] => ", url);
        const response = await (0, node_fetch_1.default)(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'authorization': this.authHeader
            },
        });
        const data = await response.json();
        return data;
    }
    /**
     * Retrieves the device ID of the server
     * @return {String} The ID of the device
     */
    async getServerDeviceID() {
        const url = 'http://juke.local/api/v2/devices/server';
        this.log.debug("[GET] => ", url);
        const response = await (0, node_fetch_1.default)(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'authorization': this.authHeader
            },
        });
        const data = await response.json();
        const deviceIDs = data;
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
    async getDeviceAttributes(deviceID) {
        const url = 'http://juke.local/api/v2/devices/' + deviceID + '/attributes';
        this.log.debug("[GET] => ", url);
        const response = await (0, node_fetch_1.default)(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'authorization': this.authHeader
            },
        });
        const data = await response.json();
        return data;
    }
    /**
     * Sets the volume for a Juke Audio zone
     * @param  {String} zoneID The ID of the zone to set the volume for
     * @param  {Number} volume The level (0-100) to set the volume to
     */
    async setZoneVolume(zoneID, volume) {
        // There is a bug in the v2.0 version of the API that has an off-by-one
        // error. Therefore if you are trying to set the volume for a zone you 
        // actually need to set the zone below it.
        const correctedZoneID = this.getOffByOneZoneCorrection(zoneID);
        const url = 'http://juke.local/api/v2/zones/' + correctedZoneID + '/volume';
        this.log.debug("[PUT] => ", url);
        const body = 'volume=' + volume.toString();
        const response = await (0, node_fetch_1.default)(url, {
            method: 'PUT',
            headers: {
                'accept': 'application/json',
                'authorization': this.authHeader,
                'content-type': 'application/x-www-form-urlencoded',
            },
            body: body
        });
        const data = await response;
        this.log.debug(data);
        return "";
    }
    // Seemingly newever versions of the Juke API / Firmware don't have
    // this problem
    getOffByOneZoneCorrection(zoneID) {
        // // 8D4F75-607-Z3
        //const zoneNumStr = zoneID.slice(-1);
        //const zoneNum: number = +zoneNumStr;
        //return zoneID.substring(0, zoneID.length - 1) + (zoneNum - 1);
        return zoneID;
    }
}
exports.JukeAudio = JukeAudio;
//# sourceMappingURL=jukeaudio.js.map