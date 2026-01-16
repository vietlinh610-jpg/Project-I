const maLopCN = localStorage.getItem('selectedClass');

document.addEventListener('DOMContentLoaded', function() {
    if(!maLopCN) {
        alert('Vui lòng chọn lớp từ trang Giáo Viên!');
        window.location.href = 'giaovien.html';
        return;
    }
    document.getElementById('tieu-de-lop').innerHTML = `<i class="fas fa-users me-2"></i>DANH SÁCH LỚP ${maLopCN}`;
    layDanhSachHocSinh();
});

// Hàm lấy danh sách học sinh 
async function layDanhSachHocSinh() {
    try {
        const response = await fetch(`/api/hocsinh/lop/${maLopCN}`);
        const data = await response.json();
        const tableBody = document.getElementById('bang-du-lieu');
        tableBody.innerHTML = ''; 

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="py-5 text-muted italic">Lớp chưa có học sinh nào. Hãy nhập mã để thêm học sinh.</td></tr>';
            document.getElementById('si-so-lop').innerText = `Sĩ số: 0`;
            return;
        }

        const tenLopHienThi = data[0].Ten_Lop || maLopCN;
        document.getElementById('tieu-de-lop').innerHTML = `<i class="fas fa-users me-2"></i>DANH SÁCH LỚP ${tenLopHienThi}`;
        document.getElementById('si-so-lop').innerText = `Sĩ số: ${data.length}`;

        data.forEach(hs => {
            let ngaySinhStr = hs.Ngay_Sinh ? new Date(hs.Ngay_Sinh).toLocaleDateString('vi-VN') : '---';
            tableBody.innerHTML += `
                <tr>
                    <td class="fw-bold text-secondary">${hs.Ma_HS}</td>
                    <td class="text-start ps-3 fw-bold text-dark">${hs.Ten_HS}</td>
                    <td>${ngaySinhStr}</td>
                    <td><span class="badge ${hs.Gioi_Tinh === 'Nam' ? 'bg-primary shadow-sm' : 'bg-danger shadow-sm'}">${hs.Gioi_Tinh}</span></td>
                    <td class="text-muted small">${hs.Email || '---'}</td>
                    <td>${hs.SDT || '---'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger fw-bold" onclick="choRoiLop('${hs.Ma_HS}')">
                            <i class="fas fa-sign-out-alt me-1"></i>Rời Lớp
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Không thể kết nối đến Server!');
    }
}

//--- Hàm thêm học sinh vào lớp ---
async function themHocSinhVaoLop() {
    const maHS = document.getElementById('txtMaHSToAdd').value.trim();
    if (!maHS) return alert("Vui lòng nhập Mã Học Sinh!");

    try {
        const res = await fetch('/api/hocsinh/them-vao-lop', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ Ma_HS: maHS, Ma_Lop: maLopCN })
        });
        const data = await res.json();
        if(res.ok){
            alert("✅ " + data.message);
            document.getElementById('txtMaHSToAdd').value = '';
            layDanhSachHocSinh(); 
        } else {
            alert("❌ " + data.message);
        }
    } catch (error){
        alert("Lỗi kết nối máy chủ");
    }
}

//---Hàm xóa học sinh khỏi lớp ---
async function choRoiLop(maHS) {
    if(!confirm(`Xác nhận đưa học sinh ${maHS} rời khỏi lớp hiện tại?`)) return;
    try {
        const res = await fetch(`/api/hocsinh/roi-lop/${maHS}`, { method: 'PUT' });
        const data = await res.json();
        if(res.ok){
            alert("✅ " + data.message);
            layDanhSachHocSinh();
        } else {
            alert("❌ " + data.message);
        }
    } catch (error){
        alert("Lỗi kết nối máy chủ");
    }
}

function dangXuat() {
    if(confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}