const express = require('express');
const router = express.Router();
const controller = require('../controllers/phancong.controller'); 

// Định nghĩa các đường dẫn
router.get('/', controller.getPhanCong);       // Lấy danh sách
router.post('/', controller.themPhanCong);     // Thêm mới
router.put('/:id', controller.suaPhanCong);    // Sửa (Môn học của bạn thiếu cái này, Phân công cần thêm vào)
router.delete('/:id', controller.xoaPhanCong); // Xóa

module.exports = router;