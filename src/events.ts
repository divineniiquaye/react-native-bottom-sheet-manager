/**
 * High-performance event manager using Maps for O(1) lookups.
 * Replaces React Native's EventEmitter which has significant overhead.
 */

export type EventHandler<T extends unknown[] = unknown[]> = (...args: T) => void;

export interface EventSubscription {
    readonly unsubscribe: () => void;
}

type HandlerEntry = {
    handler: EventHandler;
    id: number;
};

class EventManager {
    private _handlers = new Map<string, HandlerEntry[]>();
    private _nextId = 0;

    /**
     * Subscribe to an event with a handler function.
     * Returns a subscription object with an unsubscribe method.
     */
    subscribe<T extends unknown[] = unknown[]>(
        name: string,
        handler: EventHandler<T>,
    ): EventSubscription {
        if (!name || typeof handler !== "function") {
            throw new Error("Event name and handler function are required.");
        }

        const id = this._nextId++;
        const entry: HandlerEntry = { handler: handler as EventHandler, id };

        const handlers = this._handlers.get(name);
        if (handlers) {
            handlers.push(entry);
        } else {
            this._handlers.set(name, [entry]);
        }

        return {
            unsubscribe: () => {
                const currentHandlers = this._handlers.get(name);
                if (currentHandlers) {
                    const index = currentHandlers.findIndex((h) => h.id === id);
                    if (index !== -1) {
                        currentHandlers.splice(index, 1);
                        if (currentHandlers.length === 0) {
                            this._handlers.delete(name);
                        }
                    }
                }
            },
        };
    }

    /**
     * Publish an event with optional arguments.
     * All subscribed handlers will be called synchronously.
     */
    publish<T extends unknown[] = unknown[]>(name: string, ...args: T): void {
        const handlers = this._handlers.get(name);
        if (!handlers || handlers.length === 0) return;

        // Create a copy to avoid issues if handlers modify the list during iteration
        const handlersSnapshot = handlers.slice();
        for (let i = 0; i < handlersSnapshot.length; i++) {
            handlersSnapshot[i].handler(...args);
        }
    }

    /**
     * Publish an event asynchronously using microtasks for better performance.
     * Useful when you don't need immediate execution.
     */
    publishAsync<T extends unknown[] = unknown[]>(name: string, ...args: T): void {
        queueMicrotask(() => this.publish(name, ...args));
    }

    /**
     * Check if an event has any subscribers.
     */
    hasSubscribers(name: string): boolean {
        const handlers = this._handlers.get(name);
        return !!handlers && handlers.length > 0;
    }

    /**
     * Get the number of subscribers for an event.
     */
    subscriberCount(name: string): number {
        return this._handlers.get(name)?.length ?? 0;
    }

    /**
     * Remove all listeners for the specified event names.
     */
    remove(...names: string[]): void {
        for (const name of names) {
            this._handlers.delete(name);
        }
    }

    /**
     * Remove all event listeners.
     */
    clear(): void {
        this._handlers.clear();
    }

    /**
     * Subscribe to an event that will only fire once.
     */
    once<T extends unknown[] = unknown[]>(
        name: string,
        handler: EventHandler<T>,
    ): EventSubscription {
        const subscription = this.subscribe<T>(name, (...args) => {
            subscription.unsubscribe();
            handler(...args);
        });
        return subscription;
    }
}

// Singleton instance for global event management
export const eventManager = new EventManager();

export default EventManager;
