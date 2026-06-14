using System.Text.Json;
using Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis;

namespace Infrastructure.Services.Common;

public class CacheService(
    IDistributedCache distributedCache,
    IConnectionMultiplexer connectionMultiplexer) : ICacheService
{
    public async Task<T?> GetAsync<T>(string key)
    {
        var cachedData = await distributedCache.GetStringAsync(key);
        if (string.IsNullOrEmpty(cachedData))
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(cachedData);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var serializedData = JsonSerializer.Serialize(value);

        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(5)
        };

        await distributedCache.SetStringAsync(key, serializedData, options);
    }

    public async Task RemoveAsync(string key)
    {
        await distributedCache.RemoveAsync(key);
    }

    public async Task RemoveByPrefixAsync(string prefix)
    {
        var endpoints = connectionMultiplexer.GetEndPoints();
        foreach (var endpoint in endpoints)
        {
            var server = connectionMultiplexer.GetServer(endpoint);
            // Uses SCAN underneath to efficiently find keys matching the prefix
            var keys = server.Keys(pattern: $"{prefix}*").ToArray();
            
            if (keys.Length > 0)
            {
                var database = connectionMultiplexer.GetDatabase();
                await database.KeyDeleteAsync(keys);
            }
        }
    }
}
