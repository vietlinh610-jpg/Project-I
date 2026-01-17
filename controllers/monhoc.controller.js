const Mon_Hoc = require('../models/monhoc.model');
const {sql,connectDB} = require('../config/db');
//--- Lấy danh sách môn học---
const getMon =  async(req,res) =>
{
    try
    {
        await connectDB();
        const result = await sql.query`
        SELECT *
        FROM Mon_Hoc
        `
        res.json(result.recordset);
    }catch(error)
    {
        res.status(500).json(error);
    }
};

// --- Thêm môn học mới---
const themMon =  async(req,res) =>
{
    const {Ma_MH,Ten_MH} = req.body;
    try
    {
        await connectDB();
        const result = await sql.query`
        INSERT INTO Mon_Hoc VALUES(${Ma_MH},${Ten_MH})
        `
        res.json(result.recordset);
    }catch(error)
    {
        res.status(500).json(error);
    }
};

//--- Xóa Môn---
const xoaMon = async (req, res) => {
    const { id } = req.params; 
    try {
        await connectDB();
        const checkGV = await sql.query`
            SELECT TOP 1 Ma_GV FROM Giao_Vien WHERE Ma_MH = ${id}
        `;

        if (checkGV.recordset.length > 0) {
            return res.status(400).json({
                message: "Không thể xóa môn học! Đang có giáo viên dạy môn này. Vui lòng xóa tài khoản giáo viên trước."
            });
        }

        
        await sql.query`
            DELETE FROM Diem
            WHERE Ma_MH = ${id}
        `;
        const result = await sql.query`
            DELETE FROM Mon_Hoc 
            WHERE Ma_MH = ${id}
        `;

        res.json({ message: "Đã xóa bảng điểm và môn học thành công!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};
//--- Sửa môn---
const suaMon = async (req, res) => {
    const { id } = req.params; 
    const { Ten_MH } = req.body; 
    try {
        await connectDB();
        const result = await sql.query`
            UPDATE Mon_Hoc 
            SET Ten_MH = ${Ten_MH} 
            WHERE Ma_MH = ${id}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Không tìm thấy môn học để cập nhật" });
        }
        
        res.json({ message: "Cập nhật thành công", result });
    } catch (error) {
        res.status(500).json(error);
    }
};


module.exports = {
    getMon,
    themMon,
    xoaMon,
    suaMon
};