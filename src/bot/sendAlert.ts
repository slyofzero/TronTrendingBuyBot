import { errorHandler } from "@/utils/handlers";
import { memoTokenData } from "@/vars/tokens";
import { alertBot } from "..";
import {
  TRENDING_BOT_USERNAME,
  TRENDING_CHANNEL_ID,
  TRENDING_CHANNEL_LINK,
} from "@/utils/env";
import { trendingTokens } from "@/vars/trending";
import { getRandomItemFromArray } from "@/utils/general";
import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";
import { toTrendTokens } from "@/vars/toTrend";
import { advertisements } from "@/vars/advertisements";
import { tokenEmojis } from "@/vars/tokenEmojis";
import { defaultEmojis } from "@/utils/constants";
import { trendingMessageId } from "@/vars/message";
import { InlineKeyboard } from "grammy";

export interface BuyData {
  txnHash: string;
  fromTokenSymbol: string;
  fromTokenAmount: number;
  toTokenSymbol: string;
  toTokenAmount: number;
  buyer: string;
  token: string;
}

export async function sendAlert(data: BuyData) {
  try {
    const {
      buyer,
      token,
      fromTokenAmount,
      fromTokenSymbol,
      toTokenAmount,
      toTokenSymbol,
      txnHash,
    } = data;
    const isTrending = Object.keys(trendingTokens).includes(token);
    // console.log(isTrending, groups.length);
    if (!isTrending) return;

    // Preparing message for token
    const tokenData = memoTokenData[token];
    const { priceUsd, fdv, info } = tokenData;
    const sentUsdNumber = toTokenAmount * Number(priceUsd);

    const sentNative = cleanUpBotMessage(fromTokenAmount.toLocaleString("en")); // prettier-ignore
    const sentUsd = cleanUpBotMessage(sentUsdNumber.toFixed(2));
    const formattedAmount = cleanUpBotMessage(
      toTokenAmount.toLocaleString("en")
    );
    // const position = change ? `+${change}%` : "New!!!";

    // log(`${buyer} bought ${toTokenAmount} ${toTokenSymbol}`);

    const randomizeEmojiCount = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const toTrendToken = toTrendTokens.find(
      ({ token: storedToken }) => storedToken === token
    );

    let emojiCount = 0;
    if (sentUsdNumber <= 100) {
      emojiCount = randomizeEmojiCount(10, 35);
    } else {
      emojiCount = randomizeEmojiCount(35, 70);
    }

    const randomDefaultEmoji = getRandomItemFromArray(defaultEmojis);

    const emojis = `${
      toTrendToken
        ? toTrendToken.emoji
        : `${tokenEmojis[token] || randomDefaultEmoji}`
    }`.repeat(emojiCount);

    // links
    const buyerLink = `https://tronscan.org/#/address/${buyer}`;
    const txnLink = `https://tronscan.org/#/transaction/${txnHash}`;
    const dexSLink = `https://dexscreener.com/tron/${token}`;
    // const photonLink = `https://photon-sol.tinyastro.io/en/lp/${token}`;
    const advertisement = advertisements.at(0);
    let advertisementText = "";

    if (advertisement) {
      const { text, link } = advertisement;
      advertisementText = `*_Ad: [${hardCleanUpBotMessage(text)}](${link})_*`;
    } else {
      advertisementText = `*_Ad: [Place your advertisement here](https://t.me/${TRENDING_BOT_USERNAME}?start=adBuyRequest)_*`;
    }

    const telegramLink = info?.socials?.find(
      ({ type }) => type.toLowerCase() === "telegram"
    )?.url;

    const specialLink = telegramLink
      ? `[Telegram](${telegramLink})`
      : `[Screener](${dexSLink})`;

    const message = `*[${toTokenSymbol}](${telegramLink || dexSLink}) Buy\\!*
${emojis}

🔀 Spent ${sentNative} ${fromTokenSymbol} *\\($${sentUsd}\\)*
🔀 Got ${formattedAmount} *${hardCleanUpBotMessage(toTokenSymbol)}*
👤 [Buyer](${buyerLink}) \\| [Txn](${txnLink}  )
💸 [Market Cap](${dexSLink}) $${cleanUpBotMessage(fdv?.toLocaleString("en"))}

[DexS](${dexSLink}) \\| ${specialLink} \\| [Trending](${TRENDING_CHANNEL_LINK}/${trendingMessageId})

${advertisementText}`;

    const keyboard = new InlineKeyboard().url(
      "Book trending",
      `https://t.me/${TRENDING_BOT_USERNAME}?start=trend`
    );

    // Sending Message
    if (isTrending) {
      try {
        if (toTrendToken?.gif) {
          await alertBot.api.sendAnimation(
            TRENDING_CHANNEL_ID || "",
            toTrendToken.gif,
            {
              parse_mode: "MarkdownV2",
              // @ts-expect-error Type not found
              disable_web_page_preview: true,
              reply_markup: keyboard,
              caption: message,
            }
          );
        } else {
          await alertBot.api.sendMessage(TRENDING_CHANNEL_ID || "", message, {
            parse_mode: "MarkdownV2",
            // @ts-expect-error Type not found
            disable_web_page_preview: true,
            reply_markup: keyboard,
          });
        }
      } catch (error) {
        // console.log(message);
        errorHandler(error);
      }
    }
  } catch (error) {
    errorHandler(error);
  }
}
