import express from 'express';
import { rightsAllocator, userRetriever } from '../../utils';
import * as documents from './methods';

const router = express.Router();

router.post('/search', [ userRetriever, rightsAllocator('user', 'proUser') ], documents.search);

export default router;