"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useState
} from "react";

const PlayerSurface = dynamic(
  () => import("@/components/player/PlayerSurface"),
  {
    ssr: false
  }
);

const ENGAGE_EVENT = "web:player:engage";

/*
 * PLAYER ROOT (v4.0.0) — the mount point of the global Music player.
 *
 * Rendered by the root layout, but it ships NO player code: it only
 * listens for the store's one-time engagement signal (dispatched on
 * the first explicit playback intent) and only then dynamically
 * imports PlayerSurface — the mini bar, expanded player, queue UI,
 * and the single <audio> element live in a lazy chunk that cannot
 * touch the initial Home bundle or the static export's HTML.
 *
 * The DOM-event bridge (a plain string event) is deliberate: it keeps
 * this root from importing the store module at all, so the entire
 * player subsystem stays out of the main bundle until music actually
 * plays.
 */
export default function PlayerRoot() {
  const [engaged, setEngaged] =
    useState(false);

  useEffect(() => {
    if (engaged) {
      return;
    }

    const handleEngage = () => {
      setEngaged(true);
    };

    document.addEventListener(
      ENGAGE_EVENT,
      handleEngage
    );

    return () => {
      document.removeEventListener(
        ENGAGE_EVENT,
        handleEngage
      );
    };
  }, [engaged]);

  if (!engaged) {
    return null;
  }

  return <PlayerSurface />;
}
