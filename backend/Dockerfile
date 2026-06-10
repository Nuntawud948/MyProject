# 1. ชั้น Build: ใช้ .NET SDK 10.0 เพื่อคอมไพล์โค้ด
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# --- [ปรับปรุง] ก๊อปปี้เฉพาะไฟล์ .csproj ของทุก Layer เข้ามาก่อนเพื่อทำ Restore Cache ---
COPY ["Web/Web.csproj", "Web/"]
COPY ["Application/Application.csproj", "Application/"]
COPY ["Infrastructure/Infrastructure.csproj", "Infrastructure/"]
COPY ["Domain/Domain.csproj", "Domain/"]

# สั่ง Restore Package ทีเดียว (Docker จะจำ Layer นี้ไว้ ถ้าไม่มีการเพิ่ม Nuget ใหม่ มันจะไม่ทำซ้ำ)
RUN dotnet restore "Web/Web.csproj"


# ก๊อปปี้ไฟล์ทั้งหมดในโฟลเดอร์ backend เข้าไปใน Container
COPY . .

# สั่ง Publish โปรเจกต์ Web
WORKDIR /src/Web
RUN dotnet publish -c Release -o /app/publish

# 2. ชั้น Run: ใช้ .NET Runtime 10.0 (ตัวนี้จะเบามาก) เพื่อรันแอป
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# บอกให้ .NET รันที่พอร์ต 8080 (พอร์ตมาตรฐาน)
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# คำสั่ง Start รันไฟล์ dll
ENTRYPOINT ["dotnet", "Web.dll"]