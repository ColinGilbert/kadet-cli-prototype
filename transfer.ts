// const Pact = require("pact-lang-api");
import Pact from "pact-lang-api";
import { NETWORK_ID, CHAIN_ID, API_HOST, creationTime } from "./constants.js";
export async function transfer(
  receiver: string,
  amount: string,
  publicKey: string,
  secretKey: string
) {
  const KEY_PAIR = {
    publicKey: publicKey,
    secretKey: secretKey,
  };
  const sender = "k:" + publicKey;
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
  // console.log(response);
  if (response.requestKeys !== undefined) {
    console.log(`\nRequest key: ${response.requestKeys[0]}`);
    console.log("Transaction pending...");

    const txResult = await Pact.fetch.listen(
      { listen: response.requestKeys[0] },
      API_HOST
    );
    console.log("Transaction mined!");

    return txResult;
  } else return "Error. Do you have any funds in your account?";
}
