const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
router.get('/hocky',controller.getHocky);
router.get('/phancong',controller.getPhanCong);

module.exports = router;