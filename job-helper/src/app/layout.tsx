import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Job Search Helper - Mini POC Project by David Bogar",
  description: "Paste a Job Description here, get matched skills vs gaps and a calculated match percentage",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
