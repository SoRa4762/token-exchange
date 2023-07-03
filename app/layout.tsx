// "use client";

// import { ThirdwebWeb3Provider } from "@/components/Client";
// import { ThirdwebWeb3Provider } from "@3rdweb/hooks";

import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Token Exchange",
  description: "This is my attempt to create token exchange app",
};

// const supportedChainsIds = [1, 100];
// const connectors = {
//   injected: {},
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ThirdwebWeb3Provider
    //   supportedChainIds={supportedChainsIds}
    //   connectors={connectors}
    // >
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
    // </ThirdwebWeb3Provider>
  );
}
