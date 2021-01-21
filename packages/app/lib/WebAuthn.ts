import base64url from "base64url";
import { DEV } from "./constants";

type ResponseType =
  | { canceled: true }
  | { canceled: false; credential: Credential };

export async function createCredentials(
  challenge: string,
  username: string
): Promise<ResponseType> {
  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: base64url.toBuffer(challenge).buffer,
    attestation: "direct",
    authenticatorSelection: {
      // authenticatorAttachment: AuthenticatorAttachment,
      requireResidentKey: false,
      userVerification: "preferred",
    },
    rp: {
      id: DEV ? "localhost" : "home.yamatatsu.dev",
      name: "Home Dashboard",
    },
    user: {
      id: base64url.toBuffer(username).buffer,
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }], // "ES256" IANA COSE Algorithms registry
  };

  try {
    const credential = await navigator.credentials.create({ publicKey });
    if (!credential) {
      throw new Error("navigator.credentials.create return null");
    }
    // TODO: 型が嘘ついてる
    return { canceled: false, credential: decodeCredentialBuffers(credential) };
  } catch (err) {
    // WebAuthn の Popup がキャンセルされた場合はthrowしない。
    if (err.name === "NotAllowedError") {
      return { canceled: true };
    }
    throw err;
  }
}

export async function getCredentials(
  challenge: string,
  credentialIds: string[]
): Promise<ResponseType> {
  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: base64url.toBuffer(challenge).buffer,
    userVerification: "preferred",
    allowCredentials: credentialIds.map((id) => ({
      transports: ["internal"],
      type: "public-key",
      id: base64url.toBuffer(id).buffer,
    })),
  };

  try {
    const credential = await navigator.credentials.get({ publicKey });
    if (!credential) {
      throw new Error("navigator.credentials.get return null");
    }
    // TODO: 型が嘘ついてる
    return { canceled: false, credential: decodeCredentialBuffers(credential) };
  } catch (err) {
    // WebAuthn の Popup がキャンセルされた場合はthrowしない。
    if (err.name === "NotAllowedError") {
      return { canceled: true };
    }
    throw err;
  }
}

const decodeCredentialBuffers = (pubKeyCred: any): any => {
  if (pubKeyCred instanceof Array) {
    return pubKeyCred.map(decodeCredentialBuffers);
  }
  if (pubKeyCred instanceof ArrayBuffer) {
    return base64url.encode(Buffer.from(pubKeyCred));
  }
  if (pubKeyCred instanceof Object) {
    const obj: Record<string, any> = {};
    for (let key in pubKeyCred) {
      obj[key] = decodeCredentialBuffers(pubKeyCred[key]);
    }
    return obj;
  }
  return pubKeyCred;
};
