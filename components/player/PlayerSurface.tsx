"use client";

import { useEffect } from "react";

import {
  attachMediaSession,
  getPlayerStore
} from "@/lib/player/playerStore";

import { usePlayerState } from "@/lib/player/usePlayer";

import MiniPlayer from "@/components/player/MiniPlayer";

import ExpandedPlayer from "@/components/player/ExpandedPlayer";

import styles from "@/components/player/Player.module.css";

/*
 * PLAYER SURFACE (v4.0.0) — the rendered shell of the global player.
 *
 * Mounted lazily by PlayerRoot after the first playback intent, so
 * this module (and the single <audio> element it wires) never loads
 * for visitors who never press play. Renders:
 *
 *   - MiniPlayer: persistent bottom bar (desktop) / sticky compact
 *     bar (mobile) — the only always-visible player surface
 *   - ExpandedPlayer: portal overlay with large artwork, full
 *     controls and the queue, opened on demand
 *
 * A flow spacer keeps page content scrollable clear of the bar.
 */
export default function PlayerSurface() {
  const state = usePlayerState();

  useEffect(() => {
    const store = getPlayerStore();

    store.attachElementListeners();

    attachMediaSession(store);
  }, []);

  return (
    <>
      <div
        className={
          styles.surfaceSpacer
        }
        aria-hidden="true"
      />

      <MiniPlayer />

      {state.expanded && <ExpandedPlayer />}
    </>
  );
}
