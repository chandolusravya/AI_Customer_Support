//https://dewykb.github.io/blog/rag-app-with-nextjs-openai-and-dewy/
import OpenAI from 'openai';
import { Dewy } from 'dewy-ts';

// Create Dewy and OpenAI clients
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
const dewy = new Dewy({
    BASE: process.env.DEWY_ENDPOINT
})

export async function generate({query}) {
    // Search Dewy for chunks relevant to the given query.
    const context = await dewy.kb.retrieveChunks({
        collection: process.env.DEWY_COLLECTION,
        query: query,
        n: 10,
    });

    // Build an augmented prompt providing the retrieved chunks as context for the LLM.
    const prompt = [{
        role: 'system',
        content: `You are a helpful assistant.
            You will take into account any CONTEXT BLOCK
            that is provided in a conversation.
            START CONTEXT BLOCK
            ${context.results.map((c) => c.chunk.text).join("\n")}
            END OF CONTEXT BLOCK`,
    } ]

    // Call the OpenAI chat completion API to generate a response
    const messages =  [...prompt,[]]
    const res = await openai.chat.completions.create({
        messages,
        model: 'gpt-4o-mini',
        temperature: 0.7,
    })

    return res
}