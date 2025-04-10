import { getCAs } from "$lib/utils/ca";
import { json } from "@sveltejs/kit";

export async function GET() {
    const cas = await getCAs();
    return json(cas);
}