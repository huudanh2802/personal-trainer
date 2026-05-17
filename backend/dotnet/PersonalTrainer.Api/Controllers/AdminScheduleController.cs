using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalTrainer.Api.Data;
using PersonalTrainer.Api.Dtos;
using PersonalTrainer.Api.Entities;
using PersonalTrainer.Api.Services;

namespace PersonalTrainer.Api.Controllers;

[ApiController]
[Route("api/admin/schedule")]
[Authorize(Roles = SeedData.AdminRole)]
public sealed class AdminScheduleController(AppDbContext db, WorkoutPlanService plans) : ControllerBase
{
    [HttpGet("weekly")]
    public async Task<ActionResult<WeeklyScheduleDto>> Weekly(CancellationToken ct) =>
        Ok(await plans.GetWeeklyScheduleAsync(ct));

    [HttpPut("{dayOfWeek:int}")]
    public async Task<ActionResult<ScheduleDayDto>> UpdateDay(
        int dayOfWeek,
        [FromBody] UpdateScheduleDayRequest request,
        CancellationToken ct)
    {
        if (dayOfWeek is < 0 or > 6)
            return BadRequest(new { error = "dayOfWeek must be 0 (Sunday) through 6 (Saturday)." });

        var exerciseIds = request.ExerciseIds?.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).ToList()
            ?? [];
        if (exerciseIds.Count == 0)
            return BadRequest(new { error = "At least one exercise is required." });

        var existingIds = await db.Exercises
            .Where(x => exerciseIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(ct);
        var missing = exerciseIds.Except(existingIds).ToList();
        if (missing.Count > 0)
            return BadRequest(new { error = $"Unknown exercise ids: {string.Join(", ", missing)}" });

        var day = await db.WeeklyScheduleDays.FirstOrDefaultAsync(x => x.DayOfWeek == dayOfWeek, ct);

        if (day is null)
        {
            day = new WeeklyScheduleDay
            {
                DayOfWeek = dayOfWeek,
                DayType = request.DayType.Trim(),
                Title = request.Title.Trim(),
            };
            db.WeeklyScheduleDays.Add(day);
        }
        else
        {
            day.DayType = request.DayType.Trim();
            day.Title = request.Title.Trim();
            var existing = await db.ScheduleExercises.Where(x => x.DayOfWeek == dayOfWeek).ToListAsync(ct);
            db.ScheduleExercises.RemoveRange(existing);
        }

        var order = 0;
        foreach (var exerciseId in exerciseIds)
        {
            db.ScheduleExercises.Add(new ScheduleExercise
            {
                DayOfWeek = dayOfWeek,
                ExerciseId = exerciseId,
                SortOrder = order++,
            });
        }

        await db.SaveChangesAsync(ct);
        return Ok(new ScheduleDayDto(dayOfWeek, day.DayType, day.Title, exerciseIds));
    }
}
