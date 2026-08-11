interface PriceInfoProps {
  rate: string;
  networkFee: string;
  priceImpact: string;
  isLoading?: boolean;
  updatedAt?: string;
}

function PriceInfo({
  rate,
  networkFee,
  priceImpact,
  isLoading = false,
  updatedAt,
}: PriceInfoProps) {
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
      {/* Rate */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-400">
          Rate
        </span>

        <span className="text-right text-sm font-medium text-white">
          {isLoading ? "Updating..." : rate}
        </span>
      </div>

      {/* Last Updated */}
      {updatedAt && (
        <p className="text-right text-xs text-slate-500">
          {updatedAt}
        </p>
      )}

      {/* Network Fee */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-400">
          Network Fee
        </span>

        <span className="text-sm font-medium text-white">
          {networkFee}
        </span>
      </div>

      {/* Price Impact */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-400">
          Price Impact
        </span>

        <span
          className={`text-sm font-medium ${
            priceImpact.includes("High")
              ? "text-red-400"
              : "text-emerald-400"
          }`}
        >
          {priceImpact}
        </span>
      </div>

      {/* Estimate Notice */}
      <div className="border-t border-slate-800 pt-3">
        <p className="text-xs leading-relaxed text-slate-500">
          Network fee and price impact are estimates.
          Final values may change when the transaction
          is submitted on-chain.
        </p>
      </div>
    </div>
  );
}

export default PriceInfo;