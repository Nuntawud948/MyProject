using System.IO;
using System.Threading.Tasks;

namespace Application.Common.Interfaces;

/// <summary>
/// Contract for server-side image optimisation using SixLabors.ImageSharp.
/// Implementations live in Infrastructure and are injected into the Web controller.
/// </summary>
public interface IImageService
{
    /// <summary>
    /// Reads <paramref name="sourceStream"/>, resizes to fit within
    /// <paramref name="maxWidthPx"/> (maintaining aspect ratio), compresses at
    /// <paramref name="qualityPercent"/>%, saves the result under
    /// <paramref name="saveDirectory"/> with <paramref name="filename"/>.jpg,
    /// and returns the relative web-accessible URL path.
    /// </summary>
    /// <param name="sourceStream">Raw upload stream (from IFormFile.OpenReadStream).</param>
    /// <param name="filename">Desired filename without extension.</param>
    /// <param name="saveDirectory">Absolute directory path on disk.</param>
    /// <param name="maxWidthPx">Maximum output width in pixels (default 1024).</param>
    /// <param name="qualityPercent">JPEG quality 0–100 (default 80 server-side).</param>
    /// <returns>Relative URL, e.g. "/uploads/attendance/filename.jpg".</returns>
    Task<string> ProcessAndSaveAsync(
        Stream sourceStream,
        string filename,
        string saveDirectory,
        int maxWidthPx = 1024,
        int qualityPercent = 80
    );
}
