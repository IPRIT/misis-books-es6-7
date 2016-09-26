import express from 'express';
import { rightsAllocator, userRetriever } from '../../utils';
import authenticator from './authenticate';
import * as userMethods from './methods';

const router = express.Router();

router.use('/authenticate', authenticator);

router.get('/me', [ userRetriever, rightsAllocator('user') ], userMethods.me);

export default router;