const Diem = require('../models/diem.model');
const { sql, connectDB } = require("../config/db");


//  --- Lấy điểm theo lớp + môn + học kỳ ---
const getDiemLop = async (req, res) => {
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

// --- Lưu điểm ---
const luuDiem = async (req, res) => {
    const { Ma_HS, Ma_MH, Ma_HK, Diem_Mieng, Diem_15P, Diem_45P, Diem_GK, Diem_CK } = req.body;

    // Chuyển đổi sang số, nếu rỗng thì để null hoặc 0 tùy logic của bạn (ở đây giữ nguyên logic của bạn là 0)
    const m = (Diem_Mieng === "" || Diem_Mieng === null) ? 0 : parseFloat(Diem_Mieng);
    const p15 = (Diem_15P === "" || Diem_15P === null) ? 0 : parseFloat(Diem_15P);
    const p45 = (Diem_45P === "" || Diem_45P === null) ? 0 : parseFloat(Diem_45P);
    const gk = (Diem_GK === "" || Diem_GK === null) ? 0 : parseFloat(Diem_GK);
    const ck = (Diem_CK === "" || Diem_CK === null) ? 0 : parseFloat(Diem_CK);

    // --- BƯỚC KIỂM TRA ĐIỂM HỢP LỆ ---
    const danhSachDiem = [m, p15, p45, gk, ck];
    
    // Kiểm tra xem có bất kỳ cột điểm nào < 0 hoặc > 10 không
    const coDiemKhongHopLe = danhSachDiem.some(diem => diem < 0 || diem > 10);

    if (coDiemKhongHopLe) {
        return res.status(400).json({ 
            message: "Điểm không hợp lệ! Điểm phải nằm trong khoảng từ 0 đến 10." 
        });
    }

    try {
        const pool = await connectDB();
        
        const check = await pool.request().query`
            SELECT * FROM Diem
            WHERE Ma_HS=${Ma_HS} AND Ma_MH=${Ma_MH} AND Ma_HK=${Ma_HK}
        `;

        if (check.recordset.length > 0) {
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
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};      

module.exports = {
    getDiemLop,
    luuDiem
};