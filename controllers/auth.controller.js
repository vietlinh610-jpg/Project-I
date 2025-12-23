const { sql, connectDB } = require('../config/db');
const TaiKhoan = require('../models/auth.model'); 

// 1. Đăng Nhập (Đã cập nhật dùng Pool)
const login = async (req, res) => {
    const { Ten_TK, Mat_Khau } = req.body;

    try {
        const pool = await connectDB(); // Lấy kết nối pool
        
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

// 2. Lấy danh sách Tài khoản GV
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

// 3. Lấy danh sách Tài khoản HS
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

// --- 4. CẬP NHẬT TÀI KHOẢN (ĐÃ SỬA ĐỂ KHÔNG BỊ LỖI 400) ---
 // --- 4. CẬP NHẬT TÀI KHOẢN & SỐ ĐIỆN THOẠI ---
const capNhatTaiKhoan = async (req, res) => {
    // Nhận thêm biến sdtMoi (nếu bạn muốn SĐT khác mật khẩu, còn không thì dùng luôn matKhauMoi)
    // Ở đây mình giả định bạn muốn Mật khẩu mới chính là SĐT mới luôn (logic phổ biến ở trường học)
    const { maTK, matKhauMoi } = req.body; 

    // Kiểm tra dữ liệu
    if (!maTK) {
        return res.status(400).json({ message: 'Thiếu Mã Tài Khoản (maTK)!' });
    }
    if (!matKhauMoi || matKhauMoi.trim() === "") {
        return res.status(400).json({ message: 'Mật khẩu/SĐT mới không được để trống!' });
    }

    // 1. LẤY KẾT NỐI
    let pool;
    try {
        pool = await connectDB();
    } catch (err) {
        return res.status(500).json({ message: "Lỗi kết nối Database" });
    }

    // 2. TẠO TRANSACTION (Quan trọng)
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin(); // Bắt đầu giao dịch

        // --- BƯỚC 1: Cập nhật Mật khẩu bảng DANG_NHAP ---
        const request1 = new sql.Request(transaction);
        await request1.query`
            UPDATE Dang_Nhap 
            SET Mat_Khau = ${matKhauMoi} 
            WHERE Ma_TK = ${maTK}
        `;

        // --- BƯỚC 2: Cập nhật SĐT bảng HOC_SINH ---
        // (Nếu maTK là học sinh thì dòng này có tác dụng, nếu là GV thì dòng này update 0 row - không lỗi)
        const request2 = new sql.Request(transaction);
        await request2.query`
            UPDATE Hoc_Sinh 
            SET SDT = ${matKhauMoi} 
            WHERE Ma_HS = ${maTK}
        `;

        // --- BƯỚC 3: Cập nhật SĐT bảng GIAO_VIEN ---
        // (Tương tự, chỉ chạy nếu maTK là giáo viên)
        const request3 = new sql.Request(transaction);
        await request3.query`
            UPDATE Giao_Vien 
            SET SDT = ${matKhauMoi} 
            WHERE Ma_GV = ${maTK}
        `;

        // 3. XÁC NHẬN GIAO DỊCH
        await transaction.commit();
        
        res.json({ success: true, message: 'Đã cập nhật Mật khẩu và SĐT thành công!' });

    } catch (e) { 
        // Nếu lỗi thì hoàn tác tất cả
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