const COINGECKO_API =
  "https://api.coingecko.com/api/v3/simple/price";

const tokenIds: Record<string, string> = {
  ETH: "ethereum",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
};

export async function getTokenPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  const ids = symbols
    .map((symbol) => tokenIds[symbol])
    .filter(Boolean);

  if (ids.length === 0) {
    return {};
  }

  const response = await fetch(
    `${COINGECKO_API}?ids=${ids.join(",")}&vs_currencies=usd`
  );

  if (!response.ok) {
    throw new Error(
      `CoinGecko request failed: ${response.status}`
    );
  }

  const data = await response.json();

  const prices: Record<string, number> = {};

  symbols.forEach((symbol) => {
    const id = tokenIds[symbol];

    if (
      id &&
      data[id]?.usd !== undefined
    ) {
      prices[symbol] = data[id].usd;
    }
  });

  return prices;
}