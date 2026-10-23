import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let fileData: string = '';
    let fileName: string = `upload-${Date.now()}`;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      fileData = body.file || '';
      if (body.name) fileName = body.name;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const buffer = Buffer.from(await (file as File).arrayBuffer());
        const mime = (file as File).type || 'image/jpeg';
        fileData = `data:${mime};base64,${buffer.toString('base64')}`;
        fileName = (file as File).name || fileName;
      }
    }

    if (!fileData) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || '569778479335647';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'z282LuuYTsv9OJp3PPlsfKGlbKY';
    const preset = process.env.CLOUDINARY_UPLOAD_PRESET || 'bluebell';

    // 1. Attempt Cloudinary upload if Cloud Name is configured
    if (cloudName && cloudName.trim().length > 0) {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        // Signature for signed upload
        const signature = crypto
          .createHash('sha1')
          .update(`timestamp=${timestamp}${apiSecret}`)
          .digest('hex');

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: fileData,
            api_key: apiKey,
            timestamp: timestamp,
            signature: signature,
          }),
        });

        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) {
          return NextResponse.json({
            success: true,
            url: cloudData.secure_url,
            provider: 'cloudinary',
            public_id: cloudData.public_id,
          });
        }
        console.warn('Cloudinary upload warning:', cloudData);
      } catch (cloudErr) {
        console.error('Cloudinary API error, falling back to local storage:', cloudErr);
      }
    }

    // 2. High-performance fallback: Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Parse base64
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1];
      const ext = mime.includes('png')
        ? 'png'
        : mime.includes('webp')
        ? 'webp'
        : mime.includes('svg')
        ? 'svg'
        : 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const filePath = path.join(uploadsDir, cleanFileName);
      const buffer = Buffer.from(matches[2], 'base64');

      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/${cleanFileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        provider: 'local',
      });
    }

    // 3. Fallback: return data URI directly
    return NextResponse.json({
      success: true,
      url: fileData,
      provider: 'data_uri',
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
