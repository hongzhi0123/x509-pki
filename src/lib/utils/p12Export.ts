import froge from 'node-forge';

export function createP12(
    certificatePem: string,
    privateKeyPem: string,
    password: string
): Buffer {

    // Convert PEM to Forge objects
    const privateKey = froge.pki.privateKeyFromPem(privateKeyPem);
    const certificate = froge.pki.certificateFromPem(certificatePem);

    // Create a PKCS#12 structure
    const p12Asn1 = froge.pkcs12.toPkcs12Asn1(
        privateKey,
        certificate,
        password,   // Set password for the PKCS#12 file
        { algorithm: '3des' }   // Use 3DES encryption
    );

    // Convert the ASN.1 structure to DER format
    const p12Der = froge.asn1.toDer(p12Asn1).getBytes();
    // Convert the DER format to a Buffer
    return Buffer.from(p12Der, 'binary');
}