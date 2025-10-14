

import { container } from '../../../infrastructure/config/container';
import { AuthMiddleware } from './authMiddleware';

const authMiddleware = container.resolve(AuthMiddleware);

export const authenticate = authMiddleware.authenticate();
export const adminOnly = authMiddleware.authenticate('admin');
export const userOnly = authMiddleware.authenticate('user');
