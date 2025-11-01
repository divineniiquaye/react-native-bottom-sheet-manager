import {
    DeviceEventEmitter,
    NativeAppEventEmitter,
    NativeEventEmitter,
    Platform,
} from "react-native";

/* eslint-disable curly */
export type EventHandler = (...args: any[]) => void;
export type EventHandlerSubscription = {
    unsubscribe: () => void;
};

export default class EventManager {
    _registry?: NativeEventEmitter;
    constructor() {
        this._registry = Platform.select({
            ios: NativeAppEventEmitter,
            android: DeviceEventEmitter,
        });
    }

    subscribe(name: string, handler: EventHandler) {
        if (!name || !handler) throw new Error("name and handler are required.");
        const event = this._registry?.addListener(name, handler);
        return { unsubscribe: () => event?.remove() };
    }

    publish(name: string, ...args: any[]) {
        this._registry?.emit(name, ...args);
    }

    remove(...names: string[]) {
        for (const eventType of names) {
            this._registry?.removeAllListeners(eventType);
        }
    }
}

export const eventManager = new EventManager();
