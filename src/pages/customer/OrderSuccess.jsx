import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">สั่งซื้อสำเร็จ!</h1>
        <p className="text-gray-600 mb-2">ขอบคุณสำหรับการสั่งซื้อ</p>
        <p className="text-gray-500 text-sm mb-8">
          เราจะติดต่อกลับไปยังเบอร์ที่ให้ไว้เร็วๆ นี้ เพื่อยืนยันออเดอร์และแจ้งรายละเอียดการส่งมอบ
        </p>

        {/* Status Timeline */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">สถานะออเดอร์</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">รับออเดอร์แล้ว</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
              <span className="text-gray-400">รอการยืนยัน</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
              <span className="text-gray-400">กำลังจัดส่ง</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
              <span className="text-gray-400">จัดส่งสำเร็จ</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors inline-block"
          >
            🏠 กลับไปหน้าแรก
          </Link>
          <Link
            to="/"
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors inline-block"
          >
            🛍️ สั่งซื้อสินค้าอื่น
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>เคล็ดลับ:</strong> หากต้องการเปลี่ยนแปลงหรือยกเลิกออเดอร์ 
            กรุณาติดต่อเราโดยเร็วที่สุด
          </p>
        </div>
      </div>
    </div>
  );
}
