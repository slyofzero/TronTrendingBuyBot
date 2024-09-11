import { trendingMessageId } from "@/vars/message";
import { TRENDING_CHANNEL } from "./env";

export const firebaseCollectionPrefix = `_third_tron_trending`;

export const urlRegex =
  /^(?:https?|ftp):\/\/(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/[\w-]*)*\/?(?:\?[^#\s]*)?$/;
export const transactionValidTime = 25 * 60;
export const buyLimit = 50;
export const TRENDING_MSG = `${TRENDING_CHANNEL}/${trendingMessageId}`;

export const defaultEmojis = ["🟢", "☀️", "🌤️", "🔴"];

export const trendingIcons = [
  "🥇",
  "🥈",
  "🥉",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
  "1️⃣1️⃣",
  "1️⃣2️⃣",
  "1️⃣3️⃣",
  "1️⃣4️⃣",
  "1️⃣5️⃣",
];
