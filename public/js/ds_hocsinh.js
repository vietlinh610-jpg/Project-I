// --- KHỞI TẠO BIẾN TOÀN CỤC ---
let myModal;
let currentLopID = null;   
let currentLopName = null; 
let isEdit = false;         

document.addEventListener('DOMContentLoaded', function() {
    myModal = new bootstrap.Modal(document.getElementById('modalHS'));
    loadLop();
});

// ---  TẢI DANH SÁCH LỚP ---
async function loadLop() {
    try {
        const res = await fetch('/api/lop');
        if(!res.ok) throw new Error("Không tải được danh sách lớp");
        const data = await res.json();
        
        const gridLop = document.getElementById('grid-lop');
        gridLop.innerHTML = data.map(l => `
            <div class="col-md-3 col-sm-6">
                <div class="card class-card shadow-sm border-0 bg-white text-primary" 
                     onclick="showHocSinh('${l.Ma_Lop}', '${l.Ten_Lop}')">
                    <i class="fas fa-users fa-3x mb-3 text-secondary"></i>
                    <h4 class="fw-bold m-0">${l.Ten_Lop}</h4>
                    <small class="text-muted mt-2 fw-bold">GVCN: ${l.Ten_GVCN || 'Chưa có'}</small>
                </div>
            </div>
        `).join('');
    } catch (e) { 
        console.error(e);
        document.getElementById('grid-lop').innerHTML = `<p class="text-danger text-center">Lỗi kết nối: ${e.message}</p>`;
    }
}

// ---  CHUYỂN MÀN HÌNH ---
async function showHocSinh(maLop, tenLop) {
    currentLopID = maLop;
    currentLopName = tenLop;
    document.getElementById('view-lop').classList.add('hidden');
    document.getElementById('view-hs').classList.remove('hidden');
    document.getElementById('title-lop').innerHTML = `<i class="fas fa-chalkboard me-2"></i> Danh Sách Lớp ${tenLop}`;
    await loadTableHS();
}

function xuLyQuayLai() {
    if (!document.getElementById('view-hs').classList.contains('hidden')) {
        document.getElementById('view-hs').classList.add('hidden');
        document.getElementById('view-lop').classList.remove('hidden');
        currentLopID = null;
    } else {
        history.back();
    }
}

