import { ocspResponse } from '$lib/utils/ocsp';

export async function GET({ params }) {
  console.log(`GET /api/ocsp/${params.ca}`);
  console.log(`base64Request: ${params.base64Request}`); // Assuming this is the base64 encoded request

  const caId = Number(params.ca);

  // 1. Decode Base64 URL-safe string
  const base64 = params.base64Request
    .replace(/-/g, '+')  // Convert URL-safe Base64
    .replace(/_/g, '/')  // to standard Base64
    .padEnd(params.base64Request.length + ((4 - (params.base64Request.length % 4)) % 4), '='); // pad

  const der = Buffer.from(base64, 'base64');

  return ocspResponse(caId, der);
}
