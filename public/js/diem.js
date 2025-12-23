document.addEventListener('DOMContentLoaded', function() {
    // 1. Lấy thông tin từ bộ nhớ
    const maLop = localStorage.getItem('selectedClass');
    const tenMon = localStorage.getItem('selectedSubject') || 'Toán'; 
    
    // --- KIỂM TRA QUYỀN ---
    // Lấy cờ "Là Chủ Nhiệm" từ localStorage (do trang trước gửi sang)
    const isChuNhiem = localStorage.getItem('isChuNhiem') === 'true';

    // 2. Cập nhật giao diện
    document.getElementById('tieu-de-lop').innerText = `📘 LỚP ${maLop}`;
    document.getElementById('info-mon').innerText = `📖 Môn: ${tenMon}`;

    // 3. Xử lý Ẩn/Hiện nút Chủ nhiệm
    if (isChuNhiem) {
        // Nếu là GVCN -> Hiện nút Thêm HS
        document.getElementById('toolbar-chunhiem').style.display = 'block';
    } else {
        // Nếu là GV Bộ môn -> Ẩn đi (cho chắc chắn)
        document.getElementById('toolbar-chunhiem').style.display = 'none';
    }

    // 4. Tải bảng điểm
    loadBangDiem(maLop);
});

async function loadBangDiem(maLop) {
    // ... (Gọi API lấy danh sách học sinh + điểm như bài trước) ...
    // Giả sử data trả về là mảng học sinh
    const url = `/api/diem/lop?maLop=${maLop}&maMH=${maMH}&t=${Date.now()}`;
    const res = await fetch(url);
    const isChuNhiem = localStorage.getItem('isChuNhiem') === 'true';
    
    // ... (Vòng lặp forEach) ...
    data.forEach(hs => {
        // Xử lý nút Xóa: Chỉ hiện nếu là GVCN
        let nutXoa = '';
        if (isChuNhiem) {
            nutXoa = `<button class="btn btn-sm btn-outline-danger" onclick="xoaHocSinh('${hs.Ma_HS}')">
                        <i class="fas fa-trash"></i>
                      </button>`;
        } else {
            nutXoa = `<span class="text-muted small">--</span>`;
        }

        const row = `
            <tr>
                <td>${hs.Ma_HS}</td>
                <td>${hs.Ten_HS}</td>
                <td><input type="number" class="form-control text-center" value="${hs.Diem_Mieng || ''}"></td>
                <td><input type="number" class="form-control text-center" value="${hs.Diem_15P || ''}"></td>
                <td><input type="number" class="form-control text-center" value="${hs.Diem_45P || ''}"></td>
                <td><input type="number" class="form-control text-center" value="${hs.Diem_CK || ''}"></td>
                <td class="text-center">${nutXoa}</td> </tr>
        `;
        // ...
    });
}