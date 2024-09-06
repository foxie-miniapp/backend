import * as express from 'express';
const router = express.Router();

import usersController from '../controllers/users.c';

router.get('/me', usersController.findMe);

export default router;
