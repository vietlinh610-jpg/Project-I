const express = require('express');
const router = express.Router();
const controller = require('../controllers/monhoc.controller');
router.get('/',controller.getMon);
router.post('/',controller.themMon);
router.delete('/:id',controller.xoaMon);
router.put('/:id', controller.suaMon);

module.exports = router;
