const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'Linh610#', // Mật khẩu của bạn
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
        // SỬA Ở ĐÂY: Gán kết nối vào biến pool
        let pool = await sql.connect(config);
        console.log("✅ Đã kết nối SQL Server thành công!");
        
        // SỬA Ở ĐÂY: Phải return pool (kết nối), KHÔNG return sql (thư viện)
        return pool; 
    } catch (error) {
        console.log("❌ Lỗi kết nối SQL:", error.message);
        // Nên throw lỗi để Controller biết là kết nối thất bại
        throw error; 
    }
};

module.exports = { sql, connectDB };