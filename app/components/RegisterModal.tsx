"use client";
import { useState, useEffect } from "react";
import { registerUser } from "@lib/authService";
import { useSearchParams } from "next/navigation";

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviterId, setInviterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const inviter = searchParams.get("inviter");
    if (inviter) setInviterId(inviter);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }

    setLoading(true);

    try {
      await registerUser(email, password, displayName, inviterId || undefined);
      setSuccess(true);
      setTimeout(() => {
        onClose(); // 延迟关闭
      }, 1500);
    } catch (err: any) {
      setError(err.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          注册账户
        </h2>

        {success ? (
          <p className="text-green-600 text-center font-semibold">✅ 注册成功！正在关闭窗口...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-700 text-sm">你的邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded text-black mt-1"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm">输入密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded text-black mt-1"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded text-black mt-1"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm">你的账户ID / 昵称</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded text-black mt-1"
              />
            </div>

            {inviterId && (
              <p className="text-sm text-green-600">邀请人ID: {inviterId}</p>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded"
            >
              {loading ? "注册中..." : "立即注册"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
