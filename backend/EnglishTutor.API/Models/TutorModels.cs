using System.Text.Json.Serialization;
namespace EnglishTutor.API.Models;

public record TutorChatRequest(
    string Message,
    int SubLevel,
    List<ConversationMessage> History
);

public class TutorResponse
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = "";

    [JsonPropertyName("emotion")]
    public string Emotion { get; set; } = "neutral";

    [JsonPropertyName("corrections")]
    public List<Correction> Corrections { get; set; } = [];

    [JsonPropertyName("vocabulary")]
    public VocabularyItem? Vocabulary { get; set; }

    [JsonPropertyName("lessonProgress")]
    public int LessonProgress { get; set; }

    [JsonPropertyName("lessonComplete")]
    public bool LessonComplete { get; set; }
}
