using Microsoft.AspNetCore.Mvc;
using EnglishTutor.API.Models;
using EnglishTutor.API.Services;

namespace EnglishTutor.API.Controllers;

[ApiController]
[Route("api/english-tutor")]
public class EnglishTutorController : ControllerBase
{
    private readonly EnglishTutorService _tutorService;
    private readonly ILogger<EnglishTutorController> _logger;

    public EnglishTutorController(EnglishTutorService tutorService, ILogger<EnglishTutorController> logger)
    {
        _tutorService = tutorService;
        _logger = logger;
    }

    // GET /api/english-tutor/greet?subLevel=1
    [HttpGet("greet")]
    public async Task<ActionResult<TutorResponse>> Greet([FromQuery] int subLevel = 1)
    {
        if (subLevel < 1 || subLevel > 5)
            return BadRequest("subLevel must be between 1 and 5.");

        try
        {
            var response = await _tutorService.GetGreetingAsync(subLevel);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating tutor greeting for sub-level {SubLevel}", subLevel);
            return StatusCode(500, "An error occurred generating the greeting.");
        }
    }

    // POST /api/english-tutor/chat
    [HttpPost("chat")]
    public async Task<ActionResult<TutorResponse>> Chat([FromBody] TutorChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Message cannot be empty.");

        if (request.SubLevel < 1 || request.SubLevel > 5)
            return BadRequest("subLevel must be between 1 and 5.");

        try
        {
            var response = await _tutorService.ChatAsync(request.SubLevel, request.Message, request.History ?? []);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing tutor chat for sub-level {SubLevel}", request.SubLevel);
            return StatusCode(500, "An error occurred processing your request.");
        }
    }
}
