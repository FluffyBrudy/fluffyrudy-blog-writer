"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Notification = {
  id: number;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type NotificationContextType = {
  notify: (n: Omit<Notification, "id">) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queueRef = useRef<Notification[]>([]);
  const [current, setCurrent] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  const showNext = useCallback(() => {
    setCurrent(null);
    setOpen(false);

    const next = queueRef.current.shift();
    if (next) {
      setTimeout(() => {
        setCurrent(next);
        setOpen(true);
      }, 10);
    }
  }, []);

  const notify = useCallback(
    (n: Omit<Notification, "id">) => {
      const notif: Notification = { id: Date.now(), ...n };

      if (!current && queueRef.current.length === 0) {
        setCurrent(notif);
        setOpen(true);
        return;
      }

      queueRef.current.push(notif);
    },
    [current]
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const ce = event as CustomEvent<{
        title?: string;
        description?: string;
        status?: number;
      }>;
      const status = ce.detail?.status;
      const title =
        ce.detail?.title ||
        (status === 401
          ? "Unauthorized"
          : status === 503
          ? "Service Unavailable"
          : "Request Error");
      const description =
        ce.detail?.description ||
        "An error occurred while processing your request.";
      notify({ title, description, confirmLabel: "Dismiss" });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("app:error", handler as EventListener);
      return () =>
        window.removeEventListener("app:error", handler as EventListener);
    }
  }, [notify]);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <AlertDialog
        open={open}
        onOpenChange={(o) => {
          if (!o) {
            current?.onCancel?.();
            showNext();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{current?.title}</AlertDialogTitle>
            {current?.description && (
              <AlertDialogDescription>
                {current.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            {current?.cancelLabel && (
              <AlertDialogCancel
                onClick={() => {
                  current?.onCancel?.();
                  showNext();
                }}
              >
                {current.cancelLabel}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={() => {
                current?.onConfirm?.();
                showNext();
              }}
            >
              {current?.confirmLabel || "OK"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NotificationContext.Provider>
  );
}
