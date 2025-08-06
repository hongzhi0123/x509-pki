import { ocspResponse } from '$lib/utils/ocsp';

export async function POST({ params, request }) {
    console.log(`POST /api/ocsp/${params.ca}`);

    const caId = Number(params.ca);

    return ocspResponse(caId, await request.arrayBuffer());
}