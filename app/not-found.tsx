"use client";

import {
  useEffect
} from "react";

import {
  usePathname
} from "next/navigation";

export default function NotFound() {
  const pathname =
    usePathname();

  useEffect(() => {
    const segments =
      pathname
        .split("/")
        .filter(Boolean);

    const basePath =
      segments.length > 0
        ? `/${segments[0]}`
        : "";

    window.location.replace(
      `${window.location.origin}${basePath}/`
    );
  }, [pathname]);

  return null;
}
