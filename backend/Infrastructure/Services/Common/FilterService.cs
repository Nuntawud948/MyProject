using System.Linq.Expressions;
using Application.Common.Interfaces;

namespace Infrastructure.Services.Common;

public class FilterService : IFilterService
{
    public IQueryable<T> ApplyGlobalSearch<T>(IQueryable<T> query, string? searchText, string[] propertyNames)
    {
        if (string.IsNullOrWhiteSpace(searchText) || propertyNames == null || propertyNames.Length == 0)
            return query;

        var parameter = Expression.Parameter(typeof(T), "e");
        Expression? combinedExpression = null;

        foreach (var propName in propertyNames)
        {
            var property = typeof(T).GetProperty(propName, System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            if (property == null || property.PropertyType != typeof(string)) continue;

            var propertyAccess = Expression.Property(parameter, property);
            var containsMethod = typeof(string).GetMethod("Contains", [typeof(string)])!;
            var containsCall = Expression.Call(propertyAccess, containsMethod, Expression.Constant(searchText));

            combinedExpression = combinedExpression == null 
                ? containsCall 
                : Expression.OrElse(combinedExpression, containsCall);
        }

        if (combinedExpression == null) return query;

        var lambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
        return query.Where(lambda);
    }

    public IQueryable<T> ApplyStringFilter<T>(IQueryable<T> query, Expression<Func<T, string?>> propertySelector, string? value, string operation = "contains")
    {
        if (string.IsNullOrWhiteSpace(value)) return query;

        var body = propertySelector.Body;
        var parameter = propertySelector.Parameters[0];

        Expression filterExpression = operation.ToLower() switch
        {
            "contains" => Expression.Call(body, typeof(string).GetMethod("Contains", [typeof(string)])!, Expression.Constant(value)),
            "equals" => Expression.Equal(body, Expression.Constant(value)),
            _ => throw new NotSupportedException($"Operation '{operation}' is not supported.")
        };

        var lambda = Expression.Lambda<Func<T, bool>>(filterExpression, parameter);
        return query.Where(lambda);
    }

    public IQueryable<T> ApplyNumericFilter<T, TNum>(IQueryable<T> query, Expression<Func<T, TNum?>> propertySelector, TNum? value, string operation = "equals") where TNum : struct
    {
        if (value == null) return query;

        var body = propertySelector.Body;
        var parameter = propertySelector.Parameters[0];
        Expression propertyExpression = body.Type.IsGenericType && body.Type.GetGenericTypeDefinition() == typeof(Nullable<>) 
            ? Expression.Property(body, "Value") : body;

        Expression constantExpression = Expression.Constant(value.Value, typeof(TNum));

        Expression filterExpression = operation.ToLower() switch
        {
            "equals" => Expression.Equal(propertyExpression, constantExpression),
            "greaterthanorequal" => Expression.GreaterThanOrEqual(propertyExpression, constantExpression),
            "lessthanorequal" => Expression.LessThanOrEqual(propertyExpression, constantExpression),
            _ => throw new NotSupportedException($"Operation '{operation}' is not supported.")
        };

        var lambda = Expression.Lambda<Func<T, bool>>(filterExpression, parameter);
        return query.Where(lambda);
    }

    public IQueryable<T> ApplyDateFilter<T>(IQueryable<T> query, Expression<Func<T, DateTime?>> propertySelector, DateTime? value, string operation = "greaterthanorequal")
    {
        if (value == null) return query;

        var body = propertySelector.Body;
        var parameter = propertySelector.Parameters[0];
        Expression propertyExpression = body.Type.IsGenericType && body.Type.GetGenericTypeDefinition() == typeof(Nullable<>) 
            ? Expression.Property(body, "Value") : body;

        Expression constantExpression = Expression.Constant(value.Value, typeof(DateTime));

        Expression filterExpression = operation.ToLower() switch
        {
            "greaterthanorequal" => Expression.GreaterThanOrEqual(propertyExpression, constantExpression),
            "lessthanorequal" => Expression.LessThanOrEqual(propertyExpression, constantExpression),
            _ => throw new NotSupportedException($"Operation '{operation}' is not supported.")
        };

        var lambda = Expression.Lambda<Func<T, bool>>(filterExpression, parameter);
        return query.Where(lambda);
    }
}