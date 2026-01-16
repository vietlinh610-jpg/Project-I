/**
 * Logic quản trị Admin
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. Kiểm tra trạng thái đăng nhập
    const userStr = localStorage.getItem('userCurrent');
    
    if (!userStr) { 
        window.location.href = 'login.html'; 
        return; 
    }
    
    // 2. Kiểm tra quyền truy cập (Phải là Admin)
    const user = JSON.parse(userStr);
    if (user.Loai_TK !== 'Admin') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'login.html';
    }
});

/**
 * Xóa dữ liệu phiên làm việc và quay về trang đăng nhập
 */
function dangXuat() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}