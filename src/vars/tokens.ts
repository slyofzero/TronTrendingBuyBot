import { PairData, PairsData } from "@/types";
import { apiFetcher } from "@/utils/api";
import { log } from "@/utils/handlers";

export const memoTokenData: { [key: string]: PairData } = {};
export const trendingPairsTokenMap: { [key: string]: string } = {};
export let pairsToWatch: string[] = [];
export function setPairsToWatch(newPairsToWatch: string[]) {
  pairsToWatch = newPairsToWatch;
}

export async function memoizeTokenData(pairs: string[]) {
  log("Memoizing token data...");

  for (const pair of pairs) {
    try {
      const tokenData = await apiFetcher<PairsData>(
        `https://api.dexscreener.com/latest/dex/tokens/${pair}`
      );
      const data = tokenData?.data.pairs?.at(0);
      const tokenAddress = data?.baseToken.address;

      if (tokenAddress) {
        memoTokenData[tokenAddress] = data;
        trendingPairsTokenMap[data.pairAddress] = tokenAddress;
      }
    } catch (error) {
      continue;
    }
  }

  const newPairsToWatch = Object.values(memoTokenData).map(
    ({ pairAddress }) => pairAddress
  );
  setPairsToWatch(newPairsToWatch);

  log("✅ Memoization done!");
}
