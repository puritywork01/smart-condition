import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Condition Web App",
  description: "Web application for recording and analyzing plastic injection molding conditions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="gradient-bg">{children}</body>
    </html>
  );
}
