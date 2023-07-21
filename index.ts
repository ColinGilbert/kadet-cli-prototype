import { getBalance } from "./get_balance";
import { getTxStatus } from "./get_tx_status";
import { transfer } from "./transfer";
import "dotenv/config";
const globalArgs =
  "Arguments: transfer receiver-name amount | read-balance | get-tx-status request-key";
if (process.argv.length < 3) {
  console.log(globalArgs);
  process.exit();
}

if (process.argv[2] === "transfer") {
  if (process.argv.length === 5) {
    transfer(
      process.env.SENDER_NAME as string,
      process.argv[3],
      process.argv[4]
    );
  } else {
    console.log("Args: transfer receiver-name amount");
  }
} else if (process.argv[2] === "read-balance") {
  if (process.argv.length === 3) {
    console.log(getBalance(process.env.SENDER_NAME as string));
  } else {
    console.log("Args: read-balance");
  }
} else if (process.argv[2] === "get-tx-status") {
  if (process.argv.length === 4) {
    console.log(getTxStatus(process.argv[3]));
  } else {
    console.log("Args: get-tx-status request-id");
  }
} else {
  console.log(globalArgs);
}
