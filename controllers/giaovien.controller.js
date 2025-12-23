const Giao_Vien = require('../models/giaovien.model');
const { sql, connectDB } = require('../config/db');

// --- 1. LẤY DANH SÁCH GIÁO VIÊN ---
const getDanhSachGiaoVien = async (req, res) => {
    try {
        const pool = await connectDB();
        // Join thêm Mon_Hoc để hiện tên môn phụ trách
        const result = await pool.request().query`
            SELECT GV.*, MH.Ten_MH, DN.Ten_TK
            FROM Giao_Vien GV
            LEFT JOIN Mon_Hoc MH ON GV.Ma_MH = MH.Ma_MH
            LEFT JOIN Dang_Nhap DN ON GV.Ma_GV = DN.Ma_TK
            ORDER BY GV.Ma_GV ASC
        `;
        res.json(result.recordset);
    } catch (error) {
        console.error('Lỗi lấy danh sách giáo viên', error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// --- 2. LẤY LỚP PHỤ TRÁCH (CHỦ NHIỆM & GIẢNG DẠY) ---
const getLopPhuTrach = async (req, res) => {
    const { maGV } = req.params; 
    try {
        const pool = await connectDB();

        // 1. Lấy lớp Chủ Nhiệm
        const chuNhiem = await pool.request().query`
            SELECT L.Ma_Lop,
                   L.Ten_Lop,
                   GV.Ten_GV
             FROM Lop L
             JOIN Giao_Vien GV ON L.Ma_GVCN = GV.Ma_GV
             WHERE Ma_GVCN = ${maGV}
        `;

        // 2. Lấy danh sách Lớp Giảng Dạy
        const giangDay = await pool.request().query`
            SELECT DISTINCT pc.Ma_Lop, l.Ten_Lop, mh.Ma_MH, mh.Ten_MH
            FROM Phan_Cong pc
            JOIN Lop l ON pc.Ma_Lop = l.Ma_Lop
            JOIN Mon_Hoc mh ON pc.Ma_MH = mh.Ma_MH
            WHERE pc.Ma_GV = ${maGV}
        `;

        res.json({
            lopChuNhiem: chuNhiem.recordset[0] || null,
            lopGiangDay: giangDay.recordset
        });

    } catch (error) {
        console.error("Lỗi lấy lớp phụ trách:", error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// --- 3. THÊM GIÁO VIÊN (ĐÃ FIX LỖI UNICODE & TRÙNG PARAM) ---
const themGiaoVien = async (req, res) => {
    const { Ma_GV, Ten_TK, Ten_GV, SDT, Email, Ma_MH, Ngay_Sinh, Gioi_Tinh, Chuc_Vu } = req.body;

    // Validate các trường bắt buộc
    if (!Ma_GV || !Ten_TK || !Ten_GV || !Ma_MH) {
        return res.status(400).json({ message: "Thiếu thông tin: Mã GV, Tên TK, Tên GV, Môn Học!" });
    }

    if (!Ma_GV.toUpperCase().startsWith("GV")) {
        return res.status(400).json({ message: "Mã Giáo Viên phải bắt đầu bằng 'GV'." });
    }

    let pool;
    try { pool = await connectDB(); } catch (err) { return res.status(500).json({ message: "Lỗi kết nối DB" }); }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // B1: Tạo Tài khoản (Bảng Dang_Nhap)
        const req1 = new sql.Request(transaction);
        const matKhau = SDT || '123456';
        await req1.query`
            INSERT INTO Dang_Nhap (Ma_TK, Ten_TK, Mat_Khau, Loai_TK)
            VALUES (${Ma_GV}, ${Ten_TK}, ${matKhau}, 'GiaoVien')
        `;

        // B2: Tạo Hồ sơ (Bảng Giao_Vien)
        const req2 = new sql.Request(transaction);
        
        // Xử lý giá trị mặc định và Unicode (Thêm N trước chuỗi tiếng Việt)
        const finalChucVu = (Chuc_Vu && Chuc_Vu.trim() !== "") ? Chuc_Vu : 'Giáo viên';
        const finalNgaySinh = Ngay_Sinh ? Ngay_Sinh : null;
        const finalGioiTinh = (Gioi_Tinh && Gioi_Tinh.trim() !== "") ? Gioi_Tinh : 'Nam';

        await req2.query`
            INSERT INTO Giao_Vien (Ma_GV, Ma_MH, Ten_GV, Ngay_Sinh, Gioi_Tinh, Email, SDT, Chuc_Vu)
            VALUES (${Ma_GV}, ${Ma_MH}, ${Ten_GV}, ${finalNgaySinh}, ${finalGioiTinh}, ${Email}, ${SDT}, ${finalChucVu})
        `;

        await transaction.commit();
        res.json({ success: true, message: "Thêm giáo viên thành công!" });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Lỗi thêm GV:", error);
        
        if (error.number === 2627) return res.status(409).json({ message: "Trùng Mã GV hoặc Tên Tài Khoản!" });
        if (error.number === 547) return res.status(400).json({ message: "Mã Môn Học không tồn tại!" });

        res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
    }
};

// --- 4. SỬA GIÁO VIÊN ---
const suaGiaoVien = async (req, res) => {
    const { id } = req.params;
    const { Ten_TK, Ten_GV, SDT, Email, Ma_MH, Ngay_Sinh, Gioi_Tinh, Chuc_Vu } = req.body;

    let pool;
    try { pool = await connectDB(); } catch (err) { return res.status(500).json({ message: "Lỗi DB" }); }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // B1: Cập nhật bảng Giáo Viên
        const req1 = new sql.Request(transaction);
        await req1.query`
            UPDATE Giao_Vien 
            SET Ten_GV = ${Ten_GV}, 
                SDT = ${SDT}, 
                Email = ${Email},
                Ma_MH = ${Ma_MH},
                Ngay_Sinh = ${Ngay_Sinh || null},
                Gioi_Tinh = ${Gioi_Tinh || 'Nam'},
                Chuc_Vu = ${Chuc_Vu || 'Giáo viên'}
            WHERE Ma_GV = ${id}
        `;

        // B2: Cập nhật Tên TK (nếu có)
        if (Ten_TK && Ten_TK.trim() !== "") {
            const req2 = new sql.Request(transaction);
            await req2.query`
                UPDATE Dang_Nhap SET Ten_TK = ${Ten_TK} WHERE Ma_TK = ${id}
            `;
        }

        await transaction.commit();
        res.json({ success: true, message: "Cập nhật thành công!" });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Lỗi sửa GV:", error);
        res.status(500).json({ message: "Lỗi cập nhật: " + error.message });
    }
};

// --- 5. XÓA GIÁO VIÊN ---
const xoaGiaoVien = async (req, res) => {
    const { id } = req.params;

    let pool;
    try { pool = await connectDB(); } catch (err) { return res.status(500).json({ message: "Lỗi DB" }); }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // B1: Gỡ giáo viên khỏi vị trí Chủ nhiệm
        const req1 = new sql.Request(transaction);
        await req1.query`UPDATE Lop SET Ma_GVCN = NULL WHERE Ma_GVCN = ${id}`;

        // B2: Xóa dữ liệu Phân công giảng dạy
        const req2 = new sql.Request(transaction);
        await req2.query`DELETE FROM Phan_Cong WHERE Ma_GV = ${id}`;

        // B3: Xóa Hồ sơ Giáo viên
        const req3 = new sql.Request(transaction);
        await req3.query`DELETE FROM Giao_Vien WHERE Ma_GV = ${id}`;

        // B4: Xóa Tài khoản đăng nhập
        const req4 = new sql.Request(transaction);
        await req4.query`DELETE FROM Dang_Nhap WHERE Ma_TK = ${id}`;

        await transaction.commit();
        res.json({ success: true, message: "Đã xóa giáo viên thành công!" });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Lỗi xóa GV:", error);
        res.status(500).json({ message: "Lỗi xóa: " + error.message });
    }
};

module.exports = {
    getDanhSachGiaoVien,
    getLopPhuTrach,
    themGiaoVien,
    suaGiaoVien,
    xoaGiaoVien
};