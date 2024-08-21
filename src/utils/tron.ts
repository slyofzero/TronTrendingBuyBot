import { TronTransaction } from "@/types/txn";
import { errorHandler, log } from "./handlers";
import { sleep } from "./time";
import crypto from "crypto";
import bs58 from "bs58";
import { memoTokenData, trendingPairsTokenMap } from "@/vars/tokens";

let currentBlock = 0;
export const getCurrentBlock = async () => {
  try {
    const response = await fetch("https://api.trongrid.io/wallet/getnowblock");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const { block_header, transactions } = await response.json();
    if (block_header.raw_data.number > currentBlock) {
      currentBlock = block_header.raw_data.number;
      log(`Getting block number ${currentBlock}...`);

      for (const transaction of transactions) {
        parseTxn(transaction as TronTransaction);
      }
    }
  } catch (error) {
    errorHandler(error);
  } finally {
    await sleep(2500);
    getCurrentBlock();
  }
};

export function hexToTronAddress(hexAddress: string) {
  // Convert the hex address to a Buffer
  const addressBuffer = Buffer.from(hexAddress, "hex");

  // Perform SHA256 twice to generate the checksum
  const hash1 = crypto.createHash("sha256").update(addressBuffer).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const checksum = hash2.slice(0, 4); // Take the first 4 bytes as checksum

  // Append the checksum to the address
  const addressWithChecksum = Buffer.concat([addressBuffer, checksum]);

  // Encode the result with Base58
  const tronAddress = bs58.encode(addressWithChecksum);

  return tronAddress;
}

export function parseTxn(txn: TronTransaction) {
  try {
    const contractTxnInfo = txn.raw_data.contract.find(
      (contract) => contract.type === "TriggerSmartContract"
    );

    if (!contractTxnInfo) return;

    const { contract_address, owner_address, call_value } =
      contractTxnInfo.parameter.value;

    if (!call_value) return;

    const contract = hexToTronAddress(contract_address);
    const token = trendingPairsTokenMap[contract];

    const data = {
      txn: txn.txID,
      contract,
      buyer: hexToTronAddress(owner_address),
      amountBought: call_value / 1e6,
    };

    if (token) console.log(token);
  } catch (error) {
    errorHandler(error);
  }
}
