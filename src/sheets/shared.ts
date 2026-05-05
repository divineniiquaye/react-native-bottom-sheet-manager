import React from "react";

import { eventManager } from "../events";
import { PrivateManager } from "../manager";
import { useProviderContext } from "../provider";
import { StackBehavior } from "../types";

type OnHide = (data?: unknown, dismiss?: boolean, behavior?: StackBehavior) => void;
type OnBeforeShow = (data?: unknown, behavior?: StackBehavior) => void;

export const useSheetManager = ({
  id,
  onHide,
  onBeforeShow,
  onContextUpdate,
}: {
  id?: string;
  onHide: OnHide;
  onBeforeShow?: OnBeforeShow;
  onContextUpdate: () => void;
}) => {
  const currentContext = useProviderContext();
  const hasShownRef = React.useRef(false);

  React.useEffect(() => {
    if (!id) return undefined;

    const subscriptions = [
      eventManager.subscribe(
        `show_${id}`,
        (data: unknown, context?: string, behavior?: StackBehavior) => {
          if (currentContext !== context) return;
          if (!hasShownRef.current) {
            hasShownRef.current = true;
            onContextUpdate?.();
            onBeforeShow?.(data, behavior);
          }
        },
      ),
      eventManager.subscribe(
        `hide_${id}`,
        (data: unknown, context: string, dismiss?: boolean, behavior?: StackBehavior) => {
          if (currentContext !== context) return;
          hasShownRef.current = false;
          onHide?.(data, dismiss, behavior);
        },
      ),
    ];

    return () => {
      hasShownRef.current = false;
      subscriptions.forEach((s) => s?.unsubscribe?.());
    };
  }, [id, onHide, onBeforeShow, onContextUpdate, currentContext]);
};

export const useTeardownSheet = ({
  sheetId,
  currentCtx,
}: {
  sheetId?: string;
  currentCtx: string;
}) =>
  React.useCallback(
    (value: unknown, dismiss: boolean | undefined, behavior: StackBehavior) => {
      if (!sheetId) return;

      const hasHistory = PrivateManager.history.length > 0;
      const shouldRestorePrevious = behavior !== "replace";

      eventManager.publish(
        `onclose_${sheetId}`,
        value,
        currentCtx,
        hasHistory || !!dismiss,
        behavior,
      );

      if (shouldRestorePrevious) {
        if (dismiss) {
          if (behavior !== "push") {
            PrivateManager.history.push({
              id: sheetId,
              context: currentCtx,
              behavior,
            });
          }
        } else if (hasHistory) {
          const otherSheetsStillOpen = PrivateManager.stack().some(
            (s) => !(s.id === sheetId && s.context === currentCtx),
          );
          if (!otherSheetsStillOpen) {
            const prev = PrivateManager.history.pop()!;
            eventManager.publish(
              `show_wrap_${prev.id}`,
              undefined,
              prev.context,
              true,
              prev.behavior,
            );
          }
        }
      }

      PrivateManager.remove(sheetId, currentCtx);
    },
    [sheetId, currentCtx],
  );
