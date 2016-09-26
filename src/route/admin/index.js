import express from 'express';
import { rightsAllocator, userRetriever } from '../../utils';
import * as adminMethods from './methods';

const router = express.Router();

router.get('/switch-version', [ userRetriever, rightsAllocator() ], adminMethods.versionSwitcher);

export default router;