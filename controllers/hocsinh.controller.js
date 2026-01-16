const Hoc_Sinh = require('../models/hocsinh.model');
const { sql, connectDB } = require('../config/db');

// --- Lấy danh sách tất cả học sinh ---
const getDanhSachHocSinh = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query`
            SELECT HS.*, L.Ten_Lop, DN.Ten_TK 
            FROM Hoc_Sinh HS
            LEFT JOIN Lop L ON HS.Ma_Lop = L.Ma_Lop
            LEFT JOIN Dang_Nhap DN ON HS.Ma_HS = DN.Ma_TK
            ORDER BY HS.Ten_HS ASC
        `;
        res.json(result.recordset);
    } catch (error) {
        console.error('Lỗi getDanhSachHocSinh:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// --- Lấy thông tin học sinh ---
const getThongtinHS = async (req, res) => {
    const { maHS } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request().query`
            SELECT
                hs.Ten_HS, hs.Ma_HS, hs.Ngay_Sinh, hs.Gioi_Tinh, hs.Email, hs.SDT,
                gv.Ten_GV, l.Ten_Lop, l.Ma_Lop,
                dn.Ten_TK
            FROM Hoc_Sinh hs
            LEFT JOIN Lop l On hs.Ma_Lop = l.Ma_Lop
            LEFT JOIN Giao_Vien gv On l.Ma_GVCN = gv.Ma_GV
            LEFT JOIN Dang_Nhap dn ON hs.Ma_HS = dn.Ma_TK
            WHERE hs.Ma_HS = ${maHS}
        `;
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: 'Không tìm thấy học sinh này' });
        }
    } catch (error) {
        console.error('Lỗi getThongtinHS:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// --- Lấy bảng điểm---
const getBangDiemCaNhan = async (req, res) => {
    const { maHS } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request().query`
            SELECT 
                mh.Ten_MH, hk.Ten_HK,
                d.Diem_Mieng, d.Diem_15P, d.Diem_45P, d.Diem_GK, d.Diem_CK, d.Diem_TK
            FROM Diem d
            JOIN Mon_Hoc mh On d.Ma_MH = mh.Ma_MH
            JOIN Hoc_Ky hk On d.Ma_HK = hk.Ma_HK
            WHERE d.Ma_HS = ${maHS}
        `;
        res.json(result.recordset);
    } catch (error) {
        console.error('Lỗi getBangDiemCaNhan:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
}

// ---  Lấy danh sách học sinh theo lớp ---
const getHocSinhTheoLop = async (req, res) => {
    const { maLop } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request().query`
            SELECT HS.*, DN.Ten_TK,l.Ten_Lop
            FROM Hoc_Sinh HS
            LEFT JOIN Dang_Nhap DN ON HS.Ma_HS = DN.Ma_TK
            JOIN Lop l ON hs.Ma_Lop = l.Ma_Lop
            WHERE HS.Ma_Lop = ${maLop}
        `;
        res.json(result.recordset);
    } catch (error) {
        console.error('Lỗi getHocSinhTheoLop:', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// --- Thêm học sinh  ---
const themHocSinh = async (req, res) => {
    const { Ma_HS, Ten_TK, Ten_HS, Ngay_Sinh, Gioi_Tinh, Email, SDT, Ma_Lop } = req.body;
    if (!Ma_HS || !Ten_TK || !Ten_HS || !SDT || !Ma_Lop) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc!' });
    }
    if (!Ma_HS.toUpperCase().startsWith("HS")) {
        return res.status(400).json({ message: `Mã Học Sinh '${Ma_HS}' không hợp lệ. Phải bắt đầu bằng 'HS'.` });
    }
    if (SDT.length > 10) {
        return res.status(400).json({ message: `SĐT quá dài (${SDT.length} ký tự). Tối đa 10 số.` });
    }

    let pool;
    let transaction;

    try {
        pool = await connectDB();
        const checkLop = await pool.request().query`SELECT Ma_Lop FROM Lop WHERE Ma_Lop = ${Ma_Lop}`;
        if (checkLop.recordset.length === 0) {
            return res.status(400).json({ message: `Lớp '${Ma_Lop}' không tồn tại!` });
        }
        transaction = new sql.Transaction(pool);
        await transaction.begin();
        console.log("1. Đang tạo tài khoản...");
        const request1 = new sql.Request(transaction); 
        await request1.query`
            INSERT INTO Dang_Nhap (Ma_TK, Ten_TK, Mat_Khau, Loai_TK)
            VALUES (${Ma_HS}, ${Ten_TK}, ${SDT}, 'HocSinh')
        `;

        console.log("2. Đang tạo hồ sơ...");
        const finalNgaySinh = Ngay_Sinh ? Ngay_Sinh : null;
        
        const request2 = new sql.Request(transaction);
        await request2.query`
            INSERT INTO Hoc_Sinh (Ma_HS, Ma_Lop, Ten_HS, Ngay_Sinh, Gioi_Tinh, Email, SDT)
            VALUES (${Ma_HS}, ${Ma_Lop}, ${Ten_HS}, ${finalNgaySinh}, ${Gioi_Tinh}, ${Email}, ${SDT})
        `;
        await transaction.commit();
        console.log("✅ Thêm thành công:", Ma_HS);
        res.json({ success: true, message: 'Thêm học sinh thành công!' });

    } catch (error) {
        if (transaction && transaction._aborted === false) await transaction.rollback();
        
        console.error("❌ Lỗi Thêm HS:", error);
        
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({ message: 'Trùng lặp: Mã Học Sinh hoặc Tên Đăng Nhập đã tồn tại!' });
        }
        if (error.number === 547) {
            return res.status(400).json({ message: 'Lỗi ràng buộc dữ liệu (Check Mã Lớp hoặc Quy tắc đặt mã).' });
        }

        res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
};

// ---  SỬA HỌC SINH ---
const suaHocSinh = async (req, res) => {
    const { id } = req.params; 
    const { Ten_TK, Ten_HS, Ngay_Sinh, Gioi_Tinh, Email, SDT } = req.body;
    if (SDT && SDT.length > 10) {
        return res.status(400).json({ message: 'SĐT tối đa 10 số.' });
    }

    let pool; 
    let transaction;
    try {
        pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const request1 = new sql.Request(transaction);

        await request1.query`
            UPDATE Hoc_Sinh
            SET Ten_HS = ${Ten_HS},
                Ngay_Sinh = ${Ngay_Sinh || null}, 
                Gioi_Tinh = ${Gioi_Tinh},
                Email = ${Email},
                SDT = ${SDT}
            WHERE Ma_HS = ${id}
        `;
        const request2 = new sql.Request(transaction);
        if (Ten_TK && Ten_TK.trim() !== "") {
            await request2.query`
                UPDATE Dang_Nhap
                SET Ten_TK = ${Ten_TK}
                WHERE Ma_TK = ${id}
            `;
        }

        await transaction.commit();
        res.json({ success: true, message: 'Cập nhật thành công!' });

    } catch (error) {
        if (transaction && transaction._aborted === false) await transaction.rollback();
        console.error("❌ Lỗi Sửa HS:", error); 
        res.status(500).json({ message: 'Lỗi cập nhật: ' + error.message });
    }
};
// ---  XÓA HỌC SINH (XÓA CẢ BẢNG ĐIỂM) ---
const xoaHocSinh = async (req, res) => {
    const { id } = req.params;

    let pool;
    let transaction;
    try {
        pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const request1 = new sql.Request(transaction);
        await request1.query`DELETE FROM Diem WHERE Ma_HS = ${id}`;
        const request2 = new sql.Request(transaction);
        await request2.query`DELETE FROM Hoc_Sinh WHERE Ma_HS = ${id}`;
        const request3 = new sql.Request(transaction);
        await request3.query`DELETE FROM Dang_Nhap WHERE Ma_TK = ${id}`;
        await transaction.commit();
        res.json({ success: true, message: 'Đã xóa thành công học sinh và toàn bộ bảng điểm liên quan!' });

    } catch (error) {
        if(transaction) await transaction.rollback();
        console.error("❌ Lỗi xóa:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi hệ thống khi xóa dữ liệu", 
            error: error.message 
        });
    }
};

// --- Cho học sỉnh rời lớp ---
const roiLop = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        await pool.request().query`UPDATE Hoc_Sinh SET Ma_Lop = NULL WHERE Ma_HS = ${id}`;
        res.json({ message: 'Đã đưa học sinh ra khỏi lớp!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

const themVaoLop = async (req, res) => {
    const { Ma_HS, Ma_Lop } = req.body;
    try {
        const pool = await connectDB();

        // 1. Kiểm tra lớp học có tồn tại không
        const checkLop = await pool.request()
            .input('Ma_Lop', Ma_Lop)
            .query`SELECT Ma_Lop FROM Lop WHERE Ma_Lop = @Ma_Lop`;
        
        if (checkLop.recordset.length === 0) {
            return res.status(400).json({ message: 'Mã lớp không tồn tại!' });
        }

        // 2. Kiểm tra học sinh đã có lớp chưa
        const checkHS = await pool.request()
            .input('Ma_HS', Ma_HS)
            .query`SELECT Ma_Lop FROM Hoc_Sinh WHERE Ma_HS = @Ma_HS`;

        if (checkHS.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy học sinh này!' });
        }

        // Kiểm tra nếu Ma_Lop không phải null hoặc không trống
        if (checkHS.recordset[0].Ma_Lop) {
            return res.status(400).json({ 
                message: 'Học sinh này đã có lớp rồi, không thể thêm vào lớp mới!' 
            });
        }

        // 3. Nếu chưa có lớp thì mới tiến hành cập nhật
        await pool.request()
            .input('Ma_Lop', Ma_Lop)
            .input('Ma_HS', Ma_HS)
            .query`UPDATE Hoc_Sinh SET Ma_Lop = @Ma_Lop WHERE Ma_HS = @Ma_HS`;

        res.json({ message: 'Đã thêm học sinh vào lớp thành công!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = {
    getDanhSachHocSinh,
    getBangDiemCaNhan,
    getThongtinHS,
    getHocSinhTheoLop,
    themHocSinh,
    suaHocSinh,
    xoaHocSinh,
    roiLop,
    themVaoLop
};