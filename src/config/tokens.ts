
export interface Token {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  logo: string;
}

export const tokens: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address:
      "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logo:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address:
      "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
    logo:
      "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
];

