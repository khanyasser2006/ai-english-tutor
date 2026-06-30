using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using EnglishTutor.API.Models;

namespace EnglishTutor.API.Services;

// ── Groq API shapes (OpenAI-compatible) ─────────────────────────────────────
public record GroqRequest(
    [property: JsonPropertyName("model")]    string Model,
    [property: JsonPropertyName("messages")] List<GroqMessage> Messages,
    [property: JsonPropertyName("temperature")] float Temperature,
    [property: JsonPropertyName("max_tokens")]  int MaxTokens
);

public record GroqJsonFormat([property: JsonPropertyName("type")] string Type);

// Extended request that forces JSON output - used by English Tutor service
public record GroqRequestJson(
    [property: JsonPropertyName("model")]           string Model,
    [property: JsonPropertyName("messages")]        List<GroqMessage> Messages,
    [property: JsonPropertyName("temperature")]     float Temperature,
    [property: JsonPropertyName("max_tokens")]      int MaxTokens,
    [property: JsonPropertyName("response_format")] GroqJsonFormat ResponseFormat
);

public record GroqMessage(
    [property: JsonPropertyName("role")]    string Role,
    [property: JsonPropertyName("content")] string Content
);

public record GroqResponse(
    [property: JsonPropertyName("choices")] List<GroqChoice> Choices
);

public record GroqChoice(
    [property: JsonPropertyName("message")] GroqMessage Message
);

// ── Service ──────────────────────────────────────────────────────────────────
public class GeminiService   // keeping class name so nothing else needs changing
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<GeminiService> _logger;

    private const string GroqApiUrl = "https://api.groq.com/openai/v1/chat/completions";

    // Models tried in order — all free on Groq
    private static readonly string[] Models =
    [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
    ];

    private const string SystemPrompt = @"
You are Marco, a charming, warm Italian-American waiter at 'La Bella Vista' — a cozy fine-dining restaurant.
You are also a friendly English language coach. Your mission is twofold:

1. ACT AS A WAITER: Engage the customer naturally in a restaurant conversation.
   - Start by warmly greeting them and presenting yourself
   - Offer the menu (see below), take their order, make recommendations
   - React naturally to their choices, engage in light small talk
   - Confirm and finalize the order

2. COACH THEIR ENGLISH: Gently help them improve without making them feel embarrassed.
   - If they make a grammar mistake, note it in 'corrections' and ALSO naturally rephrase it correctly in your message
   - Introduce one interesting vocabulary word every 3-4 exchanges (related to dining/restaurant)
   - Be encouraging and warm — boost their confidence

MENU:
Starters: Bruschetta al Pomodoro ($8), Minestrone Soup ($7), Caprese Salad ($10)
Mains: Spaghetti Carbonara ($18), Grilled Atlantic Salmon ($24), Wild Mushroom Risotto ($20), Chicken Marsala ($19)
Desserts: Tiramisu ($9), Panna Cotta ($8)
Drinks: House Red/White Wine ($9), Sparkling Water ($4), Fresh Lemonade ($6), Espresso ($4)

IMPORTANT RULES:
- Stay in character as Marco at all times — warm, professional, slightly theatrical Italian style
- Keep responses concise (2-4 sentences as Marco + correction info)
- ALWAYS respond ONLY in this exact JSON format, no markdown, no extra text:
{
  ""message"": ""Marco's spoken response here"",
  ""emotion"": ""happy|thinking|surprised|neutral|warm|apologetic"",
  ""corrections"": [{""original"": ""what they said wrong"", ""correct"": ""correct version"", ""explanation"": ""brief why""}],
  ""vocabulary"": {""word"": ""..."", ""meaning"": ""..."", ""example"": ""...""}
}
If no corrections, use: ""corrections"": []
If no vocabulary this turn, use: ""vocabulary"": null
";

    public GeminiService(HttpClient http, IConfiguration config, ILogger<GeminiService> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public async Task<ChatResponse> SendMessageAsync(string userMessage, List<ConversationMessage> history)
    {
        var apiKey = _config["Groq:ApiKey"] ?? throw new InvalidOperationException("Groq API key not configured in appsettings.json");

        // Build message list: system prompt + history + new user message
        var messages = new List<GroqMessage>
        {
            new("system", SystemPrompt)
        };

        foreach (var h in history)
        {
            var role = h.Role == "model" ? "assistant" : "user";
            messages.Add(new GroqMessage(role, h.Content));
        }

        messages.Add(new GroqMessage("user", userMessage));

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        // Try each model with retry on rate limit
        foreach (var model in Models)
        {
            var requestBody = new GroqRequest(model, messages, 0.75f, 600);
            var json = JsonSerializer.Serialize(requestBody, options);

            for (int attempt = 1; attempt <= 3; attempt++)
            {
                try
                {
                    _logger.LogInformation("Groq: trying {Model}, attempt {Attempt}", model, attempt);

                    using var request = new HttpRequestMessage(HttpMethod.Post, GroqApiUrl);
                    request.Headers.Add("Authorization", $"Bearer {apiKey}");
                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await _http.SendAsync(request);

                    if ((int)response.StatusCode == 429)
                    {
                        var wait = attempt * 3000;
                        _logger.LogWarning("Rate limited on {Model}, waiting {Wait}ms", model, wait);
                        await Task.Delay(wait);
                        continue;
                    }

                    if (!response.IsSuccessStatusCode)
                    {
                        var err = await response.Content.ReadAsStringAsync();
                        _logger.LogWarning("Model {Model} returned {Code}: {Err}", model, response.StatusCode, err);
                        break;
                    }

                    var responseJson = await response.Content.ReadAsStringAsync();
                    var groqResponse = JsonSerializer.Deserialize<GroqResponse>(responseJson, options);
                    var rawText = groqResponse?.Choices?.FirstOrDefault()?.Message?.Content ?? "";

                    _logger.LogInformation("Groq success with {Model}", model);
                    return ParseResponse(rawText);
                }
                catch (Exception ex) when (attempt < 3)
                {
                    _logger.LogWarning(ex, "Attempt {Attempt} failed for {Model}", attempt, model);
                    await Task.Delay(attempt * 2000);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "All attempts failed for {Model}", model);
                    break;
                }
            }
        }

        return FallbackResponse();
    }

    private static ChatResponse ParseResponse(string rawText)
    {
        var cleaned = rawText.Trim();

        // Strip markdown code fences if present
        if (cleaned.StartsWith("```"))
        {
            var firstNewline = cleaned.IndexOf('\n');
            if (firstNewline >= 0) cleaned = cleaned[(firstNewline + 1)..];
            if (cleaned.EndsWith("```")) cleaned = cleaned[..^3].Trim();
        }

        // Extract JSON object if extra text is around it
        var start = cleaned.IndexOf('{');
        var end   = cleaned.LastIndexOf('}');
        if (start >= 0 && end > start)
            cleaned = cleaned[start..(end + 1)];

        var opts = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
        };

        try
        {
            var parsed = JsonSerializer.Deserialize<ChatResponse>(cleaned, opts);
            return parsed ?? FallbackResponse();
        }
        catch
        {
            // If JSON fails, treat whole response as the message
            return new ChatResponse(rawText.Length > 20 ? rawText : "Scusa, let me try again!", "neutral", [], null);
        }
    }

    private static ChatResponse FallbackResponse() => new(
        Message: "Benvenuto! Welcome to La Bella Vista! I am Marco, your waiter this evening. May I start you off with something to drink?",
        Emotion: "warm",
        Corrections: [],
        Vocabulary: null
    );
}
