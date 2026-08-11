import { createPublicClient, createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import "dotenv/config";

const ROUTER_ADDRESS =
  "0x89e1b03b77cabccdc92ad6c2c26bd19ed2984d35" as const;

const USDC_ADDRESS =
  "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as const;

const ETH_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

const routerAbi = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "setRate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "rate", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "rates",
    stateMutability: "view",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

const rpcUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;

if (!rpcUrl) {
  throw new Error("SEPOLIA_RPC_URL is missing from .env");
}

if (!privateKey) {
  throw new Error("PRIVATE_KEY is missing from .env");
}

const account = privateKeyToAccount(
  privateKey as `0x${string}`
);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(rpcUrl),
});

async function main() {
  console.log("Wallet:", account.address);
  console.log("Router:", ROUTER_ADDRESS);

  const owner = await publicClient.readContract({
    address: ROUTER_ADDRESS,
    abi: routerAbi,
    functionName: "owner",
  });

  console.log("Router owner:", owner);

  if (
    owner.toLowerCase() !== account.address.toLowerCase()
  ) {
    throw new Error(
      "Your PRIVATE_KEY wallet is NOT the owner of the deployed router."
    );
  }

  /*
   * 1 ETH = 1918.5969 USDC
   *
   * NovaSwap's contract expects the rate
   * scaled by 1e18.
   */
  const ethToUsdcRate = parseUnits(
    "1918.5969",
    18
  );

  console.log(
    "Setting ETH -> USDC rate:",
    ethToUsdcRate.toString()
  );

  const hash = await walletClient.writeContract({
    address: ROUTER_ADDRESS,
    abi: routerAbi,
    functionName: "setRate",
    args: [
      ETH_ADDRESS,
      USDC_ADDRESS,
      ethToUsdcRate,
    ],
  });

  console.log("Transaction:", hash);

  console.log("Waiting for confirmation...");

  await publicClient.waitForTransactionReceipt({
    hash,
  });

  console.log("Rate transaction confirmed.");

  const savedRate = await publicClient.readContract({
    address: ROUTER_ADDRESS,
    abi: routerAbi,
    functionName: "rates",
    args: [
      ETH_ADDRESS,
      USDC_ADDRESS,
    ],
  });

  console.log(
    "ETH -> USDC rate:",
    savedRate.toString()
  );

  console.log("SUCCESS: ETH -> USDC pair is configured.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});