
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  parseUnits,
  formatUnits,
  encodeFunctionData,
  decodeFunctionResult,
  type Address,
} from "viem";

import {
  usePublicClient,
  useBalance,
} from "wagmi";

import Card from "../ui/Card";
import Button from "../ui/Button";
import TokenInput from "./TokenInput";
import SwapDirectionButton from "./SwapDirectionButton";
import PriceInfo from "./PriceInfo";
import TokenSelectorModal from "./TokenSelectorModal";

import useWallet from "../../hooks/useWallet";
import useTokenAllowance from "../../hooks/useTokenAllowance";
import useTokenApproval from "../../hooks/useTokenApproval";
import useSwap from "../../hooks/useSwap";

import type { Token } from "../../config/tokens";
import { tokens } from "../../config/tokens";

import { routerAbi } from "../../config/routerAbi";
import { DEX_CONFIG } from "../../config/dex";

function SwapCard() {
  const wallet = useWallet();

  const publicClient = usePublicClient();

  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);

  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const [exchangeRate, setExchangeRate] =
    useState<number | null>(null);

  const [isLoadingQuote, setIsLoadingQuote] =
    useState(false);

  const [priceError, setPriceError] =
    useState("");

  const [
    isFromTokenModalOpen,
    setIsFromTokenModalOpen,
  ] = useState(false);

  const [
    isToTokenModalOpen,
    setIsToTokenModalOpen,
  ] = useState(false);

  const [approvalError, setApprovalError] =
    useState("");

  /*
   * Real ETH balance.
   */
  const {
    data: ethBalance,
  } = useBalance({
    address: wallet.address,
    chainId: 11155111,
  });

  /*
   * Real USDC balance.
   */
  const {
    data: usdcBalance,
  } = useBalance({
    address: wallet.address,
    token: tokens[1].address,
    chainId: 11155111,
  });

  const ethBalanceText =
    ethBalance?.formatted ?? "0";

  const usdcBalanceText =
    usdcBalance?.formatted ?? "0";

  /*
   * Display the correct balance based
   * on the currently selected token.
   */
  const fromBalance =
    fromToken.symbol === "ETH"
      ? ethBalanceText
      : usdcBalanceText;

  const toBalance =
    toToken.symbol === "ETH"
      ? ethBalanceText
      : usdcBalanceText;

  /*
   * Validate entered amount against
   * the user's real token balance.
   */
  const numericFromBalance =
    Number(fromBalance);

  const numericFromAmount =
    Number(fromAmount);

  const hasInsufficientBalance =
    wallet.isConnected &&
    fromAmount.trim() !== "" &&
    Number.isFinite(numericFromAmount) &&
    numericFromAmount > numericFromBalance;

  const insufficientBalanceMessage =
    hasInsufficientBalance
      ? `Insufficient ${fromToken.symbol} balance`
      : "";

  const ownerAddress =
    wallet.address as
      | `0x${string}`
      | undefined;

  const isNativeToken =
    fromToken.symbol === "ETH";

  const isWrongNetwork =
    wallet.isConnected &&
    !wallet.isSupportedNetwork;

  let requiredAmount = 0n;

  if (
    fromAmount &&
    Number(fromAmount) > 0 &&
    fromToken.decimals !== undefined
  ) {
    try {
      requiredAmount = parseUnits(
        fromAmount,
        fromToken.decimals,
      );
    } catch {
      requiredAmount = 0n;
    }
  }

  const {
    allowance,
    isLoading: isAllowanceLoading,
    refetch: refetchAllowance,
  } = useTokenAllowance({
    tokenAddress:
      fromToken.address as `0x${string}`,
    ownerAddress,
    enabled:
      wallet.isConnected &&
      !isWrongNetwork &&
      !isNativeToken &&
      requiredAmount > 0n,
  });

  const {
    approve,
    isConfirming: isApprovalConfirming,
    isSuccess: isApprovalSuccess,
  } = useTokenApproval({
    tokenAddress:
      fromToken.address as `0x${string}`,
    amount: requiredAmount,
  });

  const {
    swap,
    isConfirming: isSwapConfirming,
    isSuccess: isSwapSuccess,
  } = useSwap({
    fromToken,
    toToken,
    fromAmount,
    toAmount,
  });

  const needsApproval =
    !isNativeToken &&
    requiredAmount > 0n &&
    allowance < requiredAmount;

  useEffect(() => {
    if (!isApprovalSuccess) {
      return;
    }

    void refetchAllowance();
  }, [
    isApprovalSuccess,
    refetchAllowance,
  ]);

  /*
   * Fetch swap quote.
   */
  useEffect(() => {
    let isMounted = true;

    async function fetchQuote() {
      if (
        !fromAmount ||
        Number(fromAmount) <= 0
      ) {
        if (isMounted) {
          setToAmount("");
          setExchangeRate(null);
          setPriceError("");
        }

        return;
      }

      if (isWrongNetwork) {
        if (isMounted) {
          setToAmount("");
          setExchangeRate(null);
          setPriceError(
            "Please switch your wallet to Sepolia.",
          );
        }

        return;
      }

      if (!publicClient) {
        if (isMounted) {
          setToAmount("");
          setExchangeRate(null);
          setPriceError(
            "Blockchain client is not available.",
          );
        }

        return;
      }

      try {
        setIsLoadingQuote(true);
        setPriceError("");

        const amountIn = parseUnits(
          fromAmount,
          fromToken.decimals,
        );

        const tokenIn: Address =
          fromToken.symbol === "ETH"
            ? "0x0000000000000000000000000000000000000000"
            : (fromToken.address as Address);

        const tokenOut: Address =
          toToken.symbol === "ETH"
            ? "0x0000000000000000000000000000000000000000"
            : (toToken.address as Address);

        const callData =
          encodeFunctionData({
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
            to:
              DEX_CONFIG.routerAddress as Address,
            data: callData,
          });

        if (!result.data) {
          throw new Error(
            "Router returned no quote data.",
          );
        }

        const decoded =
          decodeFunctionResult({
            abi: routerAbi,
            functionName: "getAmountOut",
            data: result.data,
          });

        const amountOut =
          Array.isArray(decoded)
            ? decoded[0]
            : decoded;

        if (
          typeof amountOut !== "bigint"
        ) {
          throw new Error(
            "Invalid quote returned by router.",
          );
        }

        const formattedAmountOut =
          formatUnits(
            amountOut,
            toToken.decimals,
          );

        const numericOutput =
          Number(formattedAmountOut);

        const numericInput =
          Number(fromAmount);

        if (
          !Number.isFinite(numericOutput) ||
          numericOutput <= 0
        ) {
          throw new Error(
            "Invalid amount returned by router.",
          );
        }

        const rate =
          numericOutput / numericInput;

        if (isMounted) {
          setToAmount(
            numericOutput.toFixed(
              toToken.decimals > 6
                ? 6
                : 4,
            ),
          );

          setExchangeRate(rate);
        }
      } catch (error) {
        console.error(
          "NovaSwap quote failed:",
          error,
        );

        if (isMounted) {
          setToAmount("");
          setExchangeRate(null);

          setPriceError(
            error instanceof Error
              ? error.message
              : "Unable to fetch swap quote.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingQuote(false);
        }
      }
    }

    void fetchQuote();

    return () => {
      isMounted = false;
    };
  }, [
    fromAmount,
    fromToken,
    toToken,
    publicClient,
    isWrongNetwork,
  ]);

  function handleMax() {
    const balance =
      fromToken.symbol === "ETH"
        ? ethBalanceText
        : usdcBalanceText;

    setFromAmount(balance);
  }

  function handleSwapDirection() {
    setFromToken(toToken);
    setToToken(fromToken);

    setFromAmount(toAmount);
    setToAmount(fromAmount);

    setExchangeRate(null);

    setApprovalError("");
    setPriceError("");
  }

  function handleFromTokenSelect(
    token: Token,
  ) {
    setFromToken(token);

    setFromAmount("");
    setToAmount("");

    setExchangeRate(null);

    setApprovalError("");
    setPriceError("");
  }

  function handleToTokenSelect(
    token: Token,
  ) {
    setToToken(token);

    setToAmount("");
    setExchangeRate(null);
    setPriceError("");
  }

  async function handleApprove() {
    try {
      setApprovalError("");

      await approve();
    } catch (error) {
      console.error(
        "Approval failed:",
        error,
      );

      setApprovalError(
        error instanceof Error
          ? error.message
          : "Approval failed. Please try again.",
      );
    }
  }

  async function handleSwap() {
    try {
      setPriceError("");

      await swap();
    } catch (error) {
      console.error(
        "Swap failed:",
        error,
      );

      setPriceError(
        error instanceof Error
          ? error.message
          : "Swap failed. Please try again.",
      );
    }
  }

  const rateText =
    exchangeRate !== null
      ? `1 ${fromToken.symbol} = ${exchangeRate.toFixed(
          4,
        )} ${toToken.symbol}`
      : isLoadingQuote
        ? "Loading rate..."
        : "Rate unavailable";

  let buttonText = "Enter Amount";

  if (fromAmount.trim() !== "") {
    if (!wallet.isConnected) {
      buttonText = "Connect Wallet";
    } else if (isWrongNetwork) {
      buttonText =
        wallet.isSwitchingNetwork
          ? "Switching to Sepolia..."
          : "Switch to Sepolia";
    } else if (hasInsufficientBalance) {
      buttonText =
        insufficientBalanceMessage;
    } else if (isAllowanceLoading) {
      buttonText = "Checking Allowance...";
    } else if (isApprovalConfirming) {
      buttonText =
        `Approving ${fromToken.symbol}...`;
    } else if (needsApproval) {
      buttonText =
        `Approve ${fromToken.symbol}`;
    } else if (isSwapConfirming) {
      buttonText = "Swapping...";
    } else if (isSwapSuccess) {
      buttonText = "Swap Successful";
    } else if (isLoadingQuote) {
      buttonText = "Getting Quote...";
    } else if (toAmount) {
      buttonText = "Swap Tokens";
    }
  }

  async function handlePrimaryAction() {
    if (!wallet.isConnected) {
      return;
    }

    if (isWrongNetwork) {
      await wallet.switchToSepolia();
      return;
    }

    if (hasInsufficientBalance) {
      return;
    }

    if (needsApproval) {
      await handleApprove();
      return;
    }

    await handleSwap();
  }

  const isBusy =
    isAllowanceLoading ||
    isApprovalConfirming ||
    isSwapConfirming ||
    isLoadingQuote ||
    wallet.isSwitchingNetwork;

  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
          y: 18,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.45,
          ease: "easeOut",
        }}
        className="w-full max-w-lg"
      >
        <Card className="w-full p-4 sm:p-6">
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
              duration: 0.3,
            }}
          >
            <h2 className="text-2xl font-semibold">
              Swap
            </h2>

            <p className="text-sm opacity-60">
              Trade tokens on Sepolia
            </p>
          </motion.div>

          <motion.div
            layout
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 28,
            }}
          >
            <TokenInput
              label="From"
              token={fromToken}
              amount={fromAmount}
              balance={fromBalance}
              onAmountChange={setFromAmount}
              onTokenClick={() =>
                setIsFromTokenModalOpen(true)
              }
              showMax
              onMaxClick={handleMax}
            />
          </motion.div>

          <motion.div
            layout
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 28,
            }}
          >
            <SwapDirectionButton
              onClick={handleSwapDirection}
            />
          </motion.div>

          <motion.div
            layout
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 28,
            }}
          >
            <TokenInput
              label="To"
              token={toToken}
              amount={toAmount}
              balance={toBalance}
              onAmountChange={() => {}}
              onTokenClick={() =>
                setIsToTokenModalOpen(true)
              }
              readOnly
            />
          </motion.div>

          <motion.div
            layout
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 28,
            }}
          >
            <PriceInfo
              rate={rateText}
              networkFee="Estimated"
              priceImpact="<0.01%"
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {isWrongNetwork && (
              <motion.div
                key="network-warning"
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-400">
                  Please switch your wallet network
                  to Sepolia to use NovaSwap.
                </div>
              </motion.div>
            )}

            {hasInsufficientBalance && (
              <motion.div
                key="insufficient-balance"
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {insufficientBalanceMessage}
                </div>
              </motion.div>
            )}

            {priceError && !isWrongNetwork && (
              <motion.div
                key="price-error"
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {priceError}
                </div>
              </motion.div>
            )}

            {approvalError && (
              <motion.div
                key="approval-error"
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {approvalError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            whileHover={
              !isBusy && !isSwapSuccess
                ? { scale: 1.01 }
                : undefined
            }
            whileTap={
              !isBusy && !isSwapSuccess
                ? { scale: 0.985 }
                : undefined
            }
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 22,
            }}
          >
            <Button
              onClick={handlePrimaryAction}
              disabled={
                !fromAmount ||
                Number(fromAmount) <= 0 ||
                !wallet.isConnected ||
                hasInsufficientBalance ||
                isLoadingQuote ||
                isAllowanceLoading ||
                isApprovalConfirming ||
                isSwapConfirming ||
                isSwapSuccess ||
                !toAmount ||
                wallet.isSwitchingNetwork
              }
            >
              <AnimatePresence
                mode="wait"
                initial={false}
              >
                <motion.span
                  key={buttonText}
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -5,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
                  className="inline-flex items-center gap-2"
                >
                  {(isLoadingQuote ||
                    isAllowanceLoading ||
                    isApprovalConfirming ||
                    isSwapConfirming ||
                    wallet.isSwitchingNetwork) && (
                    <motion.span
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="inline-block"
                    >
                      ◌
                    </motion.span>
                  )}

                  {isSwapSuccess && (
                    <motion.span
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                    >
                      ✓
                    </motion.span>
                  )}

                  {buttonText}
                </motion.span>
              </AnimatePresence>
            </Button>
          </motion.div>

          <p className="text-center text-xs opacity-50">
            Network fee and price impact are estimates.
            Final values may change when the transaction
            is submitted on-chain.
          </p>
        </Card>
      </motion.div>

      <TokenSelectorModal
        isOpen={isFromTokenModalOpen}
        onClose={() =>
          setIsFromTokenModalOpen(false)
        }
        onSelect={handleFromTokenSelect}
        excludeToken={toToken.symbol}
        selectedToken={fromToken.symbol}
      />

      <TokenSelectorModal
        isOpen={isToTokenModalOpen}
        onClose={() =>
          setIsToTokenModalOpen(false)
        }
        onSelect={handleToTokenSelect}
        excludeToken={fromToken.symbol}
        selectedToken={toToken.symbol}
      />
    </>
  );
}

export default SwapCard;

