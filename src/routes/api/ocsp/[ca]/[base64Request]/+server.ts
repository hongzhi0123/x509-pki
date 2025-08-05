// src/routes/ocsp/[issuerNameHash]/[issuerKeyHash]/[serialNumber]/+server.ts
import { AsnConvert } from '@peculiar/asn1-schema';
import { OCSPRequest, OCSPResponse, ResponseBytes, BasicOCSPResponse, ResponseData, SingleResponse, CertID, CertStatus, ResponderID, id_pkix_ocsp_basic } from '@peculiar/asn1-ocsp';
import { Crypto } from "@peculiar/webcrypto";
import { cryptoProvider } from '@peculiar/x509';
import * as asn1X509 from '@peculiar/asn1-x509';

// Initialize crypto
const crypto = new Crypto();
cryptoProvider.set(crypto); // Set crypto provider

export async function GET({ params }) {
  console.log(`GET /api/ocsp/${params.ca}`);
  console.log(`base64Request: ${params.base64Request}`); // Assuming this is the base64 encoded request
  
  try {
    // 1. Decode Base64 URL-safe string
    const base64 = params.base64Request
      .replace(/-/g, '+')  // Convert URL-safe Base64
      .replace(/_/g, '/')  // to standard Base64
      .padEnd(params.base64Request.length + ((4 - (params.base64Request.length % 4)) % 4), '='); // pad

    const der = Buffer.from(base64, 'base64');

    // 2. Parse OCSP request (you’ll need OCSPRequest model)
    const ocspRequest = AsnConvert.parse(der, OCSPRequest); // Your OCSPRequest class

    const reqCert = ocspRequest.tbsRequest.requestList[0].reqCert;
    const serialHex = Buffer.from(reqCert.serialNumber).toString("hex");

    console.log(`Issuer Name Hash: ${reqCert.issuerNameHash}`); // Assuming this is the base64 encoded request
    console.log(`Issuer Key Hash: ${reqCert.issuerKeyHash}`);
    console.log(`Serial Number: ${reqCert.serialNumber}`);

    console.log(`Parsed Serial Number: ${serialHex}`);
  } catch (err) {
    console.error('OCSP Request Error:', err); 
    return new Response('Invalid OCSP request', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  /*
  try {
    // Decode path parameters
    const issuerNameHash = hexToBuffer(params.issuerNameHash);
    const issuerKeyHash = hexToBuffer(params.issuerKeyHash);
    const serialNumber = hexToBuffer(params.serialNumber);

    // Create CertID
    const certID = new CertID({
      hashAlgorithm: { algorithm: "1.3.14.3.2.26" }, // SHA-1
      issuerNameHash,
      issuerKeyHash,
      serialNumber
    });

    // Lookup certificate status (implement your own logic)
    const status = await checkCertificateStatus(certID);

    // Create OCSP response
    const singleResponse = new SingleResponse({
      certID,
      certStatus: status,
      thisUpdate: new Date(),
      nextUpdate: new Date(Date.now() + 3600 * 1000) // 1 hour
    });

    const responderID = new ResponderID();
    responderID.byName = { type: "2.5.4.3", value: "My OCSP Responder" };

    const responseData = new ResponseData({
      responderID,
      producedAt: new Date(),
      responses: [singleResponse]
    });

    // Create and sign basic response (signing implementation needed)
    const basicResponse = new BasicOCSPResponse();
    basicResponse.tbsResponseData = AsnConvert.serialize(responseData);
    basicResponse.signatureAlgorithm = { algorithm: "1.2.840.113549.1.1.11" };
    basicResponse.signature = await signResponse(basicResponse.tbsResponseData);
    basicResponse.certs = [];

    const responseBytes = new ResponseBytes({
      responseType: id_pkix_ocsp_basic,
      response: AsnConvert.serialize(basicResponse)
    });

    const ocspResponse = new OCSPResponse({
      responseStatus: 0, // Success
      responseBytes
    });

    return new Response(AsnConvert.serialize(ocspResponse), {
      headers: {
        'Content-Type': 'application/ocsp-response',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err) {
    console.error('OCSP Error:', err);
    const errorResponse = new OCSPResponse({ responseStatus: 2 }); // Internal error
    return new Response(AsnConvert.serialize(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/ocsp-response' }
    });
  }*/
}

// Helper function to convert hex to ArrayBuffer
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

// Mock functions (implement your own)
async function checkCertificateStatus(certID: CertID): Promise<CertStatus> {
  // Your status check logic here
  return new CertStatus({ type: 0 }); // Good status
}

async function signResponse(data: ArrayBuffer): Promise<ArrayBuffer> {
  // Implement actual signing with your private key
  return new ArrayBuffer(256); // Mock signature
}