document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Xử lý nút bật/tắt mắt mật khẩu
    const toggleIcon = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (toggleIcon) {
        toggleIcon.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('bxs-show');
            this.classList.toggle('bxs-hide');
        });
    }

    // 2. Xử lý Đăng nhập
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        Ten_TK: username,  
                        Mat_Khau: password 
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert('✅ ' + data.message);
                    const roleRaw = data.user.Loai_TK;
                    const role = roleRaw ? roleRaw.trim() : '';

                    console.log(`🔍 Role gốc: '${roleRaw}' -> Role chuẩn: '${role}'`);

                    localStorage.setItem('userCurrent', JSON.stringify(data.user));
                    console.log("--- BẮT ĐẦU CHUYỂN TRANG ---");
                    console.log("Role nhận được là:", role);


                    if (role === 'Admin') {
                        console.log("Chuyển sang Admin...");
                        window.location.href = 'admin.html'; 
                    }
                    else if (role === 'GiaoVien') {
                        console.log("Chuyển sang Giáo Viên...");
                        window.location.href = 'giaovien.html';  
                    }
                    else if (role === 'HocSinh') {
                        console.log("Chuyển sang Học Sinh...");
                        window.location.href = 'hs_bangdiem.html';
                    } 
                    else {
                        console.error("Quyền không hợp lệ:", role);
                        alert('Lỗi: Tài khoản không xác định quyền!');
                    }

                } else {
                    alert('❌ ' + data.message); 
                }

            } catch (error) {
                console.error('Lỗi:', error);
                alert('Không thể kết nối đến Server!');
            }
        });
    }
});