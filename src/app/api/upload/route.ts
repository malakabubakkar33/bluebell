import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let fileBuffer: Buffer | null = null;
    let mimeType: string = 'image/jpeg';
    let originalName: string = `upload-${Date.now()}`;
    let fileDataUri: string = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      fileDataUri = body.file || '';
      if (body.name) originalName = body.name;

      if (fileDataUri.startsWith('data:')) {
        const matches = fileDataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          fileBuffer = Buffer.from(matches[2], 'base64');
        }
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const f = file as File;
        fileBuffer = Buffer.from(await f.arrayBuffer());
        mimeType = f.type || 'image/jpeg';
        originalName = f.name || originalName;
        fileDataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      }
    }

    if (!fileBuffer && !fileDataUri) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    // Determine extension
    const ext = mimeType.includes('png')
      ? 'png'
      : mimeType.includes('webp')
      ? 'webp'
      : mimeType.includes('svg')
      ? 'svg'
      : 'jpg';
    const cleanFileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // 1. Check & Upload to Cloudinary if configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

    if (cloudName && cloudName.trim().length > 0 && fileDataUri) {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        const signature = crypto
          .createHash('sha1')
          .update(`timestamp=${timestamp}${apiSecret}`)
          .digest('hex');

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: fileDataUri,
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
      } catch (cloudErr) {
        console.warn('Cloudinary upload attempted, falling back to Supabase:', cloudErr);
      }
    }

    // 2. Upload to Supabase Storage Bucket ('bluebell')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (supabaseUrl && supabaseSecretKey && fileBuffer) {
      try {
        const sb = createClient(supabaseUrl, supabaseSecretKey);
        const { data: uploadData, error: uploadErr } = await sb.storage
          .from('bluebell')
          .upload(cleanFileName, fileBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadData && !uploadErr) {
          const { data: pubUrlData } = sb.storage.from('bluebell').getPublicUrl(cleanFileName);
          if (pubUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: pubUrlData.publicUrl,
              provider: 'supabase',
              fileName: cleanFileName,
            });
          }
        }
        if (uploadErr) {
          console.warn('Supabase storage warning:', uploadErr.message);
        }
      } catch (sbErr) {
        console.warn('Supabase storage upload error:', sbErr);
      }
    }

    // 3. Fallback: Save to public/uploads directory
    if (fileBuffer) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, cleanFileName);
        fs.writeFileSync(filePath, fileBuffer);
        return NextResponse.json({
          success: true,
          url: `/uploads/${cleanFileName}`,
          provider: 'local',
        });
      } catch (fsErr) {
        console.warn('Local file write error:', fsErr);
      }
    }

    // 4. Ultimate fallback: Return data URI directly
    return NextResponse.json({
      success: true,
      url: fileDataUri,
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
