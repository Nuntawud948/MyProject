# 1. ชั้น Build: ใช้ .NET SDK เพื่อคอมไพล์โค้ด
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# ก๊อปปี้ไฟล์ทั้งหมดในโฟลเดอร์ backend เข้าไปใน Container
COPY . .

# สั่ง Publish โปรเจกต์ Web
WORKDIR /src/Web
RUN dotnet publish -c Release -o /app/publish

# 2. ชั้น Run: ใช้ .NET Runtime (ตัวนี้จะเบามาก) เพื่อรันแอป
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# บอกให้ .NET รันที่พอร์ต 8080 (พอร์ตมาตรฐานที่ Render ชอบใช้)
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# คำสั่ง Start รันไฟล์ dll
ENTRYPOINT ["dotnet", "Web.dll"]