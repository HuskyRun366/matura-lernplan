import { list } from "@vercel/blob"

export async function GET() {
  const { blobs } = await list({ prefix: "matura/" })
  return Response.json(blobs)
}
