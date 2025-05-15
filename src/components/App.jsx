import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Sử dụng biến môi trường VITE_API_URL
const API_URL = process.env.VITE_API_URL || "http://localhost:5000";
console.log("API_URL được sử dụng:", API_URL); // Log giá trị API_URL

function App() {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [huyenList, setHuyenList] = useState([]);
  const [selectedHuyen, setSelectedHuyen] = useState(null);
  const [selectedPhu, setSelectedPhu] = useState(null);
  const [selectedTong, setSelectedTong] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [addHeaderModal, setAddHeaderModal] = useState(false);
  const [addDataModal, setAddDataModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [notification, setNotification] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const [newHeader, setNewHeader] = useState({
    huyen: "",
    tong: "",
    level: "",
    name: "",
    chu_han_nom: "",
    imageFile: null,
  });

  const [newData, setNewData] = useState({
    huyen: "",
    tong: "",
    dia_danh_chung: "",
    ten_rieng: "",
    chu_han_nom: "",
    nguon: "",
    mo_ta: "",
    nhan_xet: "",
    ghi_chu: "",
    ten_khac: "",
    imageFile: null,
  });

  const [editData, setEditData] = useState({
    huyen: "",
    tong: "",
    so_thu_tu: "",
    dia_danh_chung: "",
    ten_rieng: "",
    chu_han_nom: "",
    nguon: "",
    mo_ta: "",
    nhan_xet: "",
    ghi_chu: "",
    ten_khac: "",
    imageFile: null,
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchHuyenList = async () => {
      try {
        console.log("Gọi API huyen-list:", `${API_URL}/api/huyen-list`);
        const response = await axios.get(`${API_URL}/api/huyen-list`);
        console.log("Danh sách huyện:", response.data);
        setHuyenList(response.data);
        if (response.data.length > 0) {
          setSelectedHuyen(response.data[0]);
        }
      } catch (err) {
        console.error("Lỗi khi gọi API huyen-list:", err);
        setError(
          `Lỗi khi lấy danh sách huyện: ${err.message}${
            err.response
              ? ` - ${err.response.status} ${err.response.statusText}`
              : ""
          }`
        );
      }
    };
    fetchHuyenList();
  }, []);

  useEffect(() => {
    const fetchHeaders = async () => {
      try {
        console.log("Gọi API place-headers:", `${API_URL}/api/place-headers`);
        const response = await axios.get(`${API_URL}/api/place-headers`);
        console.log("Danh sách headers:", response.data);
        setHeaders(response.data);
        if (selectedHuyen === "Huyện Duy Xuyên") {
          setSelectedPhu("PHỦ THĂNG HOA");
        } else if (selectedHuyen === "Huyện Điện Bàn") {
          setSelectedPhu("PHỦ ĐIỆN BÀN");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API place-headers:", err);
        setError(
          `Lỗi khi lấy tiêu đề: ${err.message}${
            err.response
              ? ` - ${err.response.status} ${err.response.statusText}`
              : ""
          }`
        );
      }
    };
    fetchHeaders();
  }, [selectedHuyen]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedHuyen) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/api/place-names`, {
          params: {
            huyen: selectedHuyen,
            page: currentPage,
            limit: itemsPerPage,
          },
        });
        console.log("Dữ liệu place_names:", response.data);
        const mappedData = response.data.data.map((row) => ({
          Huyện: row.huyen,
          Tổng: row.tong,
          "Số thứ tự": row.so_thu_tu,
          "Địa danh Chung": row.dia_danh_chung || "",
          "Tên riêng": row.ten_rieng || "",
          "Chữ hán/Nôm (nếu có)": row.chu_han_nom || "",
          Nguồn: row.nguon || "",
          "Mô tả": row.mo_ta || "",
          "Nhận xét": row.nhan_xet || "",
          "Ghi Chú": row.ghi_chu || "",
          "Tên khác": row.ten_khac || "",
          id: row.id,
        }));
        console.log("Dữ liệu mappedData:", mappedData);
        setData(mappedData);
        setFilteredData(mappedData);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedHuyen, currentPage, itemsPerPage]);

  useEffect(() => {
    let result = data;
    console.log("Dữ liệu data trước khi lọc:", data);
    if (selectedTong !== "All") {
      result = result.filter((row) => row["Tổng"] === selectedTong);
    }
    if (searchQuery) {
      result = result.filter(
        (row) =>
          row["Tên riêng"]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row["Mô tả"]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    console.log("Dữ liệu filteredData sau khi lọc:", result);
    setFilteredData(result);
  }, [selectedTong, searchQuery, data]);

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredData(sortedData);
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.post(
        `${API_URL}/api/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.imagePath;
    } catch (err) {
      setError("Lỗi khi upload hình ảnh: " + err.message);
      showNotification("Lỗi khi upload hình ảnh: " + err.message, "error");
      return null;
    }
  };

  const handleHeaderChange = (field, value) => {
    if (field === "imageFile") {
      setNewHeader((prev) => ({ ...prev, imageFile: value }));
    } else {
      setNewHeader((prev) => ({ ...prev, [field]: value }));
    }
  };

  const saveHeader = async () => {
    try {
      let chu_han_nom = newHeader.chu_han_nom;
      if (newHeader.imageFile) {
        chu_han_nom = await uploadImage(newHeader.imageFile);
        if (!chu_han_nom) return;
      }
      const headerData = { ...newHeader, chu_han_nom };
      const response = await axios.post(
        `${API_URL}/api/place-headers`,
        headerData
      );
      setHeaders((prev) => [...prev, response.data]);
      setAddHeaderModal(false);
      setNewHeader({
        huyen: "",
        tong: "",
        level: "",
        name: "",
        chu_han_nom: "",
        imageFile: null,
      });
      showNotification("Thêm tiêu đề thành công!", "success");
    } catch (err) {
      setError("Lỗi khi lưu tiêu đề: " + err.message);
      showNotification("Lỗi khi lưu tiêu đề: " + err.message, "error");
    }
  };

  const handleDataChange = (field, value) => {
    if (field === "imageFile") {
      setNewData((prev) => ({ ...prev, imageFile: value }));
    } else {
      setNewData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const saveData = async () => {
    if (!newData["ten_rieng"]) {
      alert("Tên riêng là bắt buộc");
      return;
    }
    try {
      let chu_han_nom = newData.chu_han_nom;
      if (newData.imageFile) {
        chu_han_nom = await uploadImage(newData.imageFile);
        if (!chu_han_nom) return;
      }
      const dataToSave = { ...newData, chu_han_nom };
      const response = await axios.post(
        `${API_URL}/api/place-names`,
        dataToSave
      );
      setData((prev) => [
        ...prev,
        {
          Huyện: response.data.huyen,
          Tổng: response.data.tong,
          "Số thứ tự": response.data.so_thu_tu,
          "Địa danh Chung": response.data.dia_danh_chung || "",
          "Tên riêng": response.data.ten_rieng || "",
          "Chữ hán/Nôm (nếu có)": response.data.chu_han_nom || "",
          Nguồn: response.data.nguon || "",
          "Mô tả": response.data.mo_ta || "",
          "Nhận xét": response.data.nhan_xet || "",
          "Ghi Chú": response.data.ghi_chu || "",
          "Tên khác": response.data.ten_khac || "",
          id: response.data.id,
        },
      ]);
      setFilteredData((prev) => [
        ...prev,
        {
          Huyện: response.data.huyen,
          Tổng: response.data.tong,
          "Số thứ tự": response.data.so_thu_tu,
          "Địa danh Chung": response.data.dia_danh_chung || "",
          "Tên riêng": response.data.ten_rieng || "",
          "Chữ hán/Nôm (nếu có)": response.data.chu_han_nom || "",
          Nguồn: response.data.nguon || "",
          "Mô tả": response.data.mo_ta || "",
          "Nhận xét": response.data.nhan_xet || "",
          "Ghi Chú": response.data.ghi_chu || "",
          "Tên khác": response.data.ten_khac || "",
          id: response.data.id,
        },
      ]);
      setAddDataModal(false);
      setNewData({
        huyen: "",
        tong: "",
        dia_danh_chung: "",
        ten_rieng: "",
        chu_han_nom: "",
        nguon: "",
        mo_ta: "",
        nhan_xet: "",
        ghi_chu: "",
        ten_khac: "",
        imageFile: null,
      });
      showNotification("Thêm dữ liệu thành công!", "success");
    } catch (err) {
      setError("Lỗi khi lưu dữ liệu: " + err.message);
      showNotification("Lỗi khi lưu dữ liệu: " + err.message, "error");
    }
  };

  const openEditModal = (row) => {
    setEditData({ ...row, imageFile: null });
    setEditModal(row);
  };

  const handleEditChange = (field, value) => {
    if (field === "imageFile") {
      setEditData((prev) => ({ ...prev, imageFile: value }));
    } else {
      setEditData((prev) => ({ ...prev, [field]: value }));
      setEditModal((prev) => ({ ...prev, [field]: value }));
    }
  };

  const saveEdit = async () => {
    if (!editModal["Tên riêng"]) {
      alert("Tên riêng là bắt buộc");
      return;
    }
    try {
      let chu_han_nom = editModal["Chữ hán/Nôm (nếu có)"];
      if (editData.imageFile) {
        chu_han_nom = await uploadImage(editData.imageFile);
        if (!chu_han_nom) return;
      }
      const updatedData = { ...editModal, "Chữ hán/Nôm (nếu có)": chu_han_nom };
      await axios.put(`${API_URL}/api/place-names/${editModal.id}`, {
        huyen: updatedData["Huyện"],
        tong: updatedData["Tổng"],
        so_thu_tu: updatedData["Số thứ tự"],
        dia_danh_chung: updatedData["Địa danh Chung"],
        ten_rieng: updatedData["Tên riêng"],
        chu_han_nom: updatedData["Chữ hán/Nôm (nếu có)"],
        nguon: updatedData["Nguồn"],
        mo_ta: updatedData["Mô tả"],
        nhan_xet: updatedData["Nhận xét"],
        ghi_chu: updatedData["Ghi Chú"],
        ten_khac: updatedData["Tên khác"],
      });
      const newData = data.map((row) =>
        row.id === editModal.id ? updatedData : row
      );
      setData(newData);
      setFilteredData(
        newData.filter(
          (row) =>
            (selectedHuyen === "All" || row["Huyện"] === selectedHuyen) &&
            (selectedTong === "All" || row["Tổng"] === selectedTong)
        )
      );
      setEditModal(null);
      setEditData(null);
      showNotification("Sửa dữ liệu thành công!", "success");
    } catch (err) {
      setError("Lỗi khi cập nhật dữ liệu: " + err.message);
      showNotification("Lỗi khi cập nhật dữ liệu: " + err.message, "error");
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa danh này?")) return;
    try {
      await axios.delete(`${API_URL}/api/place-names/${id}`);
      const newData = data.filter((row) => row.id !== id);
      setData(newData);
      setFilteredData(
        newData.filter(
          (row) =>
            (selectedHuyen === "All" || row["Huyện"] === selectedHuyen) &&
            (selectedTong === "All" || row["Tổng"] === selectedTong)
        )
      );
      setTotalItems((prev) => prev - 1);
      showNotification("Xóa dữ liệu thành công!", "success");
    } catch (err) {
      setError("Lỗi khi xóa dữ liệu: " + err.message);
      showNotification("Lỗi khi xóa dữ liệu: " + err.message, "error");
    }
  };

  const getPhuOptions = (selectedHuyen) => {
    const filteredHeaders = headers.filter(
      (header) => header.huyen === selectedHuyen && header.level === "Phủ"
    );
    return [...new Set(filteredHeaders.map((header) => header.name))];
  };

  const getTongOptions = (selectedHuyen) => {
    const dienBanTongList = [
      "Tổng Thanh Quất Trung",
      "Tổng Phú Triêm Hạ",
      "Tổng Hạ Trung Nông",
      "Tổng Đa Hoà Thượng",
      "Tổng Thái Thượng",
      "Tổng Nhơn Trung",
      "Tổng An Hạ Lưu",
    ];

    const filteredHeaders = headers.filter(
      (header) => header.huyen === selectedHuyen && header.level === "Tổng"
    );
    let tongList = [...new Set(filteredHeaders.map((header) => header.tong))];

    if (selectedHuyen === "Huyện Điện Bàn") {
      tongList = dienBanTongList;
    }

    return ["All", ...tongList];
  };

  const getTongChuHanNom = (selectedHuyen, selectedTong) => {
    const tongHeader = headers.find(
      (header) =>
        header.huyen === selectedHuyen &&
        header.tong === selectedTong &&
        header.level === "Tổng"
    );
    return tongHeader ? tongHeader.chu_han_nom : null;
  };

  const [formHuyen, setFormHuyen] = useState("");
  const [formTongOptions, setFormTongOptions] = useState(["All"]);

  useEffect(() => {
    if (formHuyen) {
      setFormTongOptions(getTongOptions(formHuyen));
    } else {
      setFormTongOptions(["All"]);
    }
  }, [formHuyen, headers]);

  const [editFormHuyen, setEditFormHuyen] = useState("");
  const [editFormTongOptions, setEditFormTongOptions] = useState(["All"]);

  useEffect(() => {
    if (editFormHuyen) {
      setEditFormTongOptions(getTongOptions(editFormHuyen));
    } else {
      setEditFormTongOptions(["All"]);
    }
  }, [editFormHuyen, headers]);

  const tongOptions = getTongOptions(selectedHuyen);
  const phuOptions = getPhuOptions(selectedHuyen);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-md text-white ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {notification.message}
        </div>
      )}

      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white dark:bg-gray-800 p-4 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6">Quảng Nam</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lọc theo Tổng
          </label>
          <select
            value={selectedTong}
            onChange={(e) => setSelectedTong(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          >
            {tongOptions.map((tong) => (
              <option key={tong} value={tong}>
                {tong}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tìm kiếm
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mô tả"
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => setAddHeaderModal(true)}
          className="w-full mt-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Thêm Tiêu Đề
        </button>
        <button
          onClick={() => setAddDataModal(true)}
          className="w-full mt-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Thêm Dữ Liệu
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full mt-2 p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          {darkMode ? "Chế độ sáng" : "Chế độ tối"}
        </button>
      </motion.div>

      <div className="flex-1 p-6">
        <div className="flex mb-6">
          {huyenList.map((huyen) => (
            <button
              key={huyen}
              onClick={() => {
                setSelectedHuyen(huyen);
                setSelectedTong("All");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 mr-2 rounded-md ${
                selectedHuyen === huyen
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              } hover:bg-blue-500 hover:text-white`}
            >
              {huyen}
            </button>
          ))}
        </div>

        {selectedHuyen && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chọn Phủ
            </label>
            <select
              value={selectedPhu || ""}
              onChange={(e) => setSelectedPhu(e.target.value)}
              className="w-1/4 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">Chọn Phủ</option>
              {phuOptions.map((phu) => (
                <option key={phu} value={phu}>
                  {phu}
                </option>
              ))}
            </select>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 text-center"
        >
          {selectedHuyen === "Huyện Duy Xuyên" && (
            <>
              <div className="flex justify-center items-center mb-4">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 mr-4">
                  QUẢNG NAM
                </span>
                {(() => {
                  try {
                    const quangNamHeader = headers.find(
                      (header) =>
                        header.huyen === selectedHuyen &&
                        header.level === "Tỉnh"
                    );
                    return (
                      <img
                        src={
                          quangNamHeader?.chu_han_nom ||
                          "/images/quang_nam_default.png"
                        }
                        alt="Chữ Hán/Nôm - QUẢNG NAM"
                        className="h-16 w-16 object-contain p-2 border rounded-md"
                        onError={(e) => {
                          console.error("Không tải được hình ảnh QUẢNG NAM");
                          e.target.style.display = "none";
                        }}
                      />
                    );
                  } catch (err) {
                    console.error("Lỗi khi hiển thị hình ảnh QUẢNG NAM:", err);
                    return null;
                  }
                })()}
              </div>
              <div className="flex justify-center items-center mb-4">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 mr-4">
                  PHỦ THĂNG HOA
                </span>
                {(() => {
                  try {
                    const phuThangHoaHeader = headers.find(
                      (header) =>
                        header.huyen === selectedHuyen && header.level === "Phủ"
                    );
                    return (
                      <img
                        src={
                          phuThangHoaHeader?.chu_han_nom ||
                          "/images/phu_thang_hoa_default.png"
                        }
                        alt="Chữ Hán/Nôm - PHỦ THĂNG HOA"
                        className="h-16 w-16 object-contain p-2 border rounded-md"
                        onError={(e) => {
                          console.error(
                            "Không tải được hình ảnh PHỦ THĂNG HOA"
                          );
                          e.target.style.display = "none";
                        }}
                      />
                    );
                  } catch (err) {
                    console.error(
                      "Lỗi khi hiển thị hình ảnh PHỦ THĂNG HOA:",
                      err
                    );
                    return null;
                  }
                })()}
              </div>
              <div className="flex justify-center items-center mb-4">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 mr-4">
                  HUYỆN DUY XUYÊN
                </span>
                {(() => {
                  try {
                    const huyenDuyXuyenHeader = headers.find(
                      (header) =>
                        header.huyen === selectedHuyen &&
                        header.level === "Huyện"
                    );
                    return (
                      <img
                        src={
                          huyenDuyXuyenHeader?.chu_han_nom ||
                          "/images/huyen_duy_xuyen_default.png"
                        }
                        alt="Chữ Hán/Nôm - HUYỆN DUY XUYÊN"
                        className="h-16 w-16 object-contain p-2 border rounded-md"
                        onError={(e) => {
                          console.error(
                            "Không tải được hình ảnh HUYỆN DUY XUYÊN"
                          );
                          e.target.style.display = "none";
                        }}
                      />
                    );
                  } catch (err) {
                    console.error(
                      "Lỗi khi hiển thị hình ảnh HUYỆN DUY XUYÊN:",
                      err
                    );
                    return null;
                  }
                })()}
              </div>
              {selectedTong !== "All" && (
                <div className="flex justify-center items-center mb-4">
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 mr-4">
                    {selectedTong.toUpperCase()}
                  </span>
                  {(() => {
                    try {
                      const chuHanNomPath = getTongChuHanNom(
                        selectedHuyen,
                        selectedTong
                      );
                      if (!chuHanNomPath)
                        throw new Error("Không tìm thấy chữ Hán/Nôm cho Tổng");
                      return (
                        <img
                          src={chuHanNomPath}
                          alt={`Chữ Hán/Nôm - ${selectedTong}`}
                          className="h-16 w-16 object-contain p-2 border rounded-md"
                          onError={(e) => {
                            console.error(
                              `Không tải được hình ảnh ${selectedTong}`
                            );
                            e.target.style.display = "none";
                          }}
                        />
                      );
                    } catch (err) {
                      console.error(
                        `Lỗi khi hiển thị hình ảnh ${selectedTong}:`,
                        err
                      );
                      return null;
                    }
                  })()}
                </div>
              )}
            </>
          )}
          {selectedHuyen === "Huyện Điện Bàn" && (
            <>
              <div className="flex justify-center items-center mb-4">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 mr-4">
                  QUẢNG NAM
                </span>
                {(() => {
                  try {
                    const quangNamHeader = headers.find(
                      (header) =>
                        header.huyen === selectedHuyen &&
                        header.level === "Tỉnh"
                    );
                    return (
                      <img
                        src={
                          quangNamHeader?.chu_han_nom ||
                          "/images/quang_nam_default.png"
                        }
                        alt="Chữ Hán/Nôm - QUẢNG NAM"
                        className="h-16 w-16 object-contain p-2 border rounded-md"
                        onError={(e) => {
                          console.error("Không tải được hình ảnh QUẢNG NAM");
                          e.target.style.display = "none";
                        }}
                      />
                    );
                  } catch (err) {
                    console.error("Lỗi khi hiển thị hình ảnh QUẢNG NAM:", err);
                    return null;
                  }
                })()}
              </div>
              <div className="flex justify-center items-center mb-4">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 mr-4">
                  PHỦ ĐIỆN BÀN
                </span>
                {(() => {
                  try {
                    const phuDienBanHeader = headers.find(
                      (header) =>
                        header.huyen === selectedHuyen && header.level === "Phủ"
                    );
                    return (
                      <img
                        src={
                          phuDienBanHeader?.chu_han_nom ||
                          "/images/phu_dien_ban_default.png"
                        }
                        alt="Chữ Hán/Nôm - PHỦ ĐIỆN BÀN"
                        className="h-16 w-16 object-contain p-2 border rounded-md"
                        onError={(e) => {
                          console.error("Không tải được hình ảnh PHỦ ĐIỆN BÀN");
                          e.target.style.display = "none";
                        }}
                      />
                    );
                  } catch (err) {
                    console.error(
                      "Lỗi khi hiển thị hình ảnh PHỦ ĐIỆN BÀN:",
                      err
                    );
                    return null;
                  }
                })()}
              </div>
              {selectedTong !== "All" && (
                <div className="flex justify-center items-center mb-4">
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 mr-4">
                    {selectedTong.toUpperCase()}
                  </span>
                  {(() => {
                    try {
                      const chuHanNomPath = getTongChuHanNom(
                        selectedHuyen,
                        selectedTong
                      );
                      if (!chuHanNomPath)
                        throw new Error("Không tìm thấy chữ Hán/Nôm cho Tổng");
                      return (
                        <img
                          src={chuHanNomPath}
                          alt={`Chữ Hán/Nôm - ${selectedTong}`}
                          className="h-16 w-16 object-contain p-2 border rounded-md"
                          onError={(e) => {
                            console.error(
                              `Không tải được hình ảnh ${selectedTong}`
                            );
                            e.target.style.display = "none";
                          }}
                        />
                      );
                    } catch (err) {
                      console.error(
                        `Lỗi khi hiển thị hình ảnh ${selectedTong}:`,
                        err
                      );
                      return null;
                    }
                  })()}
                </div>
              )}
            </>
          )}
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
              Lỗi
            </h2>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto"
        >
          {filteredData.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                    onClick={() => requestSort("Số thứ tự")}
                  >
                    Số thứ tự
                    {sortConfig.key === "Số thứ tự" && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-4 py-3 text-center text-sm font-medium"
                    colSpan="3"
                  >
                    Địa danh
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                    onClick={() => requestSort("Nguồn")}
                  >
                    Nguồn
                    {sortConfig.key === "Nguồn" && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                    onClick={() => requestSort("Mô tả")}
                  >
                    Mô tả
                    {sortConfig.key === "Mô tả" && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                    onClick={() => requestSort("Nhận xét")}
                  >
                    Nhận xét
                    {sortConfig.key === "Nhận xét" && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                    onClick={() => requestSort("Ghi Chú")}
                  >
                    Ghi Chú
                    {sortConfig.key === "Ghi Chú" && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                    onClick={() => requestSort("Tên khác")}
                  >
                    Tên khác
                    {sortConfig.key === "Tên khác" && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Hành động
                  </th>
                </tr>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium"></th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                    onClick={() => requestSort("Địa danh Chung")}
                  >
                    Chung
                    {sortConfig.key === "Địa danh Chung" && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                    onClick={() => requestSort("Tên riêng")}
                  >
                    Tên riêng
                    {sortConfig.key === "Tên riêng" && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Chữ hán/Nôm (nếu có)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium"></th>
                  <th className="px-4 py-3 text-left text-sm font-medium"></th>
                  <th className="px-4 py-3 text-left text-sm font-medium"></th>
                  <th className="px-4 py-3 text-left text-sm font-medium"></th>
                  <th className="px-4 py-3 text-left text-sm font-medium"></th>
                  <th className="px-4 py-3 text-left text-sm font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => (
                  <motion.tr
                    key={`${row["Số thứ tự"]}-${row["Tổng"]}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">{row["Số thứ tự"]}</td>
                    <td className="px-4 py-3">{row["Địa danh Chung"]}</td>
                    <td className="px-4 py-3">{row["Tên riêng"]}</td>
                    <td className="px-4 py-3">
                      {row["Chữ hán/Nôm (nếu có)"] ? (
                        <img
                          src={row["Chữ hán/Nôm (nếu có)"]}
                          alt="Chữ Hán/Nôm"
                          className="h-16 w-16 object-contain p-2 border rounded-md"
                        />
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="px-4 py-3">{row["Nguồn"]}</td>
                    <td className="px-4 py-3">{row["Mô tả"]}</td>
                    <td className="px-4 py-3">{row["Nhận xét"]}</td>
                    <td className="px-4 py-3">{row["Ghi Chú"]}</td>
                    <td className="px-4 py-3">{row["Tên khác"]}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEditModal(row)}
                        className="text-blue-600 hover:underline mr-2"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteRow(row.id)}
                        className="text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-4 text-gray-700 dark:text-gray-300">
              Không có dữ liệu phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </motion.div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Số hàng mỗi trang:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          {filteredData.length > 0 && (
            <div className="flex items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 mr-2"
              >
                Trước
              </button>
              <span>
                Trang {currentPage} / {totalPages} (Tổng: {totalItems})
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 ml-2"
              >
                Sau
              </button>
            </div>
          )}
        </div>

        {addHeaderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
              <h2 className="text-xl font-semibold mb-4">Thêm Tiêu Đề</h2>
              {["huyen", "tong", "level", "name"].map((field) => (
                <div key={field} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field === "huyen"
                      ? "Huyện"
                      : field === "tong"
                      ? "Tổng"
                      : field === "level"
                      ? "Cấp độ (Tỉnh/Phủ/Huyện/Tổng)"
                      : "Tên Tiêu Đề"}
                  </label>
                  <input
                    type="text"
                    value={newHeader[field]}
                    onChange={(e) => handleHeaderChange(field, e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ))}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hình ảnh Chữ Hán/Nôm (.png)
                </label>
                <input
                  type="file"
                  accept="image/png"
                  onChange={(e) =>
                    handleHeaderChange("imageFile", e.target.files[0])
                  }
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setAddHeaderModal(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                >
                  Hủy
                </button>
                <button
                  onClick={saveHeader}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Lưu
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {addDataModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Thêm Dữ Liệu</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Huyện
                </label>
                <select
                  value={newData.huyen}
                  onChange={(e) => {
                    setFormHuyen(e.target.value);
                    setNewData((prev) => ({
                      ...prev,
                      huyen: e.target.value,
                      tong: "",
                    }));
                  }}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Chọn Huyện</option>
                  {huyenList.map((huyen) => (
                    <option key={huyen} value={huyen}>
                      {huyen}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tổng
                </label>
                <select
                  value={newData.tong}
                  onChange={(e) =>
                    setNewData((prev) => ({ ...prev, tong: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  disabled={!newData.huyen}
                >
                  <option value="">Chọn Tổng</option>
                  {formTongOptions.slice(1).map((tong) => (
                    <option key={tong} value={tong}>
                      {tong}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Địa danh
                </label>
                <div className="ml-4">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Chung
                    </label>
                    <input
                      type="text"
                      value={newData.dia_danh_chung}
                      onChange={(e) =>
                        handleDataChange("dia_danh_chung", e.target.value)
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tên riêng
                    </label>
                    <input
                      type="text"
                      value={newData.ten_rieng}
                      onChange={(e) =>
                        handleDataChange("ten_rieng", e.target.value)
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Chữ hán/Nôm (nếu có) (.png)
                    </label>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={(e) =>
                        handleDataChange("imageFile", e.target.files[0])
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {["nguon", "mo_ta", "nhan_xet", "ghi_chu", "ten_khac"].map(
                (field) => (
                  <div key={field} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field === "nguon"
                        ? "Nguồn"
                        : field === "mo_ta"
                        ? "Mô tả"
                        : field === "nhan_xet"
                        ? "Nhận xét"
                        : field === "ghi_chu"
                        ? "Ghi Chú"
                        : "Tên khác"}
                    </label>
                    <input
                      type="text"
                      value={newData[field]}
                      onChange={(e) => handleDataChange(field, e.target.value)}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setAddDataModal(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                >
                  Hủy
                </button>
                <button
                  onClick={saveData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Lưu
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Sửa địa danh</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Huyện
                </label>
                <select
                  value={editData["Huyện"]}
                  onChange={(e) => {
                    setEditFormHuyen(e.target.value);
                    handleEditChange("Huyện", e.target.value);
                    handleEditChange("Tổng", "");
                  }}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  disabled
                >
                  <option value="">Chọn Huyện</option>
                  {huyenList.map((huyen) => (
                    <option key={huyen} value={huyen}>
                      {huyen}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tổng
                </label>
                <select
                  value={editData["Tổng"]}
                  onChange={(e) => handleEditChange("Tổng", e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  disabled
                >
                  <option value="">Chọn Tổng</option>
                  {editFormTongOptions.slice(1).map((tong) => (
                    <option key={tong} value={tong}>
                      {tong}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Địa danh
                </label>
                <div className="ml-4">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Chung
                    </label>
                    <input
                      type="text"
                      value={editData["Địa danh Chung"]}
                      onChange={(e) =>
                        handleEditChange("Địa danh Chung", e.target.value)
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tên riêng
                    </label>
                    <input
                      type="text"
                      value={editData["Tên riêng"]}
                      onChange={(e) =>
                        handleEditChange("Tên riêng", e.target.value)
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Chữ hán/Nôm (nếu có) (.png)
                    </label>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={(e) =>
                        handleEditChange("imageFile", e.target.files[0])
                      }
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                    {editModal["Chữ hán/Nôm (nếu có)"] && (
                      <img
                        src={editModal["Chữ hán/Nôm (nếu có)"]}
                        alt="Chữ Hán/Nôm"
                        className="mt-2 h-16 w-16 object-contain p-2 border rounded-md"
                      />
                    )}
                  </div>
                </div>
              </div>

              {["Nguồn", "Mô tả", "Nhận xét", "Ghi Chú", "Tên khác"].map(
                (field) => (
                  <div key={field} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field}
                    </label>
                    <input
                      type="text"
                      value={editData[field] || ""}
                      onChange={(e) => handleEditChange(field, e.target.value)}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setEditModal(null)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                >
                  Hủy
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Lưu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
