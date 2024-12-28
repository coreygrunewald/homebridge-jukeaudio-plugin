import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { JukeAudio, Zone } from './jukeaudio';
/**
 * JukeAudioPlatform
 * Parse user config and discover zones (which HomeBridge will treat as Speakers)
 */
export declare class JukeAudioHomebridgePlatform implements DynamicPlatformPlugin {
    readonly log: Logger;
    readonly config: PlatformConfig;
    readonly api: API;
    readonly Service: typeof Service;
    readonly Characteristic: typeof Characteristic;
    readonly accessories: PlatformAccessory[];
    constructor(log: Logger, config: PlatformConfig, api: API);
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * Since the Speaker we are using is an "external" accessory there will not be anything cached.
     */
    configureAccessory(accessory: PlatformAccessory): void;
    /**
     * Discover zone accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    discoverDevices(): void;
    addSmartSpeakerAccessory(zone: Zone, jukeAudio: JukeAudio): void;
}
//# sourceMappingURL=platform.d.ts.map