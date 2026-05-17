namespace PersonalTrainer.Api.Entities;

public sealed class ScheduleExercise
{
    public int Id { get; set; }
    public int DayOfWeek { get; set; }
    public WeeklyScheduleDay Day { get; set; } = null!;
    public string ExerciseId { get; set; } = string.Empty;
    public Exercise Exercise { get; set; } = null!;
    public int SortOrder { get; set; }
}
