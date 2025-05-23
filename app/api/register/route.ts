// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password || !displayName) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    // ✅ 延迟导入
    const { registerUser } = await import("@lib/authService");
    const user = await registerUser(email, password, displayName);

    return NextResponse.json({
      message: "注册成功",
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "注册失败" },
      { status: 500 }
    );
  }
}
