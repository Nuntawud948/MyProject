namespace Application.Common.Models;

// 1. คลาสแบบไม่ใช้ Generic (สำหรับงานที่ไม่มีการส่งข้อมูลตัวแปรกลับไป เช่น Delete, Update สำเร็จ)
public class Response
{
    public bool IsSuccess { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public List<string>? Errors { get; set; }
}

public class Response<T>
{
    public bool IsSuccess { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    // Helper สำหรับส่งข้อมูลสำเร็จ แบบมี Data กลับไป
    public static Response<T> Success(T data, string message = "Success")
    {
        return new Response<T>
        {
            IsSuccess = true,
            Data = data,
            Message = message,
        };
    }

    // Helper สำหรับส่งสถานะสำเร็จแบบทั่วไป (เช่น ปรับปรุงข้อมูลสำเร็จ แต่ไม่มี data ส่งกลับ)
    public static Response<T> Success(string message = "Success")
    {
        return new Response<T> { IsSuccess = true, Message = message };
    }

    // Helper สำหรับแจ้งข้อผิดพลาดระบบ
    public static Response<T> Failure(string message, List<string>? errors = null)
    {
        return new Response<T>
        {
            IsSuccess = false,
            Message = message,
            Errors = errors,
        };
    }
}
