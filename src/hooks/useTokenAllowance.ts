import { useEffect, useState } from "react";

import type { Address } from "viem";

import { getTokenAllowance } from "../services/approvalService";

interface UseTokenAllowanceParams {
  tokenAddress: Address;
  ownerAddress?: Address;
  enabled?: boolean;
}

function useTokenAllowance({
  tokenAddress,
  ownerAddress,
  enabled = true,
}: UseTokenAllowanceParams) {
  const [allowance, setAllowance] =
    useState<bigint>(0n);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<Error | null>(null);

  async function fetchAllowance() {
    if (!ownerAddress || !enabled) {
      setAllowance(0n);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result =
        await getTokenAllowance(
          tokenAddress,
          ownerAddress
        );

      setAllowance(result);
    } catch (err) {
      console.error(
        "Failed to fetch token allowance:",
        err
      );

      setError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to fetch token allowance."
            )
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAllowance();
  }, [
    tokenAddress,
    ownerAddress,
    enabled,
  ]);

  return {
    allowance,
    isLoading,
    error,
    refetch: fetchAllowance,
  };
}

export default useTokenAllowance;