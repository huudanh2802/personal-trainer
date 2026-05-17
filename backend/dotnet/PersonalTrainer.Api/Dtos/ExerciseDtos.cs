namespace PersonalTrainer.Api.Dtos;

public sealed record ExerciseDto(
    string Id,
    string Name,
    string YoutubeId,
    string YoutubeTitle,
    string VideoCredit,
    bool VideoLoop,
    int Sets,
    string Reps,
    string RepGuide,
    string Description,
    string Category);

public sealed record CreateExerciseRequest(
    string? Id,
    string Name,
    string YoutubeId,
    string YoutubeTitle,
    string VideoCredit,
    bool VideoLoop,
    int Sets,
    string Reps,
    string RepGuide,
    string Description,
    string Category);

public sealed record UpdateExerciseRequest(
    string Name,
    string YoutubeId,
    string YoutubeTitle,
    string VideoCredit,
    bool VideoLoop,
    int Sets,
    string Reps,
    string RepGuide,
    string Description,
    string Category);
