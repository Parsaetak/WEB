import type {
  Metadata,
  Viewport
} from "next";

import "./globals.css";

import GlobalMusicPlayerHost from "@/components/player/GlobalMusicPlayerHost";

import GlobalRouteTransition from "@/components/GlobalRouteTransition";

import {
  HOME_TITLE,
  JsonLd,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE_HEIGHT,
  SITE_OG_IMAGE_PATH,
  SITE_OG_IMAGE_WIDTH,
  personEntity,
  websiteEntity
} from "@/lib/seo";

/*
 * The deployment basePath, inlined at build time (mirrors
 * next.config.ts). Used for the favicon links below: Next applies
 * metadataBase to OG/twitter images and canonical URLs but emits
 * metadata.icons hrefs verbatim, so the /WEB prefix must be carried
 * explicitly — the same discipline as lib/brand.ts and not-found.tsx.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/*
 * THE site identity graph. Emitted exactly once, here in the root
 * layout, so every route shares one coherent Person + WebSite
 * entity model. Route-specific objects (WebPage, Blog, BlogPosting,
 * BreadcrumbList) reference these @id anchors instead of defining
 * their own copies — the site never emits conflicting entities.
 */
const SITE_ENTITY_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [personEntity(), websiteEntity()]
};

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "Parsa Tak",
  authors: [
    {
      name: "Parsa Tak",
      url: "https://github.com/Parsaetak"
    }
  ],
  creator: "Parsa Tak",
  publisher: "Parsa Tak",
  /*
   * Keyword discipline (v2.7, updated v3.5): every term names
   * something the site actually presents or owns and is visible in
   * the rendered pages. SHEYTAN and Red illuminati are claimed
   * brand/artistic identity terms (see TRADEMARKS.md and the RED
   * MAGIC article) — each appears exactly once, in visible-backed
   * metadata, never in hidden text. The capability terms mirror the
   * visible capabilities grid and featured projects section;
   * "creative technology" is backed by its dedicated
   * /creative-technology/ topic hub and the RED MAGIC presentations
   * (since v3.5 it is intentionally not repeated in the home
   * capabilities grid, which is exactly eight entries).
   */
  keywords: [
    "Parsa Tak",
    "AI",
    "artificial intelligence",
    "AI systems",
    "AI agents",
    "local AI",
    "reasoning",
    "software engineering",
    "product building",
    "creative technology",
    "system architecture",
    "RED MAGIC",
    "RED THEORY",
    "SHEYTAN",
    "UHIT",
    "FreeIran",
    "Red illuminati"
  ],
  metadataBase:
    new URL(
      "https://parsaetak.github.io/WEB/"
    ),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url:
      "https://parsaetak.github.io/WEB/",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: SITE_OG_IMAGE_PATH,
        width: SITE_OG_IMAGE_WIDTH,
        height: SITE_OG_IMAGE_HEIGHT,
        alt: "Parsa Tak — AI systems, reasoning, and RED MAGIC"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE_PATH,
        alt: "Parsa Tak — AI systems, reasoning, and RED MAGIC"
      }
    ]
  },
  robots: {
    index: true,
    follow: true
  },
  /*
   * FAVICON FAMILY (v2.9) — declared explicitly and served from
   * public/ so the exact link set is deterministic in every build
   * mode (file-convention emission proved unreliable for
   * favicon.ico once a basePath is active). Hrefs carry the
   * basePath explicitly: Next emits metadata.icons verbatim
   * (metadataBase does not apply to them).
   * The SVG is the generated 13-point star (public/icon.svg).
   */
  icons: {
    icon: [
      {
        url: `${BASE_PATH}/favicon.ico`,
        sizes: "48x48",
        type: "image/x-icon"
      },
      {
        url: `${BASE_PATH}/icon.svg`,
        type: "image/svg+xml"
      },
      {
        url: `${BASE_PATH}/icon.png`,
        sizes: "192x192",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: `${BASE_PATH}/apple-icon.png`,
        sizes: "180x180",
        type: "image/png"
      }
    ]
  },
  /*
   * SEARCH CONSOLE VERIFICATION (v2.9). Emitted exactly once from
   * this root layout, so every canonical route carries the same
   * <meta name="google-site-verification"> tag — no per-route
   * duplication. The value is verified by scripts/verify-seo.mjs on
   * every build: if the tag disappears or changes, the build fails.
   * This token proves ownership of parsaetak.github.io/WEB in Google
   * Search Console; it is a public verification token, not a secret,
   * and must never appear in visible page content.
   */
  verification: {
    google: "K8PQwvcGcrpBCyR-6XbmnDhv2IFPxpxjXV90UY7glTo"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#070707"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * suppressHydrationWarning on <html> is intentional and scoped:
     * the pre-paint MOTION GATE script below mutates this element's
     * className (reveal-js) before React hydrates — a deliberate
     * pre-paint mutation, not a server/client drift. Without the
     * attribute, React logs a hydration mismatch on every page load.
     */
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/*
          * All media files and PDF.js come from the jsDelivr CDN.
          * Warming DNS + TCP + TLS while the shell renders means the
          * first heavy request starts the moment the user acts.
          */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />

        {/*
          * MOTION GATE — runs before first paint.
          *
          * The fade-in/reveal system hides `data-reveal` elements ONLY
          * when this class is present, so content stays fully visible
          * when JavaScript is disabled or fails. With the class set
          * pre-paint, there is no flash of visible-then-hidden content
          * and no flash of hidden-then-revealed content on hydration.
          */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'document.documentElement.classList.add("reveal-js");'
          }}
        />
      </head>
      <body>
        <JsonLd data={SITE_ENTITY_GRAPH} />

        {children}

        {/*
          * GLOBAL MUSIC PLAYER HOST (v4.0.2) — mounted exactly once,
          * here in the ROOT layout, so the ONE player store and its
          * ONE <audio> element survive every client-side route
          * navigation (the layout never unmounts during soft
          * navigation). The host ships no player code: it mounts the
          * lazy player surface only after the first explicit playback
          * intent, or immediately when a persisted session exists
          * (restored as a PAUSED player — never autoplaying).
          * Static-export safe: the host renders nothing in the
          * exported HTML before engagement.
          */}
        <GlobalMusicPlayerHost />

        {/*
          * GLOBAL ROUTE TRANSITION (v4.0.4) — mounted exactly once,
          * here in the ROOT layout, so the unified real-route loading
          * surface survives every client-side navigation (the same
          * law as the player host above). Display-only: it captures
          * navigation INTENT through a passive click listener, shows
          * the site's signal language only when a navigation outlives
          * its grace period, and dismisses when the destination route
          * has committed. It never blocks interaction, never delays a
          * route, and ships inert in the static export.
          */}
        <GlobalRouteTransition />
      </body>
    </html>
  );
}
