const { sql, connectDB } = require('../config/db');
const TaiKhoan = require('../models/auth.model'); 

// --- Đăng Nhập ---
const login = async (req, res) => {
    const { Ten_TK, Mat_Khau } = req.body;

    try {
        const pool = await connectDB(); 
        
        const result = await pool.request().query`
            SELECT * FROM Dang_Nhap 
            WHERE Ten_TK = ${Ten_TK} AND Mat_Khau = ${Mat_Khau}
        `;

        if (result.recordset.length > 0) {
            const userRaw = result.recordset[0];
            const userChuan = new TaiKhoan(
                userRaw.Ma_TK,
                userRaw.Ten_TK,
                userRaw.Loai_TK
            );

            res.json({ 
                success: true, 
                message: 'Đăng nhập thành công!',
                user: userChuan 
            });
        } else {
            res.json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// --- Lấy danh sách Tài khoản GV ---
const getTaiKhoanGV = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query`
            SELECT g.Ma_GV, g.Ten_GV, d.Ten_TK, d.Mat_Khau 
            FROM Giao_Vien g 
            JOIN Dang_Nhap d ON g.Ma_GV = d.Ma_TK
        `;
        res.json(result.recordset);
    } catch (e) { res.status(500).json(e); }
};

// --- Lấy danh sách Tài khoản HS ---
const getTaiKhoanHS = async (req, res) => {
    const { maLop } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request().query`
            SELECT h.Ma_HS, h.Ten_HS, d.Ten_TK, d.Mat_Khau 
            FROM Hoc_Sinh h 
            JOIN Dang_Nhap d ON h.Ma_HS = d.Ma_TK
            WHERE h.Ma_Lop = ${maLop}
        `;
        res.json(result.recordset);
    } catch (e) { res.status(500).json(e); }
};

 // ---  Cập nhật tài khoản ---
const capNhatTaiKhoan = async (req, res) => {
    const { maTK, matKhauMoi } = req.body; 

    if (!maTK) {
        return res.status(400).json({ message: 'Thiếu Mã Tài Khoản (maTK)!' });
    }
    if (!matKhauMoi || matKhauMoi.trim() === "") {
        return res.status(400).json({ message: 'Mật khẩu/SĐT mới không được để trống!' });
    }

    let pool;
    try {
        pool = await connectDB();
    } catch (err) {
        return res.status(500).json({ message: "Lỗi kết nối Database" });
    }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin(); 
        const request1 = new sql.Request(transaction);
        await request1.query`
            UPDATE Dang_Nhap 
            SET Mat_Khau = ${matKhauMoi} 
            WHERE Ma_TK = ${maTK}
        `;

        
        const request2 = new sql.Request(transaction);
        await request2.query`
            UPDATE Hoc_Sinh 
            SET SDT = ${matKhauMoi} 
            WHERE Ma_HS = ${maTK}
        `;

        const request3 = new sql.Request(transaction);
        await request3.query`
            UPDATE Giao_Vien 
            SET SDT = ${matKhauMoi} 
            WHERE Ma_GV = ${maTK}
        `;

    
        await transaction.commit();
        
        res.json({ success: true, message: 'Đã cập nhật Mật khẩu và SĐT thành công!' });

    } catch (e) { 
        if (transaction._aborted === false) {
             await transaction.rollback();
        }
        console.error("Lỗi cập nhật:", e);
        res.status(500).json({ message: 'Lỗi server: ' + e.message }); 
    }
};

module.exports = { 
    login,
    getTaiKhoanGV,
    getTaiKhoanHS,
    capNhatTaiKhoan
};