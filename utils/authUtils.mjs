import crypto from "crypto";

const AUTH_KEY = "9u7qab84rpc16gvk";
const NONCE_KEY = "vicopx7dqu06emacgpnpy8j8zwhduwlh";

const decryptNonce = (nonceEncrypted) => {
  const nonceDecipher = crypto.createDecipheriv(
    "aes-256-cbc",
    NONCE_KEY,
    NONCE_KEY.slice(0, 16),
  );
  return Buffer.concat([
    nonceDecipher.update(nonceEncrypted, "base64"),
    nonceDecipher.final(),
  ]).toString("utf-8");
};

const getAuthorization = (nonceDecrypted) => {
  let key = "";
  for (let i = 0; i < 16; i += 1) {
    const nonceChar = nonceDecrypted.charCodeAt(i);
    key += NONCE_KEY[nonceChar % 16];
  }
  key += AUTH_KEY;
  const authCipher = crypto.createCipheriv(
    "aes-256-cbc",
    key,
    key.slice(0, 16),
  );
  return Buffer.concat([
    authCipher.update(nonceDecrypted, "utf8"),
    authCipher.final(),
  ]).toString("base64");
};

export const handleAuthRotation = (responseHeaders) => {
  const { nonce } = responseHeaders;
  const nonceDecrypted = decryptNonce(nonce);
  const authorization = getAuthorization(nonceDecrypted);
  return {
    Authorization: `FUS nonce="${nonce}", signature="${authorization}", nc="", type="", realm="", newauth="1"`,
    nonce: { decrypted: nonceDecrypted, encrypted: nonce },
  };
};
