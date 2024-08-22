import { tokensToWatch } from "@/vars/pairsToWatch";
import { apiFetcher } from "./api";
import { SwapDataResponse } from "@/types/txn";
import { sendAlert } from "@/bot/sendAlert";
import { sleep } from "./time";
import { errorHandler } from "./handlers";

const lastTxnHash: { [key: string]: string } = {};
const lastAlertTime: { [key: string]: number } = {};

export async function getTokenBuys() {
  for (const token of tokensToWatch) {
    try {
      const buys = await apiFetcher<SwapDataResponse>(
        `https://api-v2.sunpump.meme/pump-api/transactions/token/${token}?page=1&size=10&sort=txDateTime:DESC`
      );

      for (const swap of buys.data.data.swaps.slice().reverse()) {
        const { txHash, toTokenAddress } = swap;

        if (txHash === lastTxnHash[toTokenAddress]) break;
        lastTxnHash[toTokenAddress] = txHash;

        if (swap.txnOrderType === "SELL") continue;
        const currentTime = Date.now();

        if (
          lastAlertTime[toTokenAddress] &&
          currentTime - lastAlertTime[toTokenAddress] < 60 * 1e3
        ) {
          continue; // Skip if the last alert was sent less than 10 seconds ago
        }

        lastAlertTime[toTokenAddress] = currentTime;

        await sendAlert({
          fromTokenAmount: swap.fromTokenAmount,
          fromTokenSymbol: swap.fromTokenSymbol,
          toTokenAmount: swap.toTokenAmount,
          toTokenSymbol: swap.toTokenSymbol,
          txnHash: txHash,
          buyer: swap.userAddress,
          token: swap.toTokenAddress,
        });
      }
    } catch (error) {
      errorHandler(error);
    }
  }

  sleep(5 * 1e3).then(() => getTokenBuys());
}
