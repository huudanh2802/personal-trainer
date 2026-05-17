using PersonalTrainer.Api.Dtos;
using PersonalTrainer.Api.Entities;

namespace PersonalTrainer.Api.Services;

public static class ExerciseMapper
{
    public static ExerciseDto ToDto(Exercise e) =>
        new(
            e.Id,
            e.Name,
            e.YoutubeId,
            e.YoutubeTitle,
            e.VideoCredit,
            e.VideoLoop,
            e.Sets,
            e.Reps,
            e.RepGuide,
            e.Description,
            e.Category);

    public static void ApplyUpdate(Exercise entity, UpdateExerciseRequest request)
    {
        entity.Name = request.Name.Trim();
        entity.YoutubeId = request.YoutubeId.Trim();
        entity.YoutubeTitle = request.YoutubeTitle.Trim();
        entity.VideoCredit = request.VideoCredit.Trim();
        entity.VideoLoop = request.VideoLoop;
        entity.Sets = request.Sets;
        entity.Reps = request.Reps.Trim();
        entity.RepGuide = request.RepGuide.Trim();
        entity.Description = request.Description.Trim();
        entity.Category = request.Category.Trim();
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    public static Exercise FromCreate(CreateExerciseRequest request, string id)
    {
        var now = DateTimeOffset.UtcNow;
        return new Exercise
        {
            Id = id,
            Name = request.Name.Trim(),
            YoutubeId = request.YoutubeId.Trim(),
            YoutubeTitle = request.YoutubeTitle.Trim(),
            VideoCredit = request.VideoCredit.Trim(),
            VideoLoop = request.VideoLoop,
            Sets = request.Sets,
            Reps = request.Reps.Trim(),
            RepGuide = request.RepGuide.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
        };
    }
}
