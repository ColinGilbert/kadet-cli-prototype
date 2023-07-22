import Pact from "pact-lang-api";
import { API_HOST } from "./constants.js";

export async function getTxStatus(requestKey: string) {
  const txResult = await Pact.fetch.listen({ listen: requestKey }, API_HOST);
  return txResult;
}
