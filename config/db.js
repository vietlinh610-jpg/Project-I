const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'Linh610#', 
    server: 'localhost',
    database: 'QuanLyHocSinh',
    options: {
        encrypt: false, 
        trustServerCertificate: true
    },
    port: 1433
};

const connectDB = async () => {
    try {
        let pool = await sql.connect(config);
        console.log("✅ Đã kết nối SQL Server thành công!");
        return pool; 
    } catch (error) {
        console.log("❌ Lỗi kết nối SQL:", error.message);
        throw error; 
    }
};

module.exports = { sql, connectDB };