"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { fullSync, subscribeToRealtime, unsubscribeFromRealtime } from "@/lib/sync";

export default function SyncStatus() {
  const { user } = useAuth();
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const syncingRef = useRef(false);

  const doSync = useCallback(async () => {
    if (!user || syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      await fullSync(user.id);
      setLastSync(new Date());
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => { setOnline(true); doSync(); };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [doSync]);

  // Initial sync + realtime subscription
  useEffect(() => {
    if (!user) return;
    doSync();
    subscribeToRealtime(user.id);

    // Sync periodically every 30 seconds
    const interval = setInterval(() => {
      if (navigator.onLine) doSync();
    }, 30000);

    return () => {
      clearInterval(interval);
      unsubscribeFromRealtime();
    };
  }, [user, doSync]);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
      <span
        className={`h-2 w-2 rounded-full ${
          !online ? "bg-red-500" : syncing ? "bg-yellow-500" : "bg-green-500"
        }`}
      />
      {!online ? "Offline" : syncing ? "Syncing..." : lastSync ? "Synced" : ""}
    </div>
  );
}
