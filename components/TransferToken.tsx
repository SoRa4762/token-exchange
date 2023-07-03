"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import "./styles.css";
import { ethers } from "ethers";
import { contractWithSigner } from "@/utils/helper";
import { ToastContainer, toast } from "react-toastify";
import ToastOptions from "./ToastOptions";

const TransferToken = () => {
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [receiverAmount, setReceiverAmount] = useState<string>("1.0");

  const tx = async () => {
    try {
      await contractWithSigner.transfer(
        receiverAddress,
        ethers.utils.parseEther(receiverAmount)
      );
    } catch (err) {
      console.log(err);
      toast.error(`${err}`, ToastOptions);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      {/* Ethereum Card UI */}
      <div className="flex card_bg bg-emerald-500 w-80 h-40 rounded-xl p-4">
        <div className="flex justify-between">
          <h1>Ethereum Logo</h1>
          <h2>Info Logo</h2>
        </div>
        <div>
          <h2>Address</h2>
          <h1>Ethereum</h1>
        </div>
      </div>
      {/* token transfer UI */}
      <div className="flex flex-col gap-4 bg-violet-600 py-6 px-4 rounded-2xl w-2/3 sm:w-2/3">
        <Input
          type="text"
          placeholder="Address To"
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Amount (MORB)"
          value={receiverAmount}
          onChange={(e) => setReceiverAmount(e.target.value)}
        />
        <Input type="text" placeholder="Keyword (Gif)" />
        <Input type="text" placeholder="Enter Message" />
        <hr className="border-t-2" />
        <Button
          className="w-full ring-1 ring-white rounded-3xl bg-emerald-500 hover:bg-emerald-600"
          onClick={() => tx()}
        >
          Send Now
        </Button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default TransferToken;
