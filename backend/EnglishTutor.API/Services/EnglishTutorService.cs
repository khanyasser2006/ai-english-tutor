using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using EnglishTutor.API.Models;

namespace EnglishTutor.API.Services;

public class EnglishTutorService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<EnglishTutorService> _logger;

    private const string GroqApiUrl = "https://api.groq.com/openai/v1/chat/completions";

    private static readonly string[] Models =
    [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
    ];

    private static readonly Dictionary<int, string> SubLevelPrompts = new()
    {
        [1] = "You are Alex, a warm English tutor teaching Greetings and Introductions. Teach formal greetings (Good morning, Good evening, How do you do) and informal ones (Hi, Hey, How is it going). Teach responses (Fine thank you, Not bad, I am doing well) and introductions (My name is, Nice to meet you). Guide the student: teach first, then ask them to practice, then correct errors gently. After the student has practiced at least 3 greetings correctly across at least 5 exchanges, set lessonComplete to true.",

        [2] = "You are Alex, an English tutor teaching English Tenses. Teach Simple Present (I eat breakfast every day), Simple Past (I ate pizza yesterday), Simple Future (I will visit Paris). Teach irregular verbs: go-went, eat-ate, see-saw, have-had, do-did. Ask the student to describe yesterday, today, and tomorrow using all three tenses. After the student correctly uses all 3 tenses across at least 5 exchanges, set lessonComplete to true.",

        [3] = "You are Alex, an English tutor teaching Nouns and Pronouns. Teach common nouns (cat, city, book) and proper nouns (Alex, London, always capitalised). Teach subject pronouns (I, you, he, she, we, they) and object pronouns (me, him, her, us, them). Ask students to identify nouns and replace them with pronouns. After student correctly uses pronouns at least 3 times across 5 exchanges, set lessonComplete to true.",

        [4] = "You are Alex, an English tutor teaching Sentence Structure. Teach Subject Verb Object: The cat ate the fish. Show adjectives expanding sentences. Teach connectors: and, but, because, so, although. Ask student to combine short sentences and create 3 original complex sentences. After student constructs 3 well-formed complex sentences across 5 exchanges, set lessonComplete to true.",

        [5] = "You are Alex, conducting the Real Talk Test. Have a real flowing conversation on hobbies, daily routine, future plans, opinions. Silently evaluate Grammar 25pts, Vocabulary 25pts, Complexity 25pts, Fluency 25pts. Do NOT correct during conversation, note errors in corrections only. After exactly 6 to 8 exchanges deliver final score: Overall Score X/100, per-category breakdown, 2 strengths, 1 area to improve, encouraging close. Set lessonComplete to true only in that final message.",
    };

    private static readonly Dictionary<int, string> SubLevelGreetings = new()
    {
        [1] = "The student just opened Sub-Level 1. Welcome them as Alex and begin teaching formal greetings with your first example.",
        [2] = "The student just opened Sub-Level 2. Welcome them as Alex and start teaching tenses enthusiastically.",
        [3] = "The student just opened Sub-Level 3. Welcome them as Alex and start teaching nouns and pronouns with a fun example.",
        [4] = "The student just opened Sub-Level 4. Welcome them as Alex and start teaching sentence structure.",
        [5] = "The student just opened Sub-Level 5: the Real Talk Test. Welcome them excitedly, explain the test briefly, and begin.",
    };

    // ── The JSON format rule appended to every system prompt ─────────────────
    // Separated into TWO-STEP to prevent model from embedding JSON into message
    private const string JsonRule = @"

IMPORTANT - HOW TO RESPOND:
You must respond using ONLY a valid JSON object. No text before or after it.

Step 1 - Write your reply as a plain conversational sentence (no quotes, no JSON syntax inside it).
Step 2 - Wrap everything in this exact JSON structure:

{""message"":""ONLY your plain reply here - no JSON syntax inside this value"",""emotion"":""neutral"",""corrections"":[],""vocabulary"":null,""lessonProgress"":10,""lessonComplete"":false}

