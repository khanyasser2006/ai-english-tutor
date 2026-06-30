namespace EnglishTutor.API.Models;

public record ChatRequest(
    string Message,
    List<ConversationMessage> History
);

public record ConversationMessage(
    string Role,   // "user" or "model"
    string Content
);

public record ChatResponse(
    string Message,
    string Emotion,
    List<Correction> Corrections,
    VocabularyItem? Vocabulary
);

public record Correction(
    string Original,
    string Correct,
    string Explanation
);

public record VocabularyItem(
    string Word,
    string Meaning,
    string Example
);

// Gemini API shapes
public record GeminiRequest(
    SystemInstruction SystemInstruction,
    List<GeminiContent> Contents,
    GenerationConfig GenerationConfig
);

public record SystemInstruction(List<GeminiPart> Parts);

public record GeminiContent(string Role, List<GeminiPart> Parts);

public record GeminiPart(string Text);

public record GenerationConfig(
    float Temperature,
    int MaxOutputTokens
);

public record GeminiResponse(List<GeminiCandidate> Candidates);

public record GeminiCandidate(GeminiContent Content);
