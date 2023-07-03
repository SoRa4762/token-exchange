// "use client";

import ConnectWallet from "@/components/ConnectWallet";
import LatestTransactions from "@/components/LatestTransactions";
import TransferToken from "@/components/TransferToken";
import "./globals.css";

export default function Home() {
  return (
    <>
      <div className="flex flex-col h-full w-screen items-center bg-violet-900 text-white bg_img gap-10">
        <div className="flex md:flex-row items-center flex-col gap-10 w-full md:justify-around pt-20">
          <ConnectWallet />
          <TransferToken />
        </div>
        <LatestTransactions />
      </div>
    </>
  );
}
