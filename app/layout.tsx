import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RemixKit",
  description: "Open-source AI workflow for generating video ad variations from reference creatives."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

