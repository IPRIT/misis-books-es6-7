import express from 'express';
import { vk } from './providers';
import { vkSignInVerifier } from '../../../../utils';

const router = express.Router();

router.post('/vk', [ vkSignInVerifier ], vk);

export default router;