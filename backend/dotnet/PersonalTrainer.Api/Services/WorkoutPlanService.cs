using Microsoft.EntityFrameworkCore;
using PersonalTrainer.Api.Data;
using PersonalTrainer.Api.Dtos;

namespace PersonalTrainer.Api.Services;

public sealed class WorkoutPlanService(AppDbContext db)
{
    public const string DailyWarmUpExerciseId = "22";

    public async Task<IReadOnlyList<ExerciseDto>> GetActiveExercisesAsync(CancellationToken ct = default)
    {
        var items = await db.Exercises
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync(ct);
        return items.Select(ExerciseMapper.ToDto).ToList();
    }

    public async Task<WeeklyScheduleDto> GetWeeklyScheduleAsync(CancellationToken ct = default)
    {
        var days = await db.WeeklyScheduleDays
            .AsNoTracking()
            .Include(x => x.Exercises.OrderBy(e => e.SortOrder))
            .OrderBy(x => x.DayOfWeek)
            .ToListAsync(ct);

        return new WeeklyScheduleDto(
            DailyWarmUpExerciseId,
            days.Select(d => new ScheduleDayDto(
                d.DayOfWeek,
                d.DayType,
                d.Title,
                d.Exercises.Select(e => e.ExerciseId).ToList())).ToList());
    }

    public static IReadOnlyList<string> WithDailyWarmUp(IReadOnlyList<string> exerciseIds)
    {
        if (exerciseIds.Contains(DailyWarmUpExerciseId, StringComparer.Ordinal))
            return exerciseIds;
        return [DailyWarmUpExerciseId, ..exerciseIds];
    }
}
