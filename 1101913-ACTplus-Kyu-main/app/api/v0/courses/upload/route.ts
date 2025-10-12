// @\app\api\v1\courses\upload\route.ts
import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
    const data = await req.formData()
    const file = data.get('image')
    if (!file || !(file instanceof Blob)) return Response.json({ error: 'No file uploaded' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    // If file is a File, use its name; otherwise, use a default extension
    const originalName = (file as File).name ?? 'uploaded'
    const extension = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '.bin'
    const filename = `${Date.now()}${extension}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'images', filename)

    await writeFile(filepath, buffer)
    return Response.json({ url: `/uploads/images/${filename}` })
}
