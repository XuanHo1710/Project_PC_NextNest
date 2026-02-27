// Auto-generated import script for pcmarket.vn categories
// Run: mongosh "mongodb://localhost:27017/your_db" < import_categories.js

db = db.getSiblingDB("project_pc");  // <-- Đổi tên DB cho đúng

// Clear existing categories (CẢNH BÁO: xóa hết data cũ!)
// db.categories.deleteMany({});

const categories = [
  {
    "_id": "12d92442ed931e5de6c3cc25",
    "name": "PC Gaming, Streaming",
    "parentId": null,
    "slug": "pc-gaming-streaming",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.365282+00:00",
    "updatedAt": "2026-02-27T10:16:46.365282+00:00"
  },
  {
    "_id": "b21f2f9a6473d43de48c1d8c",
    "name": "MÁY TÍNH CHƠI GAME PCM",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "may-tinh-choi-game-pcm",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.369644+00:00",
    "updatedAt": "2026-02-27T10:16:46.369644+00:00"
  },
  {
    "_id": "5e2c6acd0e0f3830e4f44706",
    "name": "PC ĐẸP",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "pc-dep",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.370170+00:00",
    "updatedAt": "2026-02-27T10:16:46.370170+00:00"
  },
  {
    "_id": "e2a0c9a44408848e756660a7",
    "name": "PC GAMING GIÁ RẺ",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "pc-gaming-gia-re",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.370501+00:00",
    "updatedAt": "2026-02-27T10:16:46.370501+00:00"
  },
  {
    "_id": "177472dac723ce19490e30c3",
    "name": "PC GAMING TRUNG CẤP",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "pc-gaming-trung-cap",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.370580+00:00",
    "updatedAt": "2026-02-27T10:16:46.370580+00:00"
  },
  {
    "_id": "192bed6b7900cf3219d09860",
    "name": "PC GAMING CAO CẤP",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "pc-gaming-cao-cap",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.370647+00:00",
    "updatedAt": "2026-02-27T10:16:46.370647+00:00"
  },
  {
    "_id": "d391936a37490b3eeb665691",
    "name": "PC Core Ultra",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "pc-core-ultra",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.370705+00:00",
    "updatedAt": "2026-02-27T10:16:46.370705+00:00"
  },
  {
    "_id": "546a5884132f2f2b3182e051",
    "name": "PC CORE ULTRA 5",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "pc-core-ultra-5",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.370765+00:00",
    "updatedAt": "2026-02-27T10:16:46.370765+00:00"
  },
  {
    "_id": "b35f479863e569b0d8f3d1cf",
    "name": "PC CORE ULTRA 7",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "pc-core-ultra-7",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.370823+00:00",
    "updatedAt": "2026-02-27T10:16:46.370823+00:00"
  },
  {
    "_id": "7cf842d63800a8e1ebca749e",
    "name": "PC CORE ULTRA 9",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "pc-core-ultra-9",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.370881+00:00",
    "updatedAt": "2026-02-27T10:16:46.370881+00:00"
  },
  {
    "_id": "72e05cff8d71bbd1de502522",
    "name": "PC STREAMER, YOUTUBER",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "pc-streamer-youtuber",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.370935+00:00",
    "updatedAt": "2026-02-27T10:16:46.370935+00:00"
  },
  {
    "_id": "ff2304be9359d1a17aaa982c",
    "name": "PC GAMING DDR5",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "pc-gaming-ddr5",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.370990+00:00",
    "updatedAt": "2026-02-27T10:16:46.370990+00:00"
  },
  {
    "_id": "c22c4e3b202c333c06d36d54",
    "name": "Theo Khoảng Giá",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "theo-khoang-gia",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.371046+00:00",
    "updatedAt": "2026-02-27T10:16:46.371046+00:00"
  },
  {
    "_id": "23d112703ce76cc8cce2fa60",
    "name": "Dưới 10 Triệu",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "duoi-10-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.371109+00:00",
    "updatedAt": "2026-02-27T10:16:46.371109+00:00"
  },
  {
    "_id": "13475bcd3945bca9a280a21a",
    "name": "10 Triệu - 15 Triệu",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "10-trieu-15-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.371193+00:00",
    "updatedAt": "2026-02-27T10:16:46.371193+00:00"
  },
  {
    "_id": "74d1a9a1cbae5fa7b2977075",
    "name": "15 Triệu - 20 Triệu",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "15-trieu-20-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.371825+00:00",
    "updatedAt": "2026-02-27T10:16:46.371825+00:00"
  },
  {
    "_id": "60b1ae8865b8d1ec509b87cc",
    "name": "20 Triệu - 25 Triệu",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "20-trieu-25-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.371895+00:00",
    "updatedAt": "2026-02-27T10:16:46.371895+00:00"
  },
  {
    "_id": "c48b131521c3db7f8d6bf3ef",
    "name": "25 Triệu - 30 Triệu",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "25-trieu-30-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.371979+00:00",
    "updatedAt": "2026-02-27T10:16:46.371979+00:00"
  },
  {
    "_id": "11a5a4da815cdf36834363d4",
    "name": "30 Triệu - 40 Triệu",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "30-trieu-40-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.372044+00:00",
    "updatedAt": "2026-02-27T10:16:46.372044+00:00"
  },
  {
    "_id": "905a8dcebcd79bd1c577c2d6",
    "name": "40 Triệu - 50 Triệu",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "40-trieu-50-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.372339+00:00",
    "updatedAt": "2026-02-27T10:16:46.372339+00:00"
  },
  {
    "_id": "ceec81e1b2be818d2987eecc",
    "name": "Trên 50 Triệu",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "tren-50-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.372415+00:00",
    "updatedAt": "2026-02-27T10:16:46.372415+00:00"
  },
  {
    "_id": "1b74630067b8b61d6c3b4ab9",
    "name": "Full Bộ PC Kèm Màn Hình",
    "parentId": "12d92442ed931e5de6c3cc25",
    "slug": "full-bo-pc-kem-man-hinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.372478+00:00",
    "updatedAt": "2026-02-27T10:16:46.372478+00:00"
  },
  {
    "_id": "e59f5dcfc08be5816883f85d",
    "name": "PC Workstation",
    "parentId": null,
    "slug": "pc-workstation",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.372496+00:00",
    "updatedAt": "2026-02-27T10:16:46.372496+00:00"
  },
  {
    "_id": "3ef1ba4d79381c7118ff96e3",
    "name": "PC Dựng Phim- Edit Video",
    "parentId": "e59f5dcfc08be5816883f85d",
    "slug": "pc-dung-phim-edit-video",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.376509+00:00",
    "updatedAt": "2026-02-27T10:16:46.376509+00:00"
  },
  {
    "_id": "b5f717651474987a82c831e9",
    "name": "KHOẢNG GIÁ",
    "parentId": "e59f5dcfc08be5816883f85d",
    "slug": "khoang-gia",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.376622+00:00",
    "updatedAt": "2026-02-27T10:16:46.376622+00:00"
  },
  {
    "_id": "39aae719d493c91f3820a71d",
    "name": "Từ 10 Triệu đến 20 Triệu",
    "parentId": "e59f5dcfc08be5816883f85d",
    "slug": "tu-10-trieu-den-20-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.376696+00:00",
    "updatedAt": "2026-02-27T10:16:46.376696+00:00"
  },
  {
    "_id": "9909721f12998c568d384cab",
    "name": "Từ 20 Triệu đến 30 Triệu",
    "parentId": "e59f5dcfc08be5816883f85d",
    "slug": "tu-20-trieu-den-30-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.376767+00:00",
    "updatedAt": "2026-02-27T10:16:46.376767+00:00"
  },
  {
    "_id": "d5b8e21e85958ae8d23b9c8e",
    "name": "Từ 30 Triệu đến 40 Triệu",
    "parentId": "e59f5dcfc08be5816883f85d",
    "slug": "tu-30-trieu-den-40-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.376846+00:00",
    "updatedAt": "2026-02-27T10:16:46.376846+00:00"
  },
  {
    "_id": "c77301328df6f9280282ea2f",
    "name": "Từ 40 Triệu đến 60 Triệu",
    "parentId": "e59f5dcfc08be5816883f85d",
    "slug": "tu-40-trieu-den-60-trieu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.376911+00:00",
    "updatedAt": "2026-02-27T10:16:46.376911+00:00"
  },
  {
    "_id": "9bd6635af21fdee6445d9c56",
    "name": "PC AMD Gaming",
    "parentId": null,
    "slug": "pc-amd-gaming",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.376929+00:00",
    "updatedAt": "2026-02-27T10:16:46.376929+00:00"
  },
  {
    "_id": "b66f3c950022a9eb8d7b132a",
    "name": "PC AMD GAMING PRO  RYZEN 7 7800X3D - RTX 5060 Ti 16GB",
    "parentId": "9bd6635af21fdee6445d9c56",
    "slug": "pc-amd-gaming-pro-ryzen-7-7800x3d-rtx-5060-ti-16gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.380952+00:00",
    "updatedAt": "2026-02-27T10:16:46.380952+00:00"
  },
  {
    "_id": "de33c3e4feb48f73c21552e2",
    "name": "PC Văn Phòng",
    "parentId": null,
    "slug": "pc-van-phong",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.380997+00:00",
    "updatedAt": "2026-02-27T10:16:46.380997+00:00"
  },
  {
    "_id": "436919d416b031eee238fef2",
    "name": "Máy Tính Dùng Cho Kế Toán",
    "parentId": "de33c3e4feb48f73c21552e2",
    "slug": "may-tinh-dung-cho-ke-toan",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.384517+00:00",
    "updatedAt": "2026-02-27T10:16:46.384517+00:00"
  },
  {
    "_id": "5c0c377b5f69df921cb75a82",
    "name": "Máy Tính Dùng Cho Doanh Nghiệp",
    "parentId": "de33c3e4feb48f73c21552e2",
    "slug": "may-tinh-dung-cho-doanh-nghiep",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.384601+00:00",
    "updatedAt": "2026-02-27T10:16:46.384601+00:00"
  },
  {
    "_id": "0942a58316a1300987be90ee",
    "name": "Máy Tính Cho Thu Ngân - Kho Hàng",
    "parentId": "de33c3e4feb48f73c21552e2",
    "slug": "may-tinh-cho-thu-ngan-kho-hang",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.384670+00:00",
    "updatedAt": "2026-02-27T10:16:46.384670+00:00"
  },
  {
    "_id": "d49799d87c34a34a93244731",
    "name": "Máy Tính Cho Giải Trí Cá Nhân",
    "parentId": "de33c3e4feb48f73c21552e2",
    "slug": "may-tinh-cho-giai-tri-ca-nhan",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.384743+00:00",
    "updatedAt": "2026-02-27T10:16:46.384743+00:00"
  },
  {
    "_id": "98f8d46771c764f63b3cbe8b",
    "name": "MOFFICE Pentium + Màn Hình",
    "parentId": "de33c3e4feb48f73c21552e2",
    "slug": "moffice-pentium-man-hinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.384831+00:00",
    "updatedAt": "2026-02-27T10:16:46.384831+00:00"
  },
  {
    "_id": "874a28f6a7fa2b1c991dc298",
    "name": "MOFFICE I3 + Màn Hình",
    "parentId": "de33c3e4feb48f73c21552e2",
    "slug": "moffice-i3-man-hinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.384896+00:00",
    "updatedAt": "2026-02-27T10:16:46.384896+00:00"
  },
  {
    "_id": "1b3eb822c3028c1eb3349732",
    "name": "MOFFICE I5 + Màn Hình",
    "parentId": "de33c3e4feb48f73c21552e2",
    "slug": "moffice-i5-man-hinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.384959+00:00",
    "updatedAt": "2026-02-27T10:16:46.384959+00:00"
  },
  {
    "_id": "2d32d9f1d7acd985a7eb30be",
    "name": "MOFFICE I7 + Màn Hình",
    "parentId": "de33c3e4feb48f73c21552e2",
    "slug": "moffice-i7-man-hinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.385022+00:00",
    "updatedAt": "2026-02-27T10:16:46.385022+00:00"
  },
  {
    "_id": "9e1ea997556235b06af040c0",
    "name": "PC Giả Lập Ảo Hóa",
    "parentId": null,
    "slug": "pc-gia-lap-ao-hoa",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.385035+00:00",
    "updatedAt": "2026-02-27T10:16:46.385035+00:00"
  },
  {
    "_id": "73649b5b3fa6dba9a407ba18",
    "name": "Linh Kiện Máy Tính",
    "parentId": null,
    "slug": "linh-kien-may-tinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.388717+00:00",
    "updatedAt": "2026-02-27T10:16:46.388717+00:00"
  },
  {
    "_id": "e5cd480ceabbaefde985a6b8",
    "name": "CPU - Bộ vi xử lý",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "cpu-bo-vi-xu-ly",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393265+00:00",
    "updatedAt": "2026-02-27T10:16:46.393265+00:00"
  },
  {
    "_id": "4577b77cd920c56e68536cc3",
    "name": "CPU Intel",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "cpu-intel",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393386+00:00",
    "updatedAt": "2026-02-27T10:16:46.393386+00:00"
  },
  {
    "_id": "f57e95c2559bf0b92acf5cbd",
    "name": "CPU Intel Core Ultra",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "cpu-intel-core-ultra",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393458+00:00",
    "updatedAt": "2026-02-27T10:16:46.393458+00:00"
  },
  {
    "_id": "6b8cd4e5076a0327a1392929",
    "name": "Intel Pentium",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "intel-pentium",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393528+00:00",
    "updatedAt": "2026-02-27T10:16:46.393528+00:00"
  },
  {
    "_id": "ed7b0943cb1d0a670a6d8a1a",
    "name": "Intel Core i3",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "intel-core-i3",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393595+00:00",
    "updatedAt": "2026-02-27T10:16:46.393595+00:00"
  },
  {
    "_id": "f627b86ce9ea76d1a424b147",
    "name": "Intel Core i5",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "intel-core-i5",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393663+00:00",
    "updatedAt": "2026-02-27T10:16:46.393663+00:00"
  },
  {
    "_id": "aa71c683dcaf518b2b240c1a",
    "name": "Intel Core i7",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "intel-core-i7",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393735+00:00",
    "updatedAt": "2026-02-27T10:16:46.393735+00:00"
  },
  {
    "_id": "00f7956eb7631e5fce58f6a2",
    "name": "Intel Core i9",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "intel-core-i9",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393802+00:00",
    "updatedAt": "2026-02-27T10:16:46.393802+00:00"
  },
  {
    "_id": "87979c954db41266829291a1",
    "name": "Intel Xeon",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "intel-xeon",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393865+00:00",
    "updatedAt": "2026-02-27T10:16:46.393865+00:00"
  },
  {
    "_id": "41e93905a075fb593e8223c3",
    "name": "CPU AMD",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "cpu-amd",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393928+00:00",
    "updatedAt": "2026-02-27T10:16:46.393928+00:00"
  },
  {
    "_id": "0b69e38adfbd64e51ff02119",
    "name": "AMD Ryzen 3",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "amd-ryzen-3",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.393991+00:00",
    "updatedAt": "2026-02-27T10:16:46.393991+00:00"
  },
  {
    "_id": "5d2c58482c6af0a42d396cd4",
    "name": "AMD Ryzen 5",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "amd-ryzen-5",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394064+00:00",
    "updatedAt": "2026-02-27T10:16:46.394064+00:00"
  },
  {
    "_id": "51d80bc3efbbf427325bac3c",
    "name": "AMD Ryzen 7",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "amd-ryzen-7",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394133+00:00",
    "updatedAt": "2026-02-27T10:16:46.394133+00:00"
  },
  {
    "_id": "2b390b453dd3c4acd6203328",
    "name": "AMD Ryzen 9",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "amd-ryzen-9",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394196+00:00",
    "updatedAt": "2026-02-27T10:16:46.394196+00:00"
  },
  {
    "_id": "3f52f8647611ccb7ea11f8fe",
    "name": "AMD Ryzen Threadripper",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "amd-ryzen-threadripper",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394259+00:00",
    "updatedAt": "2026-02-27T10:16:46.394259+00:00"
  },
  {
    "_id": "c78986db5ae9ef6927dcbf79",
    "name": "Mainboard - Bo mạch chủ",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-bo-mach-chu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394318+00:00",
    "updatedAt": "2026-02-27T10:16:46.394318+00:00"
  },
  {
    "_id": "c09b7cf2a109686fc530f847",
    "name": "Mainboard cho CPU INTEL",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-cho-cpu-intel",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394385+00:00",
    "updatedAt": "2026-02-27T10:16:46.394385+00:00"
  },
  {
    "_id": "7d0eb88df927b977a843e656",
    "name": "Mainboard Intel B760",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-b760",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394454+00:00",
    "updatedAt": "2026-02-27T10:16:46.394454+00:00"
  },
  {
    "_id": "df604afb9b7e27e111c29e6b",
    "name": "Mainboard Intel Z790",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-z790",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394523+00:00",
    "updatedAt": "2026-02-27T10:16:46.394523+00:00"
  },
  {
    "_id": "84c57fd93dbb52c5fa8a4b1e",
    "name": "Mainboard Intel H410/H510",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-h410-h510",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394587+00:00",
    "updatedAt": "2026-02-27T10:16:46.394587+00:00"
  },
  {
    "_id": "88153dd8398bb8232f833625",
    "name": "Mainboard Intel H610",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-h610",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394655+00:00",
    "updatedAt": "2026-02-27T10:16:46.394655+00:00"
  },
  {
    "_id": "78cb7a0fbb6797dec7d0410b",
    "name": "Mainboard Intel B560",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-b560",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394719+00:00",
    "updatedAt": "2026-02-27T10:16:46.394719+00:00"
  },
  {
    "_id": "6dbae3e82245a13afad068d1",
    "name": "Mainboard Intel B660",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-b660",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394783+00:00",
    "updatedAt": "2026-02-27T10:16:46.394783+00:00"
  },
  {
    "_id": "f41b8b6bedf4a057d39e4a47",
    "name": "Mainboard Intel Z590",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-z590",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394847+00:00",
    "updatedAt": "2026-02-27T10:16:46.394847+00:00"
  },
  {
    "_id": "09c84d917dcdca0a2060409c",
    "name": "Mainboard Intel Z690",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-z690",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394909+00:00",
    "updatedAt": "2026-02-27T10:16:46.394909+00:00"
  },
  {
    "_id": "53102814db33ca9dcbdf36f0",
    "name": "Mainboard Intel X299",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-x299",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.394971+00:00",
    "updatedAt": "2026-02-27T10:16:46.394971+00:00"
  },
  {
    "_id": "bcfa28d7cb3e4c45e7141d01",
    "name": "Mainboard Intel Khác",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-khac",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395034+00:00",
    "updatedAt": "2026-02-27T10:16:46.395034+00:00"
  },
  {
    "_id": "61dd69c08869ec0bcbff91f7",
    "name": "Mainboard Intel H470",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-h470",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395099+00:00",
    "updatedAt": "2026-02-27T10:16:46.395099+00:00"
  },
  {
    "_id": "95911b7feed56a6c6e73d834",
    "name": "Mainboard Intel Z890",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-z890",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395162+00:00",
    "updatedAt": "2026-02-27T10:16:46.395162+00:00"
  },
  {
    "_id": "db2e7bb1e940bba0ba863bbe",
    "name": "Mainboard Intel B860",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-intel-b860",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395227+00:00",
    "updatedAt": "2026-02-27T10:16:46.395227+00:00"
  },
  {
    "_id": "1489e0cfaa5802191032a2d0",
    "name": "Mainboard cho CPU AMD",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-cho-cpu-amd",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395287+00:00",
    "updatedAt": "2026-02-27T10:16:46.395287+00:00"
  },
  {
    "_id": "4c8be007854964dda0ab32ef",
    "name": "Mainboard A520",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-a520",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395353+00:00",
    "updatedAt": "2026-02-27T10:16:46.395353+00:00"
  },
  {
    "_id": "3a62c60b99afae0c9ec5ace8",
    "name": "Mainboard AMD A320",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-amd-a320",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395416+00:00",
    "updatedAt": "2026-02-27T10:16:46.395416+00:00"
  },
  {
    "_id": "accf4e856bb342c957734456",
    "name": "Mainboard AMD B450",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-amd-b450",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395479+00:00",
    "updatedAt": "2026-02-27T10:16:46.395479+00:00"
  },
  {
    "_id": "d686ed492b40f59690904cab",
    "name": "Mainboard AMD B550",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-amd-b550",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395541+00:00",
    "updatedAt": "2026-02-27T10:16:46.395541+00:00"
  },
  {
    "_id": "324231e65e84b22e6d1c88d7",
    "name": "Mainboard AMD X570",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-amd-x570",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395605+00:00",
    "updatedAt": "2026-02-27T10:16:46.395605+00:00"
  },
  {
    "_id": "438e1cbfccba8af12f368090",
    "name": "Mainboard AMD TRX40",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-amd-trx40",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395668+00:00",
    "updatedAt": "2026-02-27T10:16:46.395668+00:00"
  },
  {
    "_id": "20d9862d418df36fd862cadc",
    "name": "Mainboard AMD X399",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-amd-x399",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395734+00:00",
    "updatedAt": "2026-02-27T10:16:46.395734+00:00"
  },
  {
    "_id": "2ebec1510c94ea269621d2fc",
    "name": "Mainboard AMD Khác",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-amd-khac",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395801+00:00",
    "updatedAt": "2026-02-27T10:16:46.395801+00:00"
  },
  {
    "_id": "dcddbf2752ec8d37e75074a5",
    "name": "Mainboard AMD B650",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-amd-b650",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395868+00:00",
    "updatedAt": "2026-02-27T10:16:46.395868+00:00"
  },
  {
    "_id": "65d630202a728a56292ed9ab",
    "name": "Mainboard AMD X870",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-amd-x870",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395933+00:00",
    "updatedAt": "2026-02-27T10:16:46.395933+00:00"
  },
  {
    "_id": "62d2408721e49841cc29c07a",
    "name": "Mainboard A620",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-a620",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.395997+00:00",
    "updatedAt": "2026-02-27T10:16:46.395997+00:00"
  },
  {
    "_id": "77a8845d9d23febb64798b29",
    "name": "Mainboard AMD B850",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-amd-b850",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396068+00:00",
    "updatedAt": "2026-02-27T10:16:46.396068+00:00"
  },
  {
    "_id": "dc7a7d0a81802396205f135f",
    "name": "Mainboard theo Hãng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-theo-hang",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396134+00:00",
    "updatedAt": "2026-02-27T10:16:46.396134+00:00"
  },
  {
    "_id": "f55d32bcffa262c8d24d2e91",
    "name": "Mainboard Asus",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-asus",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396202+00:00",
    "updatedAt": "2026-02-27T10:16:46.396202+00:00"
  },
  {
    "_id": "66f25a6f02cb0231150695d7",
    "name": "Mainboard Asrock",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-asrock",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396268+00:00",
    "updatedAt": "2026-02-27T10:16:46.396268+00:00"
  },
  {
    "_id": "c82108ef87eb1cf66f07dc9b",
    "name": "Mainboard Gigabyte",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-gigabyte",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396333+00:00",
    "updatedAt": "2026-02-27T10:16:46.396333+00:00"
  },
  {
    "_id": "afd25494a6360c707c1754ee",
    "name": "Mainboard MSI",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-msi",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396400+00:00",
    "updatedAt": "2026-02-27T10:16:46.396400+00:00"
  },
  {
    "_id": "4ccf53592ac9b1cf1af4f614",
    "name": "Mainboard Biostar",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mainboard-biostar",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396465+00:00",
    "updatedAt": "2026-02-27T10:16:46.396465+00:00"
  },
  {
    "_id": "1ad3583bceb17c497e64fa31",
    "name": "VGA - Card màn hình",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-card-man-hinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396525+00:00",
    "updatedAt": "2026-02-27T10:16:46.396525+00:00"
  },
  {
    "_id": "772a574c2353d3f2dcbf6254",
    "name": "VGA Nvidia RTX 5000 Series",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-nvidia-rtx-5000-series",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396590+00:00",
    "updatedAt": "2026-02-27T10:16:46.396590+00:00"
  },
  {
    "_id": "f886eb19a61820ed3a1f6c61",
    "name": "VGA RTX 5090",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-5090",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396659+00:00",
    "updatedAt": "2026-02-27T10:16:46.396659+00:00"
  },
  {
    "_id": "671af2f20f3d935be1a51fbe",
    "name": "VGA RTX 5080",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-5080",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396724+00:00",
    "updatedAt": "2026-02-27T10:16:46.396724+00:00"
  },
  {
    "_id": "39143a4b38caeb4f9426fb01",
    "name": "VGA RTX 5070 Ti",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-5070-ti",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396789+00:00",
    "updatedAt": "2026-02-27T10:16:46.396789+00:00"
  },
  {
    "_id": "0e229c68081ec53460d4dcf6",
    "name": "VGA RTX 5070",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-5070",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396856+00:00",
    "updatedAt": "2026-02-27T10:16:46.396856+00:00"
  },
  {
    "_id": "306a5418ec5193799bbf137a",
    "name": "VGA RTX 5060",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-5060",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396921+00:00",
    "updatedAt": "2026-02-27T10:16:46.396921+00:00"
  },
  {
    "_id": "556bf6d59346522a4eb9cdfe",
    "name": "VGA RTX 5060 Ti",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-5060-ti",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.396987+00:00",
    "updatedAt": "2026-02-27T10:16:46.396987+00:00"
  },
  {
    "_id": "4017c99c148cd733d9b54fec",
    "name": "VGA RTX 5050",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-5050",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397052+00:00",
    "updatedAt": "2026-02-27T10:16:46.397052+00:00"
  },
  {
    "_id": "06715497f4d6fd8edb6cf6f4",
    "name": "VGA NVIDIA",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-nvidia",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397113+00:00",
    "updatedAt": "2026-02-27T10:16:46.397113+00:00"
  },
  {
    "_id": "c65a0279ac2c4c6418271fee",
    "name": "VGA RTX 4090",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-4090",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397177+00:00",
    "updatedAt": "2026-02-27T10:16:46.397177+00:00"
  },
  {
    "_id": "5f61609acb8a48859c1b8726",
    "name": "VGA RTX 4080",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-4080",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397242+00:00",
    "updatedAt": "2026-02-27T10:16:46.397242+00:00"
  },
  {
    "_id": "a6513984b77773998be054d9",
    "name": "VGA RTX 4070Ti",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-4070ti",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397306+00:00",
    "updatedAt": "2026-02-27T10:16:46.397306+00:00"
  },
  {
    "_id": "32fca43654423099dcdd7154",
    "name": "VGA RTX 4070",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-4070",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397370+00:00",
    "updatedAt": "2026-02-27T10:16:46.397370+00:00"
  },
  {
    "_id": "36a305059b1dc8438768bcb2",
    "name": "VGA RTX 4060Ti",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-4060ti",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397436+00:00",
    "updatedAt": "2026-02-27T10:16:46.397436+00:00"
  },
  {
    "_id": "8ef818fbe80c9c4530cbd314",
    "name": "VGA RTX 3090",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-3090",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397502+00:00",
    "updatedAt": "2026-02-27T10:16:46.397502+00:00"
  },
  {
    "_id": "5084725c1950b116e99f7b36",
    "name": "VGA RTX 4060",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-4060",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397565+00:00",
    "updatedAt": "2026-02-27T10:16:46.397565+00:00"
  },
  {
    "_id": "d3526443d05a4d494b75a403",
    "name": "VGA RTX 3080",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-3080",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397629+00:00",
    "updatedAt": "2026-02-27T10:16:46.397629+00:00"
  },
  {
    "_id": "73ff0c55150cda76b25dbd04",
    "name": "VGA RTX 3070",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-3070",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397694+00:00",
    "updatedAt": "2026-02-27T10:16:46.397694+00:00"
  },
  {
    "_id": "39368e1fa2fd1182b3dd97f4",
    "name": "VGA RTX 3060",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-3060",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397759+00:00",
    "updatedAt": "2026-02-27T10:16:46.397759+00:00"
  },
  {
    "_id": "5cc17724d7d9f864100186a7",
    "name": "VGA RTX 3050",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-3050",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397830+00:00",
    "updatedAt": "2026-02-27T10:16:46.397830+00:00"
  },
  {
    "_id": "d01d10c0d720324843a3e6e0",
    "name": "VGA RTX 4070 Ti SUPER",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-4070-ti-super",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397898+00:00",
    "updatedAt": "2026-02-27T10:16:46.397898+00:00"
  },
  {
    "_id": "6ab4fc9c4e4f955f084ce45a",
    "name": "VGA RTX 4070 SUPER",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-4070-super",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.397966+00:00",
    "updatedAt": "2026-02-27T10:16:46.397966+00:00"
  },
  {
    "_id": "727758ce21aa97147821c353",
    "name": "VGA RTX 4080 SUPER",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-rtx-4080-super",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398032+00:00",
    "updatedAt": "2026-02-27T10:16:46.398032+00:00"
  },
  {
    "_id": "f3d9a5da3f91db08b6856114",
    "name": "VGA AMD",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-amd",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398095+00:00",
    "updatedAt": "2026-02-27T10:16:46.398095+00:00"
  },
  {
    "_id": "d2572865a69b39921ccbc376",
    "name": "RX 5700",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-5700",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398160+00:00",
    "updatedAt": "2026-02-27T10:16:46.398160+00:00"
  },
  {
    "_id": "c863c8176d6e8b467da06e1c",
    "name": "RX 7900 XTX",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-7900-xtx",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398226+00:00",
    "updatedAt": "2026-02-27T10:16:46.398226+00:00"
  },
  {
    "_id": "3f5ef6a21dc66022587e450b",
    "name": "RX 7800 XT",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-7800-xt",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398302+00:00",
    "updatedAt": "2026-02-27T10:16:46.398302+00:00"
  },
  {
    "_id": "11ca0c044cdea58754b394c4",
    "name": "RX 7900 XT",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-7900-xt",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398366+00:00",
    "updatedAt": "2026-02-27T10:16:46.398366+00:00"
  },
  {
    "_id": "7849233f6c38e081980b509f",
    "name": "RX 7700 XT",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-7700-xt",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398431+00:00",
    "updatedAt": "2026-02-27T10:16:46.398431+00:00"
  },
  {
    "_id": "2fccf5bf774cbe57c51583b1",
    "name": "RX 7600 XT",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-7600-xt",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398497+00:00",
    "updatedAt": "2026-02-27T10:16:46.398497+00:00"
  },
  {
    "_id": "46169cd563e7d1a20501918a",
    "name": "RX 7600",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-7600",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398563+00:00",
    "updatedAt": "2026-02-27T10:16:46.398563+00:00"
  },
  {
    "_id": "45217230e7ddb0c916c15e4b",
    "name": "AMD RADEON RX 9070",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "amd-radeon-rx-9070",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398627+00:00",
    "updatedAt": "2026-02-27T10:16:46.398627+00:00"
  },
  {
    "_id": "fb23fda0b114452102461c46",
    "name": "RX 6700",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-6700",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398695+00:00",
    "updatedAt": "2026-02-27T10:16:46.398695+00:00"
  },
  {
    "_id": "cfd475d7bc91b79e1bf6ba83",
    "name": "RX 6800",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-6800",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398759+00:00",
    "updatedAt": "2026-02-27T10:16:46.398759+00:00"
  },
  {
    "_id": "fc5303a1922f98f10496bfc8",
    "name": "RX 6600",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-6600",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398822+00:00",
    "updatedAt": "2026-02-27T10:16:46.398822+00:00"
  },
  {
    "_id": "2777599e7b355f282e879b4d",
    "name": "RX 6900",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-6900",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398885+00:00",
    "updatedAt": "2026-02-27T10:16:46.398885+00:00"
  },
  {
    "_id": "0e88995f26e94fbe409f3ea3",
    "name": "AMD RX 9060 XT",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "amd-rx-9060-xt",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.398950+00:00",
    "updatedAt": "2026-02-27T10:16:46.398950+00:00"
  },
  {
    "_id": "16b66ff7b68c1865f6382134",
    "name": "RX 580",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "rx-580",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.399018+00:00",
    "updatedAt": "2026-02-27T10:16:46.399018+00:00"
  },
  {
    "_id": "ccb52e7fafa7d09f5181060c",
    "name": "AMD RADEON RX 9070 XT",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "amd-radeon-rx-9070-xt",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.399084+00:00",
    "updatedAt": "2026-02-27T10:16:46.399084+00:00"
  },
  {
    "_id": "0fd4134918e676fe79e4fe9e",
    "name": "VGA theo Hãng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-theo-hang",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.399149+00:00",
    "updatedAt": "2026-02-27T10:16:46.399149+00:00"
  },
  {
    "_id": "d433af6bac63771485c89c47",
    "name": "VGA Asus",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-asus",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.399217+00:00",
    "updatedAt": "2026-02-27T10:16:46.399217+00:00"
  },
  {
    "_id": "1c38b3b04582110125e2d2b4",
    "name": "VGA Gigabyte",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-gigabyte",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.399282+00:00",
    "updatedAt": "2026-02-27T10:16:46.399282+00:00"
  },
  {
    "_id": "d2cc45136a3bdeacf1177264",
    "name": "VGA MSI",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-msi",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.399521+00:00",
    "updatedAt": "2026-02-27T10:16:46.399521+00:00"
  },
  {
    "_id": "4563ff3e8a2127dae0ef5e7c",
    "name": "VGA Inno3D",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-inno3d",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.399593+00:00",
    "updatedAt": "2026-02-27T10:16:46.399593+00:00"
  },
  {
    "_id": "25c66deab6c8cffe70c4ebb2",
    "name": "VGA Palit",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-palit",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.399661+00:00",
    "updatedAt": "2026-02-27T10:16:46.399661+00:00"
  },
  {
    "_id": "32ce0c2a0da06030b9a64dc7",
    "name": "VGA Quadro",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-quadro",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.399729+00:00",
    "updatedAt": "2026-02-27T10:16:46.399729+00:00"
  },
  {
    "_id": "6dfcbbe7040281befead67a2",
    "name": "VGA GALAX",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-galax",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.399986+00:00",
    "updatedAt": "2026-02-27T10:16:46.399986+00:00"
  },
  {
    "_id": "af5983ebe92300bdf852b078",
    "name": "VGA Leadtek",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-leadtek",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400147+00:00",
    "updatedAt": "2026-02-27T10:16:46.400147+00:00"
  },
  {
    "_id": "721a8b67123553aab3237d9f",
    "name": "VGA Zotac",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-zotac",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400300+00:00",
    "updatedAt": "2026-02-27T10:16:46.400300+00:00"
  },
  {
    "_id": "cc47249dd2827167dd4f867e",
    "name": "VGA Biostar",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-biostar",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400387+00:00",
    "updatedAt": "2026-02-27T10:16:46.400387+00:00"
  },
  {
    "_id": "5139221b191c03f571a10d95",
    "name": "VGA PNY",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-pny",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400457+00:00",
    "updatedAt": "2026-02-27T10:16:46.400457+00:00"
  },
  {
    "_id": "785a4b5f8f4ff2baf8a60a4a",
    "name": "VGA AFOX",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-afox",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400524+00:00",
    "updatedAt": "2026-02-27T10:16:46.400524+00:00"
  },
  {
    "_id": "dbf3e5712587e6ca89fb2cee",
    "name": "VGA Colorful",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-colorful",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400590+00:00",
    "updatedAt": "2026-02-27T10:16:46.400590+00:00"
  },
  {
    "_id": "7032cf76d67b3d1cfd91cfcb",
    "name": "VGA ASROCK",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-asrock",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400660+00:00",
    "updatedAt": "2026-02-27T10:16:46.400660+00:00"
  },
  {
    "_id": "a2eb68caacec7754e8032f22",
    "name": "VGA Yeston",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-yeston",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400727+00:00",
    "updatedAt": "2026-02-27T10:16:46.400727+00:00"
  },
  {
    "_id": "1d469186593122e9c94ca327",
    "name": "VGA SAPPHIRE",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-sapphire",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400791+00:00",
    "updatedAt": "2026-02-27T10:16:46.400791+00:00"
  },
  {
    "_id": "c0051333fda9306d3808e182",
    "name": "VGA OCPC",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-ocpc",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400856+00:00",
    "updatedAt": "2026-02-27T10:16:46.400856+00:00"
  },
  {
    "_id": "45af00d219915a1ca1ed07ca",
    "name": "VGA Dung Lượng VRAM",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-dung-luong-vram",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400918+00:00",
    "updatedAt": "2026-02-27T10:16:46.400918+00:00"
  },
  {
    "_id": "29184f7f31331744f4334a59",
    "name": "VGA 1GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-1gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.400992+00:00",
    "updatedAt": "2026-02-27T10:16:46.400992+00:00"
  },
  {
    "_id": "117011c82a25ae3d9474330b",
    "name": "VGA 2GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-2gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401059+00:00",
    "updatedAt": "2026-02-27T10:16:46.401059+00:00"
  },
  {
    "_id": "1262a5cce424ab590dc8658f",
    "name": "VGA 4GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-4gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401127+00:00",
    "updatedAt": "2026-02-27T10:16:46.401127+00:00"
  },
  {
    "_id": "1ad25144c14a39c587136ae9",
    "name": "VGA 6GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-6gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401192+00:00",
    "updatedAt": "2026-02-27T10:16:46.401192+00:00"
  },
  {
    "_id": "fcdb4f9db724902e1a4b2450",
    "name": "VGA 8GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-8gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401259+00:00",
    "updatedAt": "2026-02-27T10:16:46.401259+00:00"
  },
  {
    "_id": "4103d18cc6535150821057fe",
    "name": "VGA 10GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-10gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401326+00:00",
    "updatedAt": "2026-02-27T10:16:46.401326+00:00"
  },
  {
    "_id": "8134c65679fa3ef883332e90",
    "name": "VGA 12GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-12gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401392+00:00",
    "updatedAt": "2026-02-27T10:16:46.401392+00:00"
  },
  {
    "_id": "293a9b1d18a4fbb13c11c588",
    "name": "VGA 16GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-16gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401457+00:00",
    "updatedAt": "2026-02-27T10:16:46.401457+00:00"
  },
  {
    "_id": "a65140c5b6b9476e53c6c98a",
    "name": "VGA 24GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "vga-24gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401520+00:00",
    "updatedAt": "2026-02-27T10:16:46.401520+00:00"
  },
  {
    "_id": "5aabab2a1b6e24a858e2fe94",
    "name": "32GB VRAM",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "32gb-vram",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401583+00:00",
    "updatedAt": "2026-02-27T10:16:46.401583+00:00"
  },
  {
    "_id": "169d339c0df4b0e29888bd19",
    "name": "RAM - Bộ nhớ trong",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-bo-nho-trong",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401643+00:00",
    "updatedAt": "2026-02-27T10:16:46.401643+00:00"
  },
  {
    "_id": "04385fde07a9267ef7d59b39",
    "name": "RAM DDR4",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-ddr4",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401711+00:00",
    "updatedAt": "2026-02-27T10:16:46.401711+00:00"
  },
  {
    "_id": "a6cac70b5a20e9a1363b3321",
    "name": "RAM DDR5",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-ddr5",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401773+00:00",
    "updatedAt": "2026-02-27T10:16:46.401773+00:00"
  },
  {
    "_id": "b775770357c28b3a993c1370",
    "name": "Dung Lượng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "dung-luong",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401834+00:00",
    "updatedAt": "2026-02-27T10:16:46.401834+00:00"
  },
  {
    "_id": "642014ec1f8f153853f0f6b0",
    "name": "4GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "4gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401903+00:00",
    "updatedAt": "2026-02-27T10:16:46.401903+00:00"
  },
  {
    "_id": "12350b0ca8dc6b178fcbaed9",
    "name": "8GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "8gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.401970+00:00",
    "updatedAt": "2026-02-27T10:16:46.401970+00:00"
  },
  {
    "_id": "b8c3c643115bf5620ce06013",
    "name": "16GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "16gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402041+00:00",
    "updatedAt": "2026-02-27T10:16:46.402041+00:00"
  },
  {
    "_id": "19a645744ba111b4234559ae",
    "name": "32GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "32gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402110+00:00",
    "updatedAt": "2026-02-27T10:16:46.402110+00:00"
  },
  {
    "_id": "e47adb571ad4d97f24e22359",
    "name": ">64GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "64gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402173+00:00",
    "updatedAt": "2026-02-27T10:16:46.402173+00:00"
  },
  {
    "_id": "3a6d866aec9588f6954bafea",
    "name": "BUS RAM",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-ram",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402235+00:00",
    "updatedAt": "2026-02-27T10:16:46.402235+00:00"
  },
  {
    "_id": "7703beda727d6d740ff62a7c",
    "name": "bus 2400",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-2400",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402300+00:00",
    "updatedAt": "2026-02-27T10:16:46.402300+00:00"
  },
  {
    "_id": "ade45e5d8b55351c0cf24775",
    "name": "bus 2666",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-2666",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402370+00:00",
    "updatedAt": "2026-02-27T10:16:46.402370+00:00"
  },
  {
    "_id": "6dad3473193696218d71e163",
    "name": "bus 2800",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-2800",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402436+00:00",
    "updatedAt": "2026-02-27T10:16:46.402436+00:00"
  },
  {
    "_id": "cdc21a62c38539eff4a43ffe",
    "name": "bus 3000",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-3000",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402501+00:00",
    "updatedAt": "2026-02-27T10:16:46.402501+00:00"
  },
  {
    "_id": "e277c3236aea8b76de28e448",
    "name": "bus 3200",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-3200",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402566+00:00",
    "updatedAt": "2026-02-27T10:16:46.402566+00:00"
  },
  {
    "_id": "fa523f904845ff6ab62c6a46",
    "name": "bus 3600",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-3600",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402629+00:00",
    "updatedAt": "2026-02-27T10:16:46.402629+00:00"
  },
  {
    "_id": "cd55112e161fe3de23447036",
    "name": "bus 4800",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-4800",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402692+00:00",
    "updatedAt": "2026-02-27T10:16:46.402692+00:00"
  },
  {
    "_id": "a5a2d802e77938914d61c409",
    "name": "bus 5200",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-5200",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402759+00:00",
    "updatedAt": "2026-02-27T10:16:46.402759+00:00"
  },
  {
    "_id": "4c103cbbce32f890727e878d",
    "name": "bus 5600",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-5600",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402822+00:00",
    "updatedAt": "2026-02-27T10:16:46.402822+00:00"
  },
  {
    "_id": "99dd261d95f82b6cdf8bbd13",
    "name": "bus 6000",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-6000",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402884+00:00",
    "updatedAt": "2026-02-27T10:16:46.402884+00:00"
  },
  {
    "_id": "bcfb6ebc0d83454ef31719d7",
    "name": "bus 6200",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "bus-6200",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.402948+00:00",
    "updatedAt": "2026-02-27T10:16:46.402948+00:00"
  },
  {
    "_id": "ff91d13ef50b25f9c9d7b781",
    "name": "Theo Hãng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "theo-hang",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403009+00:00",
    "updatedAt": "2026-02-27T10:16:46.403009+00:00"
  },
  {
    "_id": "7c0fecf38cb644f551fa260e",
    "name": "RAM Corsair",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-corsair",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403074+00:00",
    "updatedAt": "2026-02-27T10:16:46.403074+00:00"
  },
  {
    "_id": "08778d41f16d51a4e927be69",
    "name": "RAM Gskill",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-gskill",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403140+00:00",
    "updatedAt": "2026-02-27T10:16:46.403140+00:00"
  },
  {
    "_id": "556eabc3e296cdf4ea755c96",
    "name": "RAM Kingmax",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-kingmax",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403205+00:00",
    "updatedAt": "2026-02-27T10:16:46.403205+00:00"
  },
  {
    "_id": "1237af70c330e6b7a335b19f",
    "name": "RAM Kingston",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-kingston",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403270+00:00",
    "updatedAt": "2026-02-27T10:16:46.403270+00:00"
  },
  {
    "_id": "4c627d239261866abb15d446",
    "name": "RAM Silicon power",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-silicon-power",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403335+00:00",
    "updatedAt": "2026-02-27T10:16:46.403335+00:00"
  },
  {
    "_id": "868b414f0ae207ff71791910",
    "name": "Ram Adata",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-adata",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403399+00:00",
    "updatedAt": "2026-02-27T10:16:46.403399+00:00"
  },
  {
    "_id": "10cc2b43c5261821dccb2453",
    "name": "Ram Lexar",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-lexar",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403462+00:00",
    "updatedAt": "2026-02-27T10:16:46.403462+00:00"
  },
  {
    "_id": "a4201ce8ee6dd60d6e66ee4c",
    "name": "RAM GIGAYBTE",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-gigaybte",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403525+00:00",
    "updatedAt": "2026-02-27T10:16:46.403525+00:00"
  },
  {
    "_id": "4751cf2d3feee38b04263eae",
    "name": "RAM TEAM GROUP",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-team-group",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403589+00:00",
    "updatedAt": "2026-02-27T10:16:46.403589+00:00"
  },
  {
    "_id": "e6b6f9fb2c3ff2adc2c833af",
    "name": "RAM APACER",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-apacer",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403654+00:00",
    "updatedAt": "2026-02-27T10:16:46.403654+00:00"
  },
  {
    "_id": "6b9118a456e469fa20000535",
    "name": "RAM GEIL",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ram-geil",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403717+00:00",
    "updatedAt": "2026-02-27T10:16:46.403717+00:00"
  },
  {
    "_id": "39fa43d66b785b419909a902",
    "name": "Theo Tính Năng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "theo-tinh-nang",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403778+00:00",
    "updatedAt": "2026-02-27T10:16:46.403778+00:00"
  },
  {
    "_id": "bd9e86aa3c9668ca18d271f1",
    "name": "có LED",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "co-led",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403846+00:00",
    "updatedAt": "2026-02-27T10:16:46.403846+00:00"
  },
  {
    "_id": "33b6162278f3ab080cf58e47",
    "name": "Tản nhiệt",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "tan-nhiet",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403914+00:00",
    "updatedAt": "2026-02-27T10:16:46.403914+00:00"
  },
  {
    "_id": "b011d3ac1a54674162735945",
    "name": "Case - Vỏ máy tính",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "case-vo-may-tinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.403976+00:00",
    "updatedAt": "2026-02-27T10:16:46.403976+00:00"
  },
  {
    "_id": "dd87d646517a1b5bb921f82a",
    "name": "E-dra",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "e-dra",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404052+00:00",
    "updatedAt": "2026-02-27T10:16:46.404052+00:00"
  },
  {
    "_id": "265909a9f514cec320cdaf77",
    "name": "Kenoo",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "kenoo",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404119+00:00",
    "updatedAt": "2026-02-27T10:16:46.404119+00:00"
  },
  {
    "_id": "c1fab9bb7e6090d8a1ba6610",
    "name": "Lianli",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "lianli",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404182+00:00",
    "updatedAt": "2026-02-27T10:16:46.404182+00:00"
  },
  {
    "_id": "913bd3cf641d429c9cc1f8b5",
    "name": "NZXT",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "nzxt",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404247+00:00",
    "updatedAt": "2026-02-27T10:16:46.404247+00:00"
  },
  {
    "_id": "4c1b7b06e3d179cfcf8a32ee",
    "name": "Jonsbo",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "jonsbo",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404311+00:00",
    "updatedAt": "2026-02-27T10:16:46.404311+00:00"
  },
  {
    "_id": "b750505339ef55b628308ae3",
    "name": "Sama",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "sama",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404374+00:00",
    "updatedAt": "2026-02-27T10:16:46.404374+00:00"
  },
  {
    "_id": "da82a82616d16e684255fe5b",
    "name": "Orient",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "orient",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404437+00:00",
    "updatedAt": "2026-02-27T10:16:46.404437+00:00"
  },
  {
    "_id": "528bebd229e9302d79058906",
    "name": "Antec",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "antec",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404498+00:00",
    "updatedAt": "2026-02-27T10:16:46.404498+00:00"
  },
  {
    "_id": "b4b4c7cb5538ec6084236394",
    "name": "ASUS",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "asus",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404561+00:00",
    "updatedAt": "2026-02-27T10:16:46.404561+00:00"
  },
  {
    "_id": "5976cc96093079f9fc4ac7a0",
    "name": "Gigabyte",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "gigabyte",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404624+00:00",
    "updatedAt": "2026-02-27T10:16:46.404624+00:00"
  },
  {
    "_id": "3402aeef75d4dd47ec3edf60",
    "name": "Xigmatek",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "xigmatek",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404688+00:00",
    "updatedAt": "2026-02-27T10:16:46.404688+00:00"
  },
  {
    "_id": "01c0822275627ffffedf238e",
    "name": "Corsair",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "corsair",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404750+00:00",
    "updatedAt": "2026-02-27T10:16:46.404750+00:00"
  },
  {
    "_id": "171f53ccedf7a62bc9e1c018",
    "name": "CoolerMaster",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "coolermaster",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404812+00:00",
    "updatedAt": "2026-02-27T10:16:46.404812+00:00"
  },
  {
    "_id": "875b0c8ec1be4ab793200de9",
    "name": "MIK",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mik",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404877+00:00",
    "updatedAt": "2026-02-27T10:16:46.404877+00:00"
  },
  {
    "_id": "26d8ae4546f3dac69b7253f9",
    "name": "MSI",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "msi",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.404939+00:00",
    "updatedAt": "2026-02-27T10:16:46.404939+00:00"
  },
  {
    "_id": "c4f4ebbd89b759a868e3fd4d",
    "name": "Thermaltake",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "thermaltake",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405001+00:00",
    "updatedAt": "2026-02-27T10:16:46.405001+00:00"
  },
  {
    "_id": "2905bdc96de0c7c0ccd911e8",
    "name": "Theo Màu Sắc",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "theo-mau-sac",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405060+00:00",
    "updatedAt": "2026-02-27T10:16:46.405060+00:00"
  },
  {
    "_id": "1c7f88541fe037e64c75b1fa",
    "name": "màu Trắng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mau-trang",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405125+00:00",
    "updatedAt": "2026-02-27T10:16:46.405125+00:00"
  },
  {
    "_id": "6e1bd83688dce3e150a3dd03",
    "name": "màu Đen",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mau-den",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405191+00:00",
    "updatedAt": "2026-02-27T10:16:46.405191+00:00"
  },
  {
    "_id": "7fee547a25d952bb1e1314b6",
    "name": "màu Hồng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mau-hong",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405259+00:00",
    "updatedAt": "2026-02-27T10:16:46.405259+00:00"
  },
  {
    "_id": "007ac5f4be9cbced0d28acd7",
    "name": "Theo Kích Thước",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "theo-kich-thuoc",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405322+00:00",
    "updatedAt": "2026-02-27T10:16:46.405322+00:00"
  },
  {
    "_id": "25a9e500068cfc116a1b0435",
    "name": "Mini Tower",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mini-tower",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405390+00:00",
    "updatedAt": "2026-02-27T10:16:46.405390+00:00"
  },
  {
    "_id": "503df1dff619447c5cfa667b",
    "name": "Mid Tower",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mid-tower",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405457+00:00",
    "updatedAt": "2026-02-27T10:16:46.405457+00:00"
  },
  {
    "_id": "fbf6c75b86ad4764751b809c",
    "name": "Full Tower",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "full-tower",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405524+00:00",
    "updatedAt": "2026-02-27T10:16:46.405524+00:00"
  },
  {
    "_id": "9f8a57864d66eb62a14b84bb",
    "name": "Supper Full Tower",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "supper-full-tower",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405590+00:00",
    "updatedAt": "2026-02-27T10:16:46.405590+00:00"
  },
  {
    "_id": "41f1d6af07b5575282199411",
    "name": "m-ATX",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "m-atx",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405662+00:00",
    "updatedAt": "2026-02-27T10:16:46.405662+00:00"
  },
  {
    "_id": "bff15aac35b6f518912a0848",
    "name": "PSU - Nguồn máy tính",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "psu-nguon-may-tinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405735+00:00",
    "updatedAt": "2026-02-27T10:16:46.405735+00:00"
  },
  {
    "_id": "efe1fca25cd8a10f68830817",
    "name": "Kích Cỡ",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "kich-co",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405805+00:00",
    "updatedAt": "2026-02-27T10:16:46.405805+00:00"
  },
  {
    "_id": "6169fff03ec87f4a70a783b5",
    "name": "ATX",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "atx",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405873+00:00",
    "updatedAt": "2026-02-27T10:16:46.405873+00:00"
  },
  {
    "_id": "bba359a677a877d4cfce87ce",
    "name": "Flex ATX",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "flex-atx",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.405940+00:00",
    "updatedAt": "2026-02-27T10:16:46.405940+00:00"
  },
  {
    "_id": "db5acead60b3bd9893a67775",
    "name": "SFX",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "sfx",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406022+00:00",
    "updatedAt": "2026-02-27T10:16:46.406022+00:00"
  },
  {
    "_id": "74ea35a7674d023983d9ac67",
    "name": "FSP",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "fsp",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406106+00:00",
    "updatedAt": "2026-02-27T10:16:46.406106+00:00"
  },
  {
    "_id": "9f64aa3565aabaa4dde57876",
    "name": "GIGABYTE",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "gigabyte-1",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406176+00:00",
    "updatedAt": "2026-02-27T10:16:46.406176+00:00"
  },
  {
    "_id": "710b1ace22af525780e0a745",
    "name": "KENOO",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "kenoo-1",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406248+00:00",
    "updatedAt": "2026-02-27T10:16:46.406248+00:00"
  },
  {
    "_id": "8c054cd4f65ebfe6b766f078",
    "name": "SEASONIC",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "seasonic",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406322+00:00",
    "updatedAt": "2026-02-27T10:16:46.406322+00:00"
  },
  {
    "_id": "af00cc6f4bcf844a1c61f5ed",
    "name": "SUPER FLOWER",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "super-flower",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406392+00:00",
    "updatedAt": "2026-02-27T10:16:46.406392+00:00"
  },
  {
    "_id": "179edb7b43e59c77e217875a",
    "name": "THERMALTAKE",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "thermaltake-1",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406461+00:00",
    "updatedAt": "2026-02-27T10:16:46.406461+00:00"
  },
  {
    "_id": "882c677e81a1d3bfa62e995a",
    "name": "Chuẩn Nguồn",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "chuan-nguon",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406527+00:00",
    "updatedAt": "2026-02-27T10:16:46.406527+00:00"
  },
  {
    "_id": "32ecb668fd9e163d5e0f26d5",
    "name": "80 Plus",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "80-plus",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406599+00:00",
    "updatedAt": "2026-02-27T10:16:46.406599+00:00"
  },
  {
    "_id": "e9bb3ad3028a9d9293808f6b",
    "name": "80 Plus Bronze",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "80-plus-bronze",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406668+00:00",
    "updatedAt": "2026-02-27T10:16:46.406668+00:00"
  },
  {
    "_id": "c6fb22ad1d86227ba751b1d8",
    "name": "80 Plus Gold",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "80-plus-gold",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.406743+00:00",
    "updatedAt": "2026-02-27T10:16:46.406743+00:00"
  },
  {
    "_id": "14501dd177f0007fb9595dcd",
    "name": "80 Plus Platinum",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "80-plus-platinum",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.407236+00:00",
    "updatedAt": "2026-02-27T10:16:46.407236+00:00"
  },
  {
    "_id": "a93ed5c60ce10ab3b7447f29",
    "name": "80 Plus Titanium",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "80-plus-titanium",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.407438+00:00",
    "updatedAt": "2026-02-27T10:16:46.407438+00:00"
  },
  {
    "_id": "f1d053b39308ef6de2b8ed9e",
    "name": "Theo Công Suất",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "theo-cong-suat",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.407526+00:00",
    "updatedAt": "2026-02-27T10:16:46.407526+00:00"
  },
  {
    "_id": "cdba36fed78eb4f8636ceeb4",
    "name": "Nguồn dưới 400W",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "nguon-duoi-400w",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.407600+00:00",
    "updatedAt": "2026-02-27T10:16:46.407600+00:00"
  },
  {
    "_id": "3922be30d74f3314176531b1",
    "name": "Nguồn từ  400W - 550W",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "nguon-tu-400w-550w",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.407671+00:00",
    "updatedAt": "2026-02-27T10:16:46.407671+00:00"
  },
  {
    "_id": "632a50dde00011266681173d",
    "name": "Nguồn  từ  550W - 650W",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "nguon-tu-550w-650w",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.407742+00:00",
    "updatedAt": "2026-02-27T10:16:46.407742+00:00"
  },
  {
    "_id": "18de78bd7c3bd5d5ff94bf62",
    "name": "Nguồn  từ  650W - 800W",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "nguon-tu-650w-800w",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.407817+00:00",
    "updatedAt": "2026-02-27T10:16:46.407817+00:00"
  },
  {
    "_id": "bc783ae799bee7791e1e4383",
    "name": "Nguồn từ  800W - 1000W",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "nguon-tu-800w-1000w",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.407889+00:00",
    "updatedAt": "2026-02-27T10:16:46.407889+00:00"
  },
  {
    "_id": "1cca77c0bc98e4d29be69740",
    "name": "Nguồn trên 1000W",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "nguon-tren-1000w",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.407957+00:00",
    "updatedAt": "2026-02-27T10:16:46.407957+00:00"
  },
  {
    "_id": "75d58cc6c53944a0e06d3bc0",
    "name": "Ổ cứng HDD",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-hdd",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408020+00:00",
    "updatedAt": "2026-02-27T10:16:46.408020+00:00"
  },
  {
    "_id": "db418d4390b94e3f89da3571",
    "name": "Ổ Cứng HDD Theo Hãng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-hdd-theo-hang",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408084+00:00",
    "updatedAt": "2026-02-27T10:16:46.408084+00:00"
  },
  {
    "_id": "1cfa6dc715d960e957203ef3",
    "name": "Ổ Cứng Desktop Seagate",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-seagate",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408154+00:00",
    "updatedAt": "2026-02-27T10:16:46.408154+00:00"
  },
  {
    "_id": "bede99549301c8cfcfeff45d",
    "name": "Ổ Cứng Desktop Toshiba",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-toshiba",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408222+00:00",
    "updatedAt": "2026-02-27T10:16:46.408222+00:00"
  },
  {
    "_id": "0624da268872368394b896d0",
    "name": "Ổ Cứng Desktop Western Digital",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-western-digital",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408293+00:00",
    "updatedAt": "2026-02-27T10:16:46.408293+00:00"
  },
  {
    "_id": "fe31e51a6c35bfcd7e53ed37",
    "name": "Ổ Cứng HDD Theo Dung Lượng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-hdd-theo-dung-luong",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408361+00:00",
    "updatedAt": "2026-02-27T10:16:46.408361+00:00"
  },
  {
    "_id": "fc8beb24c9d4dd2a299dc7bc",
    "name": "Ổ Cứng Desktop 500GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-500gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408433+00:00",
    "updatedAt": "2026-02-27T10:16:46.408433+00:00"
  },
  {
    "_id": "7b831956b8ccc30e33f33c40",
    "name": "Ổ Cứng Desktop 1TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-1tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408503+00:00",
    "updatedAt": "2026-02-27T10:16:46.408503+00:00"
  },
  {
    "_id": "d788896d03aac57231a04712",
    "name": "Ổ Cứng Desktop 2TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-2tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408574+00:00",
    "updatedAt": "2026-02-27T10:16:46.408574+00:00"
  },
  {
    "_id": "c12a25c2278bce7f88f2eff9",
    "name": "Ổ Cứng Desktop 3TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-3tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408643+00:00",
    "updatedAt": "2026-02-27T10:16:46.408643+00:00"
  },
  {
    "_id": "fc3518ac4d32d6f6861aa721",
    "name": "Ổ Cứng Desktop 4TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-4tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408715+00:00",
    "updatedAt": "2026-02-27T10:16:46.408715+00:00"
  },
  {
    "_id": "cac82d3ee049d5084ab36fcb",
    "name": "Ổ Cứng Desktop 6TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-6tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408786+00:00",
    "updatedAt": "2026-02-27T10:16:46.408786+00:00"
  },
  {
    "_id": "2f4192f72643d151ac434a7e",
    "name": "Ổ Cứng Desktop 8TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-8tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408858+00:00",
    "updatedAt": "2026-02-27T10:16:46.408858+00:00"
  },
  {
    "_id": "9f917d23e390e4bbd6c292ad",
    "name": "Ổ Cứng Desktop 10TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-10tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.408932+00:00",
    "updatedAt": "2026-02-27T10:16:46.408932+00:00"
  },
  {
    "_id": "5e3d6750b6bf5c5b94178a43",
    "name": "Ổ Cứng Desktop 12TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-12tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.409002+00:00",
    "updatedAt": "2026-02-27T10:16:46.409002+00:00"
  },
  {
    "_id": "c0c5f269477e1f9abd670131",
    "name": "Ổ Cứng Desktop Trên 12TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-tren-12tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.409083+00:00",
    "updatedAt": "2026-02-27T10:16:46.409083+00:00"
  },
  {
    "_id": "9f993cd7a5adef07eabd6b65",
    "name": "Ổ Cứng HDD Theo Tốc Độ Vòng Quay",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-hdd-theo-toc-do-vong-quay",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.409155+00:00",
    "updatedAt": "2026-02-27T10:16:46.409155+00:00"
  },
  {
    "_id": "16996437fc1408b7a0028b44",
    "name": "Ổ Cứng Desktop 5400RPM",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-5400rpm",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.409229+00:00",
    "updatedAt": "2026-02-27T10:16:46.409229+00:00"
  },
  {
    "_id": "7e6e5d493a39cb1ad771034c",
    "name": "Ổ Cứng Desktop 5700RPM",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-5700rpm",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.409299+00:00",
    "updatedAt": "2026-02-27T10:16:46.409299+00:00"
  },
  {
    "_id": "e3c5da07800d199368fa3b11",
    "name": "Ổ Cứng Desktop 5900RPM",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-5900rpm",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.409369+00:00",
    "updatedAt": "2026-02-27T10:16:46.409369+00:00"
  },
  {
    "_id": "1d4718171596078f2b81cf58",
    "name": "Ổ Cứng Desktop 7200RPM",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-desktop-7200rpm",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.409443+00:00",
    "updatedAt": "2026-02-27T10:16:46.409443+00:00"
  },
  {
    "_id": "092af5114ec98c3993f6d438",
    "name": "Ổ cứng SSD",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.409697+00:00",
    "updatedAt": "2026-02-27T10:16:46.409697+00:00"
  },
  {
    "_id": "1573a0abbe71c3a20f4c972e",
    "name": "SSD Theo Hãng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ssd-theo-hang",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.409776+00:00",
    "updatedAt": "2026-02-27T10:16:46.409776+00:00"
  },
  {
    "_id": "e1d430496d90445486a73006",
    "name": "Ổ Cứng SSD GIGABYTE",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-gigabyte",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.409888+00:00",
    "updatedAt": "2026-02-27T10:16:46.409888+00:00"
  },
  {
    "_id": "c42836eafcab44c47853fb88",
    "name": "Ổ Cứng SSD SamSung",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-samsung",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410000+00:00",
    "updatedAt": "2026-02-27T10:16:46.410000+00:00"
  },
  {
    "_id": "27d96a31e74ec54a87e3b945",
    "name": "Ổ Cứng SSD Intel",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-intel",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410078+00:00",
    "updatedAt": "2026-02-27T10:16:46.410078+00:00"
  },
  {
    "_id": "9875ecdf0183321484712d51",
    "name": "Ổ Cứng SSD Western Digital",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-western-digital",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410149+00:00",
    "updatedAt": "2026-02-27T10:16:46.410149+00:00"
  },
  {
    "_id": "c10a6d0aab497f6bec1502f3",
    "name": "Ổ Cứng SSD Kingston",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-kingston",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410228+00:00",
    "updatedAt": "2026-02-27T10:16:46.410228+00:00"
  },
  {
    "_id": "722ecafaf9906fe984c66dd9",
    "name": "Ổ Cứng SSD SiliconPower",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-siliconpower",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410301+00:00",
    "updatedAt": "2026-02-27T10:16:46.410301+00:00"
  },
  {
    "_id": "5f2bbb0116775f36a3afe12e",
    "name": "Ổ Cứng SSD TEAMGROUP",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-teamgroup",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410372+00:00",
    "updatedAt": "2026-02-27T10:16:46.410372+00:00"
  },
  {
    "_id": "1831a1c90ef58d7757944122",
    "name": "Ổ Cứng SSD Adata",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-adata",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410442+00:00",
    "updatedAt": "2026-02-27T10:16:46.410442+00:00"
  },
  {
    "_id": "f2218a5cbe4e4a8b9229ce71",
    "name": "Ổ Cứng SSD Biostar",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-biostar",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410512+00:00",
    "updatedAt": "2026-02-27T10:16:46.410512+00:00"
  },
  {
    "_id": "1f4033e2da9931278ab13b0d",
    "name": "Ổ Cứng SSD Afox",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-afox",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410582+00:00",
    "updatedAt": "2026-02-27T10:16:46.410582+00:00"
  },
  {
    "_id": "f8c2d1ea54296c3e2beb48f4",
    "name": "Ổ cứng SSD Kioxia",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-kioxia",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410650+00:00",
    "updatedAt": "2026-02-27T10:16:46.410650+00:00"
  },
  {
    "_id": "22e06f803cf76be13d05a1bb",
    "name": "SSD Dung Lượng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ssd-dung-luong",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410731+00:00",
    "updatedAt": "2026-02-27T10:16:46.410731+00:00"
  },
  {
    "_id": "fc18cbfaba3d74cacdd1e0cc",
    "name": "Ổ Cứng SSD 120GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-120gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410818+00:00",
    "updatedAt": "2026-02-27T10:16:46.410818+00:00"
  },
  {
    "_id": "edc9502465178265be09f1ed",
    "name": "Ổ Cứng SSD 128GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-128gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410894+00:00",
    "updatedAt": "2026-02-27T10:16:46.410894+00:00"
  },
  {
    "_id": "e4719401df626f89b30eb248",
    "name": "Ổ Cứng SSD 240GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-240gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.410965+00:00",
    "updatedAt": "2026-02-27T10:16:46.410965+00:00"
  },
  {
    "_id": "9b8e1cee947003ea6ca41325",
    "name": "Ổ Cứng SSD 250GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-250gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411034+00:00",
    "updatedAt": "2026-02-27T10:16:46.411034+00:00"
  },
  {
    "_id": "0dae46b66adc6b90ec3d7ffe",
    "name": "Ổ Cứng SSD 256GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-256gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411104+00:00",
    "updatedAt": "2026-02-27T10:16:46.411104+00:00"
  },
  {
    "_id": "3b1d1b0cb8f2a4c265357d7d",
    "name": "Ổ Cứng SSD 480GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-480gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411169+00:00",
    "updatedAt": "2026-02-27T10:16:46.411169+00:00"
  },
  {
    "_id": "e4bd2ef5a4c2ce732140b6c1",
    "name": "Ổ Cứng SSD 500GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-500gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411234+00:00",
    "updatedAt": "2026-02-27T10:16:46.411234+00:00"
  },
  {
    "_id": "2997dac33b111008dfed52ea",
    "name": "Ổ Cứng SSD 512GB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-512gb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411299+00:00",
    "updatedAt": "2026-02-27T10:16:46.411299+00:00"
  },
  {
    "_id": "5098e738045f6b27a04e66ce",
    "name": "Ổ Cứng SSD 1TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-1tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411365+00:00",
    "updatedAt": "2026-02-27T10:16:46.411365+00:00"
  },
  {
    "_id": "fb512a66b57b07290bec82f4",
    "name": "Ổ Cứng SSD 2TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-2tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411435+00:00",
    "updatedAt": "2026-02-27T10:16:46.411435+00:00"
  },
  {
    "_id": "6fe2e9c45af72dd3562bd218",
    "name": "Ổ Cứng SSD 4TB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-4tb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411499+00:00",
    "updatedAt": "2026-02-27T10:16:46.411499+00:00"
  },
  {
    "_id": "e88a38068719f3dee908313f",
    "name": "Loại Ổ Cứng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "loai-o-cung",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411563+00:00",
    "updatedAt": "2026-02-27T10:16:46.411563+00:00"
  },
  {
    "_id": "39c4ead8b6263e8d36e77348",
    "name": "Ổ cứng SSD SATA 2.5",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-sata-2-5",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411697+00:00",
    "updatedAt": "2026-02-27T10:16:46.411697+00:00"
  },
  {
    "_id": "76f9ddd4633006c4696195f7",
    "name": "Ổ cứng SSD M.2 SATA",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-m-2-sata",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411793+00:00",
    "updatedAt": "2026-02-27T10:16:46.411793+00:00"
  },
  {
    "_id": "7f7db98fd8f0e07babbf1b0c",
    "name": "Ổ cứng SSD M.2 NVME",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "o-cung-ssd-m-2-nvme",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411864+00:00",
    "updatedAt": "2026-02-27T10:16:46.411864+00:00"
  },
  {
    "_id": "bf9845df5a03b1b120bc0f65",
    "name": "TẢN NHIỆT - COOLING",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "tan-nhiet-cooling",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.411944+00:00",
    "updatedAt": "2026-02-27T10:16:46.411944+00:00"
  },
  {
    "_id": "e183032582f0ffaa6ad5ed16",
    "name": "Tản Nhiệt Khí",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "tan-nhiet-khi",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412010+00:00",
    "updatedAt": "2026-02-27T10:16:46.412010+00:00"
  },
  {
    "_id": "188c6c322e9e565238960b73",
    "name": "Tản Nhiệt Nước AIO",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "tan-nhiet-nuoc-aio",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412075+00:00",
    "updatedAt": "2026-02-27T10:16:46.412075+00:00"
  },
  {
    "_id": "dbbf52ac974a834ae77a5980",
    "name": "Asus",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "asus-1",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412145+00:00",
    "updatedAt": "2026-02-27T10:16:46.412145+00:00"
  },
  {
    "_id": "0d07bae8a1d0cafdf5cde81b",
    "name": "Cooler Master",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "cooler-master",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412210+00:00",
    "updatedAt": "2026-02-27T10:16:46.412210+00:00"
  },
  {
    "_id": "5a68c574b379cdf038dfa8c3",
    "name": "Deep Cool",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "deep-cool",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412276+00:00",
    "updatedAt": "2026-02-27T10:16:46.412276+00:00"
  },
  {
    "_id": "5f9758612ad030502768852d",
    "name": "EKWB",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "ekwb",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412340+00:00",
    "updatedAt": "2026-02-27T10:16:46.412340+00:00"
  },
  {
    "_id": "6a932cbca98a4112dd89290a",
    "name": "ID Cooling",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "id-cooling",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412406+00:00",
    "updatedAt": "2026-02-27T10:16:46.412406+00:00"
  },
  {
    "_id": "880196d4f1bebc12721a6d6b",
    "name": "TRYX",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "tryx",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412475+00:00",
    "updatedAt": "2026-02-27T10:16:46.412475+00:00"
  },
  {
    "_id": "d2a79dcd286663dcb0a69988",
    "name": "Theo Màu",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "theo-mau",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412533+00:00",
    "updatedAt": "2026-02-27T10:16:46.412533+00:00"
  },
  {
    "_id": "69547a58d1e585e94a5f5d4e",
    "name": "Màu Trắng",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mau-trang-1",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412597+00:00",
    "updatedAt": "2026-02-27T10:16:46.412597+00:00"
  },
  {
    "_id": "b06350bab80b35b22c28a995",
    "name": "Màu Đen",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "mau-den-1",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412662+00:00",
    "updatedAt": "2026-02-27T10:16:46.412662+00:00"
  },
  {
    "_id": "d9314eff6a6fe192cefc0599",
    "name": "Theo Kích Cỡ",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "theo-kich-co",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412725+00:00",
    "updatedAt": "2026-02-27T10:16:46.412725+00:00"
  },
  {
    "_id": "a794561e86171b89e1d92680",
    "name": "120mm",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "120mm",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412790+00:00",
    "updatedAt": "2026-02-27T10:16:46.412790+00:00"
  },
  {
    "_id": "e6159579da24ea4187948ae3",
    "name": "280mm",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "280mm",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412853+00:00",
    "updatedAt": "2026-02-27T10:16:46.412853+00:00"
  },
  {
    "_id": "9dd5c71d094363e3ef7a95d7",
    "name": "240mm",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "240mm",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412915+00:00",
    "updatedAt": "2026-02-27T10:16:46.412915+00:00"
  },
  {
    "_id": "86695569c6969237a4178a71",
    "name": "360mm",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "360mm",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.412980+00:00",
    "updatedAt": "2026-02-27T10:16:46.412980+00:00"
  },
  {
    "_id": "2d7bec40dd3e7e0291f47b1f",
    "name": "DÂY NGUỒN BỌC LƯỚI",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "day-nguon-boc-luoi",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.413037+00:00",
    "updatedAt": "2026-02-27T10:16:46.413037+00:00"
  },
  {
    "_id": "4fc25ebca50a7005cffe9d1e",
    "name": "24 PIN (MAINBOARD)",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "24-pin-mainboard",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.413104+00:00",
    "updatedAt": "2026-02-27T10:16:46.413104+00:00"
  },
  {
    "_id": "b917ed63c3f6c89ffc282e77",
    "name": "COMBO (24 PIN + 8 PIN)",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "combo-24-pin-8-pin",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.413167+00:00",
    "updatedAt": "2026-02-27T10:16:46.413167+00:00"
  },
  {
    "_id": "b9f2b752ff10647a409a1989",
    "name": "8 PIN (VGA/CPU)",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "8-pin-vga-cpu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.413229+00:00",
    "updatedAt": "2026-02-27T10:16:46.413229+00:00"
  },
  {
    "_id": "a28f480bb25f0e6e9ba14461",
    "name": "6 PIN (VGA)",
    "parentId": "73649b5b3fa6dba9a407ba18",
    "slug": "6-pin-vga",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.413291+00:00",
    "updatedAt": "2026-02-27T10:16:46.413291+00:00"
  },
  {
    "_id": "d8bf8b26722fcf0d1bf638a0",
    "name": "PC Mini",
    "parentId": null,
    "slug": "pc-mini",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.413313+00:00",
    "updatedAt": "2026-02-27T10:16:46.413313+00:00"
  },
  {
    "_id": "064813f3bb2b0a572d66810a",
    "name": "Màn Hình Máy Tính",
    "parentId": null,
    "slug": "man-hinh-may-tinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.417118+00:00",
    "updatedAt": "2026-02-27T10:16:46.417118+00:00"
  },
  {
    "_id": "06397b8d1519869ec6f735c4",
    "name": "Màn Hình Theo Hãng",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-theo-hang",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421213+00:00",
    "updatedAt": "2026-02-27T10:16:46.421213+00:00"
  },
  {
    "_id": "e8eb643fa8059b653561d970",
    "name": "Màn hình Asus",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-asus",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421308+00:00",
    "updatedAt": "2026-02-27T10:16:46.421308+00:00"
  },
  {
    "_id": "ce77b18a33b79ae07a4bb66b",
    "name": "Màn hình Viewsonic",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-viewsonic",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421374+00:00",
    "updatedAt": "2026-02-27T10:16:46.421374+00:00"
  },
  {
    "_id": "353feb8b6e88990aa0335fd5",
    "name": "Màn hình MSI",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-msi",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421440+00:00",
    "updatedAt": "2026-02-27T10:16:46.421440+00:00"
  },
  {
    "_id": "4179d36e2e67573f6291bf05",
    "name": "Màn hình LG",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-lg",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421505+00:00",
    "updatedAt": "2026-02-27T10:16:46.421505+00:00"
  },
  {
    "_id": "0bacf332c4edfd5caa53aeee",
    "name": "Màn hình Dell",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-dell",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421567+00:00",
    "updatedAt": "2026-02-27T10:16:46.421567+00:00"
  },
  {
    "_id": "ae70b972d37cc47b09016f14",
    "name": "Màn hình AOC",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-aoc",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421630+00:00",
    "updatedAt": "2026-02-27T10:16:46.421630+00:00"
  },
  {
    "_id": "d1452bca8743818ebf407804",
    "name": "Màn hình Acer",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-acer",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421692+00:00",
    "updatedAt": "2026-02-27T10:16:46.421692+00:00"
  },
  {
    "_id": "c9afc06e9b15fc207c34eee6",
    "name": "Màn hình BenQ",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-benq",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421754+00:00",
    "updatedAt": "2026-02-27T10:16:46.421754+00:00"
  },
  {
    "_id": "741ebca47ab39e41f209294b",
    "name": "Màn hình HP",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-hp",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421814+00:00",
    "updatedAt": "2026-02-27T10:16:46.421814+00:00"
  },
  {
    "_id": "858dfcc9e782978398ff6b02",
    "name": "Màn hình HKC",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-hkc",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421875+00:00",
    "updatedAt": "2026-02-27T10:16:46.421875+00:00"
  },
  {
    "_id": "2239b53042992807a54ab541",
    "name": "Màn hình Phillip",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-phillip",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.421934+00:00",
    "updatedAt": "2026-02-27T10:16:46.421934+00:00"
  },
  {
    "_id": "7c56a452e5ce353ca6ac14d2",
    "name": "Màn hình Samsung",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-samsung",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422001+00:00",
    "updatedAt": "2026-02-27T10:16:46.422001+00:00"
  },
  {
    "_id": "0028261d49ee009db7cf1d9a",
    "name": "Màn hình Kinglight",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-kinglight",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422062+00:00",
    "updatedAt": "2026-02-27T10:16:46.422062+00:00"
  },
  {
    "_id": "ad756c15e22c08126c66c974",
    "name": "Màn hình Gigabyte Aorus",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-gigabyte-aorus",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422238+00:00",
    "updatedAt": "2026-02-27T10:16:46.422238+00:00"
  },
  {
    "_id": "5f13ad85de68c1b3db3a4e8a",
    "name": "Màn hình Cooler Master",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-cooler-master",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422394+00:00",
    "updatedAt": "2026-02-27T10:16:46.422394+00:00"
  },
  {
    "_id": "6873e1ac73993382387eb458",
    "name": "Màn hình E-dra",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-e-dra",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422499+00:00",
    "updatedAt": "2026-02-27T10:16:46.422499+00:00"
  },
  {
    "_id": "ab3d78027254f5dcaab77def",
    "name": "Màn hình Galax",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-galax",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422584+00:00",
    "updatedAt": "2026-02-27T10:16:46.422584+00:00"
  },
  {
    "_id": "cde342d8b5fb2976d1864a3e",
    "name": "Theo Kích Thước Màn Hình",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "theo-kich-thuoc-man-hinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422654+00:00",
    "updatedAt": "2026-02-27T10:16:46.422654+00:00"
  },
  {
    "_id": "9790cfc7e10cea72d7d71fb9",
    "name": "Màn Hình 17 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-17-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422725+00:00",
    "updatedAt": "2026-02-27T10:16:46.422725+00:00"
  },
  {
    "_id": "b431cb85dc10a07481cbaa31",
    "name": "Màn hình 18.5 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-18-5-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422808+00:00",
    "updatedAt": "2026-02-27T10:16:46.422808+00:00"
  },
  {
    "_id": "bbfcffba6e659b6b1fcc497a",
    "name": "Màn Hình 19 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-19-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422905+00:00",
    "updatedAt": "2026-02-27T10:16:46.422905+00:00"
  },
  {
    "_id": "a987f541c291edf908d7c687",
    "name": "Màn Hình 21.5 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-21-5-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.422971+00:00",
    "updatedAt": "2026-02-27T10:16:46.422971+00:00"
  },
  {
    "_id": "b8c41651336ee2453c7d4f3e",
    "name": "Màn Hình 22 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-22-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423034+00:00",
    "updatedAt": "2026-02-27T10:16:46.423034+00:00"
  },
  {
    "_id": "363352224d15f6788bd6923a",
    "name": "Màn Hình 23 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-23-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423097+00:00",
    "updatedAt": "2026-02-27T10:16:46.423097+00:00"
  },
  {
    "_id": "e2393ec51a8c07d60517b829",
    "name": "Màn Hình 24 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-24-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423159+00:00",
    "updatedAt": "2026-02-27T10:16:46.423159+00:00"
  },
  {
    "_id": "8b2e63ab57a71b08dfcee11a",
    "name": "Màn Hình 27 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-27-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423221+00:00",
    "updatedAt": "2026-02-27T10:16:46.423221+00:00"
  },
  {
    "_id": "964e327d1625fd61cc8f704b",
    "name": "Màn Hình 28 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-28-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423283+00:00",
    "updatedAt": "2026-02-27T10:16:46.423283+00:00"
  },
  {
    "_id": "0749e08120bdeffce5db9fe8",
    "name": "Màn Hình 29 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-29-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423345+00:00",
    "updatedAt": "2026-02-27T10:16:46.423345+00:00"
  },
  {
    "_id": "2a7bd033e244960a9b347d23",
    "name": "Màn Hình 32 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-32-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423406+00:00",
    "updatedAt": "2026-02-27T10:16:46.423406+00:00"
  },
  {
    "_id": "f80cdb5dbc6cdb6ab32d2f52",
    "name": "Màn Hình 31.5 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-31-5-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423471+00:00",
    "updatedAt": "2026-02-27T10:16:46.423471+00:00"
  },
  {
    "_id": "c5550949620ce5201ab736f5",
    "name": "Màn Hình 34 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-34-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423535+00:00",
    "updatedAt": "2026-02-27T10:16:46.423535+00:00"
  },
  {
    "_id": "b977d6607894675c39a4ad88",
    "name": "Màn Hình 35 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-35-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423600+00:00",
    "updatedAt": "2026-02-27T10:16:46.423600+00:00"
  },
  {
    "_id": "02689b3602ad6850b8f60d80",
    "name": "Màn Hình 37.5 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-37-5-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423662+00:00",
    "updatedAt": "2026-02-27T10:16:46.423662+00:00"
  },
  {
    "_id": "1e63b341bb79c9befbe22448",
    "name": "Màn Hình 49 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-49-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423723+00:00",
    "updatedAt": "2026-02-27T10:16:46.423723+00:00"
  },
  {
    "_id": "92e617603407e60dbad1e9a4",
    "name": "Màn Hình 43 inch",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-43-inch",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423785+00:00",
    "updatedAt": "2026-02-27T10:16:46.423785+00:00"
  },
  {
    "_id": "0ff93d6bbdcfa70b9a16410c",
    "name": "Theo Tần Số Quét",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "theo-tan-so-quet",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423845+00:00",
    "updatedAt": "2026-02-27T10:16:46.423845+00:00"
  },
  {
    "_id": "f651e1634971d48508f40a50",
    "name": "Màn hình 60Hz",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-60hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423910+00:00",
    "updatedAt": "2026-02-27T10:16:46.423910+00:00"
  },
  {
    "_id": "8f065f124a5021c4bd762df5",
    "name": "Màn hình 75Hz",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-75hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.423984+00:00",
    "updatedAt": "2026-02-27T10:16:46.423984+00:00"
  },
  {
    "_id": "9b28602eb7e186afd3141ab7",
    "name": "Màn hình 100Hz",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-100hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424049+00:00",
    "updatedAt": "2026-02-27T10:16:46.424049+00:00"
  },
  {
    "_id": "86abb49d4f3db7ca34ce564f",
    "name": "Màn hình 120Hz",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-120hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424113+00:00",
    "updatedAt": "2026-02-27T10:16:46.424113+00:00"
  },
  {
    "_id": "e46dee1b319cf0d8f371d74d",
    "name": "Màn hình 144Hz",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-144hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424176+00:00",
    "updatedAt": "2026-02-27T10:16:46.424176+00:00"
  },
  {
    "_id": "1a2f0beb8042e846077581b6",
    "name": "Màn hình 165HZ",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-165hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424237+00:00",
    "updatedAt": "2026-02-27T10:16:46.424237+00:00"
  },
  {
    "_id": "14ae0d315ab029e25ad63aca",
    "name": "Màn hình 180Hz",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-180hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424299+00:00",
    "updatedAt": "2026-02-27T10:16:46.424299+00:00"
  },
  {
    "_id": "c625ed1f4bef3f2d11bc4244",
    "name": "Màn hình 240HZ",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-240hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424360+00:00",
    "updatedAt": "2026-02-27T10:16:46.424360+00:00"
  },
  {
    "_id": "886266ebdc623d70949bb42e",
    "name": "Màn hình 200Hz",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-200hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424422+00:00",
    "updatedAt": "2026-02-27T10:16:46.424422+00:00"
  },
  {
    "_id": "c3d9302d84d8b19db7ee64f8",
    "name": "Màn hình 280Hz",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-280hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424482+00:00",
    "updatedAt": "2026-02-27T10:16:46.424482+00:00"
  },
  {
    "_id": "74ff7553cc6916da644c09fd",
    "name": "Màn hình 360Hz",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-360hz",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424544+00:00",
    "updatedAt": "2026-02-27T10:16:46.424544+00:00"
  },
  {
    "_id": "f448fa2831820060045122be",
    "name": "Độ Phân Giải Màn Hình",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "do-phan-giai-man-hinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424602+00:00",
    "updatedAt": "2026-02-27T10:16:46.424602+00:00"
  },
  {
    "_id": "1820692bb34e99d0bae19e95",
    "name": "Màn Hình HD (1366x768)",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-hd-1366x768",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424668+00:00",
    "updatedAt": "2026-02-27T10:16:46.424668+00:00"
  },
  {
    "_id": "22606965bfd9190eb153ab43",
    "name": "Màn Hình HD+ (1600x900)",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-hd-1600x900",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424734+00:00",
    "updatedAt": "2026-02-27T10:16:46.424734+00:00"
  },
  {
    "_id": "e1fb3cd4cde35fc660a91908",
    "name": "Màn Hình Full HD (1920x1080)",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-full-hd-1920x1080",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424800+00:00",
    "updatedAt": "2026-02-27T10:16:46.424800+00:00"
  },
  {
    "_id": "9a26686d4bed614251e2e692",
    "name": "Màn Hình WUXGA (1920x1200)",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-wuxga-1920x1200",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424866+00:00",
    "updatedAt": "2026-02-27T10:16:46.424866+00:00"
  },
  {
    "_id": "67d688c96b026277c504642d",
    "name": "Màn Hình UWHD (2560x1080)",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-uwhd-2560x1080",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424931+00:00",
    "updatedAt": "2026-02-27T10:16:46.424931+00:00"
  },
  {
    "_id": "701f332db83bf5224a3c63cf",
    "name": "Màn Hình 2K QHD (2560x1440)",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-2k-qhd-2560x1440",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.424993+00:00",
    "updatedAt": "2026-02-27T10:16:46.424993+00:00"
  },
  {
    "_id": "5988374b5c8ac936696ccfc9",
    "name": "Màn Hình WQHD (3440x1440)",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-wqhd-3440x1440",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425056+00:00",
    "updatedAt": "2026-02-27T10:16:46.425056+00:00"
  },
  {
    "_id": "509c7fe81cb3cef6543d0fe5",
    "name": "Màn Hình WQHD+(3840 x 1600)",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-wqhd-3840-x-1600",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425119+00:00",
    "updatedAt": "2026-02-27T10:16:46.425119+00:00"
  },
  {
    "_id": "4e7585747a4de7f9df9d75cd",
    "name": "Màn Hình DualQHD (5120x1440)",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-dualqhd-5120x1440",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425182+00:00",
    "updatedAt": "2026-02-27T10:16:46.425182+00:00"
  },
  {
    "_id": "e0c877a02c09d2c36cb733b1",
    "name": "Màn Hình 4K (3840x2160)",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-4k-3840x2160",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425245+00:00",
    "updatedAt": "2026-02-27T10:16:46.425245+00:00"
  },
  {
    "_id": "e7947a05cdb599165a220937",
    "name": "Màn Hình Phân Giải Khác",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-phan-giai-khac",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425307+00:00",
    "updatedAt": "2026-02-27T10:16:46.425307+00:00"
  },
  {
    "_id": "068784ec8ab3360586b23ffa",
    "name": "Theo Nhu Cầu Sử Dụng",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "theo-nhu-cau-su-dung",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425367+00:00",
    "updatedAt": "2026-02-27T10:16:46.425367+00:00"
  },
  {
    "_id": "cf62f6aaa251c41f7c582b61",
    "name": "Màn Hình Gaming",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-gaming",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425433+00:00",
    "updatedAt": "2026-02-27T10:16:46.425433+00:00"
  },
  {
    "_id": "be125da0828e04849025423f",
    "name": "Màn Hình Thiết Kế, Đồ Họa",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-thiet-ke-do-hoa",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425496+00:00",
    "updatedAt": "2026-02-27T10:16:46.425496+00:00"
  },
  {
    "_id": "b237f93504c2e988b6efc319",
    "name": "Màn Hình Cong",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "man-hinh-cong",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425565+00:00",
    "updatedAt": "2026-02-27T10:16:46.425565+00:00"
  },
  {
    "_id": "b6d3520a9c36d974565fe991",
    "name": "Văn Phòng, Giải Trí Nhẹ Nhàng",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "van-phong-giai-tri-nhe-nhang",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425630+00:00",
    "updatedAt": "2026-02-27T10:16:46.425630+00:00"
  },
  {
    "_id": "d1d729c29c52b7b15859ee6a",
    "name": "TẤM NỀN MÀN HÌNH",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "tam-nen-man-hinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425696+00:00",
    "updatedAt": "2026-02-27T10:16:46.425696+00:00"
  },
  {
    "_id": "fa44e77dcb45121a6f42e7a7",
    "name": "TẤM NỀN IPS",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "tam-nen-ips",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425760+00:00",
    "updatedAt": "2026-02-27T10:16:46.425760+00:00"
  },
  {
    "_id": "1191e8717f9933914fd29a0d",
    "name": "TẤM NỀN PLS",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "tam-nen-pls",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425821+00:00",
    "updatedAt": "2026-02-27T10:16:46.425821+00:00"
  },
  {
    "_id": "29762235adb9e5dbaf2f2201",
    "name": "TẤM NỀN VA",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "tam-nen-va",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425882+00:00",
    "updatedAt": "2026-02-27T10:16:46.425882+00:00"
  },
  {
    "_id": "9b39bddac129fbae83776254",
    "name": "TẤM NỀN TN",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "tam-nen-tn",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.425942+00:00",
    "updatedAt": "2026-02-27T10:16:46.425942+00:00"
  },
  {
    "_id": "ceb6c6445aaeda6aae840d97",
    "name": "TẤM NỀN OLED",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "tam-nen-oled",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.426009+00:00",
    "updatedAt": "2026-02-27T10:16:46.426009+00:00"
  },
  {
    "_id": "61b958c7ed3afac395530833",
    "name": "Giá Treo Màn Hình",
    "parentId": "064813f3bb2b0a572d66810a",
    "slug": "gia-treo-man-hinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.426073+00:00",
    "updatedAt": "2026-02-27T10:16:46.426073+00:00"
  },
  {
    "_id": "9cc92c6587c7a02ff07b6480",
    "name": "Gaming Gear",
    "parentId": null,
    "slug": "gaming-gear",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.426088+00:00",
    "updatedAt": "2026-02-27T10:16:46.426088+00:00"
  },
  {
    "_id": "4c380705d4d9629b9c39a429",
    "name": "Bàn phím chơi game",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-choi-game",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430032+00:00",
    "updatedAt": "2026-02-27T10:16:46.430032+00:00"
  },
  {
    "_id": "60e43c6554a5071803085e77",
    "name": "Bàn Phím Corsair",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-corsair",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430129+00:00",
    "updatedAt": "2026-02-27T10:16:46.430129+00:00"
  },
  {
    "_id": "1a3857de52e4ef92182d697d",
    "name": "Bàn Phím Steelseries",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-steelseries",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430196+00:00",
    "updatedAt": "2026-02-27T10:16:46.430196+00:00"
  },
  {
    "_id": "0fc2082cf89195e74155a965",
    "name": "Bàn Phím Razer",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-razer",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430261+00:00",
    "updatedAt": "2026-02-27T10:16:46.430261+00:00"
  },
  {
    "_id": "51bfb0ee7930acdc0aa06c0e",
    "name": "Bàn Phím Leopold",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-leopold",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430325+00:00",
    "updatedAt": "2026-02-27T10:16:46.430325+00:00"
  },
  {
    "_id": "4b66b58e79a7bd20eaf9b36e",
    "name": "Bàn Phím iKBC",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-ikbc",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430388+00:00",
    "updatedAt": "2026-02-27T10:16:46.430388+00:00"
  },
  {
    "_id": "a18c4b9d210e88ae769adfc4",
    "name": "Bàn Phím Asus",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-asus",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430449+00:00",
    "updatedAt": "2026-02-27T10:16:46.430449+00:00"
  },
  {
    "_id": "2ae73e1b877f12194e51cad3",
    "name": "Bàn Phím CoolerMaster",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-coolermaster",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430511+00:00",
    "updatedAt": "2026-02-27T10:16:46.430511+00:00"
  },
  {
    "_id": "5bfe494a8410bd77bf47a07d",
    "name": "Bàn Phím DareU",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-dareu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430574+00:00",
    "updatedAt": "2026-02-27T10:16:46.430574+00:00"
  },
  {
    "_id": "8dd252ab31c832d6753e665f",
    "name": "Bàn Phím Fuhlen",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-fuhlen",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430635+00:00",
    "updatedAt": "2026-02-27T10:16:46.430635+00:00"
  },
  {
    "_id": "b3770d143b078d6e6e086b07",
    "name": "Bàn Phím Gigabyte",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-gigabyte",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430697+00:00",
    "updatedAt": "2026-02-27T10:16:46.430697+00:00"
  },
  {
    "_id": "53d70803f13e4a1a0dc57a95",
    "name": "Bàn Phím Irocks",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-irocks",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430763+00:00",
    "updatedAt": "2026-02-27T10:16:46.430763+00:00"
  },
  {
    "_id": "df27282078d9470a91b0cb87",
    "name": "Bàn Phím Kingston HyperX",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-kingston-hyperx",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430825+00:00",
    "updatedAt": "2026-02-27T10:16:46.430825+00:00"
  },
  {
    "_id": "a9836627d7e3cca50edd0fd8",
    "name": "Bàn Phím Logitech",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-logitech",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430889+00:00",
    "updatedAt": "2026-02-27T10:16:46.430889+00:00"
  },
  {
    "_id": "85f9a7fe5d026cb71f123b3a",
    "name": "Bàn phím cơ Akko",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-co-akko",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.430951+00:00",
    "updatedAt": "2026-02-27T10:16:46.430951+00:00"
  },
  {
    "_id": "7e5fa298e4463f32ea1d212e",
    "name": "Bàn phím E-DRA",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-e-dra",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431013+00:00",
    "updatedAt": "2026-02-27T10:16:46.431013+00:00"
  },
  {
    "_id": "b6961b3101a1c747686af94b",
    "name": "Bàn phím AULA",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-aula",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431074+00:00",
    "updatedAt": "2026-02-27T10:16:46.431074+00:00"
  },
  {
    "_id": "ba313fb9b4846905b8eef2b2",
    "name": "Bàn phím LEOBOG",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-leobog",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431137+00:00",
    "updatedAt": "2026-02-27T10:16:46.431137+00:00"
  },
  {
    "_id": "955371619fddd64f9bba0845",
    "name": "Bàn phím Riccks",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-phim-riccks",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431198+00:00",
    "updatedAt": "2026-02-27T10:16:46.431198+00:00"
  },
  {
    "_id": "85bcdb92da26cfa274d72e10",
    "name": "Chuột chơi game",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-choi-game",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431256+00:00",
    "updatedAt": "2026-02-27T10:16:46.431256+00:00"
  },
  {
    "_id": "89b2e8993897dd6472876a5a",
    "name": "Chuột Logitech",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-logitech",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431318+00:00",
    "updatedAt": "2026-02-27T10:16:46.431318+00:00"
  },
  {
    "_id": "2f4343954c755497e8d0785a",
    "name": "Chuột Zowie",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-zowie",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431380+00:00",
    "updatedAt": "2026-02-27T10:16:46.431380+00:00"
  },
  {
    "_id": "94f0e4379167edb57942087b",
    "name": "Chuột Razer",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-razer",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431440+00:00",
    "updatedAt": "2026-02-27T10:16:46.431440+00:00"
  },
  {
    "_id": "f0c02cd2d189f72a6290e694",
    "name": "Chuột Steelseries",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-steelseries",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431500+00:00",
    "updatedAt": "2026-02-27T10:16:46.431500+00:00"
  },
  {
    "_id": "819fc360a35a2c9f83cd4393",
    "name": "Chuột Corsair",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-corsair",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431561+00:00",
    "updatedAt": "2026-02-27T10:16:46.431561+00:00"
  },
  {
    "_id": "f0bea88dc148144dc983660e",
    "name": "Chuột Fuhlen",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-fuhlen",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431622+00:00",
    "updatedAt": "2026-02-27T10:16:46.431622+00:00"
  },
  {
    "_id": "f1e3375354c2bb5e94eec7f4",
    "name": "Chuột Asus",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-asus",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431686+00:00",
    "updatedAt": "2026-02-27T10:16:46.431686+00:00"
  },
  {
    "_id": "8e357bbb9a106c7a2c09bf48",
    "name": "Chuột Cooler Master",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-cooler-master",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431755+00:00",
    "updatedAt": "2026-02-27T10:16:46.431755+00:00"
  },
  {
    "_id": "8ef68ab8aabac766304d57c6",
    "name": "Chuột DareU",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-dareu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431822+00:00",
    "updatedAt": "2026-02-27T10:16:46.431822+00:00"
  },
  {
    "_id": "ca6a26fb7a538cd1e45b471b",
    "name": "Chuột EZ",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-ez",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431886+00:00",
    "updatedAt": "2026-02-27T10:16:46.431886+00:00"
  },
  {
    "_id": "72fcf08b000b25197dbe6467",
    "name": "Chuột E-dra",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-e-dra",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.431950+00:00",
    "updatedAt": "2026-02-27T10:16:46.431950+00:00"
  },
  {
    "_id": "c4a983db4fe1730dfb55da4b",
    "name": "Chuột Endgame Gear",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "chuot-endgame-gear",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432013+00:00",
    "updatedAt": "2026-02-27T10:16:46.432013+00:00"
  },
  {
    "_id": "706f42b1e7596b5ba1ea5e80",
    "name": "Tai nghe chơi game",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-choi-game",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432074+00:00",
    "updatedAt": "2026-02-27T10:16:46.432074+00:00"
  },
  {
    "_id": "22282a3b4972de5816378745",
    "name": "Tai nghe Kingston HyperX",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-kingston-hyperx",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432138+00:00",
    "updatedAt": "2026-02-27T10:16:46.432138+00:00"
  },
  {
    "_id": "a8e4fed3e14710b919972435",
    "name": "Tai nghe Razer",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-razer",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432204+00:00",
    "updatedAt": "2026-02-27T10:16:46.432204+00:00"
  },
  {
    "_id": "0bb9af237cb7d2f3f9ecd5f5",
    "name": "Tai nghe Steelseries",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-steelseries",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432268+00:00",
    "updatedAt": "2026-02-27T10:16:46.432268+00:00"
  },
  {
    "_id": "f438735c7bcc50fb7f4bf1a7",
    "name": "Tai nghe Corsair",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-corsair",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432332+00:00",
    "updatedAt": "2026-02-27T10:16:46.432332+00:00"
  },
  {
    "_id": "f028f25790f29521ff07a83c",
    "name": "Tai nghe Logitech",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-logitech",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432394+00:00",
    "updatedAt": "2026-02-27T10:16:46.432394+00:00"
  },
  {
    "_id": "e33e770d25b50030db32b000",
    "name": "Tai nghe Sennheiser",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-sennheiser",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432457+00:00",
    "updatedAt": "2026-02-27T10:16:46.432457+00:00"
  },
  {
    "_id": "851c359c5fdb16db1e981689",
    "name": "Tai nghe Zidli",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-zidli",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432519+00:00",
    "updatedAt": "2026-02-27T10:16:46.432519+00:00"
  },
  {
    "_id": "1f950f0cbaa01f5160f11c9d",
    "name": "Tai nghe Audio Technica",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-audio-technica",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432580+00:00",
    "updatedAt": "2026-02-27T10:16:46.432580+00:00"
  },
  {
    "_id": "b0acf7107fad3df7d4b609ee",
    "name": "Tai nghe Dareu",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-dareu",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432642+00:00",
    "updatedAt": "2026-02-27T10:16:46.432642+00:00"
  },
  {
    "_id": "2ba80cb666024f1d0995b5ec",
    "name": "Tai nghe Asus",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "tai-nghe-asus",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432700+00:00",
    "updatedAt": "2026-02-27T10:16:46.432700+00:00"
  },
  {
    "_id": "cf8a30ae0d275dc69209cdf0",
    "name": "Ghế chơi game",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-choi-game",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432757+00:00",
    "updatedAt": "2026-02-27T10:16:46.432757+00:00"
  },
  {
    "_id": "ed7f5391d98ed60b55fcf48c",
    "name": "Ghế Noblechairs",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-noblechairs",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432817+00:00",
    "updatedAt": "2026-02-27T10:16:46.432817+00:00"
  },
  {
    "_id": "3f14cf35b579bda05a9476cb",
    "name": "Ghế Dxracer",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-dxracer",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432879+00:00",
    "updatedAt": "2026-02-27T10:16:46.432879+00:00"
  },
  {
    "_id": "759a85c1e5d13124a4a1c1c8",
    "name": "Ghế AKRacing",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-akracing",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.432941+00:00",
    "updatedAt": "2026-02-27T10:16:46.432941+00:00"
  },
  {
    "_id": "90e818e616db402f182cdd48",
    "name": "Ghế Corsair",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-corsair",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433002+00:00",
    "updatedAt": "2026-02-27T10:16:46.433002+00:00"
  },
  {
    "_id": "1a9f7a04b32613c7bcd0ee9a",
    "name": "Ghế F1 Formular",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-f1-formular",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433063+00:00",
    "updatedAt": "2026-02-27T10:16:46.433063+00:00"
  },
  {
    "_id": "17e2f408bf4ee9b9d1ed7559",
    "name": "Ghế Eblue",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-eblue",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433126+00:00",
    "updatedAt": "2026-02-27T10:16:46.433126+00:00"
  },
  {
    "_id": "6e5c94d6d464ab0a2df1c996",
    "name": "Ghế Autofull",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-autofull",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433186+00:00",
    "updatedAt": "2026-02-27T10:16:46.433186+00:00"
  },
  {
    "_id": "f800a51424ea966410729fcd",
    "name": "Ghế Obutto",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-obutto",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433245+00:00",
    "updatedAt": "2026-02-27T10:16:46.433245+00:00"
  },
  {
    "_id": "314c73b8dd340a22d35b183e",
    "name": "Ghế ALPHA",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-alpha",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433306+00:00",
    "updatedAt": "2026-02-27T10:16:46.433306+00:00"
  },
  {
    "_id": "13d06da580c9d1880af784de",
    "name": "Ghế SOLESEAT",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-soleseat",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433365+00:00",
    "updatedAt": "2026-02-27T10:16:46.433365+00:00"
  },
  {
    "_id": "9cc7346ee56ca88fd7baca31",
    "name": "Ghế AndaSeat",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-andaseat",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433425+00:00",
    "updatedAt": "2026-02-27T10:16:46.433425+00:00"
  },
  {
    "_id": "2c9e02b064b43bf762c32ec5",
    "name": "Ghế THUNDERX3",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-thunderx3",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433484+00:00",
    "updatedAt": "2026-02-27T10:16:46.433484+00:00"
  },
  {
    "_id": "5501aae3bb3f9fa7a449c7e1",
    "name": "Ghế E-DRA",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-e-dra",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433547+00:00",
    "updatedAt": "2026-02-27T10:16:46.433547+00:00"
  },
  {
    "_id": "06aed4ebaf2b36646a37bbee",
    "name": "Ghế ACE",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-ace",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433608+00:00",
    "updatedAt": "2026-02-27T10:16:46.433608+00:00"
  },
  {
    "_id": "65300d5cf49831ad4044dd81",
    "name": "Ghế  Warrior",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-warrior",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433668+00:00",
    "updatedAt": "2026-02-27T10:16:46.433668+00:00"
  },
  {
    "_id": "be22274e703b7bdc59e6c98d",
    "name": "Ghế Legion",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-legion",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433735+00:00",
    "updatedAt": "2026-02-27T10:16:46.433735+00:00"
  },
  {
    "_id": "e8054fe84b3be67370fdf2ea",
    "name": "Ghế HBADA",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ghe-hbada",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433800+00:00",
    "updatedAt": "2026-02-27T10:16:46.433800+00:00"
  },
  {
    "_id": "92e19b76d9aaead77781722c",
    "name": "Bàn chơi game",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-choi-game",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433858+00:00",
    "updatedAt": "2026-02-27T10:16:46.433858+00:00"
  },
  {
    "_id": "2c8e9f3d7a9cf03203bc1144",
    "name": "Bàn Dxracer",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-dxracer",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433923+00:00",
    "updatedAt": "2026-02-27T10:16:46.433923+00:00"
  },
  {
    "_id": "877936d5839bf557d6951be8",
    "name": "Bàn Eblue",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-eblue",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.433987+00:00",
    "updatedAt": "2026-02-27T10:16:46.433987+00:00"
  },
  {
    "_id": "4fcb6d3d68e07903f0868e4a",
    "name": "Bàn Z-Desk",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-z-desk",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434048+00:00",
    "updatedAt": "2026-02-27T10:16:46.434048+00:00"
  },
  {
    "_id": "f9d7cd24bcbb3af92da9b482",
    "name": "Bàn G-Desk",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-g-desk",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434110+00:00",
    "updatedAt": "2026-02-27T10:16:46.434110+00:00"
  },
  {
    "_id": "2f2e6674f8f6aaf155be42ca",
    "name": "Bàn K-Desk",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-k-desk",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434171+00:00",
    "updatedAt": "2026-02-27T10:16:46.434171+00:00"
  },
  {
    "_id": "7b9016b1d01dc3be9381f86e",
    "name": "Bàn R-Desk",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-r-desk",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434231+00:00",
    "updatedAt": "2026-02-27T10:16:46.434231+00:00"
  },
  {
    "_id": "71ef360302a44cd9bc6f602d",
    "name": "Bàn U-Desk",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-u-desk",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434293+00:00",
    "updatedAt": "2026-02-27T10:16:46.434293+00:00"
  },
  {
    "_id": "d00e526e3f263983e9fc4852",
    "name": "Bàn X-Desk",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "ban-x-desk",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434354+00:00",
    "updatedAt": "2026-02-27T10:16:46.434354+00:00"
  },
  {
    "_id": "fd7870f71751d8af43ee37df",
    "name": "Thiết bị trang trí",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "thiet-bi-trang-tri",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434411+00:00",
    "updatedAt": "2026-02-27T10:16:46.434411+00:00"
  },
  {
    "_id": "ed70f47999d75208614784c4",
    "name": "Micro Stream",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "micro-stream",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434472+00:00",
    "updatedAt": "2026-02-27T10:16:46.434472+00:00"
  },
  {
    "_id": "b7abcec53c2a104e5c94a618",
    "name": "Micro Thronmax",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "micro-thronmax",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434536+00:00",
    "updatedAt": "2026-02-27T10:16:46.434536+00:00"
  },
  {
    "_id": "ea6ac7b0761ada4f487d1cbd",
    "name": "Micro HyperX",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "micro-hyperx",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434596+00:00",
    "updatedAt": "2026-02-27T10:16:46.434596+00:00"
  },
  {
    "_id": "a3b8931f76e928e7bc464b4c",
    "name": "Micro NZXT",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "micro-nzxt",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434654+00:00",
    "updatedAt": "2026-02-27T10:16:46.434654+00:00"
  },
  {
    "_id": "8d4e3001413f0aca120a6939",
    "name": "Micro Endgame Gear",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "micro-endgame-gear",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434716+00:00",
    "updatedAt": "2026-02-27T10:16:46.434716+00:00"
  },
  {
    "_id": "8aa483f3f5e2788e56267003",
    "name": "Loa Máy Tính",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "loa-may-tinh",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434777+00:00",
    "updatedAt": "2026-02-27T10:16:46.434777+00:00"
  },
  {
    "_id": "93f7bedadc2d8cdfd5038e82",
    "name": "Loa Logitech",
    "parentId": "9cc92c6587c7a02ff07b6480",
    "slug": "loa-logitech",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434837+00:00",
    "updatedAt": "2026-02-27T10:16:46.434837+00:00"
  },
  {
    "_id": "fee54e93ae6cb0f56de1416f",
    "name": "Loa, Mic, Webcam",
    "parentId": null,
    "slug": "loa-mic-webcam",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.434852+00:00",
    "updatedAt": "2026-02-27T10:16:46.434852+00:00"
  },
  {
    "_id": "590e5c4a56951e0f3ba9e0c6",
    "name": "Webcam",
    "parentId": "fee54e93ae6cb0f56de1416f",
    "slug": "webcam",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.438906+00:00",
    "updatedAt": "2026-02-27T10:16:46.438906+00:00"
  },
  {
    "_id": "c73bce4b05729b43b5ec5420",
    "name": "Webcam Logitech",
    "parentId": "fee54e93ae6cb0f56de1416f",
    "slug": "webcam-logitech",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.439014+00:00",
    "updatedAt": "2026-02-27T10:16:46.439014+00:00"
  },
  {
    "_id": "a7a305ad1361e745263f2c34",
    "name": "Loa máy tính",
    "parentId": "fee54e93ae6cb0f56de1416f",
    "slug": "loa-may-tinh-1",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.439085+00:00",
    "updatedAt": "2026-02-27T10:16:46.439085+00:00"
  },
  {
    "_id": "21dae5d5cc64465feeb38c3a",
    "name": "Loa Microlab",
    "parentId": "fee54e93ae6cb0f56de1416f",
    "slug": "loa-microlab",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.439156+00:00",
    "updatedAt": "2026-02-27T10:16:46.439156+00:00"
  },
  {
    "_id": "842e72cad2ac860ce2ab59be",
    "name": "Loa Edifier",
    "parentId": "fee54e93ae6cb0f56de1416f",
    "slug": "loa-edifier",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.439242+00:00",
    "updatedAt": "2026-02-27T10:16:46.439242+00:00"
  },
  {
    "_id": "1b2a097170c0a16e67e0115b",
    "name": "Loa Logitech",
    "parentId": "fee54e93ae6cb0f56de1416f",
    "slug": "loa-logitech-1",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.439312+00:00",
    "updatedAt": "2026-02-27T10:16:46.439312+00:00"
  },
  {
    "_id": "49f5db9fb4be4203a13a7c2e",
    "name": "Loa Soundmax",
    "parentId": "fee54e93ae6cb0f56de1416f",
    "slug": "loa-soundmax",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.439390+00:00",
    "updatedAt": "2026-02-27T10:16:46.439390+00:00"
  },
  {
    "_id": "e93e94ee0f981c0543d74562",
    "name": "Loa Sony",
    "parentId": "fee54e93ae6cb0f56de1416f",
    "slug": "loa-sony",
    "isDeleted": false,
    "createdAt": "2026-02-27T10:16:46.439462+00:00",
    "updatedAt": "2026-02-27T10:16:46.439462+00:00"
  }
];

// Map temp _id sang real ObjectId
const idMap = {};
const docs = categories.map(cat => {
  const realId = new ObjectId();
  idMap[cat._id] = realId;
  return { ...cat, _realId: realId };
});

// Insert với proper ObjectId references
docs.forEach(doc => {
  db.categories.insertOne({
    _id: doc._realId,
    name: doc.name,
    parentId: doc.parentId ? (idMap[doc.parentId] || null) : null,
    slug: doc.slug,
    isDeleted: doc.isDeleted,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  });
});

print(`✅ Imported ${docs.length} categories successfully!`);
print("Parents: " + db.categories.countDocuments({ parentId: null }));
print("Children: " + db.categories.countDocuments({ parentId: { $ne: null } }));