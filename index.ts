console.log("Hello world");
import { getBalance } from "./get_balance";
import { getTxStatus } from "./get_tx_status";
import { transfer } from "./transfer";
import "dotenv/config";

console.log(process.argv[2]);

transfer(
  process.env.SENDER_NAME as string,
  process.env.RECEIVER_NAME as string,
  (0.1).toString()
);
