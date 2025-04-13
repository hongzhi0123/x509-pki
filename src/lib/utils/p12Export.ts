import forge from 'node-forge';

export function createP12(
    certificatePem: string,
    privateKeyPem: string,
    password: string,
    caCertificatesPem: string[], // Array of CA certificates in PEM format
): Buffer {

    // Convert PEM to Forge objects
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const certificate = forge.pki.certificateFromPem(certificatePem);
    const caCertificates = caCertificatesPem.map(caPem => forge.pki.certificateFromPem(caPem));

    // Create a PKCS#12 structure
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
        privateKey,
        [certificate,...caCertificates], // Add CA certificates
        password,   // Set password for the PKCS#12 file
        { algorithm: '3des' },   // Use 3DES encryption
    );

    // Convert the ASN.1 structure to DER format
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    // Convert the DER format to a Buffer
    return Buffer.from(p12Der, 'binary');
}