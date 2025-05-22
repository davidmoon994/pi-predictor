// app/lib/utils.ts

export function cn(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(' ');
  }

  export function generateInviteCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  export function getCurrentPeriodId(): string {
    const now = new Date();
    const utc = new Date(now.toUTCString());
  
    const minutes = utc.getUTCMinutes();
    const roundedMinutes = Math.floor(minutes / 5) * 5;
  
    utc.setUTCMinutes(roundedMinutes);
    utc.setUTCSeconds(0);
    utc.setUTCMilliseconds(0);
  
    // 返回格式例如：0521_1030
    return `${(utc.getUTCMonth() + 1).toString().padStart(2, '0')}${utc.getUTCDate().toString().padStart(2, '0')}_${utc.getUTCHours().toString().padStart(2, '0')}${utc.getUTCMinutes().toString().padStart(2, '0')}`;
  }
  