import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, MapPin, Phone, MessageCircle, Instagram, Download,
  ChevronRight, Loader2
} from "lucide-react";
import { petService } from "@/lib/pets";

type GeoPermission = "granted" | "denied" | "prompt" | "unknown";

const isSecureContext = () =>
  (window.isSecureContext === true) || location.protocol === "https:";

const getStoredLocation = () => {
  try {
    const raw = localStorage.getItem("wt:lastLocation");
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (Date.now() - d.ts < 2 * 60 * 1000) return d;
  } catch {}
  return null;
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

const PetProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [geoPermission, setGeoPermission] = useState<GeoPermission>("unknown");

  const [scanLoading, setScanLoading] = useState(false);
  const [pendingShare, setPendingShare] = useState(false);

  const lastPermissionPromptedRef = useRef(false);

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

  useEffect(() => {
    const loadPetData = async () => {
      if (!username) { setLoading(false); return; }
      try {
        setLoading(true);
        const petData = await petService.getPetByUsername(username);
        setPet(petData);
      } catch {
        setPet(null);
      } finally {
        setLoading(false);
      }
    };
    loadPetData();
  }, [username]);

  const startBackgroundRefiner = (seed?: GeolocationPosition) => {
    if (!("geolocation" in navigator)) return;
    let best: GeolocationPosition | null = seed ?? null;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const better =
          !best || (pos.coords.accuracy ?? 1e9) < (best.coords.accuracy ?? 1e9);
        if (better) {
          best = pos;
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationAccuracy(pos.coords.accuracy ?? null);
          storeLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy ?? undefined);
        }
        if (pendingShare && !seed) openWhatsAppWithCurrentLocation();
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    setTimeout(() => navigator.geolocation.clearWatch(watchId), 12000);
  };

  const getLocationFast = (): Promise<GeolocationPosition | null> =>
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
        setLocation({ lat: cached.lat, lng: cached.lng });
        setLocationAccuracy(cached.accuracy ?? null);
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          bestSoFar = pos;
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationAccuracy(pos.coords.accuracy ?? null);
          storeLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy ?? undefined);
          resolveOnce(pos);
          startBackgroundRefiner(pos);
        },
        undefined,
        { enableHighAccuracy: false, timeout: 2000, maximumAge: 300000 }
      );

      hiAccWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (!resolved) {
            bestSoFar = pos;
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocationAccuracy(pos.coords.accuracy ?? null);
            storeLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy ?? undefined);
            resolveOnce(pos);
            startBackgroundRefiner(pos);
          } else {
            if (!bestSoFar || (pos.coords.accuracy ?? 1e9) < (bestSoFar.coords.accuracy ?? 1e9)) {
              bestSoFar = pos;
              setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setLocationAccuracy(pos.coords.accuracy ?? null);
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

  const ensureLocation = async () => {
    if (!isSecureContext()) return false;
    const pos = await getLocationFast();
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
      startBackgroundRefiner();
      return true;
    }
    return false;
  };

  useEffect(() => {
    const tryPrompt = async () => {
      if (!isSecureContext()) return;
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

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") ensureLocation();
    };
    ensureLocation();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (pendingShare && location) openWhatsAppWithCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingShare, location]);

  const openWhatsAppWithCurrentLocation = () => {
    if (!pet?.whatsapp || !location) return;
    const message =
      `Found ${pet.name}! 🐾📍 Here's my location: https://maps.google.com/?q=${location.lat},${location.lng}`;
    const whatsappUrl =
      `https://wa.me/${pet.whatsapp.replace(/\s+/g, "").replace("+", "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setPendingShare(false);
    setScanLoading(false);
  };

  const shareLocationViaWhatsApp = async () => {
    if (!pet?.whatsapp) return;
    setScanLoading(true);
    setPendingShare(true);
    if (location) {
      openWhatsAppWithCurrentLocation();
      return;
    }
    if (geoPermission === "prompt" && isSecureContext()) {
      await triggerBrowserPromptOnce();
    }
    const ok = await ensureLocation();
    if (ok && pendingShare && location) openWhatsAppWithCurrentLocation();
    if (!ok && !location) {
      setPendingShare(false);
      setScanLoading(false);
    }
  };

  const downloadContact = () => {
    if (!pet?.users) return;
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${pet.users.name}
TEL:${pet.users.phone || ""}
END:VCARD`;
    const blob = new Blob([vCard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pet.users.name.replace(/\s+/g, "_")}.vcf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Heart className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Card className="bg-white border-0 shadow-lg rounded-b-2xl overflow-hidden mb-6">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={pet.photo_url || "/placeholder.svg"}
                alt={pet.name}
                className="w-full h-80 -mt-6 object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{pet.name}</h1>
                <div className="flex space-x-2">
                  <Badge className="bg-white/90 text-gray-900 font-medium border-0">{pet.type}</Badge>
                  {pet.breed && (
                    <Badge className="bg-white/20 text-white border border-white/30 font-medium">
                      {pet.breed}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {pet.age && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Age</span>
                  <span className="text-gray-900 font-semibold">{pet.age}</span>
                </div>
              )}
              {pet.color && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Appearance</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">{pet.color}</p>
                </div>
              )}
              {pet.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">{pet.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="relative overflow-hidden rounded-3xl p-6 mb-6 group">
          <div className="absolute inset-0 bg-linear-to-br from-violet-600/90 via-blue-600/80 to-cyan-500/70 opacity-90"></div>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Found {pet.name}?</h3>
                <p className="text-white/90 text-sm font-medium">Share your location instantly!</p>
              </div>
              <div className="bg-white/20 rounded-2xl p-3">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            </div>
            <Button
              onClick={shareLocationViaWhatsApp}
              disabled={scanLoading}
              className="w-full h-14 bg-white text-gray-900 font-bold text-lg rounded-2xl shadow-xl border-0"
            >
              {scanLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Getting Location…
                </>
              ) : (
                <>
                  <MessageCircle className="w-6 h-6 mr-3 text-green-600" />
                  Share
                </>
              )}
            </Button>
            {location && locationAccuracy !== null && (
              <p className="text-white/80 text-xs mt-3 text-center">
                📍 ±{Math.round(locationAccuracy)}m accuracy
              </p>
            )}
          </div>
        </div>

        <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-white">
                  {pet.users?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Contact Owner</h3>
              <p className="text-gray-600 text-sm">{pet.users?.name}</p>
            </div>

            <div className="space-y-3 mb-6">
              {pet.show_phone && pet.users?.phone && (
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 text-gray-900 font-medium rounded-lg"
                  onClick={() => window.open(`tel:${pet.users.phone}`)}
                >
                  <Phone className="w-5 h-5 mr-3 text-blue-600" /> Call Now
                </Button>
              )}
              {pet.show_whatsapp && pet.whatsapp && (
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 text-gray-900 font-medium rounded-lg"
                  onClick={() => window.open(`https://wa.me/${pet.whatsapp?.replace(/\s+/g, "").replace("+", "")}`)}
                >
                  <MessageCircle className="w-5 h-5 mr-3 text-green-600" /> WhatsApp
                </Button>
              )}
              {pet.show_instagram && pet.instagram && (
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 text-gray-900 font-medium rounded-lg"
                  onClick={() => window.open(`https://instagram.com/${pet.instagram.replace("@", "")}`)}
                >
                  <Instagram className="w-5 h-5 mr-3 text-pink-600" /> Instagram
                </Button>
              )}
              <Button
                onClick={downloadContact}
                variant="outline"
                className="w-full h-12 border-2 border-gray-200 text-gray-900 font-medium rounded-lg"
              >
                <Download className="w-5 h-5 mr-3 text-gray-600" /> Save Contact
              </Button>
            </div>

            {pet.show_address && pet.address && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-medium text-gray-900 mb-1 text-sm">Address</p>
                <p className="text-gray-600 text-sm leading-relaxed">{pet.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8 pb-8">
          <p className="text-gray-500 text-xs">Powered by <span className="font-medium">WhiteTag</span></p>
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
