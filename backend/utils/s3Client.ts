import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface PresignOptions {
  expiresIn?: number;
  type?: string;
}

// S3 client for API operations (upload, delete, etc.)
const s3 = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.ACCESS_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Use path-style URLs for R2
});

// S3 client for presigned URLs (uses public endpoint)
const s3Public = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_PUBLIC_URL!,
  credentials: {
    accessKeyId: process.env.ACCESS_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});




const presign = async (
  key: string,
  { expiresIn = 300, type = 'application/zip' }: PresignOptions = {}
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: type,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn });
  return signedUrl;
};

const getDownloadUrl = async (
    key: string,
    { expiresIn = 300 }: PresignOptions = {}
): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
    });

    const signedUrl = await getSignedUrl(s3Public, command, { expiresIn });
    return signedUrl;
}

const getPublicUrl = (key: string): string => {
    return `${process.env.S3_PUBLIC_URL}/${process.env.S3_BUCKET}/${key}`;
}

const uploadFile = async (
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<void> => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3.send(command);
};

export { presign, s3, s3Public, uploadFile, getDownloadUrl, getPublicUrl };