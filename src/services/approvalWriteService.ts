import type { Address } from "viem";

import { erc20Abi } from "../config/erc20Abi";
import { DEX_CONFIG } from "../config/dex";

export function encodeApproveTransaction(
  tokenAddress: Address,
  amount: bigint
) {
  return {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "approve" as const,
    args: [
      DEX_CONFIG.routerAddress,
      amount,
    ],
  };
}