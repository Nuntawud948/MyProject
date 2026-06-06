using Application.Common.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace Infrastructure.Services.Common;

/// <summary>
/// Server-side image optimisation using SixLabors.ImageSharp.
/// Provides a secondary line of compression defence after the mobile client's
/// expo-image-manipulator already compressed the image to 60% / 1024 px.
/// </summary>
public class ImageService : IImageService
{
    /// <inheritdoc/>
    public async Task<string> ProcessAndSaveAsync(
        Stream sourceStream,
        string filename,
        string saveDirectory,
        int maxWidthPx = 1024,
        int qualityPercent = 80
    )
    {
        // Ensure the target directory exists
        Directory.CreateDirectory(saveDirectory);

        using var image = await Image.LoadAsync(sourceStream);

        // Resize only if the image is wider than the maximum
        if (image.Width > maxWidthPx)
        {
            var ratio = (double)maxWidthPx / image.Width;
            var newHeight = (int)(image.Height * ratio);
            image.Mutate(ctx => ctx.Resize(maxWidthPx, newHeight));
        }

        var outputFilename = $"{filename}.jpg";
        var outputPath = Path.Combine(saveDirectory, outputFilename);

        var encoder = new JpegEncoder { Quality = qualityPercent };
        await image.SaveAsync(outputPath, encoder);

        // Return relative URL (directory separator normalised to web slash)
        var relativePath = Path
            .Combine("uploads", "attendance", outputFilename)
            .Replace(Path.DirectorySeparatorChar, '/');

        return $"/{relativePath}";
    }
}
