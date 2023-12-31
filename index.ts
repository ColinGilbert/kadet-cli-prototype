import { getBalance } from "./get_balance.js";
import { getTxStatus } from "./get_tx_status.js";
import { transfer } from "./transfer.js";
import { crossChainTransfer } from "./crosschain_transfer.js";
import { createAccount } from "./create_account.js";
import { createRandomMnemonic, getKeysFromMnemonic } from "./keys.js";
import inquirer from "inquirer";
import { keyFromAccount } from "./utils/keyFromAccount.js";

let privateKey = "";
let publicKey = "";

const mainPrompt = {
  type: "list",
  name: "main",
  message: "Which operation would you like to perform?",
  choices: [
    "unlock-account",
    "create-account",
    "transfer",
    "cross-chain-transfer",
    "read-balance",
    "get-tx-status",
    "exit",
  ],
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

const crossChainTransferPrompts = [
  {
    type: "input",
    name: "receiverName",
    message: "Which account name would you like to transfer to?",
  },
  {
    type: "input",
    name: "receiverPubkey",
    message:
      'What is the public key of the account you\'re sending to? Leave blank if account is named "k:<PUBLIC_KEY>"',
  },
  {
    type: "input",
    name: "transferAmount",
    message: "What amount of KAD do you want to transfer?",
  },
  {
    type: "input",
    name: "otherChain",
    message: "Which other chain would you like to transfer to (0-19)?",
  },
];

const txStatusPrompt = {
  type: "input",
  name: "requestKey",
  message: "Which request key would you like to track?",
};

const unlockPrompt = {
  type: "input",
  name: "mnemonic",
  message: "Please enter your recovery phrase.",
};

function main() {
  console.log("Welcome to the Kadet CLI prototype.");
  doMainPrompt();
}

function doTransferPrompt() {
  inquirer.prompt(transferPrompts).then((answers: any) => {
    const receiverName = answers.transferAcctName;
    const amount = answers.transferAmount;
    transfer(receiverName, amount, publicKey, privateKey)
      .then((results) => console.log(results))
      .then(() => doMainPrompt());
  });
}

function doCrossChainTransferPrompt() {
  inquirer.prompt(crossChainTransferPrompts).then((answers: any) => {
    const receiverName = answers.receiverName;
    const receiverPubkey =
      answers.receiverPubkey === ""
        ? keyFromAccount(receiverName)
        : answers.receiverPubkey;
    const amount = answers.transferAmount;
    const chainId = answers.otherChain;
    crossChainTransfer(
      receiverName,
      receiverPubkey,
      amount,
      chainId,
      "k:" + publicKey,
      publicKey,
      privateKey
    )
      .then((results: any) => console.log(results))
      .then(() => doMainPrompt())
      .catch((error) => {
        console.log(error);
        doMainPrompt();
      });
  });
}

function doReadBalance() {
  getBalance(publicKey, privateKey)
    .then((results) => console.log(results?.result?.data))
    .then(() => doMainPrompt());
}

function doGetTxStatus() {
  inquirer.prompt(txStatusPrompt).then((answers: any) => {
    getTxStatus(answers.requestKey)
      .then((results) => console.log(results))
      .then(() => doMainPrompt());
  });
}

function doCreateAccount() {
  const mnemonic = createRandomMnemonic();
  console.log(
    "This is your recovery phrase. Be sure to write it down somewhere: " +
      mnemonic
  );
  createAccount(mnemonic)
    .then((results) => console.log(results))
    .then(() => doMainPrompt());
}

function doUnlock() {
  inquirer.prompt(unlockPrompt).then((answers: any) => {
    unlockAccount(answers.mnemonic)
      .then(() => console.log("Account public key: " + publicKey))
      .then(() => doMainPrompt());
  });
}

async function unlockAccount(mnemonic: string) {
  const keys = getKeysFromMnemonic(mnemonic);
  publicKey = keys.publicKey;
  privateKey = keys.secretKey as string;
}

function doMainPrompt() {
  inquirer.prompt(mainPrompt).then((answers: any) => {
    switch (answers.main) {
      case "unlock-account":
        doUnlock();
        break;
      case "transfer":
        doTransferPrompt();
        break;
      case "cross-chain-transfer":
        doCrossChainTransferPrompt();
        break;
      case "read-balance":
        doReadBalance();
        break;
      case "get-tx-status":
        doGetTxStatus();
        break;
      case "create-account":
        doCreateAccount();
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
