import type { Metadata } from "next";
import { StoreProvider } from "@/lib/redux/provider";
import Background3D from "@/components/Background3D";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuildWithSSP | Websites, Web Apps & Digital Solutions",
  description: "BuildWithSSP develops business websites, custom web applications, API integrations, and digital solutions for clients worldwide.",
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
