const express = require('express');
const router = express.Router();
const controller = require('../controllers/lop.controller');
 

router.get("/ten", controller.getTenLop);
router.get('/',controller.getLop);
router.post('/',controller.themLop);
router.put('/:id', controller.suaLop);  
router.delete('/:id', controller.xoaLop);

module.exports = router;
