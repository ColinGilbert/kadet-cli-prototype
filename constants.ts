export const NETWORK_ID = "testnet04";
export const CHAIN_ID = "1";
export const API_HOST = `https://api.testnet.chainweb.com/chainweb/0.0/${NETWORK_ID}/chain/${CHAIN_ID}/pact`;
export const creationTime = () => Math.round(new Date().getTime() / 1000 - 15);
