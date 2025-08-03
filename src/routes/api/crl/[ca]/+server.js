import { X509CrlGenerator, AuthorityKeyIdentifierExtension, Extension } from '@peculiar/x509';
import { CRLNumber, id_ce_authorityKeyIdentifier, id_ce_cRLNumber } from '@peculiar/asn1-x509';
import { AsnConvert } from '@peculiar/asn1-schema';
// import { Integer }   from '@peculiar/asn1-schema';
import { Crypto } from "@peculiar/webcrypto";
import { getCAById } from '$lib/utils/ca';
import revokedCerts from '$lib/stores/revoked.json';

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
      // 1. authorityKeyIdentifier – use the helper
      // await AuthorityKeyIdentifierExtension.create(caCert.cert, false),

      // 2. CRL number – use the helper
      // { type: id_ce_cRLNumber,             critical: false, rawData: AsnSerializer.serialize(new Integer(1)) }    
      {
        // type: id_ce_authorityKeyIdentifier,
        // critical: false,
        rawData: caCert.cert.extensions.find(ext => ext.type === id_ce_authorityKeyIdentifier)?.rawData || null
      },
      // {
        // type: id_ce_cRLNumber,
        // critical: false,
        // value: new CRLNumber(1)
        new Extension(
          id_ce_cRLNumber,
          false,
          new Uint8Array([0x02, 0x01, 1]) // Integer 1, //new CRLNumber(1) // Increment as needed
        )
      // }
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