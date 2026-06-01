using System.Linq.Expressions;

namespace Application.Common.Interfaces;

public interface IFilterService
{
    // ระบบค้นหาคำกลาง ครอบคลุมหลายคอลัมน์พร้อมกันด้วย Reflection
    IQueryable<T> ApplyGlobalSearch<T>(IQueryable<T> query, string? searchText, string[] propertyNames);
    
    // ระบบกรองข้อมูลประเภทตัวหนังสือ (String)
    IQueryable<T> ApplyStringFilter<T>(IQueryable<T> query, Expression<Func<T, string?>> propertySelector, string? value, string operation = "contains");
    
    // ระบบกรองข้อมูลประเภทตัวเลข (Numeric) รองรับการเท่ากัน หรือ มากกว่าเท่ากับ
    IQueryable<T> ApplyNumericFilter<T, TNum>(IQueryable<T> query, Expression<Func<T, TNum?>> propertySelector, TNum? value, string operation = "equals") where TNum : struct;
    
    // ระบบกรองข้อมูลประเภทวันที่ (DateTime)
    IQueryable<T> ApplyDateFilter<T>(IQueryable<T> query, Expression<Func<T, DateTime?>> propertySelector, DateTime? value, string operation = "greaterthanorequal");
}