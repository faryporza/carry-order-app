import { io } from "socket.io-client";

// ถ้าไม่ได้ตั้ง VITE_SOCKET_URL จะพยายามเดาจาก VITE_API_URL โดยตัด /api ทิ้ง
const guessed = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "");
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || guessed || window.location.origin;

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});
