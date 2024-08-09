//https://dewykb.github.io/blog/rag-app-with-nextjs-openai-and-dewy/
import { Dewy } from 'dewy-ts';

export const runtime = 'edge'

// Create a Dewy client
const dewy = new Dewy({
    BASE: process.env.DEWY_ENDPOINT
})

export async function POST(req) {
    // Pull the document's URL out of the request
    const formData = await req.formData();
    const url = formData.get('url');

    const document = await dewy.kb.addDocument({
        collection: process.env.DEWY_COLLECTION,
        url,
    });

    return NextResponse.json({document_id: result.id})
}