const express = require('express');
const router = express.Router();
const controller = require('../controllers/hocsinh.controller');

// 1. Lấy danh sách
router.get('/', controller.getDanhSachHocSinh);
router.get('/canhan/:maHS', controller.getBangDiemCaNhan);
router.get('/id/:maHS', controller.getThongtinHS);
router.get('/lop/:maLop', controller.getHocSinhTheoLop);
router.put('/roi-lop/:id', controller.roiLop);      
router.post('/them-vao-lop', controller.themVaoLop);
router.post('/', controller.themHocSinh); 
router.put('/:id', controller.suaHocSinh);
router.delete('/:id', controller.xoaHocSinh);

module.exports = router;