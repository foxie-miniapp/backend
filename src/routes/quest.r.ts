import * as express from 'express';
const router = express.Router();

import QuestController from '../controllers/quest.c';

router.get('/', QuestController.getQuests);
router.post('/', QuestController.createQuest);
router.delete('/:questId', QuestController.deleteQuest);
router.post('/:questId/complete', QuestController.completeQuest);
router.post('/:questId/claim', QuestController.claimQuest);

export default router;
