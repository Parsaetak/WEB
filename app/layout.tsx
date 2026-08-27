import type {
  Metadata,
  Viewport
} from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Parsa Tak",
  description:
    "Parsa Tak — an evolving laboratory for AI systems, reasoning architecture, creative technology, and RED MAGIC.",
  applicationName: "Parsa Tak",
  authors: [
    {
      name: "Parsa Tak",
      url: "https://github.com/Parsaetak"
    }
  ],
  creator: "Parsa Tak",
  publisher: "Parsa Tak",
  keywords: [
    "Parsa Tak",
    "AI",
    "artificial intelligence",
    "AI systems",
    "reasoning",
    "creative technology",
    "system architecture",
    "RED MAGIC",
    "RED THEORY"
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
    title: "Parsa Tak",
    description:
      "An evolving laboratory for AI systems, reasoning architecture, creative technology, and RED MAGIC.",
    siteName: "Parsa Tak"
  },
  twitter: {
    card: "summary_large_image",
    title: "Parsa Tak",
    description:
      "An evolving laboratory for AI systems, reasoning architecture, creative technology, and RED MAGIC."
  },
  robots: {
    index: true,
    follow: true
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
    <html lang="en">
      <head>
        {/*
          * All library media and PDF.js come from the jsDelivr CDN.
          * Warming DNS + TCP + TLS while the shell renders means the
          * first heavy request starts the moment the user acts.
          */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
