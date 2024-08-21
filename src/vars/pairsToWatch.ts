import { log } from "@/utils/handlers";
import { trendingTokens } from "./trending";
import { memoizeTokenData } from "./tokens";

export let pairsToWatch: string[] = [];
export let tokensToWatch: string[] = [];

export async function syncPairsToWatch() {
  pairsToWatch = Object.values(trendingTokens);
  tokensToWatch = Object.keys(trendingTokens);

  await memoizeTokenData(tokensToWatch);

  log(`Synced all pairs to watch`);
}
