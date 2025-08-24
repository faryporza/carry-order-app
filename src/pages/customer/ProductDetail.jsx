import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../services/api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState({ name: "", contact: "" });
  const [selectedOptions, setSelectedOptions] = useState({ size: "", toppings: [] });
  const [quantity, setQuantity] = useState(1);
  const [orderNote, setOrderNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const toggleTopping = (topping) => {
    setSelectedOptions((prev) => ({
      ...prev,
      toppings: prev.toppings.includes(topping)
        ? prev.toppings.filter((t) => t !== topping)
        : [...prev.toppings, topping],
    }));
  };

  const submitOrder = async () => {
    if (!customer.name || !customer.contact) {
      alert("กรุณากรอกชื่อและเบอร์ติดต่อ");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/orders", {
        product_id: product._id,
        customer_name: customer.name,
        customer_contact: customer.contact,
        quantity: quantity,
        selected_options: selectedOptions,
        note: orderNote,
      });
      navigate("/order-success");
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบสินค้า</h3>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link to="/" className="mr-4 text-gray-600 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">รายละเอียดสินค้า</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <div className="w-full h-64 md:h-[520px] lg:h-[560px] bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.url ? (
                  <img
                    src={product.url}
                    alt={product.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-6xl">🍽️</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info & Order Form */}
            <div className="md:w-1/2 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-gray-600 mb-4">📍 {product.store}</p>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ฿{product.price?.toLocaleString()}
                </div>
                {product.note && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-blue-800 text-sm">💬 {product.note}</p>
                  </div>
                )}
              </div>

              {/* Options */}
              {product.options?.size && product.options.size.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">เลือกขนาด</h3>
                  <div className="space-y-2">
                    {product.options.size.map((size) => (
                      <label key={size} className="flex items-center">
                        <input
                          type="radio"
                          name="size"
                          value={size}
                          checked={selectedOptions.size === size}
                          onChange={() => setSelectedOptions({ ...selectedOptions, size })}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {product.options?.toppings && product.options.toppings.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">เลือกท็อปปิ้ง</h3>
                  <div className="space-y-2">
                    {product.options.toppings.map((topping) => (
                      <label key={topping} className="flex items-center">
                        <input
                          type="checkbox"
                          value={topping}
                          checked={selectedOptions.toppings.includes(topping)}
                          onChange={() => toggleTopping(topping)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{topping}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">จำนวน</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">ข้อมูลลูกค้า</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="ชื่อ-นามสกุล *"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="เบอร์โทรศัพท์ *"
                    value={customer.contact}
                    onChange={(e) => setCustomer({ ...customer, contact: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <textarea
                    placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">สรุปการสั่งซื้อ</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>สินค้า:</span>
                    <span>{product.title}</span>
                  </div>
                  {selectedOptions.size && (
                    <div className="flex justify-between">
                      <span>ขนาด:</span>
                      <span>{selectedOptions.size}</span>
                    </div>
                  )}
                  {selectedOptions.toppings.length > 0 && (
                    <div className="flex justify-between">
                      <span>ท็อปปิ้ง:</span>
                      <span>{selectedOptions.toppings.join(", ")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>จำนวน:</span>
                    <span>{quantity} ชิ้น</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>ราคารวม:</span>
                    <span>฿{(product.price * quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitOrder}
                disabled={submitting || !customer.name || !customer.contact}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {submitting ? "กำลังส่งออเดอร์..." : "ยืนยันสั่งซื้อ"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
