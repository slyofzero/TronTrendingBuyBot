import { log } from "@/utils/handlers";
import { trendingTokens } from "./trending";
import { memoizeTokenData } from "./tokens";

export let pairsToWatch: string[] = [];
export let tokensToWatch: string[] = [];

export async function syncPairsToWatch() {
  pairsToWatch = Object.values(trendingTokens);
  tokensToWatch = Object.keys(trendingTokens);

  await memoizeTokenData(tokensToWatch);

  // let memoizedTokenLog = Object.values(memoTokenData)
  //   .map(({ baseToken }) => {
  //     const { name, symbol } = baseToken;
  //     return `${symbol} | ${name}`;
  //   })
  //   .join("\n");

  // memoizedTokenLog = `Tokens currently being watched - \n\n${memoizedTokenLog}`;
  // teleBot.api.sendMessage(LOGS_CHANNEL_ID || "", memoizedTokenLog);

  // setUpWSS(pairsToWatch);
  log(`Synced all pairs to watch`);
}
