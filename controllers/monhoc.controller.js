const Mon_Hoc = require('../models/monhoc.model');
const {sql,connectDB} = require('../config/db');

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
const xoaMon =  async(req,res) =>
{
    const { id } = req.params;
    try
    {
        await connectDB();
        const result = await sql.query`
        DELETE FROM Mon_Hoc
        WHERE Ma_MH = ${id}
        `
        res.json(result.recordset);
    }catch(error)
    {
        res.status(500).json(error);
    }
}

module.exports = {
    getMon,
    themMon,
    xoaMon
};