import * as express from 'express';
const router = express.Router();

import petController from 'src/controllers/pet.c';

router.post('/feed', petController.feedPet);

export default router;
