const express = require("express");
const router = express.Router();
const controller = require("../controllers/diem.controller");

router.get("/lop", controller.getDiemLop);
router.post("/luu", controller.luuDiem);

module.exports = router;
