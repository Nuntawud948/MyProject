using System.Linq.Expressions;
using Application.Common.Interfaces;

namespace Infrastructure.Services.Common;

public class SortService : ISortService
{
    public IQueryable<T> ApplySort<T>(IQueryable<T> query, string? sortBy, string? sortDirection, string defaultSortBy)
    {
        var propertyName = string.IsNullOrWhiteSpace(sortBy) ? defaultSortBy : sortBy;
        var isDescending = !string.IsNullOrWhiteSpace(sortDirection) && sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);

        var property = typeof(T).GetProperty(propertyName, System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
        if (property == null)
        {
            property = typeof(T).GetProperty(defaultSortBy);
            if (property == null) return query;
        }

        var parameter = Expression.Parameter(typeof(T), "e");
        var propertyAccess = Expression.MakeMemberAccess(parameter, property);
        var orderByExpression = Expression.Lambda(propertyAccess, parameter);

        var methodName = isDescending ? "OrderByDescending" : "OrderBy";
        var resultExpression = Expression.Call(
            typeof(Queryable),
            methodName,
            [typeof(T), property.PropertyType],
            query.Expression,
            Expression.Quote(orderByExpression)
        );

        return query.Provider.CreateQuery<T>(resultExpression);
    }
}