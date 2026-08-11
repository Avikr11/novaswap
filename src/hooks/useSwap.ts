import { useEffect, useState } from "react";

import {
  useAccount,
  useChainId,
  useConfig,
  useWaitForTransactionReceipt,
} from "wagmi";

import { writeContract } from "@wagmi/core";

import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
  parseUnits,
  type Address,
} from "viem";

import { sepolia } from "viem/chains";

import { routerAbi } from "../config/routerAbi";
import { DEX_CONFIG } from "../config/dex";

import {
  addSwapHistory,
  updateSwapHistoryStatus,
} from "../services/historyService";

interface UseSwapParams {
  fromToken: {
    symbol: string;
    address: Address;
    decimals: number;
  };

  toToken: {
    symbol: string;
    address: Address;
    decimals: number;
  };

  fromAmount: string;
  toAmount: string;
}

const SEPOLIA_CHAIN_ID = 11155111;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

function useSwap({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
}: UseSwapParams) {
  const { address: account } = useAccount();

  const chainId = useChainId();

  const wagmiConfig = useConfig();

  const [hash, setHash] =
    useState<`0x${string}` | undefined>();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const isSupportedNetwork =
    chainId === SEPOLIA_CHAIN_ID;

  async function getRouterQuote(
    amountIn: bigint,
    tokenIn: Address,
    tokenOut: Address,
  ): Promise<bigint> {
    const data = encodeFunctionData({
      abi: routerAbi,
      functionName: "getAmountOut",
      args: [
        amountIn,
        tokenIn,
        tokenOut,
      ],
    });

    const result =
      await publicClient.call({
        to: DEX_CONFIG.routerAddress,
        data,
      });

    if (!result.data) {
      throw new Error(
        "Failed to get swap quote from router.",
      );
    }

    const decoded =
      decodeFunctionResult({
        abi: routerAbi,
        functionName: "getAmountOut",
        data: result.data,
      });

    if (typeof decoded !== "bigint") {
      throw new Error(
        "Router returned an invalid quote.",
      );
    }

    return decoded;
  }

  function getSwapSettings() {
    const savedSlippage =
      localStorage.getItem(
        "novaswap_slippage",
      );

    const savedDeadline =
      localStorage.getItem(
        "novaswap_deadline",
      );

    const slippage =
      Number(savedSlippage ?? "0.5");

    const deadlineMinutes =
      Number(savedDeadline ?? "20");

    if (
      !Number.isFinite(slippage) ||
      slippage <= 0 ||
      slippage >= 100
    ) {
      throw new Error(
        "Invalid slippage setting.",
      );
    }

    if (
      !Number.isFinite(deadlineMinutes) ||
      deadlineMinutes <= 0
    ) {
      throw new Error(
        "Invalid transaction deadline setting.",
      );
    }

    return {
      slippage,
      deadlineMinutes,
    };
  }

  /*
   * Update local transaction history
   * when the blockchain confirms or rejects
   * the submitted transaction.
   */
  useEffect(() => {
    if (!hash) {
      return;
    }

    if (!hash) {
  return;
}

if (isSuccess) {
  updateSwapHistoryStatus(
    hash,
    "success",
  );
} else if (isError) {
  updateSwapHistoryStatus(
    hash,
    "failed",
  );
}
  }, [
    hash,
    isSuccess,
    isError,
  ]);

  async function swap() {
    /*
     * Wallet must be connected.
     */
    if (!account) {
      throw new Error(
        "Wallet is not connected.",
      );
    }

    /*
     * NovaSwap only supports Sepolia.
     */
    if (!isSupportedNetwork) {
      throw new Error(
        "Please switch your wallet to Sepolia before swapping.",
      );
    }

    /*
     * Validate input amount.
     */
    if (
      !fromAmount ||
      Number(fromAmount) <= 0
    ) {
      throw new Error(
        "Enter a valid amount.",
      );
    }

    /*
     * Validate output amount.
     */
    if (
      !toAmount ||
      Number(toAmount) <= 0
    ) {
      throw new Error(
        "Invalid output amount.",
      );
    }

    /*
     * Read user's saved swap settings.
     */
    const {
      slippage,
      deadlineMinutes,
    } = getSwapSettings();

    /*
     * NovaSwapRouter uses address(0)
     * for native ETH.
     */
    const nativeToken =
      "0x0000000000000000000000000000000000000000" as Address;

    const tokenIn =
      fromToken.symbol === "ETH"
        ? nativeToken
        : fromToken.address;

    const tokenOut =
      toToken.symbol === "ETH"
        ? nativeToken
        : toToken.address;

    /*
     * Router path.
     */
    const path: Address[] = [
      tokenIn,
      tokenOut,
    ];

    /*
     * Convert user amount to token units.
     */
    let amountIn: bigint;

    try {
      amountIn = parseUnits(
        fromAmount,
        fromToken.decimals,
      );
    } catch {
      throw new Error(
        "Invalid amount format.",
      );
    }

    if (amountIn <= 0n) {
      throw new Error(
        "Enter a valid amount.",
      );
    }

    /*
     * Get fresh quote directly from router.
     */
    const quotedAmountOut =
      await getRouterQuote(
        amountIn,
        tokenIn,
        tokenOut,
      );

    if (quotedAmountOut <= 0n) {
      throw new Error(
        "Router returned an invalid quote.",
      );
    }

    /*
     * Convert slippage percentage into
     * basis points.
     *
     * Example:
     * 0.5% = 50 basis points
     */
    const slippageBasisPoints =
      BigInt(
        Math.round(
          slippage * 100,
        ),
      );

    /*
     * Calculate minimum amount received.
     */
    const amountOutMin =
      (quotedAmountOut *
        (10000n -
          slippageBasisPoints)) /
      10000n;

    if (amountOutMin <= 0n) {
      throw new Error(
        "Invalid minimum output amount.",
      );
    }

    /*
     * Transaction deadline based on
     * user's Settings value.
     */
    const deadline =
      BigInt(
        Math.floor(
          Date.now() / 1000,
        ) +
          Math.floor(
            deadlineMinutes * 60,
          ),
      );

    let transactionHash:
      | `0x${string}`;

    /*
     * ETH -> ERC20
     */
    if (
      fromToken.symbol === "ETH"
    ) {
      transactionHash =
        await writeContract(
          wagmiConfig,
          {
            address:
              DEX_CONFIG.routerAddress,

            abi: routerAbi,

            functionName:
              "swapExactETHForTokens",

            args: [
              amountOutMin,
              path,
              account,
              deadline,
            ],

            value: amountIn,

            account,

            chain: sepolia,
          },
        );
    }

    /*
     * ERC20 -> ETH
     */
    else if (
      toToken.symbol === "ETH"
    ) {
      transactionHash =
        await writeContract(
          wagmiConfig,
          {
            address:
              DEX_CONFIG.routerAddress,

            abi: routerAbi,

            functionName:
              "swapExactTokensForETH",

            args: [
              amountIn,
              amountOutMin,
              path,
              account,
              deadline,
            ],

            account,

            chain: sepolia,
          },
        );
    }

    /*
     * ERC20 -> ERC20
     */
    else {
      transactionHash =
        await writeContract(
          wagmiConfig,
          {
            address:
              DEX_CONFIG.routerAddress,

            abi: routerAbi,

            functionName:
              "swapExactTokensForTokens",

            args: [
              amountIn,
              amountOutMin,
              path,
              account,
              deadline,
            ],

            account,

            chain: sepolia,
          },
        );
    }

    /*
     * Save transaction hash.
     */
    setHash(transactionHash);

    /*
     * Add transaction to local history
     * as pending immediately after the
     * transaction is submitted.
     */
    addSwapHistory({
      id: transactionHash,
      hash: transactionHash,
      account,
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      fromAmount,
      toAmount,
      status: "pending",
      timestamp: Date.now(),
    });

    return transactionHash;
  }

  return {
    swap,
    hash,
    isConfirming,
    isSuccess,
    isSupportedNetwork,
  };
}

export default useSwap;