namespace PersonalTrainer.Api.Entities;

public sealed class Exercise
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string YoutubeId { get; set; } = string.Empty;
    public string YoutubeTitle { get; set; } = string.Empty;
    public string VideoCredit { get; set; } = string.Empty;
    public bool VideoLoop { get; set; }
    public int Sets { get; set; }
    public string Reps { get; set; } = string.Empty;
    public string RepGuide { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<ScheduleExercise> ScheduleEntries { get; set; } = [];
}