RULES:
- message value must be PLAIN TEXT ONLY. Never put emotion, corrections, lessonProgress or any JSON key inside the message value.
- emotion: neutral, happy, thinking, encouraging, excited, or proud
- corrections: [{""original"":""mistake"",""correct"":""fix"",""explanation"":""why""}] or []
- vocabulary: {""word"":""word"",""meaning"":""meaning"",""example"":""sentence""} or null
- lessonProgress: number 0-100
- lessonComplete: true only when all goals done, otherwise false

BAD example (NEVER do this): {""message"":""Good try! Now practice more, \""emotion\"": \""happy\""...""}
GOOD example: {""message"":""Good try! Now practice saying: Good morning, how are you?"",""emotion"":""happy"",""corrections"":[],""vocabulary"":null,""lessonProgress"":20,""lessonComplete"":false}";

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy        = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition      = JsonIgnoreCondition.WhenWritingNull,
        PropertyNameCaseInsensitive = true,
    };

    public EnglishTutorService(HttpClient http, IConfiguration config, ILogger<EnglishTutorService> logger)
    {
        _http   = http;
        _config = config;
        _logger = logger;
    }

    public async Task<TutorResponse> GetGreetingAsync(int subLevel)
    {
        var greeting = SubLevelGreetings.TryGetValue(subLevel, out var g) ? g : SubLevelGreetings[1];
        return await CallGroqAsync(subLevel, [], greeting);
    }

    public async Task<TutorResponse> ChatAsync(int subLevel, string userMessage, List<ConversationMessage> history)
        => await CallGroqAsync(subLevel, history, userMessage);

    private async Task<TutorResponse> CallGroqAsync(int subLevel, List<ConversationMessage> history, string userMessage)
    {
        var apiKey = _config["Groq:ApiKey"]
            ?? throw new InvalidOperationException("Groq API key missing from appsettings.json");

        var systemCore   = SubLevelPrompts.TryGetValue(subLevel, out var p) ? p : SubLevelPrompts[1];
        var systemPrompt = systemCore + JsonRule;

        var messages = new List<GroqMessage> { new("system", systemPrompt) };
        foreach (var h in history)
        {
            var role = h.Role == "tutor" ? "assistant" : "user";
            messages.Add(new GroqMessage(role, h.Content));
        }
        messages.Add(new GroqMessage("user", userMessage));

        foreach (var model in Models)
        {
            var requestBody = new GroqRequest(model, messages, 0.3f, 800);
            var bodyJson    = JsonSerializer.Serialize(requestBody, JsonOpts);

            for (int attempt = 1; attempt <= 3; attempt++)
            {
                try
                {
                    _logger.LogInformation("Tutor | {Model} attempt {A}", model, attempt);

                    using var req = new HttpRequestMessage(HttpMethod.Post, GroqApiUrl);
                    req.Headers.Add("Authorization", $"Bearer {apiKey}");
                    req.Content = new StringContent(bodyJson, Encoding.UTF8, "application/json");

                    var res = await _http.SendAsync(req);

                    if ((int)res.StatusCode == 429)
                    {
                        await Task.Delay(attempt * 3000);
                        continue;
                    }

                    if (!res.IsSuccessStatusCode)
                    {
                        var err = await res.Content.ReadAsStringAsync();
                        _logger.LogWarning("Tutor | {Model} HTTP {C}: {E}", model, (int)res.StatusCode,
                            err[..Math.Min(200, err.Length)]);
                        break;
                    }

                    var resJson = await res.Content.ReadAsStringAsync();
                    var groqRes = JsonSerializer.Deserialize<GroqResponse>(resJson, JsonOpts);
                    var rawText = groqRes?.Choices?.FirstOrDefault()?.Message?.Content ?? "";

                    _logger.LogInformation("Tutor | {Model} raw ({L}): {R}",
                        model, rawText.Length, rawText[..Math.Min(400, rawText.Length)]);

                    var result = ParseTutorResponse(rawText);

                    if (!string.IsNullOrWhiteSpace(result.Message))
                        return result;

                    _logger.LogWarning("Tutor | {Model} produced empty message", model);
                }
                catch (Exception ex) when (attempt < 3)
                {
                    _logger.LogWarning(ex, "Tutor | {Model} attempt {A} failed", model, attempt);
                    await Task.Delay(attempt * 2000);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Tutor | {Model} all attempts failed", model);
                    break;
                }
            }
        }

        return Fallback();
    }

    private TutorResponse ParseTutorResponse(string rawText)
    {
        if (string.IsNullOrWhiteSpace(rawText)) return Fallback();

        var cleaned = rawText.Trim();

        // Strip markdown fences
        if (cleaned.StartsWith("```"))
        {
            var nl = cleaned.IndexOf('\n');
            if (nl >= 0) cleaned = cleaned[(nl + 1)..];
            if (cleaned.EndsWith("```")) cleaned = cleaned[..^3].Trim();
        }

        // Extract the outermost JSON object
        var start = cleaned.IndexOf('{');
        var end   = cleaned.LastIndexOf('}');
        if (start >= 0 && end > start)
            cleaned = cleaned[start..(end + 1)];

        TutorResponse? parsed = null;
        try
        {
            parsed = JsonSerializer.Deserialize<TutorResponse>(cleaned, JsonOpts);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Tutor | JSON parse error: {E}", ex.Message);
        }

        if (parsed != null && !string.IsNullOrWhiteSpace(parsed.Message))
        {
            // Clean the message — strip any JSON that leaked into the message value
            parsed.Message = StripJsonLeakage(parsed.Message);
            return parsed;
        }

        // JSON failed — try to extract just the plain text before any JSON syntax
        var fallbackMsg = ExtractPlainText(rawText);
        if (!string.IsNullOrWhiteSpace(fallbackMsg))
            return new TutorResponse { Message = fallbackMsg, Emotion = "neutral" };

        return Fallback();
    }

    // Remove any JSON metadata that leaked into the message value.
    // e.g. "Good job!, "emotion": "happy", ..." → "Good job!"
    private static string StripJsonLeakage(string message)
    {
        if (string.IsNullOrWhiteSpace(message)) return message;

        // These are keys that should never appear inside a plain message
        string[] jsonKeys = [
            "\", \"emotion\"", "\",\"emotion\"",
            "\", \"corrections\"", "\",\"corrections\"",
            "\", \"vocabulary\"", "\",\"vocabulary\"",
            "\", \"lessonProgress\"", "\",\"lessonProgress\"",
            "\", \"lessonComplete\"", "\",\"lessonComplete\"",
        ];

        foreach (var key in jsonKeys)
        {
            var idx = message.IndexOf(key, StringComparison.OrdinalIgnoreCase);
            if (idx > 0)
            {
                message = message[..idx].TrimEnd(',').Trim('"').Trim();
                break;
            }
        }

        return message;
    }

    // When JSON parsing completely fails, pull out the first readable sentence
    private static string ExtractPlainText(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "";

        // If it starts with { try to grab the message value with a simple regex-like approach
        var msgKey = "\"message\":\"";
        var msgIdx = raw.IndexOf(msgKey, StringComparison.OrdinalIgnoreCase);
        if (msgIdx >= 0)
        {
            var valueStart = msgIdx + msgKey.Length;
            // Find the closing quote (not preceded by backslash)
            for (int i = valueStart; i < raw.Length; i++)
            {
                if (raw[i] == '"' && (i == 0 || raw[i - 1] != '\\'))
                {
                    var extracted = raw[valueStart..i];
                    return StripJsonLeakage(extracted);
                }
            }
        }

        // Last resort — return text up to the first JSON-like character
        var cutAt = raw.IndexOfAny(['{', '[', '"']);
        return cutAt > 10 ? raw[..cutAt].Trim() : "";
    }

    private static TutorResponse Fallback() => new()
    {
        Message        = "Hello! I am Alex, your English tutor. Let us begin!",
        Emotion        = "neutral",
        Corrections    = [],
        Vocabulary     = null,
        LessonProgress = 0,
        LessonComplete = false,
    };
}
