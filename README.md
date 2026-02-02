# Hệ Thống Tính Bảo Hiểm Xã Hội 1 Lần

Công cụ tính toán mức hưởng BHXH một lần theo quy định hiện hành của Việt Nam.

## 🎯 Tính năng

- ✅ Tính BHXH bắt buộc
- ✅ Tính BHXH tự nguyện
- ✅ Kết hợp cả hai loại BHXH
- ✅ Giai đoạn thai sản (tùy chọn tính thời gian)
- ✅ Áp dụng hệ số trượt giá theo năm đóng
- ✅ Tính số tiền Nhà nước hỗ trợ (BHXH tự nguyện)
- ✅ Diễn giải chi tiết từng bước tính
- ✅ Xuất kết quả JSON

## 📋 Công thức tính

### 1. Quy đổi thời gian
- 1-6 tháng = 0.5 năm
- 7-11 tháng = 1 năm
- Đủ 12 tháng = 1 năm

### 2. Mức bình quân tiền lương/thu nhập
```
Bình quân = Σ(Mức lương × Hệ số trượt giá × Số tháng) / Tổng số tháng
```

### 3. Mức hưởng BHXH 1 lần
- Trước 2014: `Bình quân × Số năm × 1.5`
- Từ 2014: `Bình quân × Số năm × 2.0`

### 4. Hỗ trợ Nhà nước (BHXH tự nguyện)
Áp dụng từ 01/01/2018:
- Hộ nghèo: `22% × Mức chuẩn × 30%`
- Hộ cận nghèo: `22% × Mức chuẩn × 25%`
- Đối tượng khác: `22% × Mức chuẩn × 10%`

Mức chuẩn:
- 2018-2021: 700.000 đ
- 2022-2025: 1.500.000 đ

## 🚀 Cài đặt và chạy

### Chạy local
1. Clone repository
2. Mở file `index.html` trong trình duyệt

### Deploy GitHub Pages
1. Tạo repository mới trên GitHub
2. Push code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bhxh-calculator.git
git push -u origin main
```
3. Vào Settings > Pages
4. Chọn Source: Deploy from a branch
5. Chọn Branch: main, Folder: / (root)
6. Save và đợi vài phút
7. Truy cập: `https://YOUR_USERNAME.github.io/bhxh-calculator/`

## 📁 Cấu trúc dự án

```
bhxh-calculator/
├── index.html          # Trang chính
├── css/
│   └── style.css       # Styling Neumorphism
├── js/
│   ├── utils.js        # Các hàm tiện ích
│   ├── slipFactor.js   # Dữ liệu hệ số trượt giá
│   ├── calculator.js   # Logic tính toán
│   └── app.js          # Ứng dụng chính
└── README.md           # Tài liệu
```

## 📊 Dữ liệu mẫu test

| Giai đoạn | Mức lương | Hệ số | Kết quả |
|-----------|-----------|-------|---------|
| T4-T6/2019 | 1.000.000 | 1.16 | 3.480.000 |
| T4-T6/2024 | 4.456.000 | 1.00 | 13.368.000 |
| T7-T9/2024 | 4.706.000 | 1.00 | 14.118.000 |
| T10-T12/2024 | 4.736.000 | 1.00 | 14.208.000 |

**Kết quả mong đợi:**
- Tổng điều chỉnh: 45.174.000 đ
- Bình quân: 3.764.500 đ
- Mức hưởng: 7.529.000 đ (1 năm × 2)
- Hỗ trợ (đối tượng khác): 46.200 đ
- Thực nhận: 7.482.800 đ

## 📄 License

MIT License - Miễn phí sử dụng
