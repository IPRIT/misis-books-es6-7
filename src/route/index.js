import express from 'express';
import cors from './cors';
import test from './test';
import user from './user';
import admin from './admin';
import documents from './documents';

const router = express.Router();

router.all('*', cors);

router.use('/test', test);
router.use('/user', user);
router.use('/documents', documents);
router.use('/admin', admin);

export default router;