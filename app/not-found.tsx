"use client";

import {
  useEffect
} from "react";

import {
  usePathname
} from "next/navigation";

/*
 * Static-export not-found handler.
 *
 * GitHub Pages serves 404.html for any unknown path (including
 * invalid blog slugs). usePathname() returns the path with the
 * deployment basePath already stripped, so the redirect target
 * must re-apply NEXT_PUBLIC_BASE_PATH — otherwise the visitor is
 * sent outside the site (for example /WEB/blog/invalid/ would
 * redirect to /blog/, which does not exist at the domain root).
 *
 * Unknown paths inside a known top-level area return to that
 * area's index; everything else returns to the world home.
 */

const KNOWN_AREAS: ReadonlySet<
  string
> = new Set(["blog"]);

export default function NotFound() {
  const pathname =
    usePathname();

  useEffect(() => {
    const basePath =
      process.env
        .NEXT_PUBLIC_BASE_PATH ??
      "";

    const segments =
      pathname
        .split("/")
        .filter(Boolean);

    const area =
      segments.length > 0 &&
      KNOWN_AREAS.has(
        segments[0]
      )
        ? `/${segments[0]}`
        : "";

    window.location.replace(
      `${window.location.origin}${basePath}${area}/`
    );
  }, [pathname]);

  return null;
}
