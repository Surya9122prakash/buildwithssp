import type { Metadata } from "next";
import { StoreProvider } from "@/lib/redux/provider";
import Background3D from "@/components/Background3D";
import "./globals.css";

export const metadata: Metadata = {
  title: "Developer Portfolio | Creative Full-Stack Engineer",
  description: "A premium portfolio website showcasing interactive scroll animations using GSAP and ScrollTrigger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Background3D />
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
