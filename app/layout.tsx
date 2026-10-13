import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sports Roulette",
  description: "Spin the wheel, draft a team, survive the chaos, win the title. Football, basketball, hockey.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
