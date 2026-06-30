using Microsoft.AspNetCore.Mvc;
using EnglishTutor.API.Models;
using EnglishTutor.API.Services;

namespace EnglishTutor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TutorController : ControllerBase
{
    private readonly GeminiService _gemini;
    private readonly ILogger<TutorController> _logger;

    public TutorController(GeminiService gemini, ILogger<TutorController> logger)
    {
        _gemini = gemini;
        _logger = logger;
    }

    // POST /api/tutor/chat
    [HttpPost("chat")]
    public async Task<ActionResult<ChatResponse>> Chat([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Message cannot be empty.");

        try
        {
            var response = await _gemini.SendMessageAsync(request.Message, request.History ?? []);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat request");
            return StatusCode(500, "An error occurred processing your request.");
        }
    }

    // GET /api/tutor/greet — triggers the waiter's opening line
    [HttpGet("greet")]
    public async Task<ActionResult<ChatResponse>> Greet()
    {
        try
        {
            var response = await _gemini.SendMessageAsync(
                "[START] The customer has just sat down at the table. Give your warm opening greeting as Marco.",
                []
            );
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating greeting");
            return StatusCode(500, "An error occurred generating the greeting.");
        }
    }
}
