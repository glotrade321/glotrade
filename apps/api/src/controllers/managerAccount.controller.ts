import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CreateManagerAccountData, ManagerAccountService, ManagerRole } from '../services/ManagerAccountService';

const managerAccountService = new ManagerAccountService();
const VALID_MANAGER_ROLES: ManagerRole[] = ['product_manager', 'order_manager'];

function isValidManagerRole(role: string): role is ManagerRole {
    return VALID_MANAGER_ROLES.includes(role as ManagerRole);
}

export class ManagerAccountController {
    async createManager(req: AuthRequest, res: Response) {
        try {
            const { email, firstName, lastName, phone, role } = req.body as Partial<CreateManagerAccountData>;

            if (!email || !firstName || !lastName || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, first name, last name, and role are required',
                });
            }

            if (!isValidManagerRole(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid manager role',
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                });
            }

            const result = await managerAccountService.createManager({
                email,
                firstName,
                lastName,
                phone,
                role,
                createdBy: req.user!._id.toString(),
            });

            res.status(201).json({
                success: true,
                message: 'Manager account created successfully. Login credentials sent to email.',
                data: result,
            });
        } catch (error: any) {
            console.error('[ManagerAccountController] Create error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create manager account',
            });
        }
    }

    async listManagers(req: Request, res: Response) {
        try {
            const requestedRole = req.query.role as string | undefined;
            const role = requestedRole && isValidManagerRole(requestedRole) ? requestedRole : undefined;
            const managers = await managerAccountService.listManagers(role);

            res.json({
                success: true,
                data: managers,
                total: managers.length,
            });
        } catch (error: any) {
            console.error('[ManagerAccountController] List error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch manager accounts',
            });
        }
    }

    async getManagerById(req: Request, res: Response) {
        try {
            const manager = await managerAccountService.getManagerById(req.params.id);
            res.json({ success: true, data: manager });
        } catch (error: any) {
            console.error('[ManagerAccountController] Get by ID error:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'Manager account not found',
            });
        }
    }

    async updateManager(req: Request, res: Response) {
        try {
            const { firstName, lastName, phone, isBlocked } = req.body;
            const result = await managerAccountService.updateManager(req.params.id, {
                firstName,
                lastName,
                phone,
                isBlocked,
            });

            res.json({
                success: true,
                message: 'Manager account updated successfully',
                data: result,
            });
        } catch (error: any) {
            console.error('[ManagerAccountController] Update error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update manager account',
            });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const result = await managerAccountService.resetPassword(req.params.id);
            res.json({
                success: true,
                message: result.message,
            });
        } catch (error: any) {
            console.error('[ManagerAccountController] Reset password error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to reset password',
            });
        }
    }

    async deleteManager(req: AuthRequest, res: Response) {
        try {
            const result = await managerAccountService.deleteManager(
                req.params.id,
                req.user!._id.toString()
            );

            res.json({
                success: true,
                message: result.message,
            });
        } catch (error: any) {
            console.error('[ManagerAccountController] Delete error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete manager account',
            });
        }
    }
}
