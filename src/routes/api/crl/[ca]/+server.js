import { X509CrlGenerator } from '@peculiar/x509';
import { Crypto } from "@peculiar/webcrypto";
import { getCA } from '$lib/utils/ca';

const crypto = new Crypto();

export async function GET() {
  const caCert = getCA();

  const aYearFromNow = new Date();
  aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

  // Create a CRL
  const crl = await X509CrlGenerator.create({
    issuer: caCert.cert.subject,
    nextUpdate: aYearFromNow,
    signingKey: caCert.key,
    signingAlgorithm: caCert.cert.publicKey.algorithm,
    entries: [
      // {
      //   serialNumber: "01",
      //   revocationDate: new Date("2022-02-13"),
      //   reason: x509.X509CrlReason.certificateHold,
      // },
    ],
  }, crypto);

  return new Response(crl.rawData, {
    headers: {
      'Content-Type': 'application/pkix-crl'
    }
  });
}