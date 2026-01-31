import { Request, Response } from 'express';
import { ProductManagerService } from '../services/ProductManagerService';
import { AuthRequest } from '../middleware/auth';

const productManagerService = new ProductManagerService();

export class ProductManagerController {
    /**
     * Create a new Product Manager
     * POST /api/v1/admin/product-managers
     */
    async createProductManager(req: AuthRequest, res: Response) {
        try {
            const { email, firstName, lastName, phone } = req.body;

            // Validate input
            if (!email || !firstName || !lastName) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, first name, and last name are required',
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                });
            }

            const result = await productManagerService.createProductManager({
                email,
                firstName,
                lastName,
                phone,
                createdBy: req.user!._id.toString(),
            });

            res.status(201).json({
                success: true,
                message: 'Product Manager created successfully. Login credentials sent to email.',
                data: result,
            });
        } catch (error: any) {
            console.error('[ProductManagerController] Create error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create Product Manager',
            });
        }
    }

    /**
     * List all Product Managers
     * GET /api/v1/admin/product-managers
     */
    async listProductManagers(req: Request, res: Response) {
        try {
            const productManagers = await productManagerService.listProductManagers();

            res.json({
                success: true,
                data: productManagers,
                total: productManagers.length,
            });
        } catch (error: any) {
            console.error('[ProductManagerController] List error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch Product Managers',
            });
        }
    }

    /**
     * Get Product Manager by ID
     * GET /api/v1/admin/product-managers/:id
     */
    async getProductManagerById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const productManager = await productManagerService.getProductManagerById(id);

            res.json({
                success: true,
                data: productManager,
            });
        } catch (error: any) {
            console.error('[ProductManagerController] Get by ID error:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'Product Manager not found',
            });
        }
    }

    /**
     * Update Product Manager
     * PUT /api/v1/admin/product-managers/:id
     */
    async updateProductManager(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { firstName, lastName, phone, isBlocked } = req.body;

            const result = await productManagerService.updateProductManager(id, {
                firstName,
                lastName,
                phone,
                isBlocked,
            });

            res.json({
                success: true,
                message: 'Product Manager updated successfully',
                data: result,
            });
        } catch (error: any) {
            console.error('[ProductManagerController] Update error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update Product Manager',
            });
        }
    }

    /**
     * Reset Product Manager password
     * POST /api/v1/admin/product-managers/:id/reset-password
     */
    async resetPassword(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const result = await productManagerService.resetPassword(id);

            res.json({
                success: true,
                message: result.message,
            });
        } catch (error: any) {
            console.error('[ProductManagerController] Reset password error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to reset password',
            });
        }
    }

    /**
     * Delete Product Manager
     * DELETE /api/v1/admin/product-managers/:id
     */
    async deleteProductManager(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            const result = await productManagerService.deleteProductManager(
                id,
                req.user!._id.toString()
            );

            res.json({
                success: true,
                message: result.message,
            });
        } catch (error: any) {
            console.error('[ProductManagerController] Delete error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete Product Manager',
            });
        }
    }
}
