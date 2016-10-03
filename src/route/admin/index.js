import express from 'express';
import { rightsAllocator, userRetriever } from '../../utils';
import * as adminMethods from './methods';

const router = express.Router();

router.post('/switch-version', adminMethods.versionSwitcher);

export default router;