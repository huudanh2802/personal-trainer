using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalTrainer.Api.Dtos;
using PersonalTrainer.Api.Services;

namespace PersonalTrainer.Api.Controllers;

[ApiController]
[Route("api/schedule")]
[AllowAnonymous]
public sealed class ScheduleController(WorkoutPlanService plans) : ControllerBase
{
    [HttpGet("weekly")]
    public async Task<ActionResult<WeeklyScheduleDto>> Weekly(CancellationToken ct) =>
        Ok(await plans.GetWeeklyScheduleAsync(ct));
}
