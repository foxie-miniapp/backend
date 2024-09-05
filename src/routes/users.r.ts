import * as express from 'express';
const router = express.Router();

import usersController from '../controllers/users.c';

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's profile
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.get('/me', usersController.findMe);

export default router;
