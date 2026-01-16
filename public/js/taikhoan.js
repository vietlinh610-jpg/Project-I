function xuLyQuayLai() {
    const mainHidden = document.getElementById('view-main').classList.contains('hidden');
    if (!mainHidden) {
        history.back();
    } else {
        veManHinhChinh(); 
    }
}

function hideAll() {
    const views = ['view-main', 'view-gv', 'view-chonlop', 'view-hs'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
}

function veManHinhChinh() {
    hideAll();
    document.getElementById('view-main').classList.remove('hidden');
}

//---Hiển thị giáo viên---
async function hienThiGV() {
    hideAll();
    document.getElementById('view-gv').classList.remove('hidden');
    
    try {
        const res = await fetch('/api/auth/giaovien');
        if (!res.ok) throw new Error("Lỗi tải dữ liệu");
        const data = await res.json();

        const tbody = document.getElementById('bang-gv');
        tbody.innerHTML = data.map(u => `
            <tr>
                <td class="fw-bold text-secondary">${u.Ma_GV}</td>
                <td class="fw-bold">${u.Ten_GV}</td>
                <td class="text-primary">${u.Ten_TK}</td>
                <td>
                    <input type="text" value="${u.Mat_Khau}" id="pass-${u.Ma_GV}" 
                           class="form-control form-control-sm text-center mx-auto" 
                           style="max-width: 150px;" 
                           placeholder="Nhập pass mới">
                </td>
                <td>
                    <button class="btn btn-success btn-sm shadow-sm" onclick="luuMatKhau('${u.Ma_GV}', 'GV')">
                        <i class="fas fa-save me-1"></i> Lưu
                    </button>
                </td>
            </tr>`).join('');
    } catch (e) {
        console.error(e);
        alert("Không thể tải danh sách giáo viên!");
    }
}

//--- Hiển thị danh sách lớp---
async function hienThiDSClass() {
    hideAll();
    document.getElementById('view-chonlop').classList.remove('hidden');
    
    try {
        const res = await fetch('/api/lop');
        const data = await res.json();
        const listLop = document.getElementById('list-lop');
        
        listLop.innerHTML = data.map(l => `
            <div class="col-md-3 col-sm-6">
                <div class="card p-3 text-center shadow-sm border-0 h-100 option-card bg-white" 
                     onclick="hienThiHS('${l.Ma_Lop}')">
                    <h5 class="text-primary fw-bold mb-1">${l.Ten_Lop}</h5>
                    <small class="text-muted"><i class="fas fa-user-tie me-1"></i> ${l.Ten_GVCN || 'Chưa có'}</small>
                </div>
            </div>`).join('');
    } catch (e) {
        alert("Lỗi tải danh sách lớp!");
    }
}

//--- Hiển thị học sinh---
async function hienThiHS(maLop) {
    hideAll();
    document.getElementById('view-hs').classList.remove('hidden');
    document.getElementById('title-lop').innerHTML = `<i class="fas fa-users me-2"></i> Tài Khoản Lớp ${maLop}`;
    
    try {
        const res = await fetch(`/api/auth/hocsinh/${maLop}`);
        const data = await res.json();
        const tbody = document.getElementById('bang-hs');
        
        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted fst-italic">Lớp này chưa có học sinh nào.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(u => `
            <tr>
                <td class="fw-bold text-secondary">${u.Ma_HS}</td>
                <td class="fw-bold">${u.Ten_HS}</td>
                <td class="text-info">${u.Ten_TK}</td>
                <td>
                    <input type="text" value="${u.Mat_Khau}" id="pass-${u.Ma_HS}" 
                           class="form-control form-control-sm text-center mx-auto" 
                           style="max-width: 150px;"
                           placeholder="Nhập pass mới">
                </td>
                <td>
                    <button class="btn btn-primary btn-sm shadow-sm" onclick="luuMatKhau('${u.Ma_HS}', 'HS')">
                        <i class="fas fa-save me-1"></i> Lưu
                    </button>
                </td>
            </tr>`).join('');
    } catch (e) {
        alert("Lỗi tải danh sách học sinh!");
    }
}

//--- Cập nhật mật khẩu ---
async function luuMatKhau(id, role) {
    const passInput = document.getElementById(`pass-${id}`);
    const passMoi = passInput.value.trim();
    
    if(!passMoi) return alert("⚠️ Mật khẩu không được để trống!");
    if(!confirm(`Xác nhận đổi mật khẩu cho tài khoản ${id}?`)) return;

    try {
        const res = await fetch('/api/auth/update', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ maTK: id, matKhauMoi: passMoi, role: role })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            alert("✅ Cập nhật mật khẩu thành công!");
        } else {
            alert("❌ Lỗi: " + (data.message || "Không thể cập nhật"));
        }
    } catch (err) { 
        alert("❌ Lỗi kết nối đến máy chủ!"); 
    }
}

//--- Đăng xuất ---
function dangXuat() {
    if(confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}