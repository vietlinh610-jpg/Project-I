const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');

router.post('/login',controller.login);
router.get('/giaovien', controller.getTaiKhoanGV);       // Lấy list TK GV
router.get('/hocsinh/:maLop', controller.getTaiKhoanHS); // Lấy list TK HS theo lớp
router.put('/update', controller.capNhatTaiKhoan);
module.exports = router;
