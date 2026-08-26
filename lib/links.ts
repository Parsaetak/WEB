export type PublicLink = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly description?: string;
  readonly verified: boolean;
};

/**
 * Canonical public destinations for the website.
 *
 * Keep external URLs here instead of duplicating them across scenes.
 */
export const PUBLIC_LINKS = {
  social: [
    {
      id: "x",
      label: "X",
      href: "https://x.com/Parsaetak",
      verified: true
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: "https://api.whatsapp.com/send?phone=393515742989",
      verified: true
    },
    {
      id: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/Parsaetak/",
      verified: true
    },
    {
      id: "email",
      label: "Email",
      href: "mailto:Parsaetak@gmail.com",
      verified: true
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/parsaetak",
      verified: true
    },
    {
      id: "github",
      label: "GitHub",
      href: "https://github.com/Parsaetak",
      verified: true
    },
    {
      id: "discord",
      label: "Discord",
      href: "https://discord.com/invite/BXNNcGFPTp",
      verified: true
    },
    {
      id: "tiktok",
      label: "TikTok",
      href: "https://www.tiktok.com/@Parsaetak",
      verified: true
    }
  ] satisfies readonly PublicLink[],

  resources: [
    {
      id: "youtube",
      label: "YouTube",
      href: "https://www.youtube.com/@parsaetak",
      verified: true
    },
    {
      id: "patreon",
      label: "Patreon",
      href: "http://patreon.com/Parsaetak",
      verified: true
    },
    {
      id: "pinterest",
      label: "Pinterest",
      href: "https://www.pinterest.com/parsaetak/",
      verified: true
    },
    {
      id: "telegram-channel",
      label: "Telegram Channel",
      href: "https://t.me/ParsaxTak",
      verified: true
    },
    {
      id: "telegram-account",
      label: "Telegram",
      href: "https://t.me/Parsaetak",
      verified: true
    },
    {
      id: "support",
      label: "Support & Donation",
      href: "https://www.paypal.me/ParsaTak",
      verified: true
    }
  ] satisfies readonly PublicLink[],

  meta: [
    {
      id: "linktree",
      label: "Linktree",
      href: "https://linktr.ee/Parsaetak",
      verified: true
    }
  ] satisfies readonly PublicLink[]
} as const;

export const ALL_PUBLIC_LINKS = [
  ...PUBLIC_LINKS.social,
  ...PUBLIC_LINKS.resources,
  ...PUBLIC_LINKS.meta
] as const;
