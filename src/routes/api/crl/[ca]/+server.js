import { X509CrlGenerator, AuthorityKeyIdentifierExtension, Extension } from '@peculiar/x509';
import { CRLNumber, id_ce_subjectKeyIdentifier, id_ce_cRLNumber } from '@peculiar/asn1-x509';
import { AsnConvert } from '@peculiar/asn1-schema';
import { Crypto } from "@peculiar/webcrypto";
import { getCAById } from '$lib/utils/ca';
import revokedCerts from '$lib/stores/revoked.json';
import { getCRLNumberById } from '$lib/utils/ca.js';

const crypto = new Crypto();

export async function GET({ params }) {
  console.log(`GET /api/crl/${params.ca}`);

  const caId = Number(params.ca);
  if (isNaN(caId) || caId <= 0) {
    return new Response('Invalid CA ID', { status: 400 });
  }
  
  const caCert = getCAById(caId);
  if (!caCert) {
    return new Response('CA not found', { status: 404 });
  }

  const aYearFromNow = new Date();
  aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

  // Create a CRL
  const crl = await X509CrlGenerator.create({
    issuer: caCert.cert.subject,
    nextUpdate: aYearFromNow,
    signingKey: caCert.key,
    signingAlgorithm: caCert.cert.publicKey.algorithm,
    extensions: [
      new AuthorityKeyIdentifierExtension(caCert.cert.extensions.find(ext => ext.type === id_ce_subjectKeyIdentifier)?.keyId || null),
      new Extension(id_ce_cRLNumber, false, AsnConvert.serialize(new CRLNumber(await getCRLNumberById(caId)))) // Increment as needed
    ],
    entries: 
      revokedCerts.filter(r => r.caId === caId)
        .map(r => ({
          serialNumber: r.serialNumber,
          revocationDate: new Date(r.revokedAt),
          reason: r.reason,
          invalidity: new Date(),
          extensions: null
        }))
  }, crypto);

  return new Response(crl.rawData, {
    headers: {
      'Content-Type': 'application/pkix-crl'
    }
  });
}