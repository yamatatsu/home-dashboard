import base64url from "base64url";
import { DEV } from "../constants";

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

    return { canceled: false, credential };
  } catch (err) {
    // WebAuthn の Popup がキャンセルされた場合はthrowしない。
    if (err.name === "NotAllowedError") {
      return { canceled: true };
    }
    throw err;
  }
}
