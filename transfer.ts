// const Pact = require("pact-lang-api");
import * as Pact from "pact-lang-api";
import { NETWORK_ID, CHAIN_ID, API_HOST, creationTime } from "./constants";
import "dotenv/config";
const KEY_PAIR = {
  publicKey: process.env.SENDER_PUBKEY,
  secretKey: process.env.SENDER_SECRET_KEY,
};
export async function transfer(
  sender: string,
  receiver: string,
  amount: string
) {
  const cmd = {
    networkId: NETWORK_ID,
    keyPairs: [
      Object.assign(KEY_PAIR, {
        clist: [
          Pact.lang.mkCap(
            "GAS",
            "Capability to allow buying gas",
            "coin.GAS",
            []
          ).cap,
          Pact.lang.mkCap(
            "Transfer",
            "Capability to allow coin transfer",
            "coin.TRANSFER",
            [sender, receiver, { decimal: amount }]
          ).cap,
        ],
      }),
    ],
    pactCode: `(coin.transfer "${sender}" "${receiver}" ${amount})`,
    envData: {},
    meta: {
      creationTime: creationTime(),
      ttl: 28000,
      gasLimit: 800,
      chainId: CHAIN_ID,
      gasPrice: 0.0000001,
      sender: sender,
    },
  };

  const response = await Pact.fetch.send(cmd, API_HOST);
  console.log(response);
  console.log(`Request key: ${response.requestKeys[0]}`);
  console.log("Transaction pending...");

  const txResult = await Pact.fetch.listen(
    { listen: response.requestKeys[0] },
    API_HOST
  );
  console.log("Transaction mined!");
  console.log(txResult);
}
