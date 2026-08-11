import type { Address } from "viem";

export type SwapHistoryStatus =
  | "pending"
  | "success"
  | "failed";

export interface SwapHistoryItem {
  id: string;
  hash: `0x${string}`;
  account: Address;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  status: SwapHistoryStatus;
  timestamp: number;
}

const STORAGE_KEY = "novaswap_transaction_history";

function readHistory(): SwapHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function writeHistory(items: SwapHistoryItem[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items),
  );
}

export function getSwapHistory(
  account?: Address,
): SwapHistoryItem[] {
  const history = readHistory();

  if (!account) {
    return [];
  }

  return history.filter(
    (item) =>
      item.account.toLowerCase() ===
      account.toLowerCase(),
  );
}

export function addSwapHistory(
  item: SwapHistoryItem,
) {
  const history = readHistory();

  const updated = [
    item,
    ...history.filter(
      (existing) => existing.id !== item.id,
    ),
  ];

  writeHistory(updated);
}

export function updateSwapHistoryStatus(
  id: string,
  status: SwapHistoryStatus,
) {
  const history = readHistory();

  const updated = history.map((item) =>
    item.id === id
      ? {
          ...item,
          status,
        }
      : item,
  );

  writeHistory(updated);
}

export function clearSwapHistory(
  account?: Address,
) {
  if (!account) {
    return;
  }

  const history = readHistory();

  const remaining = history.filter(
    (item) =>
      item.account.toLowerCase() !==
      account.toLowerCase(),
  );

  writeHistory(remaining);
}