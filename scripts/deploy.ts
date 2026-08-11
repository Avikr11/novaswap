
import { network } from "hardhat";

const { viem } = await network.connect();

const publicClient = await viem.getPublicClient();
const [deployer] = await viem.getWalletClients();

console.log("Deploying from:", deployer.account.address);
console.log("Chain ID:", await publicClient.getChainId());

const router = await viem.deployContract("NovaSwapRouter");

console.log("NovaSwapRouter deployed to:", router.address);

