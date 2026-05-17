using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalTrainer.Api.Dtos;
using PersonalTrainer.Api.Services;

namespace PersonalTrainer.Api.Controllers;

[ApiController]
[Route("api/exercises")]
[AllowAnonymous]
public sealed class ExercisesController(WorkoutPlanService plans) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ExerciseDto>>> List(CancellationToken ct) =>
        Ok(await plans.GetActiveExercisesAsync(ct));
}
