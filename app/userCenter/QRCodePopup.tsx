// app/userCenter/QRCodePopup.tsx
'use client';
import QRCode from 'qrcode.react';

type QRCodePopupProps = {
  onClose: () => void;
  user: {
    uid: string;
  };
};

const QRCodePopup = ({ onClose, user }: QRCodePopupProps) => {
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?inviter=${user.uid}`;
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>邀请二维码</h2>
        <QRCode value={referralLink} size={128} />
        <p>邀请链接：{referralLink}</p>
        <button onClick={() => navigator.clipboard.writeText(referralLink)}>复制链接</button>
        <button onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

export default QRCodePopup;
