import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { petService } from "@/lib/pets";
import { useDeviceLocation } from "@/lib/location";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// removed playful confetti to keep it clean

// Platform SVG icons (brand colors baked in each file)
import CallIcon from "../assets/call.svg";
import CallIconwhite from "../assets/callwhite.svg";
import InstagramIcon from "../assets/instagram.svg";
import SaveIcon from "../assets/save.svg";
import ShareIcon from "../assets/share_location.svg";
import WhatsAppIcon from "../assets/whatsapp.svg";

// -----------------
// Types
// -----------------
type Pet = {
  name: string;
  breed?: string;
  age?: string;
  color?: string;
  description?: string;
  photo_url?: string;
  whatsapp?: string;
  instagram?: string;
  show_whatsapp?: boolean;
  show_instagram?: boolean;
  show_phone?: boolean;
  show_address?: boolean;
  address?: string;
  users?: { name: string; phone?: string };
  reward?: string | null;
};

// ---- Animation Variants ----
const pageStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const fadeUp = (y = 12) => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
});

const heroEnter = {
  hidden: { opacity: 0, scale: 0.985 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const pawEnter = {
  hidden: { opacity: 0, rotate: 2, scale: 0.96 },
  show: { opacity: 1, rotate: 6, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const footerEnter = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// Extra playful variants
const heroImgEnter = {
  hidden: { opacity: 0, scale: 1.04, y: 6 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 20 }
  },
};

const chipStagger = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const chipItem = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 24 },
  },
};

const buttonPop = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 22 },
  },
};

const PetProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    location,
    locationAccuracy,
    geoPermission,
    ensureLocation,
    triggerBrowserPromptOnce,
    isSecure,
  } = useDeviceLocation();

  const [scanLoading, setScanLoading] = useState(false);
  const [pendingShare, setPendingShare] = useState(false);
  const [inlineMsg, setInlineMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const prefersReduced = useReducedMotion();

  // -----------------
  // Data load
  // -----------------
  useEffect(() => {
    const loadPetData = async () => {
      if (!username) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const petData = await petService.getPetByUsername(username);
        setPet(petData as Pet);
      } catch {
        setPet(null);
      } finally {
        setLoading(false);
      }
    };
    loadPetData();
  }, [username]);

  // -----------------
  // Side effects
  // -----------------
  useEffect(() => {
    if (pendingShare && location) openWhatsAppWithCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingShare, location]);

  // Confetti removed per request

  // -----------------
  // Helpers
  // -----------------
  const mapsUrl = useMemo(() => {
    if (!location) return "";
    return `https://maps.google.com/?q=${location.lat},${location.lng}`;
  }, [location]);

  const accuracyText = useMemo(() => {
    if (!location || locationAccuracy == null) return null;
    return `±${Math.round(locationAccuracy)}m accuracy`;
  }, [location, locationAccuracy]);

  const openWhatsAppWithCurrentLocation = () => {
    if (!pet?.whatsapp || !location) return;
    const message = [`Found ${pet.name}! 🐾`, `My location: ${mapsUrl}`].join("\n");
    const whatsappUrl = `https://wa.me/${pet.whatsapp
      ?.replace(/\s+/g, "")
      .replace("+", "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setPendingShare(false);
    setScanLoading(false);
    setInlineMsg("Opened WhatsApp. Thank you for helping!");
  };

  const AboutText: React.FC<{ text: string }> = ({ text }) => {
    const [open, setOpen] = React.useState(false);
    const LIMIT = 140;
    const needsClamp = text.length > LIMIT;
    const shown = open || !needsClamp ? text : text.slice(0, LIMIT).trim() + "…";

    return (
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          About
        </p>
        <p className="text-sm leading-6 text-slate-700">{shown}</p>
        {needsClamp && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-1 text-xs font-semibold text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded"
            aria-expanded={open}
          >
            {open ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    );
  };

  const shareLocationViaWhatsApp = async () => {
    if (!pet?.whatsapp) return;
    setInlineMsg(null);
    setScanLoading(true);
    setPendingShare(true);

    if (location) {
      openWhatsAppWithCurrentLocation();
      return;
    }

    if (geoPermission === "prompt" && isSecure) {
      await triggerBrowserPromptOnce();
    }

    const ok = await ensureLocation();

    if (ok && pendingShare && location) {
      openWhatsAppWithCurrentLocation();
      return;
    }

    if (!ok || !location) {
      setPendingShare(false);
      setScanLoading(false);
      setInlineMsg("We couldn’t get GPS. You can still call or WhatsApp the owner.");
    }
  };

  const copyMapsLink = async () => {
    if (!mapsUrl) return;
    try {
      await navigator.clipboard.writeText(mapsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setInlineMsg("Maps link copied.");
    } catch {
      setInlineMsg("Copy failed. Long-press the link to copy.");
    }
  };

  const downloadContact = () => {
    if (!pet?.users) return;
    const vCard = `BEGIN:VCARD\nVERSION:3.0\nFN:${pet.users.name}\nTEL:${pet.users.phone || ""}\nEND:VCARD`;
    const blob = new Blob([vCard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pet.users.name.replace(/\s+/g, "_")}.vcf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // -----------------
  // Presentational helpers
  // -----------------
  const initials = pet?.users?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const whatsappHref = pet?.whatsapp
    ? `https://wa.me/${pet.whatsapp.replace(/\s+/g, "").replace("+", "")}`
    : "#";

  // -----------------
  // States
  // -----------------
  if (loading) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-sky-100 via-rose-50 to-amber-50 text-slate-900">
        <div className="mx-auto max-w-md px-4 py-6 sm:max-w-lg">
          <div className="h-64 w-full animate-pulse rounded-b-3xl bg-white/70 ring-1 ring-white shadow" />
          <div className="mt-4 space-y-3 rounded-3xl bg-white/80 p-4 ring-1 ring-white shadow">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-sky-100 via-rose-50 to-amber-50">
        <div className="rounded-3xl bg-white/80 px-6 py-8 text-center shadow ring-1 ring-white">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-2xl">🐾</div>
          <p className="text-sm text-slate-600">We couldn’t find this pet profile.</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key={username}
        className="min-h-dvh bg-gradient-to-b from-sky-50 via-rose-50 to-amber-50 text-slate-900"
        initial={prefersReduced ? false : "hidden"}
        animate={prefersReduced ? undefined : "show"}
        variants={pageStagger}
      >
        {/* Full-width hero */}
        <motion.header
          className="relative w-full overflow-hidden rounded-b-3xl shadow-lg"
          variants={heroEnter}
        >
          <div className="relative aspect-[16/10] sm:aspect-[16/9]">
            <motion.img
              src={pet.photo_url || "/placeholder.svg"}
              alt={pet.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover bg-slate-200"
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/placeholder.svg")}
              variants={heroImgEnter}
            />

            {/* Gradients for color & legibility */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-900/70 via-emerald-900/20 to-transparent mix-blend-multiply" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/0" />

            {/* Paw watermark + name (animated) */}
        <motion.div className="absolute bottom-5 left-4" variants={fadeUp(6)}>
  {/* Container has NO rotation */}
  <div className="relative h-28 w-28">
    {/* Paw: rotated & animated */}
    <motion.div
      className="absolute inset-0 mt-6"      // no rotate class here
      variants={pawEnter}                    // sets final rotate: 6deg
      animate={
        prefersReduced
          ? undefined
          : { rotate: [6, 4, 6], y: [0, -2, 0] } // subtle wiggle
      }
      transition={prefersReduced ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 84.541 84.541"
        className="h-full w-full text-white/20 mix-blend-soft-light drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
        aria-hidden
      >
    <path
                      d="M84.449,34.955c-0.515-5.05-3.149-9.294-7.219-11.638c-2.137-1.235-4.592-1.882-7.108-1.882
                        c-0.018,0-0.036,0.004-0.054,0.004C69.901,13.432,65.46,6.625,58.327,4.71c-1.231-0.329-2.502-0.497-3.779-0.497
                        c-4.62,0-8.972,2.201-12.275,5.805c-3.303-3.604-7.655-5.805-12.275-5.805c-1.278,0-2.548,0.168-3.786,0.497
                        c-7.129,1.911-11.57,8.722-11.739,16.728c-0.018,0-0.036-0.004-0.054-0.004c-2.516,0-4.975,0.651-7.1,1.879
                        c-4.076,2.348-6.71,6.592-7.226,11.642c-0.412,4.041,0.569,8.353,2.756,12.147c2.344,4.073,5.808,7.086,9.674,8.672
                        c-0.734,2.652-1.177,5.39-1.177,8.188c0,15.189,10.142,16.366,13.252,16.366c3.089,0,5.97-0.909,9.019-1.872
                        c2.895-0.916,5.884-1.865,8.657-1.865c2.774,0,5.766,0.948,8.657,1.865c3.049,0.966,5.93,1.872,9.019,1.872
                        c4.527,0,8.321-2.008,10.679-5.655c1.754-2.713,2.573-6.116,2.573-10.712c0-2.799-0.444-5.536-1.177-8.188
                        c3.869-1.582,7.329-4.595,9.67-8.664C83.88,43.308,84.861,38.996,84.449,34.955z
                        M45.83,21.653c1.521-5.68,6.08-9.394,10.185-8.296
                        c4.105,1.102,6.195,6.603,4.678,12.279c-1.525,5.676-6.08,9.394-10.185,8.292C46.399,32.829,44.309,27.332,45.83,21.653z
                        M28.526,13.353c4.101-1.099,8.661,2.616,10.185,8.296c1.521,5.68-0.569,11.177-4.674,12.275
                        c-4.105,1.102-8.661-2.616-10.185-8.292C22.327,19.956,24.421,14.456,28.526,13.353z
                        M10.596,42.635c-2.602-4.509-2.079-9.688,1.185-11.567
                        c3.26-1.882,8.009,0.247,10.611,4.76c2.609,4.513,2.079,9.692-1.181,11.57C17.95,49.278,13.198,47.152,10.596,42.635z
                        M42.269,67.644c-12.139,0-21.981,10.493-21.981-3.683c0-14.179,14.097-25.668,21.981-25.664
                        c7.884,0.004,21.981,11.485,21.981,25.664C64.25,78.138,54.408,67.644,42.269,67.644z
                        M73.941,42.635c-2.602,4.517-7.351,6.642-10.615,4.763
                        c-3.26-1.879-3.79-7.061-1.181-11.57c2.602-4.513,7.351-6.642,10.611-4.76C76.021,32.947,76.543,38.126,73.941,42.635z"
                      fill="currentColor"
                    />
      </svg>
    </motion.div>

    {/* Name stays upright because it's NOT inside the rotated element */}
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 bottom-[16%] w-[80%] text-center"
      variants={fadeUp(4)}
    >
      <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 via-cyan-200 to-white bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] truncate">
        {pet.name}
      </h1>
    </motion.div>
  </div>
</motion.div>

          </div>
        </motion.header>

        {/* Main content container (stacked cards) */}
        <main className="mx-auto space-y-4 max-w-md px-4 pb-[6.5rem] pt-4 sm:max-w-lg">
          {/* Info (chips + address + about) */}
          <motion.section
            className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            variants={fadeUp(10)}
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Info
            </p>

            <motion.div className="flex flex-wrap gap-2" variants={chipStagger}>
              {pet.age && (
                <motion.span variants={chipItem} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                  <span className="text-slate-400">🧭</span> Age
                  <span className="font-semibold text-slate-900">{pet.age}</span>
                </motion.span>
              )}
              {pet.color && (
                <motion.span variants={chipItem} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                  <span className="text-slate-400">🎨</span> Color
                  <span className="font-semibold text-slate-900 capitalize">{pet.color}</span>
                </motion.span>
              )}
              {pet.breed && (
                <motion.span variants={chipItem} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                  <span className="text-slate-400">🐾</span> Breed
                  <span className="font-semibold text-slate-900">{pet.breed}</span>
                </motion.span>
              )}
            </motion.div>

            {pet.show_address && pet.address && (
              <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Address
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 break-words leading-snug">
                  {pet.address}
                </p>
              </div>
            )}

            {pet.description && (
              <>
                <div className="my-4 h-px bg-slate-100" />
                <AboutText text={pet.description} />
              </>
            )}
          </motion.section>

          {/* Owner card */}
          <motion.section
            className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
            variants={fadeUp(10)}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Owner</p>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-pink-200 font-semibold text-slate-700 ring-1 ring-slate-100">
                {initials || "OW"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{pet.users?.name}</p>
                {location && accuracyText && (
                  <p className="mt-0.5 text-[11px] text-slate-500">Current GPS: {accuracyText}</p>
                )}
              </div>
            </div>

            {/* contact buttons */}
            <motion.div className="mt-3 grid grid-cols-2 gap-2" variants={chipStagger}>
              {pet.users?.phone && (
                <motion.button
                  variants={buttonPop}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(`tel:${pet.users!.phone}`)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-slate-900 text-white shadow active:scale-[.98]"
                  aria-label="Call owner"
                >
                  <img src={CallIcon} alt="Call" className="h-5 w-5" />
                  <span className="text-sm font-semibold">Call</span>
                </motion.button>
              )}

              {pet.show_whatsapp && pet.whatsapp && (
                <motion.button
                  variants={buttonPop}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(whatsappHref, "_blank")}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow active:scale-[.98]"
                  aria-label="Open WhatsApp"
                >
                  <img src={WhatsAppIcon} alt="WhatsApp" className="h-5 w-5" />
                  <span className="text-sm font-semibold">WhatsApp</span>
                </motion.button>
              )}

              {pet.show_instagram && pet.instagram && (
                <motion.button
                  variants={buttonPop}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    window.open(
                      `https://instagram.com/${pet.instagram.replace("@", "")}`,
                      "_blank"
                    )
                  }
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow active:scale-[.98]"
                  aria-label="Open Instagram"
                >
                  <img src={InstagramIcon} alt="Instagram" className="h-5 w-5" />
                  <span className="text-sm font-semibold">Instagram</span>
                </motion.button>
              )}

              <motion.button
                variants={buttonPop}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadContact}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 shadow active:scale-[.98]"
              >
                <img src={SaveIcon} alt="Save" className="h-5 w-5" />
                <span className="text-sm font-semibold text-blue-600">Save Contact</span>
              </motion.button>
            </motion.div>
          </motion.section>

          {/* Inline status */}
          {inlineMsg && (
            <motion.div
              className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100"
              variants={fadeUp(10)}
            >
              {inlineMsg}
            </motion.div>
          )}

          {/* HTTPS warning */}
          {!isSecure && (
            <motion.p
              className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 ring-1 ring-amber-100"
              variants={fadeUp(10)}
            >
              ⚠️ Location requires HTTPS. You can call or WhatsApp the owner.
            </motion.p>
          )}

          {/* Brand */}
          <motion.div
            className="mt-4 text-center text-[11px] text-slate-500"
            variants={fadeUp(10)}
          >
            <span className="inline-flex items-center gap-1">🐕 Powered by <span className="font-semibold text-emerald-600">WhiteTag</span></span>
          </motion.div>
        </main>

        {/* Sticky footer CTA */}
        <motion.footer
          className="fixed inset-x-0 bottom-0 z-40 bg-cyan-50/95 backdrop-blur text-slate-800 shadow-2xl overflow-visible"
          role="contentinfo"
          variants={footerEnter}
        >
          {/* Top fade */}
          <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-cyan-50/95" />

          <div className="mx-auto max-w-md px-4 py-3 sm:max-w-lg">
            <div className="flex items-center gap-2">
              {/* Primary Action */}
              <motion.button
                type="button"
                onClick={shareLocationViaWhatsApp}
                disabled={scanLoading}
                className="flex-1 h-12 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 hover:scale-[1.02] transition active:scale-[.98] disabled:opacity-60 shadow-lg shadow-cyan-200/50"
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2 text-sm font-bold">
                  {!scanLoading ? (
                    <>
                      <img src={ShareIcon} alt="" className="h-5 w-5 invert" />
                      Share My Location
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-30 fill-none" />
                        <path d="M22 12a10 10 0 0 0-10-10" className="fill-none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Getting location…
                    </>
                  )}
                </span>
              </motion.button>

              {/* Secondary actions */}
              <div className="flex items-center gap-2 rounded-full bg-white/70 p-1 ring-1 ring-cyan-200 backdrop-blur">
                {pet.users?.phone && (
                  <motion.button
                    type="button"
                    onClick={() => window.open(`tel:${pet.users!.phone}`)}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-cyan-200 hover:bg-cyan-50 active:scale-[.98]"
                    whileHover={{ scale: 1.05, rotate: -3 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <img src={CallIconwhite} alt="" className="h-5 w-5" />
                  </motion.button>
                )}
                {pet.show_whatsapp && pet.whatsapp && (
                  <motion.button
                    type="button"
                    onClick={() => window.open(whatsappHref, "_blank")}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-cyan-200 hover:bg-cyan-50 active:scale-[.98]"
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <img src={WhatsAppIcon} alt="WhatsApp" className="h-5 w-5" />
                  </motion.button>
                )}
                {location && (
                  <motion.button
                    type="button"
                    onClick={copyMapsLink}
                    className={`grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-cyan-200 hover:bg-cyan-50 active:scale-[.98] ${copied ? "bg-cyan-100" : ""}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="text-lg">{copied ? "✅" : "🔗"}</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Safe area */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </motion.footer>
      </motion.div>
    </AnimatePresence>
  );
};

export default PetProfile;
