
import { useState } from "react";

import {
  useAccount,
  useConfig,
  useWaitForTransactionReceipt,
} from "wagmi";

import { writeContract } from "@wagmi/core";
import type { Address } from "viem";
import { sepolia } from "wagmi/chains";

import { erc20Abi } from "../config/erc20Abi";
import { DEX_CONFIG } from "../config/dex";

interface UseTokenApprovalParams {
  tokenAddress: Address;
  amount: bigint;
}

function useTokenApproval({
  tokenAddress,
  amount,
}: UseTokenApprovalParams) {
  const { address: account } = useAccount();

  const wagmiConfig = useConfig();

  const [hash, setHash] =
    useState<`0x${string}` | undefined>();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  async function approve() {
    if (!account) {
      throw new Error(
        "Wallet is not connected."
      );
    }

    if (amount <= 0n) {
      throw new Error(
        "Approval amount must be greater than zero."
      );
    }

    const transactionHash =
      await writeContract(
        wagmiConfig,
        {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [
            DEX_CONFIG.routerAddress,
            amount,
          ],
          account,
          chain: sepolia,
        }
      );

    setHash(transactionHash);

    return transactionHash;
  }

  return {
    approve,
    hash,
    isConfirming,
    isSuccess,
  };
}

export default useTokenApproval;

