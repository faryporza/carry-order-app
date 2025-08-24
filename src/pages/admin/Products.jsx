import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ 
    title: "", 
    store: "", 
    price: "", 
    url: "", 
    note: "",
    status: "available",
    options: {
      size: [],
      toppings: []
    }
  });
  const [newSize, setNewSize] = useState("");
  const [newTopping, setNewTopping] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch {
      alert("เกิดข้อผิดพลาดในการโหลดสินค้า");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setForm({ 
      title: "", 
      store: "", 
      price: "", 
      url: "", 
      note: "",
      status: "available",
      options: {
        size: [],
        toppings: []
      }
    });
    setEditingProduct(null);
    setNewSize("");
    setNewTopping("");
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setForm({
      title: product.title || "",
      store: product.store || "",
      price: product.price?.toString() || "",
      url: product.url || "",
      note: product.note || "",
      status: product.status || "available",
      options: {
        size: product.options?.size || [],
        toppings: product.options?.toppings || []
      }
    });
  };

  const saveProduct = async () => {
    if (!form.title || !form.price) {
      alert("กรุณากรอกชื่อสินค้าและราคา");
      return;
    }

    const productData = {
      ...form,
      price: Number(form.price),
    };

    try {
      if (editingProduct) {
        await API.put(`/products/${editingProduct._id}`, productData);
      } else {
        await API.post("/products", productData);
      }
      resetForm();
      fetchProducts();
    } catch {
      alert("เกิดข้อผิดพลาดในการบันทึกสินค้า");
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("ลบสินค้านี้?")) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch {
      alert("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  const addSize = () => {
    if (newSize.trim() && !form.options.size.includes(newSize.trim())) {
      setForm({
        ...form,
        options: {
          ...form.options,
          size: [...form.options.size, newSize.trim()]
        }
      });
      setNewSize("");
    }
  };

  const removeSize = (sizeToRemove) => {
    setForm({
      ...form,
      options: {
        ...form.options,
        size: form.options.size.filter(size => size !== sizeToRemove)
      }
    });
  };

  const addTopping = () => {
    if (newTopping.trim() && !form.options.toppings.includes(newTopping.trim())) {
      setForm({
        ...form,
        options: {
          ...form.options,
          toppings: [...form.options.toppings, newTopping.trim()]
        }
      });
      setNewTopping("");
    }
  };

  const removeTopping = (toppingToRemove) => {
    setForm({
      ...form,
      options: {
        ...form.options,
        toppings: form.options.toppings.filter(topping => topping !== toppingToRemove)
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "unavailable": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available": return "พร้อมสั่ง";
      case "unavailable": return "ไม่พร้อมสั่ง";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">📦 จัดการสินค้า</h1>
              <span className="text-sm text-gray-500">
                ทั้งหมด {products.length} รายการ
              </span>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              จัดการออเดอร์ →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อสินค้า *
                </label>
                <input
                  type="text"
                  placeholder="ชื่อสินค้า"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ร้านค้า
                </label>
                <input
                  type="text"
                  placeholder="ร้านค้า"
                  value={form.store}
                  onChange={(e) => setForm({ ...form, store: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคา (บาท) *
                </label>
                <input
                  type="number"
                  placeholder="ราคา"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปภาพ (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">พร้อมสั่ง</option>
                  <option value="unavailable">ไม่พร้อมสั่ง</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุ
                </label>
                <textarea
                  placeholder="หมายเหตุเพิ่มเติม..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Size Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ตัวเลือกขนาด
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="เช่น S, M, L"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSize()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    เพิ่ม
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.options.size.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Topping Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ตัวเลือกท็อปปิ้ง
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="เช่น ชีส, เบคอน"
                    value={newTopping}
                    onChange={(e) => setNewTopping(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTopping()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTopping}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    เพิ่ม
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.options.toppings.map((topping) => (
                    <span
                      key={topping}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {topping}
                      <button
                        type="button"
                        onClick={() => removeTopping(topping)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {form.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ตัวอย่างรูปภาพ
                  </label>
                  <img
                    src={form.url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-32 bg-gray-100 border border-gray-300 rounded-lg items-center justify-center">
                    <span className="text-gray-400">รูปภาพไม่สามารถโหลดได้</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
            )}
            <button
              type="button"
              onClick={saveProduct}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {editingProduct ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">รายการสินค้า</h2>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีสินค้า</h3>
              <p className="text-gray-600">เพิ่มสินค้าแรกของคุณเพื่อเริ่มต้นรับออเดอร์</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สินค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ร้านค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ราคา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ตัวเลือก
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.url ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover mr-4"
                              src={product.url}
                              alt={product.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="hidden h-10 w-10 rounded-lg bg-gray-100 mr-4 items-center justify-center">
                            <span className="text-gray-400 text-sm">🍽️</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            {product.note && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{product.note}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.store || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        ฿{product.price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.options?.size?.length > 0 && (
                          <div className="mb-1">
                            <span className="font-medium">ขนาด: </span>
                            {product.options.size.join(", ")}
                          </div>
                        )}
                        {product.options?.toppings?.length > 0 && (
                          <div>
                            <span className="font-medium">ท็อปปิ้ง: </span>
                            {product.options.toppings.join(", ")}
                          </div>
                        )}
                        {!product.options?.size?.length && !product.options?.toppings?.length && (
                          <span className="text-gray-400">ไม่มีตัวเลือก</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {getStatusText(product.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => editProduct(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