// ---  TẢI BẢNG HỌC SINH ---
async function loadTableHS() {
    const tableBody = document.getElementById('bang-hs');
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div> Đang tải...</td></tr>`;

    try {
        const res = await fetch(`/api/hocsinh/lop/${currentLopID}`); 
        const data = await res.json();
        
        if(data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-muted fst-italic py-4 text-center">Lớp này chưa có học sinh nào.</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(hs => `
            <tr>
                <td class="fw-bold text-secondary">${hs.Ma_HS}</td>
                <td class="fw-bold text-start ps-4">${hs.Ten_HS}</td>
                <td><span class="badge bg-info text-dark">${currentLopName}</span></td>
                <td>${formatDateVN(hs.Ngay_Sinh)}</td>
                <td>${hs.Gioi_Tinh}</td>
                <td class="text-start small">${hs.Email || '-'}</td>
                <td>${hs.SDT || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="openEdit('${hs.Ma_HS}', '${hs.Ten_TK || ''}', '${hs.Ten_HS}', '${hs.Ngay_Sinh}', '${hs.Gioi_Tinh}', '${hs.Email}', '${hs.SDT}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="xoaHS('${hs.Ma_HS}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) { 
        console.error(e); 
        tableBody.innerHTML = `<tr><td colspan="8" class="text-danger text-center">Lỗi tải dữ liệu!</td></tr>`;
    }
}

// --- HELPER FUNCTIONS ---
function formatDateVN(dateString) {
    if(!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN');
}

function formatDateForInput(dateString) {
    if(!dateString) return "";
    const d = new Date(dateString);
    const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
}

// ---  MODAL THÊM ---
function openModal() {
    isEdit = false;
    document.getElementById('modalTitle').innerText = "Thêm Học Sinh Mới";
    document.getElementById('hs-tenlop-display').value = currentLopName;


    document.getElementById('hs-ma').value = "";
    document.getElementById('hs-ma').disabled = false;
    document.getElementById('hs-tentk').value = ""; 
    document.getElementById('hs-tentk').disabled = false;
    document.getElementById('hs-ten').value = "";
    document.getElementById('hs-ngaysinh').value = "";
    document.getElementById('hs-gioitinh').value = "Nam";
    document.getElementById('hs-email').value = "";
    document.getElementById('hs-sdt').value = "";
    
    myModal.show();
}

// ---  MODAL SỬA ---
function openEdit(ma, tenTK, ten, ngaysinh, gioitinh, email, sdt) {
    isEdit = true;
    document.getElementById('modalTitle').innerText = "Sửa Thông Tin";
    document.getElementById('hs-tenlop-display').value = currentLopName;

    document.getElementById('hs-ma').value = ma;
    document.getElementById('hs-ma').disabled = true;

    document.getElementById('hs-tentk').value = tenTK;
    if (tenTK && tenTK !== 'null' && tenTK.trim() !== "") {
        document.getElementById('hs-tentk').disabled = true;
    } else {
        document.getElementById('hs-tentk').disabled = false;
    }

    document.getElementById('hs-ten').value = ten;
    document.getElementById('hs-ngaysinh').value = formatDateForInput(ngaysinh);
    document.getElementById('hs-gioitinh').value = gioitinh;
    document.getElementById('hs-email').value = (email === 'null' || !email) ? '' : email;
    document.getElementById('hs-sdt').value = (sdt === 'null' || !sdt) ? '' : sdt;
    
    myModal.show();
}

// ---  LƯU DỮ LIỆU ---
async function luuHS() {
    const btnSave = document.getElementById('btn-save');
    const originalBtnText = btnSave.innerHTML;

    const payload = {
        Ma_HS: document.getElementById('hs-ma').value.trim(),
        Ten_TK: document.getElementById('hs-tentk').value.trim(),
        Ten_HS: document.getElementById('hs-ten').value.trim(),
        Ngay_Sinh: document.getElementById('hs-ngaysinh').value,
        Gioi_Tinh: document.getElementById('hs-gioitinh').value,
        Email: document.getElementById('hs-email').value.trim(),
        SDT: document.getElementById('hs-sdt').value.trim(),
        Ma_Lop: currentLopID
    };

    let errors = [];
    if (!payload.Ma_HS) errors.push("- Chưa nhập Mã Học Sinh");
    if (!payload.Ten_HS) errors.push("- Chưa nhập Họ và Tên");
    if (!payload.Ngay_Sinh) errors.push("- Chưa chọn Ngày Sinh");
    if (!payload.SDT) errors.push("- Chưa nhập Số Điện Thoại");
    
    if (!document.getElementById('hs-tentk').disabled && !payload.Ten_TK) {
        errors.push("- Chưa nhập Tên Đăng Nhập");
    }

    if (errors.length > 0) {
        alert("Vui lòng kiểm tra lại:\n" + errors.join("\n"));
        return; 
    }

    btnSave.disabled = true;
    btnSave.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang lưu...`;

    const url = isEdit ? `/api/hocsinh/${payload.Ma_HS}` : '/api/hocsinh';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if(res.ok) {
            alert("✅ Lưu thành công!");
            myModal.hide();
            loadTableHS();
        } else {
            alert("❌ Lỗi: " + (data.message || "Không thể lưu"));
        }
    } catch (e) { 
        alert("❌ Lỗi kết nối!"); 
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = originalBtnText;
    }
}

// --- XÓA ---
async function xoaHS(id) {
    if(!confirm(`Bạn chắc chắn muốn xóa học sinh mã: ${id}?`)) return;

    try {
        const res = await fetch(`/api/hocsinh/${id}`, { method: 'DELETE' });
        if(res.ok) {
            alert("✅ Đã xóa thành công!");
            loadTableHS();
        } else {
            const d = await res.json();
            alert("❌ Lỗi: " + d.message);
        }
    } catch (e) { 
        alert("Lỗi kết nối khi xóa!"); 
    }
}

function dangXuat() {
    if(confirm('Bạn muốn đăng xuất?')) { 
        localStorage.clear(); 
        location.href='login.html'; 
    }
}