import { Crypto } from "@peculiar/webcrypto";
import * as x509 from "@peculiar/x509";
import { createQCStatements, QCStatementsExtension } from "./qcStatement/qcStatementsExtension";

const crypto = new Crypto();
x509.cryptoProvider.set(crypto); // Set crypto provider

export async function generateKey() {
    // Generate key pair for the new certificate
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["sign", "verify"]
    );

    return keyPair;
}

export async function createCertificate(caCert, keyPair) {
    try {
        // Create certificate signed by CA
        const cert = await x509.X509CertificateGenerator.create({
            serialNumber: "01",
            subject: "CN=End Entity Certificate", // Your subject
            notBefore: new Date(),
            notAfter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            signingAlgorithm: caCert.cert.publicKey.algorithm, // Use CA's algorithm
            publicKey: keyPair.publicKey,
            signingKey: caCert.key,
            issuer: caCert.cert.subject, // Set issuer to CA's subject
            extensions: [
                // Basic Constraints (if needed)
                new x509.BasicConstraintsExtension(false, undefined, true),

                // CRL Distribution Points
                new x509.CRLDistributionPointsExtension(["http://example.com/crl.crl"]),

                // OCSP (Authority Information Access)
                new x509.AuthorityInfoAccessExtension({ ocsp: "http://example.com/ocsp" }),

                // QCStatements (custom extension)
                // new Psd2RolesExtension({rolesOfPSP: ["PSP_AI", "PSP_PI"], NCAId: "PSDDE_XXX", NCAName: "BAFIN"}),
                new QCStatementsExtension(createQCStatements()),

                // Authority Key Identifier (link to CA)
                new x509.AuthorityKeyIdentifierExtension(
                    (
                        caCert.cert.getExtension(x509.SubjectKeyIdentifierExtension)
                    )?.keyId,
                ),
            ]
        });

        const certificatePEM = cert.toString("pem");
        // certificates.set(cert.serialNumber, certificatePEM);

        console.log("New Certificate (PEM):\n", certificatePEM);
        // res.json({ certificate: certificatePEM });
        return certificatePEM;

    } catch (error) {
        console.error('Certificate creation error:', error);
        // res.status(500).json({ error: 'Certificate creation failed' });
    }
}
