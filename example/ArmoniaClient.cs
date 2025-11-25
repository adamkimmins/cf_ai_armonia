using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class ArmoniaAIClient
{
    private readonly HttpClient _client = new HttpClient();
    private readonly string _apiBase;

    public ArmoniaAIClient(string apiBaseUrl)
    {
        _apiBase = apiBaseUrl.TrimEnd('/');
    }

    public async Task<string> Chat(string message)
    {
        var json = JsonSerializer.Serialize(new { message });
        var res = await _client.PostAsync(
            $"{_apiBase}/api/chat",
            new StringContent(json, Encoding.UTF8, "application/json")
        );

        var body = await res.Content.ReadAsStringAsync();
        var data = JsonSerializer.Deserialize<ChatResponse>(body);
        return data.reply;
    }

    public async Task<string> GenerateLyrics(string style, string theme)
    {
        var json = JsonSerializer.Serialize(new { style, theme });
        var res = await _client.PostAsync(
            $"{_apiBase}/api/armonia/lyrics",
            new StringContent(json, Encoding.UTF8, "application/json")
        );

        var body = await res.Content.ReadAsStringAsync();
        var data = JsonSerializer.Deserialize<LyricsResponse>(body);
        return data.lyrics;
    }

    public async Task<string> Help(string question)
    {
        var json = JsonSerializer.Serialize(new { question });
        var res = await _client.PostAsync(
            $"{_apiBase}/api/armonia/help",
            new StringContent(json, Encoding.UTF8, "application/json")
        );

        var body = await res.Content.ReadAsStringAsync();
        var data = JsonSerializer.Deserialize<HelpResponse>(body);
        return data.reply;
    }

    private class ChatResponse { public string reply { get; set; } }
    private class LyricsResponse { public string lyrics { get; set; } }
    private class HelpResponse { public string reply { get; set; } }
}
