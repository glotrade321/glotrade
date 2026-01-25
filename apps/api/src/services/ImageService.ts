import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { Readable } from "stream";

export class ImageService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        this.bucketName = process.env.R2_BUCKET_NAME || "";

        if (!accountId || !accessKeyId || !secretAccessKey || !this.bucketName) {
            console.warn("⚠️ R2 credentials missing. Image optimization service will fail if used.");
        }

        this.s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: accessKeyId || "",
                secretAccessKey: secretAccessKey || "",
            },
        });
    }

    /**
     * Optimize an image from R2 on the fly
     */
    async optimizeImage(key: string, options: { width?: number; height?: number; quality?: number; fit?: keyof sharp.FitEnum }): Promise<{ buffer: Buffer; contentType: string }> {
        try {
            // 1. Fetch original image from R2
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const response = await this.s3Client.send(command);

            if (!response.Body) {
                throw new Error("Image not found");
            }

            // Convert stream to buffer
            const stream = response.Body as Readable;
            const chunks: Buffer[] = [];
            for await (const chunk of stream) {
                chunks.push(Buffer.from(chunk));
            }
            const originalBuffer = Buffer.concat(chunks);

            // 2. Process with Sharp
            let pipeline = sharp(originalBuffer);

            // Resize if requested
            if (options.width || options.height) {
                pipeline = pipeline.resize({
                    width: options.width,
                    height: options.height,
                    fit: options.fit || "cover",
                    withoutEnlargement: true,
                });
            }

            // Always convert to WebP for performance
            pipeline = pipeline.webp({
                quality: options.quality || 80,
                effort: 4, // Balance between compression speed and file size
            });

            const processedBuffer = await pipeline.toBuffer();

            return {
                buffer: processedBuffer,
                contentType: "image/webp",
            };
        } catch (error) {
            console.error("Image optimization error:", error);
            throw error;
        }
    }
}

export const imageService = new ImageService();
