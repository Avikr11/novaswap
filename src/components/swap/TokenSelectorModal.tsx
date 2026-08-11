import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Token } from "../../config/tokens";
import { tokens } from "../../config/tokens";

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excludeToken?: string;
  selectedToken?: string;
}

function TokenSelectorModal({
  isOpen,
  onClose,
  onSelect,
  excludeToken,
  selectedToken,
}: TokenSelectorModalProps) {
  const [search, setSearch] = useState("");

  const availableTokens = tokens.filter(
    (token) => token.symbol !== excludeToken,
  );

  const popularTokens = availableTokens.filter((token) =>
    ["ETH", "USDC", "USDT"].includes(token.symbol),
  );

  const filteredTokens = availableTokens.filter((token) => {
    const query = search.toLowerCase();

    return (
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query)
    );
  });

  function handleSelect(token: Token) {
    onSelect(token);
    setSearch("");
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            px-3
            py-4
            backdrop-blur-sm
            sm:px-4
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="
              flex
              max-h-[calc(100vh-2rem)]
              w-full
              max-w-md
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              p-4
              shadow-2xl
              sm:max-h-[calc(100vh-3rem)]
              sm:p-5
            "
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 10,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Select Token
              </h2>

              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{
                  scale: 1.08,
                  rotate: 90,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 18,
                }}
                className="
                  shrink-0
                  rounded-lg
                  px-3
                  py-2
                  text-xl
                  text-slate-400
                  transition
                  hover:bg-slate-800
                  hover:text-white
                "
                aria-label="Close token selector"
              >
                ×
              </motion.button>
            </div>

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search token..."
              autoFocus
              className="
                mb-4
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                px-4
                py-3
                text-white
                outline-none
                placeholder:text-slate-500
                focus:border-cyan-400
                sm:mb-5
              "
            />

            {/* Popular Tokens */}
            {search.trim() === "" &&
              popularTokens.length > 0 && (
                <div className="mb-4 sm:mb-5">
                  <p className="mb-3 text-sm font-medium text-slate-400">
                    Popular Tokens
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    {popularTokens.map((token) => (
                      <motion.button
                        key={token.symbol}
                        type="button"
                        onClick={() =>
                          handleSelect(token)
                        }
                        whileHover={{
                          scale: 1.04,
                          y: -1,
                        }}
                        whileTap={{
                          scale: 0.96,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 20,
                        }}
                        className="
                          flex
                          min-w-0
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-slate-700
                          bg-slate-950
                          px-3
                          py-2
                          hover:border-cyan-400
                          hover:bg-slate-800
                        "
                      >
                        <img
                          src={token.logo}
                          alt={token.name}
                          className="h-6 w-6 shrink-0 rounded-full"
                        />

                        <span className="text-sm font-semibold text-white">
                          {token.symbol}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

            {/* All Tokens */}
            <p className="mb-3 shrink-0 text-sm font-medium text-slate-400">
              {search.trim() === ""
                ? "All Tokens"
                : "Search Results"}
            </p>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => {
                  const isSelected =
                    token.symbol === selectedToken;

                  return (
                    <motion.button
                      key={token.symbol}
                      type="button"
                      onClick={() =>
                        handleSelect(token)
                      }
                      whileHover={{
                        scale: 1.01,
                        x: 2,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 22,
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${
                        isSelected
                          ? "border border-cyan-400/50 bg-cyan-400/10"
                          : "hover:bg-slate-800"
                      }`}
                    >
                      <img
                        src={token.logo}
                        alt={token.name}
                        className="h-10 w-10 shrink-0 rounded-full"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">
                          {token.symbol}
                        </p>

                        <p className="truncate text-sm text-slate-400">
                          {token.name}
                        </p>
                      </div>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.span
                            initial={{
                              opacity: 0,
                              scale: 0.5,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.5,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                            }}
                            className="shrink-0 font-semibold text-cyan-400"
                          >
                            ✓
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center text-slate-500"
                >
                  No tokens found
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TokenSelectorModal;