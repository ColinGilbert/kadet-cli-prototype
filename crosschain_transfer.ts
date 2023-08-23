import { ChainwebChainId, ICommandResult } from "@kadena/chainweb-node-client";
import {
  IContinuationPayloadObject,
  isSignedTransaction,
  Pact,
  readKeyset,
} from "@kadena/client";
import { sign } from "@kadena/cryptography-utils";
import {
  ChainId,
  ICommand,
  ISignatureJson,
  IUnsignedCommand,
} from "@kadena/types";
import { listen, pollCreateSpv, pollStatus, submit } from "./utils/client.js";
import { inspect } from "./utils/fp-helper.js";
import { NETWORK_ID } from "./constants.js";
import "dotenv/config";

interface IAccount {
  account: string;
  publicKey: string;
  chainId: ChainId;
  guard: string;
}

// This code is written differently from the others, using the transaction building API from github.com/kadena-community/kadena.js
// It is derived from  https://github.com/kadena-community/kadena.js/blob/main/packages/libs/client-examples/src/example-contract/crosschain-transfer.ts
// This is as opposed to the rest of this application whose code was derived from the Pact-Lang-API Cookbook at https://docs.kadena.io/build/frontend/pact-lang-api-cookbook

function startInTheFirstChain(
  from: IAccount,
  to: IAccount,
  amount: string
): IUnsignedCommand {
  return Pact.builder
    .execution(
      Pact.modules.coin.defpact["transfer-crosschain"](
        from.account,
        to.account,
        readKeyset("receiver-guard"),
        to.chainId,
        {
          decimal: amount.toString(),
        }
      )
    )
    .addSigner(from.publicKey, (withCapability: any) => [
      // in typescript this function suggests you only relevant capabilities
      withCapability("coin.GAS"),
      withCapability(
        "coin.TRANSFER_XCHAIN",
        from.account,
        to.account,
        {
          decimal: amount,
        },
        to.chainId
      ),
    ])
    .addKeyset("receiver-guard", "keys-all", to.publicKey)
    .setMeta({ chainId: from.chainId, senderAccount: from.account })
    .setNetworkId(NETWORK_ID)
    .createTransaction();
}

function finishInTheTargetChain(
  continuation: IContinuationPayloadObject["cont"],
  targetChainId: ChainId,
  gasPayer: string = "kadena-xchain-gas"
): IUnsignedCommand {
  const builder = Pact.builder
    .continuation(continuation)
    .setNetworkId(NETWORK_ID)
    // uncomment this if you want to pay gas yourself
    // .addSigner(gasPayer.publicKey, (withCapability) => [
    //   withCapability('coin.GAS'),
    // ])
    .setMeta({
      chainId: targetChainId,
      senderAccount: gasPayer,
      // this need to be less than or equal to 850 if you want to use gas-station, otherwise the gas-station does not pay the gas
      gasLimit: 850,
    });

  return builder.createTransaction();
}

async function signCommand(
  transaction: IUnsignedCommand,
  senderPubkey: string,
  senderSecret: string
) {
  const cmd: ICommand = {
    cmd: transaction.cmd,
    hash: transaction.hash,
    sigs: [
      sign(transaction.cmd, {
        secretKey: senderSecret,
        publicKey: senderPubkey,
      }) as ISignatureJson,
    ],
  };
  return cmd;
}

async function doCrossChainTransfer(
  from: IAccount,
  to: IAccount,
  amount: string,
  senderSecret: string
): Promise<Record<string, ICommandResult>> {
  //const state = {};
  return (
    Promise.resolve(startInTheFirstChain(from, to, amount))
      .then((command) => {
        return signCommand(command, from.publicKey, senderSecret);
      })
      .then((command) =>
        isSignedTransaction(command)
          ? command
          : Promise.reject("CMD_NOT_SIGNED")
      )
      // inspect is only for development you can remove them
      .then(inspect("EXEC_SIGNED"))
      .then((cmd) => submit(cmd))
      .then(inspect("SUBMIT_RESULT"))
      .then(listen)
      .then(inspect("LISTEN_RESULT"))
      .then((status) =>
        status.result.status === "failure"
          ? Promise.reject(new Error("DEBIT REJECTED"))
          : status
      )
      .then((status) =>
        Promise.all([
          status,
          pollCreateSpv(
            {
              requestKey: status.reqKey,
              networkId: NETWORK_ID,
              chainId: from.chainId,
            },
            to.chainId
          ),
        ])
      )
      .then(inspect("POLL_SPV_RESULT"))
      .then(
        ([status, proof]) =>
          finishInTheTargetChain(
            {
              pactId: status.continuation?.pactId,
              proof,
              rollback: false,
              step: 1,
            },
            to.chainId
          ) as ICommand
      )
      .then(inspect("CONT_TR"))
      // // uncomment the following lines if you want to pay gas from your account not the gas-station
      // .then((command) => signWithChainweaver(command))
      // .then((command) =>
      //   isSignedTransaction(command) ? command : Promise.reject('CMD_NOT_SIGNED'),
      // )
      // .then(inspect('CONT_SIGNED'))
      .then((cmd) => submit(cmd))
      .then(inspect("SUBMIT_RESULT"))
      .then(pollStatus)
      .then(inspect("FINAL_RESULT"))
  );
}

export function crossChainTransfer(
  receiverName: string,
  receiverPubkey: string,
  amount: string,
  chain: string,
  senderName: string,
  senderPubkey: string,
  senderSecret: string
) {
  const from: IAccount = {
    account: senderName,
    chainId: "1",
    publicKey: senderPubkey,
    // use keyset guard
    guard: senderPubkey,
  };

  const to: IAccount = {
    account: receiverName, // k:account of sender
    chainId: chain as ChainwebChainId,
    publicKey: receiverPubkey,
    // use keyset guard
    guard: receiverPubkey,
  };

  return doCrossChainTransfer(from, to, amount, senderSecret);
}
