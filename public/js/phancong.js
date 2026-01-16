const modalElement = document.getElementById('modalPhanCong');
const modal = new bootstrap.Modal(modalElement);
let isEdit = false;

const selectGV = document.getElementById('Ma_GV');
const selectLop = document.getElementById('Ma_Lop');
const selectHK = document.getElementById('Ma_HK');
const inputPcId = document.getElementById('pcId');
const tableBang = document.getElementById('bang');
const lblModalTitle = document.getElementById('modalTitle');

async function loadCombobox() {
    try {
        const [gv, lop, hk] = await Promise.all([
            fetch('/api/auth/giaovien').then(r => r.json()),
            fetch('/api/lop').then(r => r.json()),
            fetch('/api/hocky').then(r => r.json())
        ]);

        selectGV.innerHTML = gv.map(x => `<option value="${x.Ma_GV}">${x.Ten_GV}</option>`).join('');
        selectLop.innerHTML = lop.map(x => `<option value="${x.Ma_Lop}">${x.Ten_Lop}</option>`).join('');
        selectHK.innerHTML = hk.map(x => `<option value="${x.Ma_HK}">${x.Ten_HK} - ${x.Nam_Hoc}</option>`).join('');
    } catch (err) {
        console.error("Lỗi load combobox:", err);
    }
}

async function load() {
    try {
        const res = await fetch('/api/phancong');
        const data = await res.json();

        if (data.length === 0) {
            tableBang.innerHTML = '<tr><td colspan="5" class="py-4 text-muted">Chưa có phân công nào</td></tr>';
            return;
        }

        tableBang.innerHTML = data.map(p => `
            <tr>
                <td>${p.Ten_GV}</td>
                <td class="fw-bold text-primary">${p.Ten_MH}</td>
                <td>${p.Ten_Lop}</td>
                <td>${p.Hoc_Ky} (${p.Nam_Hoc})</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="edit(${p.Ma_PC}, '${p.Ma_GV}', '${p.Ma_Lop}', '${p.Ma_HK}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="xoa(${p.Ma_PC})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tableBang.innerHTML = '<tr><td colspan="5" class="py-4 text-danger">Lỗi kết nối máy chủ</td></tr>';
    }
}

function openAdd() {
    isEdit = false;
    lblModalTitle.innerText = 'Thêm Phân Công';
    inputPcId.value = '';
    modal.show();
}

function edit(id, gv, lop, hk) {
    isEdit = true;
    lblModalTitle.innerText = 'Sửa Phân Công';
    inputPcId.value = id;
    selectGV.value = gv;
    selectLop.value = lop;
    selectHK.value = hk;
    modal.show();
}

// ---Lưu phân công ---
async function luuPhanCong() {
    const id = inputPcId.value;
    const body = {
        Ma_GV: selectGV.value,
        Ma_Lop: selectLop.value,
        Ma_HK: selectHK.value
    };

    const url = isEdit ? `/api/phancong/${id}` : '/api/phancong';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if(res.ok) {
            alert('✅ Lưu thành công!');
            modal.hide();
            load();
        } else {
            alert('❌ Thất bại: ' + data.message);
        }
    } catch (err) {
        alert('❌ Lỗi kết nối!');
    }
}

// --- Xóa phân công ---
async function xoa(id) {
    if(confirm('Bạn có chắc chắn muốn xóa phân công này?')) {
        try {
            const res = await fetch(`/api/phancong/${id}`, {method:'DELETE'});
            if(res.ok) {
                load();
            } else {
                const data = await res.json();
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (err) {
            alert('❌ Lỗi kết nối!');
        }
    }
}

// --- Đăng xuất ---
function dangXuat() {
    if(confirm('Bạn muốn đăng xuất khỏi hệ thống?')) {
        localStorage.clear();
        location.href = 'login.html';
    }
}

loadCombobox();
load();