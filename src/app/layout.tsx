import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Pokémon Finding Calculator | By Santosh Thapa",
  description:
    "Created by Santosh Thapa, this Pokémon Finding Calculator helps you easily calculate encounter rates and probabilities to find your favorite Pokémon in any region.",
  keywords: [
    "Pokémon calculator",
    "Pokémon finding tool",
    "encounter rate calculator",
    "Pokémon search tool",
    "Santosh Thapa",
    "Pokémon odds",
    "shiny hunting calculator",
    "Pokémon probability",
    "GBA Pokémon tools",
    "trainer utilities",
  ],
  metadataBase: new URL("https://pfc-app-mauve.vercel.app/"),
  openGraph: {
    title: "Pokémon Finding Calculator | By Santosh Thapa",
    description:
      "Discover your Pokémon with ease. Built by Santosh Thapa, this calculator estimates encounter odds and helps trainers optimize their search.",
    url: "https://pfc-app-mauve.vercel.app/",
    siteName: "Pokémon Finding Calculator",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [
    { name: "Santosh Thapa", url: "https://santosh-gamma.vercel.app/" },
  ],
  creator: "Santosh Thapa",
  publisher: "Santosh Thapa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.cdnfonts.com/css/pokemon-solid"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
