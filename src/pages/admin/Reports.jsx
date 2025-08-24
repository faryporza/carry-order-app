import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("today");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    topProducts: [],
    ordersByStatus: {},
    ordersByHour: {},
    recentActivity: []
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        API.get("/orders"),
        API.get("/products")
      ]);

      const orders = ordersRes.data;
      const products = productsRes.data;

      // Filter orders by date range
      const now = new Date();
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (dateRange) {
          case "today":
            return orderDate.toDateString() === now.toDateString();
          case "week": {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          }
          case "month": {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          }
          case "all":
          default:
            return true;
        }
      });

      // Calculate revenue (only completed orders)
      const completedOrders = filteredOrders.filter(order => order.status === "done");
      const totalRevenue = completedOrders.reduce((sum, order) => {
        const product = products.find(p => p._id === order.product_id?._id || order.product_id);
        return sum + (product?.price || 0) * (order.quantity || 1);
      }, 0);

      // Calculate top products
      const productSales = {};
      completedOrders.forEach(order => {
        const productId = order.product_id?._id || order.product_id;
        const product = products.find(p => p._id === productId);
        if (product) {
          if (!productSales[productId]) {
            productSales[productId] = {
              product,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += order.quantity || 1;
          productSales[productId].revenue += (product.price || 0) * (order.quantity || 1);
        }
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Orders by status
      const ordersByStatus = filteredOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      // Orders by hour (for today/week)
      const ordersByHour = {};
      if (dateRange === "today" || dateRange === "week") {
        filteredOrders.forEach(order => {
          const hour = new Date(order.createdAt).getHours();
          ordersByHour[hour] = (ordersByHour[hour] || 0) + 1;
        });
      }

      setStats({
        totalOrders: filteredOrders.length,
        totalRevenue,
        avgOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
        topProducts,
        ordersByStatus,
        ordersByHour,
        recentActivity: orders.slice(-10).reverse()
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "delivering": return "bg-purple-100 text-purple-800";
      case "done": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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

  const getDateRangeText = (range) => {
    switch (range) {
      case "today": return "วันนี้";
      case "week": return "7 วันที่ผ่านมา";
      case "month": return "30 วันที่ผ่านมา";
      case "all": return "ทั้งหมด";
      default: return range;
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
              <h1 className="text-2xl font-bold text-gray-900">📊 รายงานและสถิติ</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">วันนี้</option>
                <option value="week">7 วันที่ผ่านมา</option>
                <option value="month">30 วันที่ผ่านมา</option>
                <option value="all">ทั้งหมด</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ออเดอร์ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">({getDateRangeText(dateRange)})</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ยอดขายรวม</p>
                <p className="text-2xl font-bold text-gray-900">฿{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">(เฉพาะออเดอร์ที่เสร็จสิ้น)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ยอดขายเฉลี่ย/ออเดอร์</p>
                <p className="text-2xl font-bold text-gray-900">฿{Math.round(stats.avgOrderValue).toLocaleString()}</p>
                <p className="text-xs text-gray-500">(ค่าเฉลี่ยต่อออเดอร์)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">🏆 สินค้าขายดี</h2>
              <p className="text-sm text-gray-600">อันดับตามยอดขาย ({getDateRangeText(dateRange)})</p>
            </div>
            <div className="p-6">
              {stats.topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📊</div>
                  <p className="text-gray-600">ยังไม่มีข้อมูลการขาย</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topProducts.map((item, index) => (
                    <div key={item.product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.product.title}</p>
                          <p className="text-sm text-gray-600">{item.product.store}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">฿{item.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{item.quantity} ชิ้น</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">📋 สถานะออเดอร์</h2>
              <p className="text-sm text-gray-600">จำนวนออเดอร์แยกตามสถานะ</p>
            </div>
            <div className="p-6">
              {Object.keys(stats.ordersByStatus).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📭</div>
                  <p className="text-gray-600">ยังไม่มีออเดอร์</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                      <span className="text-xl font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders by Hour (only for today/week) */}
        {(dateRange === "today" || dateRange === "week") && Object.keys(stats.ordersByHour).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">⏰ ออเดอร์ตามช่วงเวลา</h2>
              <p className="text-sm text-gray-600">จำนวนออเดอร์แยกตามชั่วโมง</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-12 gap-2">
                {Array.from({ length: 24 }, (_, hour) => {
                  const count = stats.ordersByHour[hour] || 0;
                  const maxCount = Math.max(...Object.values(stats.ordersByHour));
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={hour} className="text-center">
                      <div className="h-20 flex items-end justify-center mb-2">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0px' }}
                          title={`${hour}:00 - ${count} ออเดอร์`}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">{hour}</div>
                      <div className="text-xs font-medium text-gray-900">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">🕒 กิจกรรมล่าสุด</h2>
            <p className="text-sm text-gray-600">ออเดอร์ล่าสุด 10 รายการ</p>
          </div>
          <div className="p-6">
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-600">ยังไม่มีกิจกรรม</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">
                        สั่ง {order.product_id?.title || "สินค้าถูกลบ"} จำนวน {order.quantity} ชิ้น
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}