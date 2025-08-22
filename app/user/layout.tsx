// app/layout.tsx or pages/_app.tsx
"use client";

import { HelmetProvider } from "react-helmet-async";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <HelmetProvider>
          {children}
        </HelmetProvider>
      </body>
    </html>
  );
}
