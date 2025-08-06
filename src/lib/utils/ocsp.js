import revokedCerts from '$lib/stores/revoked.json';
import { getCAById } from '$lib/utils/ca';
import { Crypto } from "@peculiar/webcrypto";
import { cryptoProvider } from '@peculiar/x509';
import { AlgorithmIdentifier } from '@peculiar/asn1-x509';
import { AsnConvert, OctetString } from '@peculiar/asn1-schema';
import { OCSPRequest, OCSPResponse, OCSPResponseStatus, SingleResponse, BasicOCSPResponse, ResponseData, ResponseBytes, id_pkix_ocsp_basic, CertStatus, ResponderID } from "@peculiar/asn1-ocsp";

// ---------- crypto ----------
const crypto = new Crypto();
cryptoProvider.set(crypto); // Set crypto provider

const alg = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };

export async function ocspResponse(caId, der) {
    if (isNaN(caId) || caId <= 0) {
        return new Response('Invalid CA ID', { status: 400 });
    }

    const caCert = getCAById(caId);
    if (!caCert) {
        return new Response('CA not found', { status: 404 });
    }
    
    try {
        // 2. Parse OCSP request (you’ll need OCSPRequest model)
        const ocspRequest = AsnConvert.parse(der, OCSPRequest);

        const reqCertId = ocspRequest.tbsRequest.requestList[0].reqCert;
        const serialHex = Buffer.from(reqCertId.serialNumber).toString("hex");
        const entry = revokedCerts.filter(r => r.caId === caId).filter(r => r.serialNumber === serialHex);

        var certStatus = new CertStatus({ good: null }); // Default to good status
        if (entry.length > 0) {
            // If the certificate is revoked, set the status accordingly
            certStatus = new CertStatus({ unknown: null }); // Unknown status
        }

        // Create OCSP response
        const singleResponse = new SingleResponse({
            certID: reqCertId,
            certStatus,
            thisUpdate: new Date(),
            nextUpdate: new Date(Date.now() + 3600 * 1000) // 1 hour validity
        });

        const responseData = new ResponseData({
            responderID: new ResponderID({byName: caCert.cert.subjectName.asn }), // caCert.cert.subjectName is an another Name object, not the schema decorated one.
            producedAt: new Date(),
            responses: [singleResponse]
        });

        // 3. Sign ResponseData → BasicOCSPResponse
        const responseDataDer = AsnConvert.serialize(responseData);
        const signature = await crypto.subtle.sign(
            { ...alg, name: "RSASSA-PKCS1-v1_5" },
            caCert.key,
            responseDataDer
        );

        const basicResponse = new BasicOCSPResponse({
            tbsResponseData: responseData,
            signatureAlgorithm: new AlgorithmIdentifier({ algorithm: '1.2.840.113549.1.1.11' }), // SHA-256 with RSA
            signature: new Uint8Array(signature), 
            certs: [] // Add your responder certificate chain if needed
        });

        const responseBytes = new ResponseBytes({
            responseType: id_pkix_ocsp_basic,
            response: new OctetString(AsnConvert.serialize(basicResponse))
        });

        const ocspResponse = new OCSPResponse({
            responseStatus: 0, // Success
            responseBytes
        });

        // Serialize to DER
        const derResponse = AsnConvert.serialize(ocspResponse);

        // 7. Return binary DER response
        return new Response(derResponse, {
            headers: {
                'Content-Type': 'application/ocsp-response',
                'Cache-Control': 'max-age=3600'
            }
        });
    } catch (error) {
        console.error('OCSP request failed:', error);

        // Return internal error response
        const failResponse = new OCSPResponse({
            status: OCSPResponseStatus.InternalError
        });
        const der = AsnConvert.serialize(failResponse);

        return new Response(der, {
            status: 500,
            headers: { 'Content-Type': 'application/ocsp-response' }
        });        
    }
}