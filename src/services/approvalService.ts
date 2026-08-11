import {
  createPublicClient,
  http,
  type Address,
  encodeFunctionData,
  decodeFunctionResult,
} from "viem";

import { sepolia } from "viem/chains";

import { erc20Abi } from "../config/erc20Abi";
import { DEX_CONFIG } from "../config/dex";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export async function getTokenAllowance(
  tokenAddress: Address,
  ownerAddress: Address
): Promise<bigint> {
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      ownerAddress,
      DEX_CONFIG.routerAddress,
    ],
  });

  const result = await publicClient.call({
    to: tokenAddress,
    data,
  });

  if (!result.data) {
  throw new Error(
    "Failed to read token allowance."
  );
}

return decodeFunctionResult({
  abi: erc20Abi,
  functionName: "allowance",
  data: result.data,
});
}