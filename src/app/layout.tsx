import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://designbrooks.netlify.app"),
  title: {
    default: "Design Brooks | Architecture & Interiors",
    template: "%s | Design Brooks",
  },
  description:
    "Design Brooks is an architecture and interior design studio creating refined residential, cultural, and workplace environments.",
  icons: { icon: "/images/loggoo-64.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
