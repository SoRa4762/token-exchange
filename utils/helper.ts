// import { useState } from "react";
import { ethers } from "ethers";
export const provider = new ethers.providers.Web3Provider(window.ethereum);

// const [errorMessage, setErrorMessage] = useState<string>("");
// const [defaultAccount, setDefaultAccount] = useState<string>("");
// const [userBalance, setUserBalance] = useState<string>("");

//SETTING UP TOKEN CONTRACT TRANSFER
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT; //i cannot do this apparently & i am in no mood of debugging it rn
// const TOKEN_CONTRACT = "0x070DE26032F8E251Ec22D28D9F4ca8B91cDc1901";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)",
];
export const contract = new ethers.Contract(
  TOKEN_CONTRACT,
  ERC20_ABI,
  provider
);
const signer = provider.getSigner();
export const contractWithSigner = contract.connect(signer);

//decoding through transaction hash
export const infuraProvider = new ethers.providers.InfuraProvider(
  "goerli",
  process.env.INFURA_API_KEY
);

export const infuraMainProvider = new ethers.providers.InfuraProvider(
  "mainnet",
  process.env.NEXT_PUBLIC_INFURA_API_KEY
);

export const sig = "Transfer(address, address, uint256)";
export const utils = ethers.utils;
export const myEthers = ethers;
