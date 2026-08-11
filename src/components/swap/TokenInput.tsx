import type { Token } from "../../config/tokens";

interface TokenInputProps {
  label: string;
  token: Token;
  amount: string;
  balance: string;
  address?: string;
  showMax?: boolean;
  readOnly?: boolean;
  onAmountChange?: (value: string) => void;
  onMaxClick?: () => void;
  onTokenClick?: () => void;
}

function TokenInput({
  label,
  token,
  amount,
  balance,
  address,
  showMax = false,
  readOnly = false,
  onAmountChange,
  onMaxClick,
  onTokenClick,
}: TokenInputProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-slate-400">
          {label}
        </span>

        <div className="min-w-0 text-right">
          <p className="truncate text-xs text-slate-500 sm:text-sm">
            Balance: {balance} {token.symbol}
          </p>

          {address && (
            <p className="truncate text-xs text-slate-600">
              {address.slice(0, 6)}...
              {address.slice(-4)}
            </p>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Token selector */}
        <button
          type="button"
          onClick={onTokenClick}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:gap-2 sm:px-3"
        >
          <img
            src={token.logo}
            alt={token.name}
            className="h-5 w-5 rounded-full sm:h-6 sm:w-6"
          />

          <span>{token.symbol}</span>

          <span className="text-slate-400">
            ▼
          </span>
        </button>

        {/* Amount */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            readOnly={readOnly}
            onChange={(event) =>
              onAmountChange?.(
                event.target.value,
              )
            }
            placeholder="0.00"
            className={`min-w-0 flex-1 bg-transparent text-right text-xl font-semibold outline-none placeholder:text-slate-600 sm:text-2xl ${
              readOnly
                ? "cursor-default text-slate-400"
                : "text-white"
            }`}
          />

          {showMax && (
            <button
              type="button"
              onClick={onMaxClick}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-400/10"
            >
              MAX
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TokenInput;