const Diem = require('../models/diem.model');
const { sql, connectDB } = require("../config/db");

// 1. Lấy toàn bộ điểm
const getDiem = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query`SELECT * FROM Diem`;
        res.json(result.recordset);
    } catch (error) {
        console.error("Lỗi lấy điểm:", error);
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// 2. Lấy điểm theo lớp + môn + học kỳ
const getDiemLop = async (req, res) => {
    // Cho phép nhận maHK từ query, nếu không có thì mặc định HK1
    const { maLop, maMH, maHK } = req.query;
    const hocKy = maHK || "HK1"; 

    try {
        const pool = await connectDB();
        const result = await pool.request().query`
            SELECT 
                hs.Ma_HS, hs.Ten_HS,
                d.Diem_Mieng, d.Diem_15P, d.Diem_45P,
                d.Diem_GK, d.Diem_CK, d.Diem_TK
            FROM Hoc_Sinh hs
            LEFT JOIN Diem d 
                ON hs.Ma_HS = d.Ma_HS 
                AND d.Ma_MH = ${maMH}
                AND d.Ma_HK = ${hocKy}
            WHERE hs.Ma_Lop = ${maLop}
        `;
        res.json(result.recordset);
    } catch (error) {
        console.log("Lỗi lấy điểm lớp:", error);
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// 3. Lưu điểm (Thêm/Sửa)
const luuDiem = async (req, res) => {
    const { Ma_HS, Ma_MH, Ma_HK, Diem_Mieng, Diem_15P, Diem_45P, Diem_GK, Diem_CK } = req.body;

    // Xử lý dữ liệu số (nếu rỗng thì tính là 0)
    const m = Diem_Mieng === "" || Diem_Mieng === null ? 0 : parseFloat(Diem_Mieng);
    const p15 = Diem_15P === "" || Diem_15P === null ? 0 : parseFloat(Diem_15P);
    const p45 = Diem_45P === "" || Diem_45P === null ? 0 : parseFloat(Diem_45P);
    const gk = Diem_GK === "" || Diem_GK === null ? 0 : parseFloat(Diem_GK);
    const ck = Diem_CK === "" || Diem_CK === null ? 0 : parseFloat(Diem_CK);

    try {
        const pool = await connectDB();
        
        // Kiểm tra xem đã có điểm của HS này môn này kỳ này chưa
        const check = await pool.request().query`
            SELECT * FROM Diem
            WHERE Ma_HS=${Ma_HS} AND Ma_MH=${Ma_MH} AND Ma_HK=${Ma_HK}
        `;

        if (check.recordset.length > 0) {
            // NẾU CÓ RỒI -> UPDATE
            // Lưu ý: SQL Server nếu cài đặt Computed Column cho Diem_TK thì nó tự nhảy, không cần update
            await pool.request().query`
                UPDATE Diem SET 
                    Diem_Mieng=${m}, 
                    Diem_15P=${p15}, 
                    Diem_45P=${p45}, 
                    Diem_GK=${gk}, 
                    Diem_CK=${ck}
                WHERE Ma_HS=${Ma_HS} AND Ma_MH=${Ma_MH} AND Ma_HK=${Ma_HK}
            `;
        } else {
            // NẾU CHƯA CÓ -> INSERT
            await pool.request().query`
                INSERT INTO Diem 
                    (Ma_HS, Ma_MH, Ma_HK, Diem_Mieng, Diem_15P, Diem_45P, Diem_GK, Diem_CK)
                VALUES 
                    (${Ma_HS}, ${Ma_MH}, ${Ma_HK}, ${m}, ${p15}, ${p45}, ${gk}, ${ck})
            `;
        }

        res.json({ message: "Lưu thành công!" });
    } catch (error) {
        console.error("Lỗi lưu điểm:", error);
        res.status(500).json({ message: "Lỗi server", error });
    }
};

module.exports = {
    getDiem,
    getDiemLop,
    luuDiem
};