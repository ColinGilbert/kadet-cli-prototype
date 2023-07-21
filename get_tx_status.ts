import * as Pact from "pact-lang-api";
import { API_HOST } from "./constants";
export async function getTxStatus(requestKey: string) {
  const txResult = await Pact.fetch.listen({ listen: requestKey }, API_HOST);
  console.log(txResult);
}
