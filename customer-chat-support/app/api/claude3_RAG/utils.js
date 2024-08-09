import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { Dewy } from 'dewy-ts';

// Create Dewy and Bedrock clients
const client = new BedrockRuntimeClient({ region: "us-west-2" }, {credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }});
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
    const systemPrompt = [{
        role: 'system',
        content: `You are a helpful assistant.
            You will take into account any CONTEXT BLOCK
            that is provided in a conversation.
            START CONTEXT BLOCK
            ${context.results.map((c) => c.chunk.text).join("\n")}
            END OF CONTEXT BLOCK`,
    } ]

    // Set the model ID, e.g., Claude 3 Haiku.
  const modelId = "anthropic.claude-3-haiku-20240307-v1:0";
  console.log(data)
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [...data],
  }

  // Create a command with the model ID, the message, and a basic configuration.
  const command = new InvokeModelWithResponseStreamCommand({
    contentType: "application/json",
    body: JSON.stringify(payload),
    modelId,
  });
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send the command to the model and wait for the response
        const response = await client.send(command);
        let completeMessage = "";
        // Extract and print the streamed response text in real-time.
        for await (const item of response.body) {
          const chunk = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
          const chunk_type = chunk.type;
      
          if (chunk_type === "content_block_delta") {
            const text = chunk.delta.text;
            completeMessage = completeMessage + text;
            controller.enqueue(text);
            process.stdout.write(text);
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    }
  })

  return new NextResponse(stream);
}