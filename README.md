Requires a .env file with the following variables defined:

```
ACCT_CREATOR_NAME
ACCT_CREATOR_PUBKEY
ACCT_CREATOR_SECRET
```

The public key and secret key can be generated at https://transfer.chainweb.com/ by clicking the button "Generate Keypairs" and a Testnet account can be made using these keys at https://faucet.testnet.chainweb.com/.

To compile:

```
npm run compile
```

To run:

```
npm run exec
```

NOTE: The create-account code is broken. I'm blocked on it and will be emailing Kadena org asking for a better way of doing this.
