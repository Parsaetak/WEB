"use client";

import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    window.location.replace(
      `${window.location.origin}/WEB/`
    );
  }, []);

  return null;
}
