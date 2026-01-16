const Phan_Cong = require('../models/phancong.model');
const { sql, connectDB } = require('../config/db');

// --- Lấy danh sách phân công ---
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
//--- Thêm Phân Công mới ---
const themPhanCong = async (req, res) => {
    const { Ma_GV, Ma_Lop, Ma_HK } = req.body;

    try {
        const pool = await connectDB();
        const gv = await pool.request().query`
            SELECT Ma_MH FROM Giao_Vien WHERE Ma_GV = ${Ma_GV}
        `;

        if (gv.recordset.length === 0) {
            return res.status(400).json({ message: 'Giáo viên không tồn tại!' });
        }

        const Ma_MH = gv.recordset[0].Ma_MH;
        const check = await pool.request().query`
            SELECT Ma_PC FROM Phan_Cong
            WHERE Ma_Lop = ${Ma_Lop}
              AND Ma_MH = ${Ma_MH}
              AND Ma_HK = ${Ma_HK}
        `;

        if (check.recordset.length > 0) {
            return res.status(400).json({
                message: 'Lớp này đã được phân công môn này trong học kỳ này!'
            });
        }
        await pool.request().query`
            INSERT INTO Phan_Cong (Ma_GV, Ma_Lop, Ma_MH, Ma_HK)
            VALUES (${Ma_GV}, ${Ma_Lop}, ${Ma_MH}, ${Ma_HK})
        `;

        res.json({ message: 'Thêm phân công thành công!' });

    } catch (error) {
        console.error('Lỗi thêm phân công:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

//--- Sửa phân công---
const suaPhanCong = async (req, res) => {
    const { id } = req.params; // Ma_PC
    const { Ma_GV, Ma_Lop, Ma_HK } = req.body;

    try {
        const pool = await connectDB();
        const hk = await pool.request().query`
            SELECT Ma_HK FROM Hoc_Ky WHERE Ma_HK = ${Ma_HK}
        `;
        if (hk.recordset.length === 0) {
            return res.status(400).json({ message: 'Học kỳ không tồn tại!' });
        }
        const gv = await pool.request().query`
            SELECT Ma_MH FROM Giao_Vien WHERE Ma_GV = ${Ma_GV}
        `;
        if (gv.recordset.length === 0) {
            return res.status(400).json({ message: 'Giáo viên không tồn tại!' });
        }
        const Ma_MH = gv.recordset[0].Ma_MH;
        const check = await pool.request().query`
            SELECT Ma_PC FROM Phan_Cong
            WHERE Ma_Lop = ${Ma_Lop}
              AND Ma_MH = ${Ma_MH}
              AND Ma_HK = ${Ma_HK}
              AND Ma_PC != ${id}
        `;
        if (check.recordset.length > 0) {
            return res.status(400).json({
                message: 'Lớp này đã có giáo viên dạy môn này trong học kỳ!'
            });
        }
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
        console.error('Lỗi sửa phân công:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};
  

// --- Xóa phân công ---
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