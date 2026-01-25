describe("EventManager", () => {
    const mockModule = (platform: "ios" | "android") => {
        const listener = { remove: jest.fn() };
        const emitter = {
            addListener: jest.fn().mockReturnValue(listener),
            emit: jest.fn(),
            removeAllListeners: jest.fn(),
        };

        jest.doMock("react-native", () => ({
            Platform: { select: (options: any) => options[platform] },
            NativeAppEventEmitter: emitter,
            DeviceEventEmitter: emitter,
            NativeEventEmitter: jest.fn(),
        }));

        return { emitter, listener };
    };

    const loadEventManager = (platform: "ios" | "android") => {
        jest.resetModules();
        const { emitter, listener } = mockModule(platform);

        const module = require("../events") as typeof import("../events");

        return { ...module, emitter, listener };
    };

    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    it("selects the appropriate emitter based on the platform", () => {
        const ios = loadEventManager("ios");
        const handler = jest.fn();

        const subscription = ios.eventManager.subscribe("event", handler);
        expect(ios.emitter.addListener).toHaveBeenCalledWith("event", handler);

        subscription.unsubscribe();
        expect(ios.listener.remove).toHaveBeenCalled();

        ios.eventManager.publish("event", "value");
        expect(ios.emitter.emit).toHaveBeenCalledWith("event", "value");

        ios.eventManager.remove("event");
        expect(ios.emitter.removeAllListeners).toHaveBeenCalledWith("event");
    });

    it("throws when subscribing without a name or handler", () => {
        const { eventManager } = loadEventManager("android");

        expect(() => eventManager.subscribe("", jest.fn())).toThrow(
            "name and handler are required.",
        );
        expect(() => eventManager.subscribe("event", undefined as any)).toThrow(
            "name and handler are required.",
        );
    });
});
