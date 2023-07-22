import { getBalance } from "./get_balance.js";
import { getTxStatus } from "./get_tx_status.js";
import { transfer } from "./transfer.js";
import inquirer from "inquirer";
import "dotenv/config";
const mainPrompt = {
  type: "list",
  name: "main",
  message: "Which operation would you like to perform?",
  choices: ["transfer", "read-balance", "get-tx-status", "exit"],
};

const transferPrompts = [
  {
    type: "input",
    name: "transferAcctName",
    message: "Which account name would you like to transfer to?",
  },
  {
    type: "input",
    name: "transferAmount",
    message: "What amount of KAD do you want to transfer?",
  },
];
const txStatusPrompt = {
  type: "input",
  name: "requestKey",
  message: "Which request key would you like to track?",
};

function main() {
  console.log("Welcome to the Kadet CLI prototype.");
  doMainPrompt();
}

function doTransferPrompt() {
  inquirer.prompt(transferPrompts).then((answers: any) => {
    const receiverName = answers.transferAcctName;
    const amount = answers.transferAmount;
    transfer(process.env.SENDER_NAME as string, receiverName, amount)
      .then((results) => console.log(results))
      .then(() => doMainPrompt());
  });
}

function doReadBalance() {
  getBalance(process.env.SENDER_NAME as string)
    .then((results) => console.log(results))
    .then(() => doMainPrompt());
}

function doGetTxStatus() {
  inquirer.prompt(txStatusPrompt).then((answers: any) => {
    getTxStatus(answers.requestKey)
      .then((results) => console.log(results))
      .then(() => doMainPrompt());
  });
}

function doMainPrompt() {
  inquirer.prompt(mainPrompt).then((answers: any) => {
    switch (answers.main) {
      case "transfer":
        doTransferPrompt();
        break;
      case "read-balance":
        doReadBalance();
        break;
      case "get-tx-status":
        doGetTxStatus();
        break;
      case "exit":
        process.exit(0);
        break;
      default:
        prompt();
    }
  });
}

main();
