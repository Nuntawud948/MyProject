# === Stage 1: Build Stage ===
# ดึง Node.js เวอร์ชัน 20 บน Alpine Linux (เวอร์ชันขนาดเล็ก) มาเพื่อบิวด์โปรเจกต์
FROM node:20-alpine AS build-stage
WORKDIR /app

# คัดลอกไฟล์จัดการแพ็กเกจเข้ามาเพื่อรัน npm install
COPY package*.json ./
RUN npm install

# คัดลอกซอร์สโค้ดหน้าบ้านทั้งหมดเข้ามาในตู้
COPY . .

# สั่งให้ Vite บิวด์โค้ดทั้งหมดออกมาเป็น Static Files (จะได้โฟลเดอร์ย่อยชื่อ /dist)
#RUN npm run build
RUN npx vite build --mode development

# === Stage 2: Runtime Stage ===
# ดึง Nginx ซึ่งเป็น Web Server ขนาดจิ๋วแต่ประสิทธิภาพสูงมาใช้งาน
FROM nginx:alpine

# คัดลอกไฟล์ Static จากโฟลเดอร์ /app/dist ในตู้แรก มาวางที่โฟลเดอร์เสิร์ฟเว็บของ Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# เปิดพอร์ต 80 ซึ่งเป็นพอร์ตมาตรฐานของ HTTP และ Nginx
EXPOSE 80

# สั่งให้ Nginx ทำงานในฉากหน้า (Foreground) เพื่อไม่ให้คอนเทนเนอร์ปิดตัวเอง
CMD ["nginx", "-g", "daemon off;"]