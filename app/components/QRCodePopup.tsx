"use client";
import React from "react";
import QRCode from "qrcode.react";

const QRCodePopup = ({ link, onClose }: { link: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-black text-center">
        <h2 className="text-lg font-bold mb-4">邀请二维码</h2>
        <QRCode value={link} size={200} />
        <p className="mt-2 text-sm">{link}</p>
        <button onClick={onClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          关闭
        </button>
      </div>
    </div>
  );
};

export default QRCodePopup;
