import { useEffect, useRef, useState } from "react";

export type GeoPermission = "granted" | "denied" | "prompt" | "unknown";

type LatLng = { lat: number; lng: number };

const isSecureContextNow = () => (window.isSecureContext === true) || location.protocol === "https:";

const getStoredLocation = () => {
  try {
    const raw = localStorage.getItem("wt:lastLocation");
    if (!raw) return null as null | { lat: number; lng: number; accuracy: number | null; ts: number };
    const d = JSON.parse(raw);
    if (Date.now() - d.ts < 2 * 60 * 1000) return d;
  } catch {}
  return null as null;
};

const storeLocation = (lat: number, lng: number, accuracy?: number) => {
  try {
    localStorage.setItem(
      "wt:lastLocation",
      JSON.stringify({ lat, lng, accuracy: accuracy ?? null, ts: Date.now() })
    );
  } catch {}
};

const triggerBrowserPromptOnce = (): Promise<void> =>
  new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve();
    navigator.geolocation.getCurrentPosition(
      () => resolve(),
      () => resolve(),
      { enableHighAccuracy: false, timeout: 800, maximumAge: 0 }
    );
  });

const startBackgroundRefiner = (
  setLoc: (ll: LatLng | null) => void,
  setAcc: (acc: number | null) => void,
  seed?: GeolocationPosition
) => {
  if (!("geolocation" in navigator)) return;
  let best: GeolocationPosition | null = seed ?? null;
  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const better = !best || (pos.coords.accuracy ?? 1e9) < (best.coords.accuracy ?? 1e9);
      if (better) {
        best = pos;
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAcc(pos.coords.accuracy ?? null);
        storeLocation(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.accuracy ?? undefined
        );
      }
    },
    undefined,
    { enableHighAccuracy: true, maximumAge: 0 }
  );
  setTimeout(() => navigator.geolocation.clearWatch(watchId), 12000);
};

const getLocationFast = (
  setLoc: (ll: LatLng | null) => void,
  setAcc: (acc: number | null) => void
): Promise<GeolocationPosition | null> =>
  new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    let resolved = false;
    let bestSoFar: GeolocationPosition | null = null;
    let hiAccWatchId: number | null = null;
    const resolveOnce = (pos: GeolocationPosition | null) => {
      if (resolved) return;
      resolved = true;
      if (hiAccWatchId !== null) navigator.geolocation.clearWatch(hiAccWatchId);
      clearTimeout(globalCap);
      resolve(pos);
    };

    const cached = getStoredLocation();
    if (cached) {
      bestSoFar = {
        coords: {
          latitude: cached.lat,
          longitude: cached.lng,
          accuracy: cached.accuracy ?? 150,
          altitude: null, altitudeAccuracy: null, heading: null, speed: null
        },
        timestamp: cached.ts
      } as unknown as GeolocationPosition;
      setLoc({ lat: cached.lat, lng: cached.lng });
      setAcc(cached.accuracy ?? null);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        bestSoFar = pos;
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAcc(pos.coords.accuracy ?? null);
        storeLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy ?? undefined);
        resolveOnce(pos);
        startBackgroundRefiner(setLoc, setAcc, pos);
      },
      undefined,
      { enableHighAccuracy: false, timeout: 2000, maximumAge: 300000 }
    );

    hiAccWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!resolved) {
          bestSoFar = pos;
          setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAcc(pos.coords.accuracy ?? null);
          storeLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy ?? undefined);
          resolveOnce(pos);
          startBackgroundRefiner(setLoc, setAcc, pos);
        } else {
          if (!bestSoFar || (pos.coords.accuracy ?? 1e9) < (bestSoFar.coords.accuracy ?? 1e9)) {
            bestSoFar = pos;
            setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setAcc(pos.coords.accuracy ?? null);
            storeLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy ?? undefined);
          }
        }
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    const globalCap = setTimeout(() => {
      if (bestSoFar) resolveOnce(bestSoFar);
      else resolveOnce(null);
    }, 7000);
  });

export const useDeviceLocation = () => {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [geoPermission, setGeoPermission] = useState<GeoPermission>("unknown");

  const lastPermissionPromptedRef = useRef(false);

  // Track permission state
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // @ts-ignore
        if (navigator.permissions?.query) {
          // @ts-ignore
          const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
          if (cancelled) return;
          setGeoPermission(status.state as GeoPermission);
          status.onchange = () => setGeoPermission(status.state as GeoPermission);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const ensureLocation = async () => {
    if (!isSecureContextNow()) return false;
    const pos = await getLocationFast(setLocation, setLocationAccuracy);
    if (pos && pos.coords) {
      const { latitude, longitude, accuracy } = pos.coords;
      setLocation({ lat: latitude, lng: longitude });
      setLocationAccuracy(accuracy ?? null);
      storeLocation(latitude, longitude, accuracy ?? undefined);
      return true;
    }
    const cached = getStoredLocation();
    if (cached) {
      setLocation({ lat: cached.lat, lng: cached.lng });
      setLocationAccuracy(cached.accuracy ?? null);
      startBackgroundRefiner(setLocation, setLocationAccuracy);
      return true;
    }
    return false;
  };

  // Proactively prompt/ensure when permission allows
  useEffect(() => {
    const tryPrompt = async () => {
      if (!isSecureContextNow()) return;
      if (lastPermissionPromptedRef.current) return;
      if (document.visibilityState !== "visible") return;
      if (geoPermission === "prompt") {
        lastPermissionPromptedRef.current = true;
        await triggerBrowserPromptOnce();
        await ensureLocation();
      } else if (geoPermission === "granted") {
        lastPermissionPromptedRef.current = true;
        await ensureLocation();
      }
    };
    tryPrompt();
  }, [geoPermission]);

  // Refresh on tab visibility
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") ensureLocation();
    };
    ensureLocation();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    location,
    locationAccuracy,
    geoPermission,
    ensureLocation,
    triggerBrowserPromptOnce,
    isSecure: isSecureContextNow(),
  } as const;
};

