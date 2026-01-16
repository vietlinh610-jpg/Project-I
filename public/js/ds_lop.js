let myModal;
document.addEventListener('DOMContentLoaded', () => {
    myModal = new bootstrap.Modal(document.getElementById('modalLop'));
    load();
});

let isEdit = false;

// --- Tải danh sách lớp từ API ---
async function load() {
    try {
        const res = await fetch('/api/lop');
        const data = await res.json();
        
        const content = data.map(l => `
            <tr>
                <td class="fw-bold text-secondary">${l.Ma_Lop}</td>
                <td class="fw-bold text-primary">${l.Ten_Lop}</td>
                <td>
                    ${l.Ten_GVCN 
                        ? `<span class="badge bg-success bg-opacity-10 text-success px-3 py-2">${l.Ten_GVCN}</span>` 
                        : (l.Ma_GVCN ? l.Ma_GVCN : '<span class="badge bg-danger bg-opacity-10 text-danger">Chưa có</span>')}
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="openEditModal('${l.Ma_Lop}', '${l.Ten_Lop}', '${l.Ma_GVCN || ''}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="xoaLop('${l.Ma_Lop}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('bang').innerHTML = content;
    } catch (err) { 
        console.error("Lỗi tải dữ liệu:", err); 
    }
}

// --- Mở Modal Thêm mới ---
function openModal() {
    isEdit = false;
    document.getElementById('modalTitle').innerText = "Thêm Lớp Mới";
    document.getElementById('input-ma').value = "";
    document.getElementById('input-ma').disabled = false;
    document.getElementById('input-ten').value = "";
    document.getElementById('input-gv').value = "";
    myModal.show();
}

// --- Mở Modal Sửa thông tin ---
function openEditModal(ma, ten, gv) {
    isEdit = true;
    document.getElementById('modalTitle').innerText = "Sửa Thông Tin Lớp";
    document.getElementById('lop-id-old').value = ma;
    
    document.getElementById('input-ma').value = ma;
    document.getElementById('input-ma').disabled = true; 
    document.getElementById('input-ten').value = ten;
    document.getElementById('input-gv').value = gv === 'null' ? '' : gv;
    
    myModal.show();
}

// --- Lưu Dữ Liệu ---
async function luuLop() {
    const ma = document.getElementById('input-ma').value.trim();
    const ten = document.getElementById('input-ten').value.trim();
    const gv = document.getElementById('input-gv').value.trim();

    if(!ma || !ten) {
        alert("Vui lòng nhập đầy đủ Mã lớp và Tên lớp!");
        return;
    }

    const url = isEdit ? `/api/lop/${ma}` : '/api/lop';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
        Ma_Lop: ma,
        Ten_Lop: ten,
        Ma_GVCN: gv
    };

    try {
        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (res.ok) {
            alert("✅ " + (data.message || "Thành công!"));
            myModal.hide();
            load();
        } else {
            alert("❌ LỖI: " + data.message);
        }
    } catch (e) { 
        alert("Lỗi kết nối server!"); 
    }
}

// --- Xóa Lớp ---
async function xoaLop(ma) {
    if(confirm('⚠️ CẢNH BÁO: Bạn chắc chắn muốn xóa lớp này?\nDữ liệu học sinh trong lớp cũng sẽ bị ảnh hưởng.')) {
        try {
            const res = await fetch(`/api/lop/${ma}`, { method: 'DELETE' });
            const data = await res.json();
            if(res.ok) {
                alert("✅ Đã xóa thành công!");
                load();
            } else {
                alert("❌ Lỗi: " + data.message);
            }
        } catch (e) { 
            alert("Lỗi kết nối server!"); 
        }
    }
}

// --- Đăng xuất ---
function dangXuat() {
    if(confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}