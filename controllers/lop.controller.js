const Lop = require('../models/lop.model');
const { sql, connectDB } = require('../config/db');

//  Lấy Tên Lớp và Tên Môn 
const getTenLop = async (req, res) => {
    const { maLop, maMH } = req.query;
    try {
        const pool = await connectDB(); 

        const lopResult = await pool.request().query`
            SELECT Ten_Lop FROM Lop WHERE Ma_Lop=${maLop}
        `;
        
        const monResult = await pool.request().query`
            SELECT Ten_MH FROM Mon_Hoc WHERE Ma_MH=${maMH}
        `;

        res.json({
            Ten_Lop: lopResult.recordset[0]?.Ten_Lop ?? maLop,
            Ten_MH: monResult.recordset[0]?.Ten_MH ?? maMH
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const getLop = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query`
            SELECT l.*, g.Ten_GV as Ten_GVCN 
            FROM Lop l LEFT JOIN Giao_Vien g ON l.Ma_GVCN = g.Ma_GV
        `;
        res.json(result.recordset);
    } catch (e) { res.status(500).json(e); }
};

//  Tạo lớp mới
const themLop = async (req, res) => {
    const { Ma_Lop, Ten_Lop, Ma_GVCN } = req.body;
    try {
        const pool = await connectDB();
        const checkGV = await pool.request().query`SELECT * FROM Giao_Vien WHERE Ma_GV = ${Ma_GVCN}`;
        if (checkGV.recordset.length === 0) {
            return res.status(400).json({ message: 'Mã Giáo Viên không tồn tại! Hãy kiểm tra lại.' });
        }

        await pool.request().query`
            INSERT INTO Lop (Ma_Lop, Ten_Lop, Ma_GVCN, Nam_Hoc) 
            VALUES (${Ma_Lop}, ${Ten_Lop}, ${Ma_GVCN}, '2024-2025')
        `;
        res.json({ message: 'Tạo lớp thành công!' });
    } catch (e) { 
        console.error(e);
        if (e.number === 2627) {
            return res.status(409).json({ message: 'Mã lớp này đã tồn tại!' });
        }
        res.status(500).json({ message: 'Lỗi: ' + e.message }); 
    }
};

//  Sửa lớp
const suaLop = async (req, res) => {
    const { id } = req.params; 
    const { Ten_Lop, Ma_GVCN } = req.body; 
    try {
        const pool = await connectDB();
        const checkGV = await pool.request().query`SELECT * FROM Giao_Vien WHERE Ma_GV = ${Ma_GVCN}`;
        if (checkGV.recordset.length === 0) {
            return res.status(400).json({ message: 'Mã Giáo Viên không tồn tại!' });
        }

        await pool.request().query`
            UPDATE Lop 
            SET Ten_Lop = ${Ten_Lop}, Ma_GVCN = ${Ma_GVCN}
            WHERE Ma_Lop = ${id}
        `;
        res.json({ message: 'Cập nhật lớp thành công!' });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ message: 'Lỗi cập nhật: ' + e.message }); 
    }
};

//  Xóa lớp 
const xoaLop = async (req, res) => {
    const { id } = req.params;
    
    let pool;
    try {
        pool = await connectDB();
    } catch (err) {
        return res.status(500).json({ message: "Lỗi kết nối DB" });
    }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const request1 = new sql.Request(transaction);
        await request1.query`DELETE FROM Phan_Cong WHERE Ma_Lop = ${id}`;
        const request2 = new sql.Request(transaction);
        await request2.query`UPDATE Hoc_Sinh SET Ma_Lop = NULL WHERE Ma_Lop = ${id}`;
        const request3 = new sql.Request(transaction);
        await request3.query`DELETE FROM Lop WHERE Ma_Lop = ${id}`;
        await transaction.commit();
        res.json({ message: 'Đã xóa lớp và hủy phân công thành công!' });

    } catch (e) { 
        if(transaction._aborted === false) await transaction.rollback();
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi xóa lớp: ' + e.message }); 
    }
};

module.exports = {
    getTenLop,
    getLop,
    themLop,
    suaLop,
    xoaLop
};