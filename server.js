const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const { connectDB } = require('./config/db'); 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

connectDB(); 

const hocSinhRoute = require('./routes/hocsinh.route');
const giaovienRoute = require('./routes/giaovien.route');
const monhocRoute  = require('./routes/monhoc.route');
const lopRoute = require('./routes/lop.route');
const diemRoute = require('./routes/diem.route');
const authRoute = require('./routes/auth.route');
const adminRoute = require('./routes/admin.route');
const phancongRoute = require('./routes/phancong.route');
const hockyRoute = require('./routes/hocky.route');

app.use('/api/hocsinh', hocSinhRoute); 
app.use('/api/giaovien',giaovienRoute);
app.use('/api/monhoc',monhocRoute);
app.use('/api/lop',lopRoute);
app.use('/api/diem',diemRoute);
app.use('/api/auth',authRoute);
app.use('/api/admin',adminRoute);
app.use('/api/phancong',phancongRoute);
app.use('/api/hocky',hockyRoute);

app.get('/', (req, res) => {
    res.redirect('/login.html'); 
});
 
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`---------------------------------------------`);
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`---------------------------------------------`);
});