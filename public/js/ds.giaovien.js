let myModal;
let isEdit = false;
window.onload = async () => {
    myModal = new bootstrap.Modal(document.getElementById('modalGV'));
    await Promise.all([loadMonHoc(), loadGV()]);
};

// ---  Tải danh sách môn học  ---
async function loadMonHoc() {
    try {
        const res = await fetch('/api/monhoc');
        const data = await res.json();
        const selectMh = document.getElementById('input-mamh');
        
        selectMh.innerHTML = `<option value="">-- Chọn Môn --</option>` + 
            data.map(m => `<option value="${m.Ma_MH}">${m.Ten_MH}</option>`).join('');
    } catch (e) { 
        console.error("Lỗi tải môn học:", e); 
    }
}

// ---  Tải danh sách giáo viên ---
async function loadGV() {
    try {
        const res = await fetch('/api/giaovien');
        const data = await res.json();
        
        const html = data.map(gv => `
            <tr>
                <td>${gv.Ma_GV}</td>
                <td class="text-primary fw-bold">${gv.Ten_GV}</td>
                <td><span class="badge bg-info text-dark">${gv.Ten_MH || gv.Ma_MH || ''}</span></td>
                <td>${formatDate(gv.Ngay_Sinh)}</td>
                <td>${gv.Gioi_Tinh || ''}</td>
                <td>${gv.Email || ''}</td>
                <td>${gv.SDT || ''}</td>
                <td>${gv.Chuc_Vu || ''}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="openEdit('${gv.Ma_GV}', '${gv.Ten_GV}', '${gv.Ma_MH}', '${gv.Ngay_Sinh}', '${gv.Gioi_Tinh}', '${gv.Email}', '${gv.SDT}', '${gv.Chuc_Vu}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="xoa('${gv.Ma_GV}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('bang-gv').innerHTML = html;
    } catch (e) { 
        alert("Lỗi tải dữ liệu giáo viên"); 
    }
}

function formatDate(d) {
    if(!d || d === 'null') return "";
    return new Date(d).toLocaleDateString('vi-VN');
}

function openModal() {
    isEdit = false;
    document.getElementById('modalTitle').innerText = "Thêm Giáo Viên Mới";
    document.getElementById('input-ma').disabled = false;
    
    const fields = ['input-ma', 'input-ten', 'input-mamh', 'input-ngaysinh', 'input-email', 'input-sdt'];
    fields.forEach(id => document.getElementById(id).value = "");
    
    document.getElementById('input-gioitinh').value = "Nam";
    document.getElementById('input-chucvu').value = "Giáo viên";
    myModal.show();
}

function openEdit(ma, ten, mamh, ngaysinh, gioitinh, email, sdt, chucvu) {
    isEdit = true;
    document.getElementById('modalTitle').innerText = "Sửa Thông Tin Giáo Viên";
    
    const inputMa = document.getElementById('input-ma');
    inputMa.value = ma;
    inputMa.disabled = true; 
    
    document.getElementById('input-ten').value = ten;
    document.getElementById('input-mamh').value = mamh;
    
    document.getElementById('input-ngaysinh').value = 
        ngaysinh && ngaysinh !== 'null' ? new Date(ngaysinh).toISOString().split('T')[0] : "";
    
    document.getElementById('input-gioitinh').value = gioitinh !== 'null' ? gioitinh : "Nam";
    document.getElementById('input-chucvu').value = chucvu !== 'null' ? chucvu : "Giáo viên";
    document.getElementById('input-email').value = email !== 'null' ? email : "";
    document.getElementById('input-sdt').value = sdt !== 'null' ? sdt : "";
    
    myModal.show();
}

// --- Lưu Dữ Liệu ---
async function luuGV() {
    const ma = document.getElementById('input-ma').value.trim();
    const payload = {
        Ma_GV: ma, 
        Ten_TK: ma, 
        Ten_GV: document.getElementById('input-ten').value.trim(),
        Ma_MH: document.getElementById('input-mamh').value,
        Ngay_Sinh: document.getElementById('input-ngaysinh').value || null,
        Gioi_Tinh: document.getElementById('input-gioitinh').value,
        Email: document.getElementById('input-email').value.trim(),
        SDT: document.getElementById('input-sdt').value.trim(),
        Chuc_Vu: document.getElementById('input-chucvu').value.trim()
    };

    if(!payload.Ma_GV || !payload.Ten_GV || !payload.Ma_MH || !payload.SDT) {
        return alert("Vui lòng nhập đủ các trường có dấu *");
    }

    try {
        const url = isEdit ? `/api/giaovien/${ma}` : '/api/giaovien';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if(res.ok) { 
            alert("Thành công!"); 
            myModal.hide(); 
            loadGV(); 
        } else { 
            const err = await res.json(); 
            alert("Lỗi: " + (err.message || "Không thể lưu")); 
        }
    } catch (e) { 
        alert("Lỗi kết nối đến máy chủ"); 
    }
}

// ---  Xóa Giáo Viên ---
async function xoa(id) {
    if(confirm(`Bạn có chắc muốn xóa giáo viên [${id}]?`)) {
        try {
            const res = await fetch(`/api/giaovien/${id}`, { method: 'DELETE' });
            if(res.ok) {
                alert("Đã xóa!");
                loadGV();
            } else {
                alert("Không thể xóa (có thể dữ liệu đang được sử dụng ở bảng khác)");
            }
        } catch (e) {
            alert("Lỗi kết nối");
        }
    }
}

// ---  Đăng xuất ---
function dangXuat() { 
    if(confirm("Xác nhận đăng xuất?")) {
        localStorage.clear(); 
        location.href='login.html'; 
    }
}