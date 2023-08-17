import Pact from "pact-lang-api";
import { NETWORK_ID, CHAIN_ID, API_HOST, creationTime } from "./constants.js";
import { createKeysFromMnemonic } from "./keys.js";
import "dotenv/config";

const KEY_PAIR = {
  publicKey: process.env.SENDER_PUBKEY,
  secretKey: process.env.SENDER_SECRET,
};

export async function createAccount(mnemonic: string) {
  const keys = createKeysFromMnemonic(mnemonic);
  const newAccount = "k:" + keys.publicKey;
  const cmd = {
    networkId: NETWORK_ID,
    pactCode: `(coin.create-account "${newAccount}" (read-keyset "account-keyset"))`,
    envData: {
      "account-keyset": {
        keys: [keys.publicKey],
        pred: "keys-all",
      },
    },
    keyPairs:
    {
      publicKey: KEY_PAIR.publicKey,
      secretKey: KEY_PAIR.secretKey,
      clist:
       [
        {
          name: "free.kadet-gas-station-2.GAS_PAYER",
          args: [
            newAccount,
            {int: 1000},
            0.00000001
          ]
        }
      ]
    },
     meta: {
       creationTime: creationTime(),
       ttl: 28000,
       gasLimit: 800,
       chainId: CHAIN_ID,
       gasPrice: 0.0000001,
       sender: process.env.SENDER_NAME,
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
