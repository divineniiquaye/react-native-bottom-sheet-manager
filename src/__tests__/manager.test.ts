jest.mock("../provider", () => {
  const providerRegistryStack: string[] = [];
  const sheetsRegistry: Record<string, Record<string, unknown>> = {
    global: {},
  };
  return { providerRegistryStack, sheetsRegistry };
});

jest.mock("../events", () => {
  const listeners = new Map<string, Set<(...args: any[]) => void>>();
  const eventManager: any = {};

  eventManager.subscribe = jest.fn(
    (name: string, handler: (...args: any[]) => void) => {
      if (!listeners.has(name)) {
        listeners.set(name, new Set());
      }
      listeners.get(name)!.add(handler);
      return {
        unsubscribe: () => {
          const set = listeners.get(name);
          if (!set) return;
          set.delete(handler);
          if (set.size === 0) {
            listeners.delete(name);
          }
        },
      };
    },
  );

  eventManager.publish = jest.fn((name: string, ...args: any[]) => {
    const set = listeners.get(name);
    if (!set) return;
    for (const handler of Array.from(set)) {
      handler(...args);
    }
  });

  eventManager.remove = jest.fn((...names: string[]) => {
    for (const name of names) {
      listeners.delete(name);
    }
  });

  eventManager.__reset = () => {
    listeners.clear();
    eventManager.subscribe.mockClear();
    eventManager.publish.mockClear();
    eventManager.remove.mockClear();
  };

  return { eventManager };
});

describe("SheetManager", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const setup = () => {
    const provider = require("../provider") as typeof import("../provider");
    provider.providerRegistryStack.length = 0;
    provider.providerRegistryStack.push("global");
    Object.keys(provider.sheetsRegistry).forEach((context) => {
      delete provider.sheetsRegistry[context];
    });
    provider.sheetsRegistry.global = {};

    const events = require("../events") as typeof import("../events") & {
      eventManager: typeof import("../events")["eventManager"] & {
        __reset: () => void;
      };
    };
    (events.eventManager as any).__reset();

    const manager = require("../manager") as typeof import("../manager");

    return {
      providerRegistryStack: provider.providerRegistryStack,
      sheetsRegistry: provider.sheetsRegistry,
      eventManager: events.eventManager as typeof events.eventManager & {
        __reset: () => void;
      },
      PrivateManager: manager.PrivateManager,
      SheetManager: manager.SheetManager,
    };
  };

  it("publishes show events and resolves when the sheet closes", async () => {
    const { SheetManager, sheetsRegistry, eventManager } = setup();
    sheetsRegistry.global["test-sheet"] = {};

    const onClose = jest.fn();
    const promise = SheetManager.show("test-sheet", { onClose });

    expect(eventManager.publish).toHaveBeenCalledWith(
      "show_wrap_test-sheet",
      undefined,
      "global",
    );

    eventManager.publish(`onclose_test-sheet`, "result", "global");
    await expect(promise).resolves.toBe("result");
    expect(onClose).toHaveBeenCalledWith("result");
  });

  it("publishes hide events with the provided context", async () => {
    const { SheetManager, PrivateManager, sheetsRegistry, eventManager } = setup();
    sheetsRegistry.global["test-sheet"] = {};
    PrivateManager.add("test-sheet", "global");

    const promise = SheetManager.hide("test-sheet", {
      context: "global",
      payload: "payload" as any,
    });

    expect(eventManager.publish).toHaveBeenCalledWith(
      "hide_wrap_test-sheet",
      "payload",
      "global",
    );

    eventManager.publish(`onclose_test-sheet`, "return", "global");
    await expect(promise).resolves.toBe("return");
  });

  it("computes z-index values based on registration order", () => {
    const { PrivateManager } = setup();

    PrivateManager.registerRef("first", "global", { current: null } as any);
    PrivateManager.registerRef("second", "global", { current: null } as any);

    expect(PrivateManager.zIndex("first", "global")).toBe(1000);
    expect(PrivateManager.zIndex("second", "global")).toBe(1001);
    expect(PrivateManager.zIndex("missing", "global")).toBe(999);
  });

  it("hides all sheets or only the matching id prefix", () => {
    const { PrivateManager, SheetManager, eventManager } = setup();

    PrivateManager.add("alpha", "global");
    PrivateManager.add("beta", "nested");

    (eventManager.publish as jest.Mock).mockClear();
    SheetManager.hideAll();

    expect(eventManager.publish).toHaveBeenCalledTimes(2);
    expect(eventManager.publish).toHaveBeenCalledWith(
      "hide_alpha",
      undefined,
      "global",
    );
    expect(eventManager.publish).toHaveBeenCalledWith(
      "hide_beta",
      undefined,
      "nested",
    );

    (eventManager.publish as jest.Mock).mockClear();
    SheetManager.hideAll("alpha");
    expect(eventManager.publish).toHaveBeenCalledTimes(1);
    expect(eventManager.publish).toHaveBeenCalledWith(
      "hide_alpha",
      undefined,
      "global",
    );
  });
});
