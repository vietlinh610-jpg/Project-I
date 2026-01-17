let myModal;
let isEdit = false;

document.addEventListener('DOMContentLoaded', () => {
    myModal = new bootstrap.Modal(document.getElementById('modalMonHoc'));
    load();
});

async function load() {
    try {
        const res = await fetch('/api/monhoc');
        const data = await res.json();
        
        const content = data.map(m => `
            <tr>
                <td class="fw-bold text-secondary">${m.Ma_MH}</td>
                <td class="fw-bold text-primary">${m.Ten_MH}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="openEditModal('${m.Ma_MH}', '${m.Ten_MH}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="xoa('${m.Ma_MH}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('bang').innerHTML = content;
    } catch (e) { 
        console.error("Lỗi tải dữ liệu:", e); 
    }
}

function openModal() {
    isEdit = false;
    document.getElementById('modalTitle').innerText = "Thêm Môn Học Mới";
    document.getElementById('input-ma').value = "";
    document.getElementById('input-ma').disabled = false;
    document.getElementById('input-ten').value = "";
    myModal.show();
}

function openEditModal(ma, ten) {
    isEdit = true;
    document.getElementById('modalTitle').innerText = "Sửa Môn Học";
    document.getElementById('mh-id-old').value = ma;
    
    document.getElementById('input-ma').value = ma;
    document.getElementById('input-ma').disabled = true; 
    document.getElementById('input-ten').value = ten;
    
    myModal.show();
}

// ---Lưu môn học ---
async function luuMonHoc() {
    const ma = document.getElementById('input-ma').value.trim();
    const ten = document.getElementById('input-ten').value.trim();

    if (!ma || !ten) {
        alert("Vui lòng nhập đầy đủ Mã và Tên môn!");
        return;
    }

    const url = isEdit ? `/api/monhoc/${ma}` : '/api/monhoc';
    const method = isEdit ? 'PUT' : 'POST';
    const body = isEdit ? { Ten_MH: ten } : { Ma_MH: ma, Ten_MH: ten };

    try {
        const res = await fetch(url, { 
            method: method, 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        
        if (res.ok) {
            alert("✅ Thành công!");
            myModal.hide();
            load();
        } else {
            const errorData = await res.json();
            alert("❌ Lỗi: " + (errorData.message || "Không thể lưu dữ liệu"));
        }
    } catch (e) { 
        alert("Lỗi kết nối server"); 
    }
}

// --- Xóa môn ---
async function xoa(id) { 
    if (confirm(`⚠️ Bạn có chắc chắn muốn xóa môn học [${id}] không?`)) { 
        try {
            const res = await fetch(`/api/monhoc/${id}`, { method: 'DELETE' }); 
            if (res.ok) {
                alert("✅ Xóa thành công");
                load(); 
            } else {
                alert("❌ Môn học này đang có giáo viên giảng dạy");
            }
        } catch (e) { 
            alert("Lỗi kết nối server"); 
        }
    } 
}

// --- Đăng xuất ---
function dangXuat() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}