"use client";

import { ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { expireIdleSession } from "@/actions/auth";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_TIME_MS = 14 * 60 * 1000;

type IdleWarningCallbackType = (data: {
  timeRemaining: number;
  onDismiss: () => void;
  onLogout: () => void;
}) => void;

const SessionMonitorContext = globalThis as unknown as {
  __sessionMonitorCallback?: IdleWarningCallbackType;
};

export function useSessionMonitorWarning(
  callback: IdleWarningCallbackType,
): void {
  useEffect(() => {
    SessionMonitorContext.__sessionMonitorCallback = callback;

    return () => {
      SessionMonitorContext.__sessionMonitorCallback = undefined;
    };
  }, [callback]);
}

export function SessionMonitor({ children }: { children: ReactNode }) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isWarningShownRef = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const clearTimeouts = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const resetActivity = useCallback(() => {
    isWarningShownRef.current = false;
    clearTimeouts();

    warningTimeoutRef.current = setTimeout(() => {
      if (!isWarningShownRef.current) {
        isWarningShownRef.current = true;

        const timeRemaining = IDLE_TIMEOUT_MS - WARNING_TIME_MS;

        const onDismiss = () => {
          isWarningShownRef.current = false;
          clearTimeouts();
          warningTimeoutRef.current = setTimeout(() => {
            if (!isWarningShownRef.current) {
              isWarningShownRef.current = true;
              SessionMonitorContext.__sessionMonitorCallback?.({
                timeRemaining: IDLE_TIMEOUT_MS - WARNING_TIME_MS,
                onDismiss,
                onLogout,
              });
            }
          }, WARNING_TIME_MS);
          timeoutRef.current = setTimeout(() => {
            setIsLoggingOut(true);
            void expireIdleSession().finally(() => {
              window.location.href = "/admin/mfa-verify";
            });
          }, IDLE_TIMEOUT_MS);
        };

        const onLogout = () => {
          setIsLoggingOut(true);
          void expireIdleSession().finally(() => {
            window.location.href = "/admin/mfa-verify";
          });
        };

        SessionMonitorContext.__sessionMonitorCallback?.({
          timeRemaining,
          onDismiss,
          onLogout,
        });
      }
    }, WARNING_TIME_MS);

    timeoutRef.current = setTimeout(() => {
      setIsLoggingOut(true);
      void expireIdleSession().finally(() => {
        window.location.href = "/admin/mfa-verify";
      });
    }, IDLE_TIMEOUT_MS);
  }, [clearTimeouts]);

  useEffect(() => {
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];

    const handleActivity = () => {
      if (!isLoggingOut) {
        resetActivity();
      }
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    resetActivity();

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [resetActivity, isLoggingOut]);

  return <>{children}</>;
}
