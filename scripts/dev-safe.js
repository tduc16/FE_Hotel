const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const LOCK_FILE = path.join(__dirname, '..', '.next', 'lock');

console.log(`[Safe Start] Đang kiểm tra cổng ${PORT} và lockfile...`);

// 1. Phát hiện và giải phóng cổng PORT (3000)
try {
  let pid = null;
  if (process.platform === 'win32') {
    // Tìm PID đang LISTEN trên cổng PORT trên Windows
    const output = execSync(`netstat -ano | findstr :${PORT}`).toString();
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        // Cấu trúc: TCP [IP] [IP:PORT] LISTENING [PID]
        const lastPart = parts[parts.length - 1];
        if (lastPart && !isNaN(lastPart)) {
          pid = parseInt(lastPart, 10);
          break;
        }
      }
    }
  } else {
    // Tìm PID đang listen trên macOS/Linux
    const output = execSync(`lsof -t -i:${PORT} -sTCP:LISTEN`).toString().trim();
    if (output) {
      pid = parseInt(output, 10);
    }
  }

  if (pid && pid !== process.pid) {
    console.log(`[Safe Start] Phát hiện tiến trình khác đang chạy trên cổng ${PORT} (PID: ${pid}). Đang tắt tiến trình này...`);
    if (process.platform === 'win32') {
      execSync(`taskkill /F /PID ${pid}`);
    } else {
      execSync(`kill -9 ${pid}`);
    }
    console.log(`[Safe Start] Đã tắt tiến trình ${pid} thành công.`);
  } else {
    console.log(`[Safe Start] Không có tiến trình lạ nào đang chiếm dụng cổng ${PORT}.`);
  }
} catch (error) {
  // Lỗi do không tìm thấy tiến trình chiếm cổng, bỏ qua an toàn
}

// 2. Dọn dẹp lockfile cũ nếu có
if (fs.existsSync(LOCK_FILE)) {
  console.log(`[Safe Start] Phát hiện lockfile cũ tại ${LOCK_FILE}. Tiến hành xóa...`);
  try {
    fs.rmSync(LOCK_FILE, { force: true });
    console.log(`[Safe Start] Xóa lockfile thành công.`);
  } catch (error) {
    console.error(`[Safe Start] Không thể xóa lockfile:`, error.message);
  }
} else {
  console.log(`[Safe Start] Không phát hiện lockfile bị kẹt.`);
}

console.log(`[Safe Start] Môi trường đã sẵn sàng để khởi động Next.js.`);
