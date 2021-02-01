import * as z from "zod";
import { JWK } from "jwk-to-pem";

export type PreCredential = {
  username: string;
  credentialId: string;
  jwk: JWK;
  signCount: number;
  createdAt: string;
  approved: boolean;
};
export type Credential = {
  __verified__: "Model:Credential";
} & PreCredential;

const schema = z.object({
  username: z.string(),
  credentialId: z.string(),
  jwk: z.object({
    kty: z.enum(["EC"]),
    crv: z.string(),
    x: z.string(),
    y: z.string(),
  }),
  signCount: z.number(),
  createdAt: z.string(),
  approved: z.boolean(),
});

export function createCredential(
  username: string,
  credentialId: string,
  jwk: JWK,
  signCount: number,
  createdAt: Date,
  approved: boolean = false
): Credential {
  return verifyCredential({
    username,
    credentialId,
    jwk,
    signCount: signCount,
    createdAt: createdAt.toISOString(),
    approved,
  });
}

export function verifyCredential(credential: PreCredential): Credential {
  const item: PreCredential = schema.parse(credential);
  return item as Credential;
}
