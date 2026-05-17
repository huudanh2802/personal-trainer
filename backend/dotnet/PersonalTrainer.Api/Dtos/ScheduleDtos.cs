namespace PersonalTrainer.Api.Dtos;

public sealed record ScheduleDayDto(
    int DayOfWeek,
    string DayType,
    string Title,
    IReadOnlyList<string> ExerciseIds);

public sealed record WeeklyScheduleDto(
    string DailyWarmUpExerciseId,
    IReadOnlyList<ScheduleDayDto> Days);

public sealed record UpdateScheduleDayRequest(
    string DayType,
    string Title,
    IReadOnlyList<string> ExerciseIds);
