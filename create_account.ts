import Pact from "pact-lang-api";
import { NETWORK_ID, CHAIN_ID, API_HOST, creationTime } from "./constants.js";
import "dotenv/config";

const KEY_PAIR = {
  publicKey: process.env.SENDER_PUBKEY,
  secretKey: process.env.SENDER_SECRET,
};

// const KEY_PAIR = {
//   publicKey: process.env.CREATED_ACCT_PUBKEY,
//   secretKey: process.env.CREATED_ACCT_SECRET,
// };

export async function createAccount() {
  const newAccount = "k:" + process.env.CREATED_ACCT_PUBKEY;
  const cmd = {
    networkId: NETWORK_ID,
    keyPairs: KEY_PAIR,
    pactCode: `(coin.create-account "${newAccount}" (read-keyset "account-keyset"))`,
    envData: {
      "account-keyset": {
        keys: [process.env.CREATED_ACCT_PUBKEY],
        pred: "keys-all",
      },
    },
    meta: {
      creationTime: creationTime(),
      ttl: 28000,
      gasLimit: 800,
      chainId: CHAIN_ID,
      gasPrice: 0.0000001,
      sender: KEY_PAIR.publicKey,
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
  return txResult;
}
