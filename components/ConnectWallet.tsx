"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ethers } from "ethers";
import { contract, provider } from "@/utils/helper";
import { ToastContainer, toast } from "react-toastify";
import ToastOptions from "./ToastOptions";

declare global {
  interface Window {
    ethereum: any;
  }
}

const ConnectWallet = () => {
  // const [errorMessage, setErrorMessage] = useState<string>("");
  const [defaultAccount, setDefaultAccount] = useState<string>("");
  const [userBalance, setUserBalance] = useState<string>("");

  //connect wallet mate
  const connectwalletHandler = () => {
    if (window.ethereum) {
      provider.send("eth_requestAccounts", []).then(async () => {
        await accountChangedHandler(provider.getSigner());
      });
    } else {
      toast.info("Please Install Metamask", ToastOptions);
    }
  };

  const accountChangedHandler = async (newAccount: string) => {
    const address = await newAccount.getAddress();
    setDefaultAccount(address);
    // const balance = await newAccount.getBalance();
    // setUserBalance(ethers.utils.formatEther(balance));
    await getuserBalance(address);
  };

  const getuserBalance = async (address: string) => {
    // const balance = await provider.getBalance(address, "latest"); //use this to get eth balance
    const balance = await contract.balanceOf(address); // this is to get balance of MORB; token
    setUserBalance(ethers.utils.formatEther(balance));
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-2/3 flex flex-col">
        <h2 className="font-bold text-xl">Connect Your Wallet</h2>
        <div className="flex gap-2">
          {/* {address &&} */}
          <Input
            type="text"
            placeholder="Address"
            disabled={true}
            value={defaultAccount ? defaultAccount : ""}
            className="max-w-lg"
          />
          {defaultAccount ? (
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                try {
                  // disconnectWallet();
                } catch (error) {
                  console.log(error);
                  toast.error(`${error}`, ToastOptions);
                }
              }}
            >
              Disconnect Wallet
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => {
                try {
                  connectwalletHandler();
                } catch (error) {
                  alert(error);
                }
              }}
            >
              Connect Wallet
            </Button>
          )}
        </div>
        <div className="py-2">
          <Input
            type="text"
            placeholder="Balance"
            disabled={true}
            value={userBalance ? userBalance : ""}
            className="max-w-lg"
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ConnectWallet;
