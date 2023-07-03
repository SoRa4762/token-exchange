"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  infuraProvider,
  infuraMainProvider,
  utils,
  myEthers,
} from "@/utils/helper";
import { ERC_20_ABI } from "@/utils/ABI";
import { toast, ToastContainer } from "react-toastify";
import ToastOptions from "./ToastOptions";
import axios from "axios";
import abiDecoder from "abi-decoder";
import { Loader2 } from "lucide-react";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import BoltIcon from "@mui/icons-material/Bolt";

interface ITransactionAction {
  type: string;
  toAmount: string;
  toSymbol: string;
  fromAmount: string;
  fromSymbol: string;
  routerAddress: string;
}

interface ITransferDetails {
  address: string;
  src: string;
  dst: string;
  value: string;
}

interface IInputData {
  amountIn: string;
  amountOutMin: string;
  deadline: string;
  srcToken: string;
  dstToken: string;
  initiator: string;
}

type VOTD = {
  address: string;
  value: string;
};

type VOSD = {
  address: string;
  type: string;
  swapAmountIn: string;
  swapAmountOut: string;
  routerAddress: string;
};

const LatestTransactions = () => {
  const [hashAddress, setHashAddress] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  // const [amountIn, setAmountIn] = useState<string>("");
  // const [amountOutMin, setAmountOutMin] = useState<string>("");
  // const [firstTokenAddress, setFirstTokenAddress] = useState<string>("");
  // const [secondTokenAddress, setSecondTokenAddress] = useState<string>("");
  // const [initiatorAddress, setInitiatorAddress] = useState<string>("");
  // const [deadline, setDeadline] = useState<string>("");

  //for Transaction Action
  const [loading, setLoading] = useState<boolean>(false);
  const [transactionAction, setTransactionAction] = useState<
    ITransactionAction[]
  >([]);

  //for Transfer
  const [transferDetails, setTransferDetails] = useState<ITransferDetails[]>(
    []
  );

  //for Input Data
  const [inputData, setInputData] = useState<IInputData[]>([]);
  const inputDataList: IInputData[] = [];
  let amountIn;
  let amountOutMin;
  let initiator;
  let deadline;
  let path;

  //* decoding transaction value from transaction action
  const getTransactionDetails = async (hashAddress: string) => {
    setLoading(true);
    const decodedLogs: string[] = [];

    try {
      const receipt = await infuraMainProvider.getTransactionReceipt(
        hashAddress
      );
      const transaction = await infuraMainProvider.getTransaction(hashAddress);
      console.log("This is Receipt: ", receipt);
      console.log("This is Transaction: ", transaction);

      if (transaction && receipt) {
        const tokenContractAddress = receipt.to;
        const inputData = transaction.data;
        const tokenContractAbi: any = await axios.get(
          `https://api.etherscan.io/api?module=contract&action=getabi&address=${tokenContractAddress}&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_TOKEN}`
        );
        const ec20Abi = JSON.parse(tokenContractAbi.data.result);
        abiDecoder.addABI(ec20Abi);

        let decodedInputData;
        try {
          decodedInputData = abiDecoder.decodeMethod(inputData);

          //setting inputDatas
          deadline = decodedInputData.params.find(
            (deadline: string) => deadline.name === "deadline"
          );
          amountIn = decodedInputData.params.find(
            (amountIn: string) => amountIn.name === "amountIn"
          );
          amountOutMin = decodedInputData.params.find(
            (amountOutMin: string) => amountOutMin.name === "amountOutMin"
          );
          path = decodedInputData.params.find(
            (path: string[]) => path.name === "path"
          );
          initiator = decodedInputData.params.find(
            (to: string) => to.name === "to"
          );

          //pushing it to array
          inputDataList.push({
            amountIn: amountIn.value,
            amountOutMin: amountOutMin.value,
            srcToken: path.value[0],
            dstToken: path.value[1],
            initiator: initiator.value,
            deadline: deadline.value,
          });
          setInputData(inputDataList);
        } catch (err) {
          console.log(err);
          toast.info("Attempt: Decoding Inner Input Data", ToastOptions);

          //Inner Input Data: Decoding
          try {
            const innerInputDataDecoded = abiDecoder.decodeMethod(
              decodedInputData.params[1].value[0]
            );
            amountIn = innerInputDataDecoded.params.find(
              (amountIn: string) => amountIn.name === "amountIn"
            );
            amountOutMin = innerInputDataDecoded.params.find(
              (amountOutMin: string) => amountOutMin.name === "amountOutMin"
            );
            path = innerInputDataDecoded.params.find(
              (path: string[]) => path.name === "path"
            );
            initiator = innerInputDataDecoded.params.find(
              (to: string) => to.name === "to"
            );

            //pushing it to array
            inputDataList.push({
              amountIn: amountIn.value,
              amountOutMin: amountOutMin.value,
              srcToken: path.value[0],
              dstToken: path.value[1],
              initiator: initiator.value,
              deadline: deadline.value,
            });
            setInputData(inputDataList);
            console.log(innerInputDataDecoded);
          } catch (err) {
            console.log(err);
            toast.error("Error: Failed to Decode Input Data", ToastOptions);
          }
        }

        // loop to get logs abis and decode logs
        for (let i = 0; i < receipt.logs.length; i++) {
          const logsAddress: string = receipt.logs[i].address;
          const logsAbi: any = await axios.get(
            `https://api.etherscan.io/api?module=contract&action=getabi&address=${logsAddress}&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_TOKEN}`
          );
          abiDecoder.addABI(JSON.parse(logsAbi.data.result));

          const decodedLog = abiDecoder.decodeLogs(receipt.logs);
          decodedLogs.push(decodedLog);
          // console.log("Individual Decoded Log: ", decodedLog);
        }

        //setting up data after getting from loop
        const lastDecodedLog: any = decodedLogs[decodedLogs.length - 1];
        const transferData: any = lastDecodedLog.filter(
          (log: any) => log.name === "Transfer"
        );
        const swapData: any = lastDecodedLog.filter(
          (log: any) => log.name === "Swap"
        );

        //arrays setup for useState arrays
        const valueOfTransferData: any = [];
        const valueOfSwapData: any = [];
        const finalSwapDetails: ITransactionAction[] = [];

        //for loop to get necessary data out of transferData
        for (let j = 0; j < transferData.length; j++) {
          const src = transferData[j].events.find(
            (src: any) => src.name === "src"
          );
          const dst = transferData[j].events.find(
            (dst: any) => dst.name === "dst"
          );
          const transferValue = transferData[j].events.find(
            (value: any) => value.name === "wad" || value.name === "value"
          );

          valueOfTransferData.push({
            address: transferData[j].address,
            value: transferValue.value,
            src: src.value,
            dst: dst.value,
          });

          //setting all the necessary data for transfer details
          setTransferDetails(valueOfTransferData);
        }

        //for loop to get necessary data out of swapData
        for (let k = 0; k < swapData.length; k++) {
          //for amountIn
          const swapAmount0In = swapData[k].events.find(
            (value: any) => value.name === "amount0In"
          );
          const swapAmount1In = swapData[k].events.find(
            (value: any) => value.name === "amount1In"
          );
          const exceptionAmountIn = swapData[k].events.find(
            (value: any) => value.value > value.value
          );
          const swapAmountIn = exceptionAmountIn
            ? exceptionAmountIn
            : Number(swapAmount0In.value) + Number(swapAmount1In.value);

          //for amount out
          const swapAmount0Out = swapData[k].events.find(
            (value: any) => value.name === "amount0Out"
          );
          const swapAmount1Out = swapData[k].events.find(
            (value: any) => value.name === "amount1Out"
          );
          const exceptionAmountOut = swapData[k].events.find(
            (value: any) => value.value < value.value
          );
          const swapAmountOut = exceptionAmountOut
            ? exceptionAmountOut
            : Number(swapAmount0Out.value) + Number(swapAmount1Out.value);

          //for router address
          const routerAddress = swapData[k].events.find(
            (value: any) => value.name === "sender"
          );

          valueOfSwapData.push({
            type: swapData[k].name,
            swapAmountIn: swapAmountIn,
            swapAmountOut: swapAmountOut,
            routerAddress: routerAddress.value,
          });
        }
        // console.log("transfer Data Organized: ", valueOfTransferData);
        // console.log("swap Data Organized: ", valueOfSwapData);

        //looping swap to compare the amounts
        for (let l = 0; l < valueOfSwapData.length; l++) {
          let amountIn = valueOfSwapData[l].swapAmountIn;
          let amountOut = valueOfSwapData[l].swapAmountOut;
          const type = valueOfSwapData[l].type;
          const routerAddress = valueOfSwapData[l].routerAddress;

          //getting the closest amountIn by comparing
          const amount0 = valueOfTransferData.reduce((prev: any, curr: any) => {
            return Math.abs(curr.value.toString() - amountIn) <
              Math.abs(prev.value.toString() - amountIn)
              ? curr
              : prev;
          });

          //getting index for AmountIn
          const transIndexIn = valueOfTransferData.findIndex(
            (transData: any) =>
              Math.abs(transData.value.toString()) ===
              Math.abs(amount0.value.toString())
          );

          //create contract for AmountIn
          const contractIn = new myEthers.Contract(
            valueOfTransferData[transIndexIn].address,
            ERC_20_ABI,
            infuraMainProvider
          );

          const fromSymbol = await contractIn.symbol();
          const fromDecimal = await contractIn.decimals();

          //for comparing amount out
          const amount1 = valueOfTransferData.reduce((prev: any, curr: any) => {
            return Math.abs(prev.value.toString() - amountOut) <
              Math.abs(curr.value.toString() - amountOut)
              ? prev
              : curr;
          });

          //find index for amountOut
          const transIndexOut = valueOfTransferData.findIndex(
            (transData: any) =>
              Math.abs(transData.value.toString()) ===
              Math.abs(amount1.value.toString())
          );

          //creating a contract for amountOut
          const contractOut = new myEthers.Contract(
            valueOfTransferData[transIndexOut].address,
            ERC_20_ABI,
            infuraMainProvider
          );

          //getting symbol & decimal
          const toDecimal = await contractOut.decimals();
          const toSymbol = await contractOut.symbol();

          //pushing all the necessary data for transaction action
          finalSwapDetails.push({
            type: type,
            fromSymbol: fromSymbol,
            fromAmount: utils.formatUnits(amount0.value, fromDecimal),
            toSymbol: toSymbol,
            toAmount: utils.formatUnits(amount1.value, toDecimal),
            routerAddress: routerAddress,
          });
          setTransactionAction(finalSwapDetails);
          setLoading(false);
        }
      }
      setLoading(false);
    } catch (error: any) {
      toast.error(`${error}`, ToastOptions);
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center h-full w-screen overflow-auto">
        <h1 className="font-bold text-xl">Latest Transactions</h1>
        {transactionAction.length > 0 && (
          <div className="flex justify-center h-full w-full">
            <div className="flex flex-col w-full h-full items-center justify-center pt-2">
              {/* transaction action card */}
              <div className="flex items-center w-full md:justify-center">
                <div className="flex h-full relative">
                  <div className="flex flex-col h-full w-full rounded-2xl bg-violet-600 py-6 px-4 text-sm md:text-base">
                    <div
                      className="grid w-full h-full"
                      style={{ gridTemplateColumns: "25% 75%" }}
                    >
                      <h1 className="font-bold text-l">
                        <BoltIcon /> Transaction Action:
                      </h1>
                      {transactionAction.map(
                        (
                          {
                            type,
                            fromAmount,
                            fromSymbol,
                            toAmount,
                            toSymbol,
                            routerAddress,
                          },
                          index
                        ) => {
                          return (
                            <div
                              key={index}
                              className="flex flex-row justify-center w-full"
                            >
                              <p className="text-sm">
                                <ArrowRightIcon fontSize="medium" />{" "}
                                <span className="text-emerald-400 font-bold">
                                  {type}
                                </span>{" "}
                                {fromAmount}{" "}
                                <span className="text-emerald-400 font-bold">
                                  {fromSymbol}
                                </span>{" "}
                                For {toAmount}{" "}
                                <span className="text-emerald-400 font-bold">
                                  {toSymbol}
                                </span>{" "}
                                On {routerAddress}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* get transaction details through input data */}
        {/* hash address */}
        <div className="flex flex-col gap-4 bg-violet-600 my-6 py-6 px-4 rounded-2xl w-3/4 md:w-2/4">
          <Input
            type="text"
            placeholder="Hash Address"
            value={hashAddress}
            onChange={(e) => setHashAddress(e.target.value)}
          />
          <hr className="border-t-2" />
          <Button
            className="w-full ring-1 ring-white rounded-3xl bg-emerald-500 hover:bg-emerald-600"
            disabled={loading}
            onClick={() => {
              try {
                getTransactionDetails(hashAddress);
                setHashAddress("");
              } catch (err) {
                console.log(err);
                toast.error(`${err}`, ToastOptions);
              }
            }}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Get Details"
            )}
          </Button>
        </div>

        {/* outer most div */}
        <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
          {/* Frist Half */}
          {inputData.length > 0 && (
            <>
              <div className="flex flex-col w-full h-full items-center pt-2">
                <h1 className="font-bold text-base">Input Data: Decoded</h1>
                {/* transaction card */}
                {inputData.map(
                  (
                    {
                      amountIn,
                      amountOutMin,
                      initiator,
                      srcToken,
                      dstToken,
                      deadline,
                    },
                    index
                  ) => {
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center mt-4 w-10/12 md:flex-row md:justify-evenly overflow-hidden"
                      >
                        <div className="flex h-full relative">
                          <div className="flex flex-col h-full w-full rounded-2xl bg-violet-600 py-6 px-4 text-sm md:text-base">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <p className="flex flex-row overflow-hidden gap-1">
                                    <span className="font-bold">
                                      AmountIn:{" "}
                                    </span>
                                    {amountIn}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>{amountIn}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <p className="flex flex-row overflow-hidden gap-1">
                                    <span className="font-bold">
                                      AmountOutMin:{" "}
                                    </span>
                                    {amountOutMin}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>{amountOutMin}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <p className="flex flex-row overflow-hidden gap-1">
                                    <span className="font-bold">
                                      Source Token:{" "}
                                    </span>
                                    {srcToken}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>{srcToken}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <p className="flex flex-row overflow-hidden gap-1">
                                    <span className="font-bold">
                                      Destination Token:{" "}
                                    </span>
                                    {dstToken}
                                  </p>
                                </TooltipTrigger>

                                <TooltipContent>{dstToken}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <p className="flex flex-row overflow-hidden gap-1">
                                    <span className="font-bold">
                                      Initiator Address:{" "}
                                    </span>
                                    {initiator}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>{initiator}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <p className="flex flex-row overflow-hidden gap-1">
                                    <span className="font-bold">
                                      Deadline:{" "}
                                    </span>
                                    {deadline}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>{deadline}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <Image
                              src={"/JS-Wallpaper.jpg"}
                              alt={"image"}
                              className="rounded-xl"
                              width={10000}
                              height={100}
                            />
                            <div className="flex justify-center absolute bottom-2 left-0 right-0">
                              <p className="text-black bg-white rounded-2xl px-2 py-1 text-sm md:text-base">
                                24/05/2023, 6:04 PM
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}

          {/* Second Half */}
          {transferDetails.length > 0 && (
            <>
              <div className="flex flex-col w-full h-full items-center pt-2">
                <h1 className="font-bold text-base">
                  Transfer Details Through Logs
                </h1>
                {/* get transaction details through Logs */}

                {/* transaction card */}
                {transferDetails.map(({ src, dst, value }, index) => {
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-4 mt-4 md:flex-row w-10/12 md:justify-evenly"
                    >
                      <div className="flex h-full relative">
                        <div className="flex flex-col h-full w-full rounded-2xl bg-violet-600 py-6 px-4 text-sm md:text-base">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <p className="flex flex-row overflow-hidden gap-1">
                                  <span className="font-bold">From: </span>
                                  {src}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>{src}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <p className="flex flex-row overflow-hidden gap-1">
                                  <span className="font-bold">To: </span>
                                  {dst}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>{dst}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <p>
                            <span className="font-bold">Amount: </span> {value}{" "}
                          </p>

                          <Image
                            src={"/JS-Wallpaper.jpg"}
                            alt={"image"}
                            className="rounded-xl"
                            width={10000}
                            height={100}
                          />
                          <div className="flex justify-center absolute bottom-2 left-0 right-0">
                            <p className="text-black bg-white rounded-2xl px-2 py-1 text-sm md:text-base">
                              24/05/2023, 6:04 PM
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <ToastContainer />
      </div>
    </>
  );
};

export default LatestTransactions;
