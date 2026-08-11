
import { useEffect, useMemo, useState } from "react";
import { formatUnits, type Address } from "viem";
import { useReadContract } from "wagmi";
import { motion } from "framer-motion";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import useWallet from "../hooks/useWallet";
import { tokens } from "../config/tokens";
import { erc20Abi } from "../config/erc20Abi";
import { getTokenPrices } from "../services/priceService";

function PortfolioPage() {
  const wallet = useWallet();

  const [usdcBalance, setUsdcBalance] = useState("0");

  const [prices, setPrices] = useState<
    Record<string, number>
  >({});

  const [isPriceLoading, setIsPriceLoading] =
    useState(false);

  const [priceError, setPriceError] =
    useState("");

  const usdcToken = tokens.find(
    (token) => token.symbol === "USDC",
  );

  const {
    data: usdcBalanceRaw,
    isLoading: isUsdcLoading,
    refetch: refetchUsdcBalance,
  } = useReadContract({
    address:
      usdcToken?.address as Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: wallet.address
      ? [wallet.address]
      : undefined,
    query: {
      enabled:
        wallet.isConnected &&
        Boolean(wallet.address) &&
        Boolean(usdcToken),
    },
  });

  useEffect(() => {
    if (usdcBalanceRaw === undefined) {
      setUsdcBalance("0");
      return;
    }

    setUsdcBalance(
      formatUnits(
        usdcBalanceRaw,
        usdcToken?.decimals ?? 6,
      ),
    );
  }, [usdcBalanceRaw, usdcToken]);

  async function fetchPrices() {
    try {
      setIsPriceLoading(true);
      setPriceError("");

      const supportedSymbols = tokens.map(
        (token) => token.symbol,
      );

      const fetchedPrices =
        await getTokenPrices(
          supportedSymbols,
        );

      setPrices(fetchedPrices);
    } catch (error) {
      console.error(
        "Portfolio price fetch failed:",
        error,
      );

      setPriceError(
        error instanceof Error
          ? error.message
          : "Unable to fetch token prices.",
      );
    } finally {
      setIsPriceLoading(false);
    }
  }

  useEffect(() => {
    if (!wallet.isConnected) {
      return;
    }

    void fetchPrices();
  }, [wallet.isConnected]);

  function formatBalance(
    value: string,
    decimals = 4,
  ) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "0";
    }

    return numericValue.toFixed(decimals);
  }

  function formatUsd(value: number) {
    if (!Number.isFinite(value)) {
      return "$0.00";
    }

    return value.toLocaleString(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits:
          value >= 1000 ? 0 : 2,
      },
    );
  }

  function handleRefresh() {
    void refetchUsdcBalance();
    void fetchPrices();
  }

  const ethFormatted =
    wallet.balance?.formatted ?? "0";

  const ethNumeric =
    Number(ethFormatted);

  const usdcNumeric =
    Number(usdcBalance);

  const ethPrice =
    prices.ETH ?? 0;

  const usdcPrice =
    prices.USDC ?? 1;

  const ethUsdValue =
    ethNumeric * ethPrice;

  const usdcUsdValue =
    usdcNumeric * usdcPrice;

  const totalUsdValue =
    ethUsdValue + usdcUsdValue;

  const hasPrices =
    Object.keys(prices).length > 0;

  const walletAddress =
    wallet.address ?? "";

  const portfolioAssets = useMemo(
    () =>
      tokens.map((token) => {
        const balance =
          token.symbol === "ETH"
            ? ethFormatted
            : usdcBalance;

        const numericBalance =
          Number(balance);

        const price =
          prices[token.symbol] ?? 0;

        const usdValue =
          numericBalance * price;

        return {
          token,
          balance,
          price,
          usdValue,
        };
      }),
    [
      ethFormatted,
      usdcBalance,
      prices,
    ],
  );

  if (!wallet.isConnected) {
    return (
      <main className="bg-slate-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="p-6 sm:p-8">
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
              }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Portfolio
              </p>

              <h1 className="mt-1 text-2xl font-bold text-white">
                Your Portfolio
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Connect your wallet to view your
                token balances and portfolio value.
              </p>
            </motion.div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
          }}
        >
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Portfolio
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your Assets
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Track your wallet balances and
                estimated portfolio value.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={
                isUsdcLoading ||
                isPriceLoading
              }
              className="w-full sm:w-auto"
            >
              {isUsdcLoading ||
              isPriceLoading
                ? "Refreshing..."
                : "Refresh"}
            </Button>
          </div>

          {/* Portfolio Summary */}
          <Card className="mb-6 overflow-hidden p-0">
            <div className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Estimated Portfolio Value
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      {isPriceLoading &&
                      !hasPrices ? (
                        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-800" />
                      ) : (
                        <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                          {formatUsd(
                            totalUsdValue,
                          )}
                        </p>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      Based on current CoinGecko
                      market prices.
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Network
                    </p>

                    <p className="mt-1 text-sm font-semibold text-cyan-400">
                      Sepolia Testnet
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-px bg-slate-800 sm:grid-cols-2">
              <div className="bg-slate-900 p-5 sm:p-6">
                <p className="text-sm text-slate-400">
                  ETH Value
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {formatUsd(
                    ethUsdValue,
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatBalance(
                    ethFormatted,
                    4,
                  )}{" "}
                  ETH
                </p>
              </div>

              <div className="bg-slate-900 p-5 sm:p-6">
                <p className="text-sm text-slate-400">
                  USDC Value
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {formatUsd(
                    usdcUsdValue,
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatBalance(
                    usdcBalance,
                    2,
                  )}{" "}
                  USDC
                </p>
              </div>
            </div>
          </Card>

          {/* Price Error */}
          {priceError && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
            >
              {priceError}
            </motion.div>
          )}

          {/* Wallet */}
          <Card className="mb-8 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-slate-400">
                  Connected Wallet
                </p>

                <p className="mt-2 break-all font-mono text-sm text-white">
                  {walletAddress}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Sepolia
              </div>
            </div>
          </Card>

          {/* Assets */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">
              Assets
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your supported NovaSwap assets.
            </p>
          </div>

          <div className="space-y-3">
            {portfolioAssets.map(
              (
                {
                  token,
                  balance,
                  price,
                  usdValue,
                },
                index,
              ) => (
                <motion.div
                  key={token.symbol}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.3,
                  }}
                >
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={token.logo}
                        alt={token.name}
                        className="h-11 w-11 shrink-0 rounded-full"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">
                          {token.symbol}
                        </p>

                        <p className="truncate text-sm text-slate-500">
                          {token.name}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {formatBalance(
                            balance,
                            token.symbol ===
                              "USDC"
                              ? 2
                              : 4,
                          )}{" "}
                          {token.symbol}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {formatUsd(
                            usdValue,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                      <span className="text-xs text-slate-500">
                        Market price
                      </span>

                      <span className="text-xs font-medium text-slate-400">
                        {price > 0
                          ? formatUsd(price)
                          : "Unavailable"}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ),
            )}
          </div>

          {/* Valuation Notice */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs leading-5 text-slate-500">
              <span className="font-medium text-slate-400">
                Testnet valuation:
              </span>{" "}
              Sepolia tokens have no real monetary
              value. USD figures are estimates based
              on current mainnet market prices and are
              provided for interface demonstration only.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default PortfolioPage;

