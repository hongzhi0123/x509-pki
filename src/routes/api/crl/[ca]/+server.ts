
  // Create a CRL
  const crl = await x509.X509CrlGenerator.create({
    issuer: "CN=Test certificate, O=Test, L=US",
    nextUpdate: new Date("2022-02-13"),
    signingKey: keys.privateKey,
    signingAlgorithm: algorithm,
    entries: [
      {
        serialNumber: "01",
        revocationDate: new Date("2022-02-13"),
        reason: x509.X509CrlReason.certificateHold,
      },
    ],
  }, crypto);