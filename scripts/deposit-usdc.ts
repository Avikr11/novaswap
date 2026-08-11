import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import "dotenv/config";

const ROUTER_ADDRESS =
  "0x89e1b03b77cabccdc92ad6c2c26bd19ed2984d35" as const;

const USDC_ADDRESS =
  "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as const;

const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

const routerAbi = [
  {
    type: "function",
    name: "depositToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;

const rpcUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;

if (!rpcUrl) {
  throw new Error("SEPOLIA_RPC_URL is missing.");
}

if (!privateKey) {
  throw new Error("PRIVATE_KEY is missing.");
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

  const owner = await publicClient.readContract({
    address: ROUTER_ADDRESS,
    abi: routerAbi,
    functionName: "owner",
  });

  if (
    owner.toLowerCase() !== account.address.toLowerCase()
  ) {
    throw new Error(
      "This wallet is not the NovaSwap router owner."
    );
  }

  const walletBalance =
    await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [account.address],
    });

  console.log(
    "Wallet USDC:",
    Number(walletBalance) / 1_000_000
  );

  const amount = parseUnits("10", 6);

  if (walletBalance < amount) {
    throw new Error(
      "Wallet does not have 100 USDC."
    );
  }

  console.log("Approving 100 USDC...");

  const approveHash =
    await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [
        ROUTER_ADDRESS,
        amount,
      ],
    });

  console.log(
    "Approval transaction:",
    approveHash
  );

  await publicClient.waitForTransactionReceipt({
    hash: approveHash,
  });

  console.log("Approval confirmed.");

  console.log("Depositing 100 USDC into NovaSwap...");

  const depositHash =
    await walletClient.writeContract({
      address: ROUTER_ADDRESS,
      abi: routerAbi,
      functionName: "depositToken",
      args: [
        USDC_ADDRESS,
        amount,
      ],
    });

  console.log(
    "Deposit transaction:",
    depositHash
  );

  await publicClient.waitForTransactionReceipt({
    hash: depositHash,
  });

  console.log(
    "SUCCESS: 100 USDC deposited into NovaSwap."
  );

  const routerBalance =
    await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [ROUTER_ADDRESS],
    });

  console.log(
    "Router USDC:",
    Number(routerBalance) / 1_000_000
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});