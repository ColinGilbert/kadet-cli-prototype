import Pact from "pact-lang-api";
import { NETWORK_ID, CHAIN_ID, API_HOST, creationTime } from "./constants.js";
import { getKeysFromMnemonic } from "./keys.js";
import "dotenv/config";

export async function createAccount(mnemonic: string) {
  const keys = getKeysFromMnemonic(mnemonic);
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
    keyPairs: {
      publicKey: keys.publicKey,
      secretKey: keys.secretKey,
    },
    meta: {
      creationTime: creationTime(),
      ttl: 28000,
      gasLimit: 850,
      chainId: CHAIN_ID,
      gasPrice: 0.00000001,
      sender: "kadena-xchain-gas",
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
