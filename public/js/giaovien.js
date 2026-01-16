document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('userCurrent'));
    
    if (!user || user.Loai_TK !== 'GiaoVien') {
        alert("Phiên đăng nhập hết hạn hoặc không có quyền!");
        return location.href = 'login.html';
    }
    
    const labelTen = document.getElementById('lbl-tengv');

    try {
        const res = await fetch(`/api/giaovien/lop-phu-trach/${user.Ma_TK}`);
        if (!res.ok) throw new Error(`Lỗi (${res.status})`);

        const data = await res.json();

        let tenHienThi = data.lopChuNhiem?.Ten_GV || data.lopGiangDay?.[0]?.Ten_GV || `Thầy/Cô (${user.Ma_TK})`;
        labelTen.innerHTML = `<i class="fas fa-user-circle me-2"></i>Xin chào Thầy/Cô ${tenHienThi}`;

        // Xử lý Lớp Chủ Nhiệm
        const boxCN = document.getElementById('box-chunhiem');
        if (data.lopChuNhiem) {
            boxCN.innerHTML = `
                <h2 class="display-5 fw-bold text-dark mb-3">${data.lopChuNhiem.Ten_Lop}</h2>
                <button class="btn btn-primary fw-bold shadow-sm px-4" onclick="chonLopCN('${data.lopChuNhiem.Ma_Lop}')">
                    <i class="fas fa-users-cog me-2"></i>Quản Lý Lớp
                </button>`;
        } else {
            boxCN.innerHTML = `<i class="fas fa-info-circle fa-3x text-muted mb-3"></i><span class="text-muted fw-bold">Không có lớp chủ nhiệm</span>`;
        }

        // Xử lý Lớp Giảng Dạy
        const listGD = document.getElementById('list-giangday');
        listGD.innerHTML = data.lopGiangDay?.length > 0 
            ? data.lopGiangDay.map(lop => `
                <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3" onclick="vaoChamDiem('${lop.Ma_Lop}', '${lop.Ma_MH}')">
                    <div><i class="fas fa-users text-secondary me-2"></i>Lớp: <strong>${lop.Ten_Lop}</strong></div>
                    <div class="text-end"><span class="badge bg-info text-dark me-2 px-3">${lop.Ten_MH}</span><i class="fas fa-chevron-right text-muted small"></i></div>
                </button>`).join('')
            : '<div class="p-5 text-center text-muted fst-italic">Chưa có lịch giảng dạy</div>';

    } catch (error) {
        labelTen.innerHTML = `<i class="fas fa-exclamation-triangle text-danger me-2"></i>Lỗi kết nối`;
        console.error(error);
    }
});

function vaoChamDiem(maLop, maMH) {
    localStorage.setItem('cur_MaLop', maLop);
    localStorage.setItem('cur_MaMH', maMH);
    window.location.href = 'diem.html';
}

function chonLopCN(maLop) {
    localStorage.setItem('selectedClass', maLop);
    window.location.href = 'hocsinh.html';
}

function dangXuat() {
    if(confirm('Xác nhận đăng xuất?')) {
        localStorage.clear();
        location.href = 'login.html';
    }
}