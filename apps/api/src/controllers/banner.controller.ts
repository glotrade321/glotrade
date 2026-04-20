import { Request, Response, NextFunction } from 'express';
import Banner from '../models/Banner';
import { R2Service } from '../services/R2Service';
import { ValidationError, NotFoundError } from '../utils/errors';

const r2Service = new R2Service();

const parseOptionalDate = (value: unknown) => {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
        throw new ValidationError('Invalid banner date');
    }

    return date;
};

const parseBannerPosition = (value: unknown, fallback = 0) => {
    if (value === undefined || value === null || value === '') return fallback;

    const position = Number.parseInt(String(value), 10);
    if (Number.isNaN(position)) {
        throw new ValidationError('Banner position must be a valid number');
    }

    return position;
};

export const createBanner = async (req: any, res: any, next: any) => {
    try {
        const { title, link, isActive, startDate, endDate, position } = req.body;
        const file = req.file;

        if (!file) {
            throw new ValidationError('Banner image is required');
        }

        // Upload image to R2
        const key = `banners/${Date.now()}_${file.originalname}`;
        const uploadResult = await r2Service.uploadFile(file.buffer, key, file.mimetype);
        const nextStartDate = parseOptionalDate(startDate);
        const nextEndDate = parseOptionalDate(endDate);

        const banner = await Banner.create({
            title,
            image: uploadResult.url,
            link,
            isActive: isActive === 'true' || isActive === true,
            startDate: nextStartDate ?? undefined,
            endDate: nextEndDate ?? undefined,
            position: parseBannerPosition(position),
        });

        res.status(201).json({
            status: 'success',
            data: { banner },
        });
    } catch (error) {
        next(error);
    }
};

export const getBanners = async (req: any, res: any, next: any) => {
    try {
        // If admin, return all. If public, return only active and within date range.
        // Assuming there's a way to distinguish admin requests, e.g., via middleware attaching user role
        // For now, let's support a query param 'mode=admin' or similar, but securely checking req.user is better.
        // Since this is a public endpoint for home page, we'll default to active.
        // Admin management usually goes through a protected route. 
        // Let's assume this controller handles both, but we filter based on context.

        // Ideally, we should have separate endpoints or check permissions.
        // For simplicity, let's return all for now and let frontend filter or add a query param.

        const { active } = req.query;

        let query: any = {};

        if (active === 'true') {
            const now = new Date();
            query = {
                isActive: true,
                $or: [
                    { startDate: { $exists: false } },
                    { startDate: null },
                    { startDate: { $lte: now } }
                ],
                $and: [
                    {
                        $or: [
                            { endDate: { $exists: false } },
                            { endDate: null },
                            { endDate: { $gte: now } }
                        ]
                    }
                ]
            };
        }

        const banners = await Banner.find(query).sort({ position: 1, createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: banners.length,
            data: { banners },
        });
    } catch (error) {
        next(error);
    }
};

export const getBanner = async (req: any, res: any, next: any) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            throw new NotFoundError('Banner not found');
        }
        res.status(200).json({
            status: 'success',
            data: { banner }
        });
    } catch (error) {
        next(error);
    }
}

export const updateBanner = async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const { title, link, isActive, startDate, endDate, position } = req.body;
        const file = req.file;

        const banner = await Banner.findById(id);
        if (!banner) {
            throw new NotFoundError('Banner not found');
        }

        let imageUrl = banner.image;

        if (file) {
            // Delete old image if it exists and looks like an R2 URL (optional safety check)
            // Extract key from URL if possible, or just upload new one.
            // R2Service deleteFile expects a key.
            // Assuming the image URL structure matches what we expect from R2Service public URL.
            // We can try to extract the key.

            const publicUrl = r2Service.getPublicUrl();
            if (banner.image.startsWith(publicUrl)) {
                const oldKey = banner.image.replace(`${publicUrl}/`, '');
                await r2Service.deleteFile(oldKey).catch(err => console.error("Failed to delete old banner image", err));
            }

            const key = `banners/${Date.now()}_${file.originalname}`;
            const uploadResult = await r2Service.uploadFile(file.buffer, key, file.mimetype);
            imageUrl = uploadResult.url;
        }

        banner.title = title || banner.title;
        banner.image = imageUrl;
        banner.link = link; // Allow clearing link? If so, handle empty string.
        if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;
        const nextStartDate = parseOptionalDate(startDate);
        const nextEndDate = parseOptionalDate(endDate);

        if (nextStartDate !== undefined) banner.startDate = nextStartDate ?? undefined;
        if (nextEndDate !== undefined) banner.endDate = nextEndDate ?? undefined;
        if (position !== undefined) banner.position = parseBannerPosition(position, banner.position);

        await banner.save();

        res.status(200).json({
            status: 'success',
            data: { banner },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBanner = async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findById(id);

        if (!banner) {
            throw new NotFoundError('Banner not found');
        }

        // Delete image from R2
        const publicUrl = r2Service.getPublicUrl();
        if (banner.image && banner.image.startsWith(publicUrl)) {
            const key = banner.image.replace(`${publicUrl}/`, '');
            await r2Service.deleteFile(key).catch(err => console.error("Failed to delete banner image", err));
        }

        await Banner.findByIdAndDelete(id);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};
