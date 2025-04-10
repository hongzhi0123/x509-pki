import { Crypto } from "@peculiar/webcrypto";
import * as x509 from "@peculiar/x509";
import { createQCStatements, QCStatementsExtension } from "./qcStatement/qcStatementsExtension";
import { getCAByCn } from "./ca";

const crypto = new Crypto();
x509.cryptoProvider.set(crypto); // Set crypto provider

async function generateKey() {
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

export async function createCertificate(newCertReq, caCert) {
    try {
        const keyPair = await generateKey();
        // Create certificate signed by CA
        const cert = await x509.X509CertificateGenerator.create({
            serialNumber: newCertReq.id.toString(),
            subject: `C=${newCertReq.country}, O=${newCertReq.organization}, CN=${newCertReq.commonName}, 2.5.4.97=${newCertReq.organizationId}`, // Your subject
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
                new x509.CRLDistributionPointsExtension(["http://localhost:5173/api/crl/1"]),

                // OCSP (Authority Information Access)
                new x509.AuthorityInfoAccessExtension({ ocsp: "http://example.com/ocsp" }),

                // QCStatements (custom extension)
                // new Psd2RolesExtension({rolesOfPSP: ["PSP_AI", "PSP_PI"], NCAId: "PSDDE_XXX", NCAName: "BAFIN"}),
                new QCStatementsExtension(createQCStatements(newCertReq.tppRoles)),

                // Authority Key Identifier (link to CA)
                new x509.AuthorityKeyIdentifierExtension(
                    (
                        caCert.cert.getExtension(x509.SubjectKeyIdentifierExtension)
                    )?.keyId,
                ),
            ]
        });

        const certificatePEM = cert.toString("pem");
        // Export the private key to PKCS#8 DER
        const derPrivateKey = await crypto.subtle.exportKey(
            "pkcs8",
            keyPair.privateKey
        );

        // Convert to PEM
        const privateKeyPEM = x509.PemConverter.encode(derPrivateKey, "PRIVATE KEY");

        console.log("New Certificate (PEM):\n", certificatePEM);

        return {
            id: newCertReq.id,
            commonName: newCertReq.commonName,
            organization: newCertReq.organization,
            country: newCertReq.country,
            organizationId: newCertReq.organizationId,
            notBefore: cert.notBefore,
            notAfter: cert.notAfter,
            status: 'Active',
            ca: 'CA1',
            cert: certificatePEM,
            key: privateKeyPEM
        };

    } catch (error) {
        console.error('Certificate creation error:', error);
        // res.status(500).json({ error: 'Certificate creation failed' });
    }
}

export function parseUploadedCerts(list) {
    const certs = list.map((item) => {
        const pem = item.cert;
        const cert = new x509.X509Certificate(pem);
        const subjectName = cert.subjectName;

        return {
            id: cert.serialNumber,
            commonName: subjectName.getField('CN'),
            organization: subjectName.getField('O'),
            organizationUnit: subjectName.getField('OU'),
            country: subjectName.getField('C'),
            organizationId: subjectName.getField('2.5.4.97'),
            notBefore: new Date(cert.notBefore),
            notAfter: new Date(cert.notAfter),
            status: 'Active',   // ToDo: Add status Active, Expired, Revoked
            ca: getCAByCn(cert.issuerName.getField('CN')[0]).name,
            cert: pem,
            key: item.key
        };
    });

    return certs;
}
