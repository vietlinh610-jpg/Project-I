const express = require('express');
const router = express.Router();
const controller = require('../controllers/giaovien.controller');


router.get('/', controller.getDanhSachGiaoVien);

router.get('/lop-phu-trach/:maGV', controller.getLopPhuTrach);
router.post('/', controller.themGiaoVien);
router.put('/:id', controller.suaGiaoVien);
router.delete('/:id', controller.xoaGiaoVien);

module.exports = router;