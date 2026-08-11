import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import type { Address, Hash } from "viem";

import { DEX_CONFIG } from "../config/dex";

const routerAbi = [
  {
    type: "function",
    name: "swapExactETHForTokens",
    stateMutability: "payable",
    inputs: [
      {
        name: "amountOutMin",
        type: "uint256",
      },
      {
        name: "path",
        type: "address[]",
      },
      {
        name: "to",
        type: "address",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "amounts",
        type: "uint256[]",
      },
    ],
  },
  {
    type: "function",
    name: "swapExactTokensForTokens",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "amountIn",
        type: "uint256",
      },
      {
        name: "amountOutMin",
        type: "uint256",
      },
      {
        name: "path",
        type: "address[]",
      },
      {
        name: "to",
        type: "address",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "amounts",
        type: "uint256[]",
      },
    ],
  },
] as const;

export function useTokenSwap() {
  const { address, chainId } = useAccount();
  const { data: walletClient } =
    useWalletClient();

  const publicClient = usePublicClient();

  async function swapETHForToken(
    amountIn: bigint,
    tokenOut: Address,
    amountOutMin: bigint
  ): Promise<Hash> {
    if (!address) {
      throw new Error(
        "Wallet is not connected."
      );
    }

    if (!walletClient) {
      throw new Error(
        "Wallet client is unavailable."
      );
    }

    if (!publicClient) {
      throw new Error(
        "Public client is unavailable."
      );
    }

    if (chainId !== 11155111) {
      throw new Error(
        "Please switch to Sepolia."
      );
    }

    const deadline =
      BigInt(
        Math.floor(Date.now() / 1000) + 1200
      );

    const hash =
      await walletClient.writeContract({
        address:
          DEX_CONFIG.routerAddress as Address,
        abi: routerAbi,
        functionName:
          "swapExactETHForTokens",
        args: [
          amountOutMin,
          [
            "0x0000000000000000000000000000000000000000",
            tokenOut,
          ],
          address,
          deadline,
        ],
        value: amountIn,
        chain: walletClient.chain,
        account: address,
      });

    await publicClient.waitForTransactionReceipt({
      hash,
    });

    return hash;
  }

  async function swapTokenForToken(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: bigint,
    amountOutMin: bigint
  ): Promise<Hash> {
    if (!address) {
      throw new Error(
        "Wallet is not connected."
      );
    }

    if (!walletClient) {
      throw new Error(
        "Wallet client is unavailable."
      );
    }

    if (!publicClient) {
      throw new Error(
        "Public client is unavailable."
      );
    }

    if (chainId !== 11155111) {
      throw new Error(
        "Please switch to Sepolia."
      );
    }

    const deadline =
      BigInt(
        Math.floor(Date.now() / 1000) + 1200
      );

    const hash =
      await walletClient.writeContract({
        address:
          DEX_CONFIG.routerAddress as Address,
        abi: routerAbi,
        functionName:
          "swapExactTokensForTokens",
        args: [
          amountIn,
          amountOutMin,
          [tokenIn, tokenOut],
          address,
          deadline,
        ],
        chain: walletClient.chain,
        account: address,
      });

    await publicClient.waitForTransactionReceipt({
      hash,
    });

    return hash;
  }

  return {
    swapETHForToken,
    swapTokenForToken,
  };
}