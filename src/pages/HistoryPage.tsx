import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import useWallet from "../hooks/useWallet";

import {
  clearSwapHistory,
  getSwapHistory,
  type SwapHistoryItem,
} from "../services/historyService";

function HistoryPage() {
  const wallet = useWallet();

  const [history, setHistory] =
    useState<SwapHistoryItem[]>([]);

  const loadHistory = useCallback(() => {
    if (!wallet.address) {
      setHistory([]);
      return;
    }

    setHistory(
      getSwapHistory(wallet.address),
    );
  }, [wallet.address]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function handleClearHistory() {
    if (!wallet.address) {
      return;
    }

    clearSwapHistory(wallet.address);
    setHistory([]);
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }

  function shortenHash(hash: string) {
    if (hash.length < 14) {
      return hash;
    }

    return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
  }

  function getStatusClasses(
    status: SwapHistoryItem["status"],
  ) {
    if (status === "success") {
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";
    }

    if (status === "failed") {
      return "border-red-400/20 bg-red-400/10 text-red-400";
    }

    return "border-yellow-400/20 bg-yellow-400/10 text-yellow-400";
  }

  function getStatusLabel(
    status: SwapHistoryItem["status"],
  ) {
    if (status === "success") {
      return "Success";
    }

    if (status === "failed") {
      return "Failed";
    }

    return "Pending";
  }

  if (!wallet.isConnected) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-4xl">
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
            <Card className="p-6 sm:p-8">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
                  ↔
                </div>

                <h1 className="mt-5 text-2xl font-bold text-white">
                  Transaction History
                </h1>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                  Connect your wallet to view
                  your NovaSwap transactions.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-400">
                NovaSwap
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Transaction History
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                View your recent swaps on Sepolia.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={loadHistory}
              >
                Refresh
              </Button>

              {history.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleClearHistory}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Wallet */}
          <Card className="mb-6 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  Connected Wallet
                </p>

                <p className="mt-1 break-all font-mono text-sm text-white">
                  {wallet.address}
                </p>
              </div>

              <div className="flex w-fit shrink-0 items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Sepolia
              </div>
            </div>
          </Card>

          {/* Empty State */}
          {history.length === 0 ? (
            <Card className="p-8 sm:p-12">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-2xl text-slate-500">
                  ↔
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  No transactions yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Your completed and pending NovaSwap
                  transactions will appear here after
                  you make a swap.
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* Summary */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Recent Swaps
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {history.length}{" "}
                    {history.length === 1
                      ? "transaction"
                      : "transactions"}
                  </p>
                </div>
              </div>

              {/* Transaction List */}
              <div className="space-y-3">
                {history.map(
                  (transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                      }}
                    >
                      <Card className="p-4 sm:p-5">
                        <div className="flex flex-col gap-4">
                          {/* Main Row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-white">
                                  {transaction.fromAmount}{" "}
                                  {transaction.fromToken}
                                </span>

                                <span className="text-slate-500">
                                  →
                                </span>

                                <span className="font-semibold text-white">
                                  {transaction.toAmount}{" "}
                                  {transaction.toToken}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {formatDate(
                                  transaction.timestamp,
                                )}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                transaction.status,
                              )}`}
                            >
                              {getStatusLabel(
                                transaction.status,
                              )}
                            </span>
                          </div>

                          {/* Transaction Details */}
                          <div className="border-t border-slate-800 pt-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <span className="text-xs text-slate-500">
                                Transaction
                              </span>

                              <a
                                href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-xs text-cyan-400 transition hover:text-cyan-300"
                              >
                                {shortenHash(
                                  transaction.hash,
                                )}
                                {" ↗"}
                              </a>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ),
                )}
              </div>
            </>
          )}

          {/* Testnet Notice */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs leading-5 text-slate-500">
              <span className="font-medium text-slate-400">
                Sepolia Testnet:
              </span>{" "}
              These transactions use testnet tokens
              and have no real monetary value.
              Transaction links open on Sepolia
              Etherscan.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default HistoryPage;