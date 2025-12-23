const Hoc_Ky = require('../models/hocky.model');
const { sql, connectDB } = require('../config/db');

// 1. Lấy danh sách Học Kỳ
const getHocky = async (req, res) => {
    try {
        const pool = await connectDB(); // Lấy kết nối pool
        
        // Sắp xếp giảm dần để học kỳ mới nhất hiện lên đầu
        const result = await pool.request().query`
            SELECT * FROM Hoc_Ky 
            ORDER BY Nam_Hoc DESC, Ma_HK DESC
        `;
        
        res.json(result.recordset);
    } catch (error) {
        console.error('Lỗi tải học kỳ:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// 2. Lấy phân công (Lưu ý: File phancong.controller.js đã có hàm chi tiết hơn)
const getPhanCong = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query`
            SELECT * FROM Phan_Cong
        `;
        res.json(result.recordset);
    } catch (error) {
        console.error('Lỗi tải bảng phân công:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

module.exports = {
    getHocky,
    getPhanCong
};