import { registerUserClient } from './authClient';
import { handlePostRegister } from './authServer';
import { signInUser } from './authClient';

// 保持原始 registerUser 接口不变
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  inviterId?: string
) {
  const user = await registerUserClient(email, password, displayName);
  await handlePostRegister(user, displayName, inviterId);
  return user;
}

export { signInUser };
