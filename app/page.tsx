import type { Metadata } from "next";

import LivingShell from "@/components/LivingShell";

import {
  HOME_TITLE,
  JsonLd,
  homeWebPageEntity
} from "@/lib/seo";

/*
 * The world shell: one route, six hash scenes. The scenes are an
 * interaction architecture, not separate documents, so this page
 * carries exactly ONE WebPage object for the single canonical URL.
 * Concepts that deserve independent indexing (framework articles)
 * live as real /blog/<slug>/ routes instead of hash URLs.
 */

export const metadata: Metadata = {
  title: HOME_TITLE
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [homeWebPageEntity()]
        }}
      />

      <LivingShell />
    </>
  );
}
