using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalTrainer.Api.Data;
using PersonalTrainer.Api.Dtos;
using PersonalTrainer.Api.Entities;
using PersonalTrainer.Api.Services;

namespace PersonalTrainer.Api.Controllers;

[ApiController]
[Route("api/admin/exercises")]
[Authorize(Roles = SeedData.AdminRole)]
public sealed class AdminExercisesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ExerciseDto>>> List(CancellationToken ct)
    {
        var items = await db.Exercises.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct);
        return Ok(items.Select(ExerciseMapper.ToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExerciseDto>> Get(string id, CancellationToken ct)
    {
        var item = await db.Exercises.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return item is null ? NotFound() : Ok(ExerciseMapper.ToDto(item));
    }

    [HttpPost]
    public async Task<ActionResult<ExerciseDto>> Create([FromBody] CreateExerciseRequest request, CancellationToken ct)
    {
        var id = string.IsNullOrWhiteSpace(request.Id) ? Guid.NewGuid().ToString("N")[..12] : request.Id.Trim();
        if (await db.Exercises.AnyAsync(x => x.Id == id, ct))
            return Conflict(new { error = "Exercise id already exists." });

        var entity = ExerciseMapper.FromCreate(request, id);
        db.Exercises.Add(entity);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id }, ExerciseMapper.ToDto(entity));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExerciseDto>> Update(string id, [FromBody] UpdateExerciseRequest request, CancellationToken ct)
    {
        var entity = await db.Exercises.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return NotFound();

        ExerciseMapper.ApplyUpdate(entity, request);
        await db.SaveChangesAsync(ct);
        return Ok(ExerciseMapper.ToDto(entity));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var entity = await db.Exercises.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return NotFound();

        var inSchedule = await db.ScheduleExercises.AnyAsync(x => x.ExerciseId == id, ct);
        if (inSchedule)
            return BadRequest(new { error = "Remove this exercise from the weekly schedule before deleting." });

        db.Exercises.Remove(entity);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(string id, CancellationToken ct)
    {
        var entity = await db.Exercises.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return NotFound();
        entity.IsActive = false;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id}/activate")]
    public async Task<IActionResult> Activate(string id, CancellationToken ct)
    {
        var entity = await db.Exercises.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return NotFound();
        entity.IsActive = true;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
