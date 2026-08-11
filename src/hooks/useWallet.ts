import {
  useAccount,
  useBalance,
  useChainId,
  useSwitchChain,
} from "wagmi";

const SEPOLIA_CHAIN_ID = 11155111;

function useWallet() {
  const { address, isConnected, chain } = useAccount();

  const chainId = useChainId();

  const { switchChain, isPending: isSwitchingNetwork } =
    useSwitchChain();

  const { data: balance, isLoading: isBalanceLoading } =
    useBalance({
      address,
      chainId: SEPOLIA_CHAIN_ID,
    });

  const isSupportedNetwork =
    chainId === SEPOLIA_CHAIN_ID;

  async function switchToSepolia() {
    try {
      await switchChain({
        chainId: SEPOLIA_CHAIN_ID,
      });
    } catch (error) {
      console.error(
        "Failed to switch network:",
        error,
      );

      throw error;
    }
  }

  return {
    address,
    isConnected,
    chain,
    chainId,
    balance,
    isBalanceLoading,
    isSupportedNetwork,
    isSwitchingNetwork,
    switchToSepolia,
  };
}

export default useWallet;