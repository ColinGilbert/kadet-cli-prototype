import bip39 from "bip39";
import kcrypt from "@kadena/cryptography-utils";

export function createRandomMnemonic() {
  return bip39.generateMnemonic();
}

export function getKeysFromMnemonic(mnemonic: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic).toString("hex");
  return kcrypt.restoreKeyPairFromSecretKey(seed.slice(0, 64));
}
