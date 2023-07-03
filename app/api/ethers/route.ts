import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";

//using ethers
const provider = new ethers.JsonRpcProvider(
  `https://goerli.infura.io/v3${process.env.INFURA_API_KEY}`
);
const signer = provider.getSigner();

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint)",
  "function owner() view returns (address)",
];

const ADDRESS = process.env.ADDRESS;
const TOKENCONTRACT = process.env.TOKENCONTRACT;

const contract = new ethers.Contract(TOKENCONTRACT, ERC20_ABI, provider);

export const GET = async (request: NextRequest) => {
  const balance = await contract.balance();
  const address = await contract.address();
  return new NextResponse(ethers.formatEther(balance), address);
};
