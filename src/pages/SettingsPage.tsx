import { useState } from "react";
import { motion } from "framer-motion";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

import useWallet from "../hooks/useWallet";
import {
  clearSwapHistory,
} from "../services/historyService";

function SettingsPage() {
  const wallet = useWallet();

  const [slippage, setSlippage] =
    useState(() => {
      return (
        localStorage.getItem(
          "novaswap_slippage",
        ) ?? "0.5"
      );
    });

  const [deadline, setDeadline] =
    useState(() => {
      return (
        localStorage.getItem(
          "novaswap_deadline",
        ) ?? "20"
      );
    });

  const [saved, setSaved] =
    useState(false);

  function handleSave() {
    const numericSlippage =
      Number(slippage);

    const numericDeadline =
      Number(deadline);

    if (
      !Number.isFinite(numericSlippage) ||
      numericSlippage <= 0 ||
      numericSlippage >= 100
    ) {
      window.alert(
        "Slippage must be greater than 0% and less than 100%.",
      );
      return;
    }

    if (
      !Number.isFinite(numericDeadline) ||
      numericDeadline <= 0
    ) {
      window.alert(
        "Transaction deadline must be greater than 0 minutes.",
      );
      return;
    }

    localStorage.setItem(
      "novaswap_slippage",
      slippage,
    );

    localStorage.setItem(
      "novaswap_deadline",
      deadline,
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  function handleClearHistory() {
    if (!wallet.address) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to clear your transaction history?",
      );

    if (!confirmed) {
      return;
    }

    clearSwapHistory(
      wallet.address,
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
          <div className="mb-8">
            <p className="text-sm font-medium text-cyan-400">
              NovaSwap
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage your swap preferences and
              application settings.
            </p>
          </div>

          <Card className="mb-5 p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">
                Swap Settings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure how NovaSwap handles
                your transactions.
              </p>
            </div>

            <div className="space-y-5">
              {/* Slippage */}
              <div>
                <label
                  htmlFor="slippage"
                  className="text-sm font-medium text-slate-300"
                >
                  Slippage Tolerance
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  Maximum price movement allowed
                  before your swap is rejected.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "0.1",
                    "0.5",
                    "1.0",
                  ].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setSlippage(value)
                      }
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        slippage === value
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
                          : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-white"
                      }`}
                    >
                      {value}%
                    </button>
                  ))}

                  <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3">
                    <input
                      id="slippage"
                      type="number"
                      min="0.01"
                      max="50"
                      step="0.1"
                      value={slippage}
                      onChange={(event) =>
                        setSlippage(
                          event.target.value,
                        )
                      }
                      className="w-20 bg-transparent text-sm text-white outline-none"
                    />

                    <span className="text-sm text-slate-500">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label
                  htmlFor="deadline"
                  className="text-sm font-medium text-slate-300"
                >
                  Transaction Deadline
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  Transactions will expire after
                  this amount of time.
                </p>

                <div className="mt-3 flex w-fit items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
                  <input
                    id="deadline"
                    type="number"
                    min="1"
                    max="120"
                    value={deadline}
                    onChange={(event) =>
                      setDeadline(
                        event.target.value,
                      )
                    }
                    className="w-20 bg-transparent text-sm text-white outline-none"
                  />

                  <span className="text-sm text-slate-500">
                    minutes
                  </span>
                </div>
              </div>

              {/* Save */}
              <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center">
                <Button
                  onClick={handleSave}
                >
                  {saved
                    ? "Saved ✓"
                    : "Save Settings"}
                </Button>

                {saved && (
                  <motion.span
                    initial={{
                      opacity: 0,
                      x: -5,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    className="text-sm text-emerald-400"
                  >
                    Preferences saved locally.
                  </motion.span>
                )}
              </div>
            </div>
          </Card>

          {/* Network */}
          <Card className="mb-5 p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">
                Network
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current blockchain environment.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <div>
                <p className="font-semibold text-white">
                  Sepolia Testnet
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Chain ID: 11155111
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Active
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              NovaSwap is currently configured for
              Sepolia testing. Transactions on this
              network do not have real monetary value.
            </p>
          </Card>

          {/* Wallet */}
          <Card className="mb-5 p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">
                Wallet
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Connected wallet information.
              </p>
            </div>

            {wallet.isConnected ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs text-slate-500">
                  Connected Address
                </p>

                <p className="mt-2 break-all font-mono text-sm text-white">
                  {wallet.address}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Wallet connected
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-sm text-slate-400">
                  No wallet connected.
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Connect your wallet from the
                  navigation bar.
                </p>
              </div>
            )}
          </Card>

          {/* Local Data */}
          <Card className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">
                Local Data
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage data stored by NovaSwap in
                your browser.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-white">
                  Transaction History
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Remove locally stored NovaSwap
                  transaction history for this wallet.
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={handleClearHistory}
                disabled={!wallet.isConnected}
                className="w-full sm:w-auto"
              >
                Clear History
              </Button>
            </div>
          </Card>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs leading-5 text-slate-500">
              <span className="font-medium text-slate-400">
                Privacy:
              </span>{" "}
              NovaSwap stores swap preferences and
              transaction history locally in your
              browser. No account or personal profile
              is created by the application.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default SettingsPage;