import forge from 'node-forge';
import {readFileSync, writeFileSync} from 'fs';

// Read the private key and certificate from files
const privateKeyPem = readFileSync('private-key.pem', 'utf8');
const certificatePem = readFileSync('certificate.pem', 'utf8');

// Convert PEM to forge objects
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
const certificate = forge.pki.certificateFromPem(certificatePem);

// Create a PKCS#12 structure
const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
  privateKey, 
  certificate, 
  'your-password', // Set password for the .p12 file
  { algorithm: '3des' } // Use Triple DES encryption
);

// Convert ASN.1 object to DER format
const p12Der = forge.asn1.toDer(p12Asn1).getBytes();

// Save to file
writeFileSync('keystore.p12', Buffer.from(p12Der, 'binary'));

console.log('PKCS#12 file created: keystore.p12');