import { PairData, PairsData } from "@/types";
import { SunPumpTokenData } from "@/types/sunpumpapidata";
import { apiFetcher } from "@/utils/api";
import { log } from "@/utils/handlers";

export const memoTokenData: { [key: string]: Partial<PairData> } = {};
export const trendingPairsTokenMap: { [key: string]: string } = {};
export let pairsToWatch: string[] = [];
export function setPairsToWatch(newPairsToWatch: string[]) {
  pairsToWatch = newPairsToWatch;
}

export async function memoizeTokenData(pairs: string[]) {
  log("Memoizing token data...");

  for (const token of pairs) {
    try {
      const tokenData = await apiFetcher<PairsData>(
        `https://api.dexscreener.com/latest/dex/tokens/${token}`
      );
      const data = tokenData?.data.pairs?.at(0);
      const tokenAddress = data?.baseToken.address;

      if (tokenAddress) {
        memoTokenData[tokenAddress] = data;
      } else {
        const sunpumpData = await apiFetcher<SunPumpTokenData>(
          `https://api-v2.sunpump.meme/pump-api/token/${token}`
        );

        const tokenData = sunpumpData.data?.data;

        if (tokenData) {
          const priceUsd = String(tokenData.priceInTrx * tokenData.trxPriceInUsd); // prettier-ignore
          memoTokenData[token] = {
            priceUsd,
            fdv: tokenData.marketCap,
            baseToken: {
              name: tokenData.name,
              address: tokenData.contractAddress,
              symbol: tokenData.symbol,
            },
          };
        }
      }
    } catch (error) {
      continue;
    }
  }

  log("✅ Memoization done!");
}
