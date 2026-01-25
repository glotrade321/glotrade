import { imageService } from "../services/ImageService";
import sharp from "sharp";

export class ImageController {
    optimize = async (req: any, res: any, next: any) => {
        try {
            const { key } = req.params;
            const { w, h, q, fit } = req.query;

            if (!key) {
                return res.status(400).json({ error: "Image key is required" });
            }

            // Validate dimensions to prevent DOS
            const width = w ? parseInt(w as string) : undefined;
            const height = h ? parseInt(h as string) : undefined;
            const quality = q ? parseInt(q as string) : 80;

            if ((width && width > 2000) || (height && height > 2000)) {
                return res.status(400).json({ error: "Max dimension is 2000px" });
            }

            const { buffer, contentType } = await imageService.optimizeImage(key, {
                width,
                height,
                quality,
                fit: fit as keyof sharp.FitEnum,
            });

            // Set caching headers - Aggressive caching
            // Cache for 1 year (immutable) since keys should change if content changes
            res.set("Cache-Control", "public, max-age=31536000, immutable");
            res.set("Content-Type", contentType);

            res.send(buffer);
        } catch (error) {
            console.error("Image controller error:", error);
            // If original not found, 404
            if ((error as Error).message === "Image not found" || (error as any).name === "NoSuchKey") {
                return res.status(404).json({ error: "Image not found" });
            }
            next(error);
        }
    };
}

export default new ImageController();
