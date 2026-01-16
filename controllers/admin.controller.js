const { sql, connectDB } = require('../config/db');

// --- Lấy danh sách Học Kỳ ---
const getHocky = async (req, res) => {
    try {
        const pool = await connectDB(); 
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

// --- Lấy phân công ---
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