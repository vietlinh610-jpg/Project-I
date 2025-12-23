const express = require('express');
const router = express.Router();
const controller = require('../controllers/hocky.controller');

router.get('/', controller.getHocky);
router.get('/', controller.getPhanCong);

module.exports = router;