namespace PersonalTrainer.Api.Entities;

public sealed class WeeklyScheduleDay
{
    public int DayOfWeek { get; set; }
    public string DayType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;

    public ICollection<ScheduleExercise> Exercises { get; set; } = [];
}
