import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "NovaSwap",

  projectId: "8717eb9608bcdacf7b06cf8bb837c778",

  chains: [mainnet, sepolia],

  ssr: false,
});