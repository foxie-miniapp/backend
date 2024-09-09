import * as express from 'express';
const router = express.Router();

import usersController from '../controllers/users.c';

router.get('/me', usersController.findMe);

router.post('/daily-reward', usersController.dailyReward);

router.get('/leaderboard', usersController.getLeaderboard);

router.get('/referents', usersController.getReferents);

export default router;
