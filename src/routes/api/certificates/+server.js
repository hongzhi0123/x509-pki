import { json } from "@sveltejs/kit";
import dummyCertificates from '$lib/stores/dummy-certificates.json';
import { createCertificate, generateKey } from "$lib/utils/certificate.js";
import { getCA, loadCA } from "$lib/utils/ca.js";

// Load CA when the server starts
await loadCA();

export async function GET() {
    return json(dummyCertificates);
}

export async function POST({ request }) {
    const newCertReq = await request.json();
    newCertReq.id = dummyCertificates.length + 1; // Assign a new ID

    const caCert = getCA();
    const keyPair = await generateKey();
    const newCertificate = await createCertificate(caCert, keyPair);

    return json({ message: 'Certificate created successfully', certificate: newCertificate});
}