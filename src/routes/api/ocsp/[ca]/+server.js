import { OCSPRequest, OCSPResponse, OCSPResponseStatus, SingleResponse, BasicOCSPResponse, ResponseData, ResponseBytes, id_pkix_ocsp_basic, CertStatus } from "@peculiar/asn1-ocsp";
import { AsnConvert } from '@peculiar/asn1-schema';
import revokedCerts from '$lib/stores/revoked.json';
import { getCAById } from '$lib/utils/ca';

// ---------- crypto ----------
const alg = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };

export async function POST({ params, request }) {
    console.log(`POST /api/ocsp/${params.ca}`);

    const caId = Number(params.ca);
    if (isNaN(caId) || caId <= 0) {
        return new Response('Invalid CA ID', { status: 400 });
    }

    const caCert = getCAById(caId);
    if (!caCert) {
        return new Response('CA not found', { status: 404 });
    }

    try {
        // 1.  Parse incoming OCSP request
        const buffer = Buffer.from(await request.arrayBuffer());
        const reqASN = AsnConvert.parse(buffer, OCSPRequest);
        const reqCertId = reqASN.tbsRequest.requestList[0].reqCert;

        const serialHex = Buffer.from(reqCertId.serialNumber).toString("hex");
        const entry = revokedCerts.filter(r => r.caId === caId).filter(r => r.serialNumber === serialHex);

        if (entry.length === 0) {
            // Create OCSP response
            const singleResponse = new SingleResponse({
                certID: reqCertId,
                certStatus: new CertStatus({ type: 0 }), // Good status
                thisUpdate: new Date(),
                nextUpdate: new Date(Date.now() + 3600 * 1000) // 1 hour validity
            });

            const responseData = new ResponseData({
                responderID: { byName: caCert.cert.subject }, // Should be actual responder ID
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
                signatureAlgorithm: { algorithm: '1.2.840.113549.1.1.11' }, // SHA-256 with RSA
                signature, // Replace with actual signature
                certs: [] // Add your responder certificate chain if needed
            });

            const responseBytes = new ResponseBytes({
                responseType: id_pkix_ocsp_basic,
                response: AsnConvert.serialize(basicResponse)
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
        }

        // // 3.2  Build OCSP response
        // const responseGen = new OCSPResponseGenerator({
        //     responderCertificate: responderCert,
        //     responderPrivateKey: responderKey,
        //     certificates: [caCert], // optional: chain to send back
        // });

        // const ocspResp = await responseGen.create({
        //     request: ocspReq,
        //     producedAt: new Date(),
        //     responses: [
        //         {
        //             certId: await ocspReq.getCertId(caCert),
        //             status: entry.revoked ? "revoked" : "good",
        //             revocationTime: entry.date,
        //             thisUpdate: new Date(),
        //             nextUpdate: new Date(Date.now() + 3600_000), // 1 h
        //         },
        //     ],
        // });

        // // 3.3  Send DER-encoded response
        // res.set("Content-Type", "application/ocsp-response");
        // res.send(Buffer.from(ocspResp.rawData));
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