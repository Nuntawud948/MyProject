import { useEffect, useState } from 'react';
import axiosClient from '../../../src/api/axiosClient';

// จำลอง DTO สั้นๆ สำหรับทดสอบหน้าจอ
interface DepartmentDto {
    id: number;
    name: string;
}

const TestPage = () => {
    const [departments, setDepartments] = useState<DepartmentDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🚀 ทดลองยิง API ไปที่ Backend ของคุณ
        axiosClient.get('/api/departments')
            .then(res => {
                // รองรับทั้งกรณีที่ Backend พ่นออกมาเป็น List ตรงๆ หรือเป็น PaginatedDto (res.data.items)
                const data = res.data.items ? res.data.items : res.data;
                setDepartments(data);
            })
            .catch(err => {
                console.error("API Error:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6">

            {/* วาดกล่อง Card เองด้วย div ธรรมดา เพื่อเลี่ยง Error จาก CustomCard */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">

                {/* แถบ Header ของ Card */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                    <h1 className="text-lg font-bold text-gray-800">🧪 ห้องทดลอง (API Testing)</h1>
                </div>

                {/* เนื้อหาด้านใน Card */}
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4 text-blue-600">ทดสอบดึงข้อมูลแผนก (Departments)</h2>

                    <p className="text-gray-600 mb-6">
                        หน้านี้อยู่บน Branch <b>feature/leave-management</b> เรากำลังทดสอบให้ React วิ่งไปคุยกับ C# Backend ครับ
                    </p>

                    {loading ? (
                        <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูลจาก Database...</p>
                    ) : departments.length > 0 ? (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <ul className="list-disc pl-5 space-y-2">
                                {departments.map(dept => (
                                    <li key={dept.id} className="text-gray-800">
                                        <span className="font-medium text-gray-900">{dept.name}</span> (ID: {dept.id})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-red-500">ไม่พบข้อมูลแผนก หรือเชื่อมต่อ API ไม่สำเร็จ</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default TestPage;