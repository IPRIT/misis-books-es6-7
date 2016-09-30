import express from 'express';
import { rightsAllocator, userRetriever } from '../../utils';
import * as documents from './methods';

const router = express.Router();

router.post('/search', [ userRetriever, rightsAllocator('user', 'proUser') ], documents.search);

router.route('/faves')
  .get([ userRetriever, rightsAllocator('proUser') ], documents.faves.get)
  .post([ userRetriever, rightsAllocator('proUser') ], documents.faves.post)
  .delete([ userRetriever, rightsAllocator('proUser') ], documents.faves.remove);

router.get('/popular', [ userRetriever, rightsAllocator('user', 'proUser') ], documents.popular);

export default router;