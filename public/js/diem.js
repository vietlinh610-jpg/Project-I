const maLop = localStorage.getItem("cur_MaLop");
const maMH = localStorage.getItem("cur_MaMH");
const maHK = "HK1";

document.addEventListener("DOMContentLoaded", () => {
    if (!maLop || !maMH) {
        alert("Không tìm thấy thông tin lớp dạy!");
        window.location.href = 'giaovien.html';
        return;
    }
    hienThiTenLopMon();
    loadBangDiem();
});

async function hienThiTenLopMon() {
    try {
        const res = await fetch(`/api/lop/ten?maLop=${maLop}&maMH=${maMH}`);
        const data = await res.json();
        document.getElementById("lbl-title").innerHTML = 
            `<i class="fas fa-chalkboard-teacher me-2"></i>LỚP: <span class="text-dark">${data.Ten_Lop}</span> | MÔN: <span class="text-dark">${data.Ten_MH}</span>`;
    } catch (e) { 
        console.error("Lỗi hiển thị tiêu đề:", e); 
    }
}

async function loadBangDiem() {
    try {
        const res = await fetch(`/api/diem/lop?maLop=${maLop}&maMH=${maMH}`);
        const data = await res.json();
        const tbody = document.getElementById("bang-diem");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="py-5">Không có học sinh nào trong lớp này.</td></tr>';
            return;
        }

        data.forEach(row => {
            tbody.innerHTML += `
                <tr>
                    <td class="fw-bold text-secondary">${row.Ma_HS}</td>
                    <td class="text-start ps-3 fw-bold">${row.Ten_HS}</td>
                    <td><input type="number" min="0" max="10" step="0.1" class="form-control text-center input-score p-1" id="m_${row.Ma_HS}" value="${row.Diem_Mieng ?? ''}"></td>
                    <td><input type="number" min="0" max="10" step="0.1" class="form-control text-center input-score p-1" id="p15_${row.Ma_HS}" value="${row.Diem_15P ?? ''}"></td>
                    <td><input type="number" min="0" max="10" step="0.1" class="form-control text-center input-score p-1" id="p45_${row.Ma_HS}" value="${row.Diem_45P ?? ''}"></td>
                    <td><input type="number" min="0" max="10" step="0.1" class="form-control text-center input-score p-1" id="gk_${row.Ma_HS}" value="${row.Diem_GK ?? ''}"></td>
                    <td><input type="number" min="0" max="10" step="0.1" class="form-control text-center input-score p-1" id="ck_${row.Ma_HS}" value="${row.Diem_CK ?? ''}"></td>
                    <td class="total-score">${row.Diem_TK ?? "-"}</td>
                    <td>
                        <button type="button" class="btn btn-success btn-sm fw-bold px-3 shadow-sm" onclick="luu('${row.Ma_HS}')">
                            <i class="fas fa-save me-1"></i>Lưu
                        </button>
                    </td>
                </tr>
            `;
        }); 
    } catch (e) { 
        console.error("Lỗi tải bảng điểm:", e);
        alert("Không thể tải danh sách điểm!");
    }
} 

async function luu(maHS) {
    const body = {
        Ma_HS: maHS,
        Ma_MH: maMH,
        Ma_HK: maHK,
        Diem_Mieng: document.getElementById(`m_${maHS}`).value,
        Diem_15P: document.getElementById(`p15_${maHS}`).value,
        Diem_45P: document.getElementById(`p45_${maHS}`).value,
        Diem_GK: document.getElementById(`gk_${maHS}`).value,
        Diem_CK: document.getElementById(`ck_${maHS}`).value
    };

    try {
        const res = await fetch("/api/diem/luu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            const toast = document.createElement("div");
            toast.className = "position-fixed bottom-0 end-0 p-3";
            toast.style.zIndex = "11";
            toast.innerHTML = `<div class="alert alert-success shadow-lg border-0 mb-0">✅ Đã cập nhật điểm cho ${maHS}</div>`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
            
            loadBangDiem(); 
        } else {
            alert("Có lỗi khi lưu điểm!");
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ!");
    }
}

function dangXuat() {
    if(confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('userCurrent');
        window.location.href = 'login.html';
    }
}