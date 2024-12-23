import express from 'express'
import urlController from '../controller/url_shortener.js'
const { url_shorten, redirect } = urlController

const router = express.Router();

router.post('/url-shorten', url_shorten);
router.get('/redirect/:url', redirect);

export default router