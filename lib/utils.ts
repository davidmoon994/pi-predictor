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
  
