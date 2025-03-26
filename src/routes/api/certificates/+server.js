import { json } from "@sveltejs/kit";
import dummyCertificates from '$lib/stores/dummy-certificates.json';

export async function GET() {
    return json(dummyCertificates);
}