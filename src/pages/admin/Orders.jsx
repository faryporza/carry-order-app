import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { socket } from "../../services/socket";

const STATUS = ["pending","confirmed","delivering","done","cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // โหลดครั้งแรก
  useEffect(() => {
    API.get("/orders").then(res => {
      setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // subscribe realtime
  useEffect(() => {
    const onNew = (o) => setOrders(prev => [o, ...prev]);
    const onUpdate = (o) => setOrders(prev => prev.map(x => x._id === o._id ? o : x));
    const onDelete = (id) => setOrders(prev => prev.filter(x => x._id !== id));

    socket.on("order:new", onNew);
    socket.on("order:update", onUpdate);
    socket.on("order:delete", onDelete);

    return () => {
      socket.off("order:new", onNew);
      socket.off("order:update", onUpdate);
      socket.off("order:delete", onDelete);
    };
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}`, { status });
      // ไม่ต้อง setState เอง รอ event "order:update" จาก server
    } catch {
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  const remove = async (id) => {
    if (!confirm("ลบคำสั่งซื้อนี้?")) return;
    try {
      await API.delete(`/orders/${id}`);
      // รอ "order:delete"
    } catch {
      alert("เกิดข้อผิดพลาดในการลบออเดอร์");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivering": return "bg-purple-100 text-purple-800 border-purple-200";
      case "done": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "รอดำเนินการ";
      case "confirmed": return "ยืนยันแล้ว";
      case "delivering": return "กำลังจัดส่ง";
      case "done": return "เสร็จสิ้น";
      case "cancelled": return "ยกเลิก";
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_contact?.includes(searchTerm) ||
      order.product_id?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

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
              <h1 className="text-2xl font-bold text-gray-900">📋 จัดการออเดอร์</h1>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🔄 Real-time
                </span>
                <span className="text-sm text-gray-500">
                  ทั้งหมด {orders.length} รายการ
                </span>
              </div>
            </div>
            <Link
              to="/admin/products"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              จัดการสินค้า →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                ทั้งหมด ({orders.length})
              </button>
              {STATUS.map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    filter === status
                      ? getStatusColor(status).replace("bg-", "bg-").replace("text-", "text-")
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {getStatusText(status)} ({statusCounts[status] || 0})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, เบอร์, หรือสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filter !== "all" ? "ไม่พบออเดอร์ที่ตรงกับเงื่อนไข" : "ยังไม่มีออเดอร์"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== "all" 
                  ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" 
                  : "เมื่อมีลูกค้าสั่งซื้อ ออเดอร์จะแสดงที่นี่"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เวลา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สินค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ลูกค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รายละเอียด
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
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('th-TH', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.product_id?.title || "สินค้าถูกลบ"}
                        </div>
                        <div className="text-sm text-gray-500">
                          📍 {order.product_id?.store}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          ฿{order.product_id?.price?.toLocaleString()} × {order.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          📞 {order.customer_contact}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.selected_options?.size && (
                          <div>ขนาด: <span className="font-medium">{order.selected_options.size}</span></div>
                        )}
                        {order.selected_options?.toppings?.length > 0 && (
                          <div>ท็อปปิ้ง: <span className="font-medium">{order.selected_options.toppings.join(", ")}</span></div>
                        )}
                        {order.note && (
                          <div className="mt-1 p-2 bg-blue-50 rounded text-xs">
                            💬 {order.note}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}
                          value={order.status}
                          onChange={e => changeStatus(order._id, e.target.value)}
                        >
                          {STATUS.map(status => (
                            <option key={status} value={status}>
                              {getStatusText(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => remove(order._id)}
                          className="text-red-600 hover:text-red-900 font-medium"
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
