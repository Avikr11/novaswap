
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { navigation } from "../../config/navigation";
import useWallet from "../../hooks/useWallet";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const {
    isConnected,
    isSupportedNetwork,
    switchToSepolia,
    isSwitchingNetwork,
  } = useWallet();

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  async function handleSwitchNetwork() {
    try {
      await switchToSepolia();
    } catch (error) {
      console.error(
        "Failed to switch to Sepolia:",
        error,
      );
    }
  }

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950">
        <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <NavLink to="/">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 20,
              }}
              className="text-xl font-bold text-white"
            >
              NovaSwap
            </motion.div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative py-1 text-sm transition-colors duration-200 ${
                    isActive
                      ? "font-semibold text-cyan-400"
                      : "text-slate-300 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <motion.span
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                  >
                    {item.label}

                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-indicator"
                        className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-cyan-400"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Desktop Wallet */}
          <div className="hidden items-center gap-2 md:flex">
            {isConnected && !isSupportedNetwork && (
              <motion.button
                type="button"
                onClick={handleSwitchNetwork}
                disabled={isSwitchingNetwork}
                whileHover={
                  !isSwitchingNetwork
                    ? { scale: 1.02 }
                    : undefined
                }
                whileTap={
                  !isSwitchingNetwork
                    ? { scale: 0.98 }
                    : undefined
                }
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSwitchingNetwork
                  ? "Switching..."
                  : "Switch to Sepolia"}
              </motion.button>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 20,
              }}
            >
              <ConnectButton />
            </motion.div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {isConnected && !isSupportedNetwork && (
              <motion.button
                type="button"
                onClick={handleSwitchNetwork}
                disabled={isSwitchingNetwork}
                whileTap={
                  !isSwitchingNetwork
                    ? { scale: 0.95 }
                    : undefined
                }
                className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSwitchingNetwork
                  ? "Switching..."
                  : "Sepolia"}
              </motion.button>
            )}

            <ConnectButton />

            <motion.button
              type="button"
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
              onClick={() =>
                setIsMobileMenuOpen(
                  (previous) => !previous,
                )
              }
              whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-400"
            >
              {isMobileMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </motion.button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="overflow-hidden border-t border-slate-800 md:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
                {navigation.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm transition-colors ${
                        isActive
                          ? "bg-cyan-400/10 font-semibold text-cyan-400"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export default Navbar;

