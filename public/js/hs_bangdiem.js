document.addEventListener('DOMContentLoaded', function() {
    const userstr = localStorage.getItem('userCurrent');
    if (!userstr) {
        alert("Vui lòng đăng nhập!");
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userstr);
    
    if (user.Loai_TK !== 'HocSinh') {
         alert("Tài khoản không có quyền truy cập cổng học sinh!");
         window.location.href = 'login.html';
         return;
    }

    const maHocSinh = user.Ma_TK; 
    
    layThongTinHS(maHocSinh);
    layBangDiem(maHocSinh);
});

//--- Lấy bảng điểm lớp---
async function layBangDiem(maHS) {
    try {
        const res = await fetch(`/api/hocsinh/canhan/${maHS}`);
        if (!res.ok) throw new Error("Lỗi tải điểm");

        const data = await res.json();
        const tbody = document.getElementById('bang-diem-body');
        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="py-4">Chưa có dữ liệu điểm học tập.</td></tr>';
            return;
        }

        data.forEach(d => {
            let mauDiem = "";
            if (d.Diem_TK !== null) {
                mauDiem = d.Diem_TK < 5 ? 'diem-kem' : 'diem-tot';
            }

            const row = `
                <tr>
                    <td class="fw-bold text-secondary">${d.Ten_HK || d.Hoc_Ky}</td>
                    <td class="text-start fw-bold">${d.Ten_MH}</td>
                    <td>${d.Diem_Mieng ?? '-'}</td>
                    <td>${d.Diem_15P ?? '-'}</td>
                    <td>${d.Diem_45P ?? '-'}</td>
                    <td>${d.Diem_GK ?? '-'}</td>
                    <td>${d.Diem_CK ?? '-'}</td>
                    <td class="${mauDiem} fs-5">${d.Diem_TK ?? '-'}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (error) {
        console.error("Lỗi fetch điểm:", error);
        document.getElementById('bang-diem-body').innerHTML = 
            '<tr><td colspan="8" class="text-danger py-4">Không thể kết nối Server để tải điểm!</td></tr>';
    }
}

//--- Lấy thông tin học sinh ---
async function layThongTinHS(maHS) {
    try {
         const res = await fetch(`/api/hocsinh/id/${maHS}`);
         if (!res.ok) throw new Error("Lỗi tải thông tin cá nhân");

         const hs = await res.json();
         document.getElementById('txtMaHS').innerText = hs.Ma_HS || maHS;
         document.getElementById('txtTenHS').innerText = hs.Ten_HS || "---";
         document.getElementById('txtTenLop').innerText = hs.Ten_Lop || "Chưa xếp lớp";
         document.getElementById('txtTenGVCN').innerText = hs.Ten_GV || "Chưa có";
         document.getElementById('txtGioiTinh').innerText = hs.Gioi_Tinh || "---";
         document.getElementById('txtEmail').innerText = hs.Email || "---";
         document.getElementById('txtSDT').innerText = hs.SDT || "---";
         
         if(hs.Ngay_Sinh) {
            document.getElementById('txtNgaySHS').innerText = new Date(hs.Ngay_Sinh).toLocaleDateString('vi-VN');
         }
    } catch (error) {
        console.error("Lỗi fetch thông tin HS:", error);
    }
}

function dangXuat() {
    if(confirm("Xác nhận đăng xuất?")) {
        localStorage.removeItem('userCurrent');
        window.location.href = 'login.html';
    }
}