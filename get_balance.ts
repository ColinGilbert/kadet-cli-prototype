import Pact from "pact-lang-api";

import { NETWORK_ID, CHAIN_ID, API_HOST, creationTime } from "./constants.js";
import "dotenv/config";
const KEY_PAIR = {
  publicKey: process.env.SENDER_PUBKEY,
  secretKey: process.env.SENDER_SECRET_KEY,
};
export async function getBalance(account: string) {
  const cmd = {
    networkId: NETWORK_ID,
    keyPairs: KEY_PAIR,
    pactCode: `(coin.get-balance "${account}")`,
    envData: {},
    meta: {
      creationTime: creationTime(),
      ttl: 28000,
      gasLimit: 600,
      chainId: CHAIN_ID,
      gasPrice: 0.0000001,
      sender: KEY_PAIR.publicKey,
    },
  };

  const result = await Pact.fetch.local(cmd, API_HOST);
  return result;
}
