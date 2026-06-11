import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'กรุณากรอกชื่อผู้ใช้งาน' }),
  password: z
    .string()
    .min(1, { message: 'กรุณากรอกรหัสผ่าน' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
