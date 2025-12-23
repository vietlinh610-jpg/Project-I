const Phan_Cong = require('../models/phancong.model');
const { sql, connectDB } = require('../config/db');

// 1. Lấy danh sách phân công (Đã sửa dùng pool)
const getPhanCong = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query`
            SELECT 
                PC.Ma_PC, 
                HK.Ten_HK as Hoc_Ky,   
                HK.Nam_Hoc,  
                GV.Ma_GV, GV.Ten_GV,
                L.Ma_Lop, L.Ten_Lop,
                MH.Ma_MH, MH.Ten_MH
            FROM Phan_Cong PC
            LEFT JOIN Giao_Vien GV ON PC.Ma_GV = GV.Ma_GV
            LEFT JOIN Lop L ON PC.Ma_Lop = L.Ma_Lop    
            LEFT JOIN Mon_Hoc MH ON PC.Ma_MH = MH.Ma_MH 
            LEFT JOIN Hoc_Ky HK ON PC.Ma_HK = HK.Ma_HK 
            ORDER BY HK.Nam_Hoc DESC, PC.Ma_HK DESC
        `;
        res.json(result.recordset);
    } catch (error) {
        console.error("Lỗi getPhanCong:", error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// 2. Thêm phân công mới (Đã sửa dùng pool)
const themPhanCong = async (req, res) => {
    const { Ma_GV, Ma_Lop, Ma_MH, Ma_HK } = req.body; 

    try {
        const pool = await connectDB();
        
        // --- SỬA LỖI KIỂM TRA TRÙNG TẠI ĐÂY ---
        const check = await pool.request().query`
            SELECT Ma_PC FROM Phan_Cong 
            WHERE Ma_Lop = ${Ma_Lop} AND Ma_MH = ${Ma_MH} AND Ma_HK = ${Ma_HK}
        `;
        
        if (check.recordset.length > 0) {
            return res.status(400).json({ message: 'Lớp này đã được phân công môn này trong học kỳ này rồi!' });
        }

        await pool.request().query`
            INSERT INTO Phan_Cong (Ma_GV, Ma_Lop, Ma_MH, Ma_HK)
            VALUES (${Ma_GV}, ${Ma_Lop}, ${Ma_MH}, ${Ma_HK})
        `;
        
        res.json({ message: 'Thêm phân công thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
};

// 3. Sửa phân công (Đã sửa dùng pool)
const suaPhanCong = async (req, res) => {
    const { id } = req.params; // Ma_PC
    const { Ma_GV, Ma_Lop, Ma_MH, Ma_HK } = req.body; 

    try {
        const pool = await connectDB();

        // Bước 1: Kiểm tra trùng lặp (trừ chính nó ra)
        const check = await pool.request().query`
            SELECT * FROM Phan_Cong 
            WHERE Ma_Lop = ${Ma_Lop} 
              AND Ma_MH = ${Ma_MH} 
              AND Ma_HK = ${Ma_HK}
              AND Ma_PC != ${id} 
        `;
        
        if (check.recordset.length > 0) {
            return res.status(400).json({ message: 'Lỗi: Đã có phân công môn này cho lớp này trong học kỳ này rồi!' });
        }

        // Bước 2: Thực hiện Update
        await pool.request().query`
            UPDATE Phan_Cong
            SET Ma_GV = ${Ma_GV}, 
                Ma_Lop = ${Ma_Lop}, 
                Ma_MH = ${Ma_MH}, 
                Ma_HK = ${Ma_HK}
            WHERE Ma_PC = ${id}
        `;
        
        res.json({ message: 'Cập nhật phân công thành công!' });
    } catch (error) {
        console.error("Lỗi sửa phân công:", error);
        res.status(500).json({ message: 'Lỗi cập nhật dữ liệu', error });
    }
};

// 4. Xóa phân công (Đã sửa dùng pool)
const xoaPhanCong = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        await pool.request().query`DELETE FROM Phan_Cong WHERE Ma_PC = ${id}`;
        res.json({ message: 'Đã xóa phân công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa: ' + error.message });
    }
};

module.exports = { 
    getPhanCong, 
    themPhanCong,
    suaPhanCong, 
    xoaPhanCong
};