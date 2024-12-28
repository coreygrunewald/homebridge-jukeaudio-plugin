"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JukeAudioHomebridgePlatform = void 0;
const settings_1 = require("./settings");
const zonePlatformAccessory_1 = require("./zonePlatformAccessory");
const jukeaudio_1 = require("./jukeaudio");
/**
 * JukeAudioPlatform
 * Parse user config and discover zones (which HomeBridge will treat as Speakers)
 */
class JukeAudioHomebridgePlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        // this is used to track restored cached accessories
        this.accessories = [];
        this.config = {
            ...config,
        };
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on('didFinishLaunching', () => {
            //log.debug('Executed didFinishLaunching callback');
            // run the method to discover / register your devices as accessories
            this.discoverDevices();
        });
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * Since the Speaker we are using is an "external" accessory there will not be anything cached.
     */
    configureAccessory(accessory) {
        // Do Nothing
        this.log.debug('restoring cached accessory: ' + accessory.displayName);
    }
    /**
     * Discover zone accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    discoverDevices() {
        const jukeAudio = new jukeaudio_1.JukeAudio(this.config.password, this.log);
        this.log.info("Discovering JukeAudio Zones...");
        this.log.debug("Existing accessory count: " + this.accessories.length);
        jukeAudio.getZones().then(zones => {
            // loop over the discovered devices and register each one if it has not already been registered
            for (const zone of zones) {
                this.log.debug("Configuring zone " + zone.name + " (" + zone.id + ")...");
                // generate a unique id for the accessory -- we use the zoneID
                const uuid = this.api.hap.uuid.generate(zone.id);
                // see if an accessory with the same uuid has already been registered
                const existingAccessory = this.accessories[uuid];
                // Add a new zone if not already registered
                if (!existingAccessory) {
                    this.addSmartSpeakerAccessory(zone, jukeAudio);
                    continue;
                }
                // the accessory already exists
                this.log.info('Restoring existing speaker accessory from cache:', existingAccessory.displayName);
                // update the accessory with the latest zone info and new reference to JukeAudio object
                existingAccessory.updateZoneAndJuke(zone, jukeAudio);
            }
        })
            .catch((err) => {
            this.log.error('failed to get zones from JukeAudio - ' + err);
        });
    }
    addSmartSpeakerAccessory(zone, jukeAudio) {
        this.log.debug("adding speaker: " + zone.name + " (" + zone.id + ")");
        const accessoryUUID = this.api.hap.uuid.generate(zone.id);
        // Add Zone as a Speaker (categoryID #26). There is some debate about the best way to specify
        // the speaker. Reference: https://github.com/homebridge/homebridge/issues/2553#issuecomment-623675893
        const accessory = new this.api.platformAccessory(zone.name, accessoryUUID, 26 /* this.api.hap.Categories.SPEAKER */);
        // accessory.category = 26; // Shouldn't be needed (see comment above)
        accessory.context.zone = zone;
        const pluginAccessory = new zonePlatformAccessory_1.ZonePlatformAccessory(this, accessory, zone, jukeAudio);
        this.accessories[accessory.UUID] = pluginAccessory;
        this.api.publishExternalAccessories(settings_1.PLUGIN_NAME, [accessory]);
        this.log.info('Zone Registered: ' + accessory.displayName + ' (' + zone.id + ')');
    }
}
exports.JukeAudioHomebridgePlatform = JukeAudioHomebridgePlatform;
//# sourceMappingURL=platform.js.map