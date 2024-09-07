import * as express from 'express';
const router = express.Router();

import QuestController from '../controllers/quest.c';

router.get('/', QuestController.getQuests);
router.post('/', QuestController.createQuest);
router.post('/complete', QuestController.completeQuest);

export default router;
