using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PersonalTrainer.Api.Entities;

namespace PersonalTrainer.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<WeeklyScheduleDay> WeeklyScheduleDays => Set<WeeklyScheduleDay>();
    public DbSet<ScheduleExercise> ScheduleExercises => Set<ScheduleExercise>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Exercise>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(36);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.YoutubeId).HasMaxLength(20).IsRequired();
            e.Property(x => x.YoutubeTitle).HasMaxLength(300).IsRequired();
            e.Property(x => x.VideoCredit).HasMaxLength(500);
            e.Property(x => x.Reps).HasMaxLength(50).IsRequired();
            e.Property(x => x.RepGuide).HasMaxLength(2000);
            e.Property(x => x.Description).HasMaxLength(1000);
            e.Property(x => x.Category).HasMaxLength(80).IsRequired();
            e.HasIndex(x => x.IsActive);
        });

        builder.Entity<WeeklyScheduleDay>(d =>
        {
            d.HasKey(x => x.DayOfWeek);
            d.Property(x => x.DayOfWeek).ValueGeneratedNever();
            d.Property(x => x.DayType).HasMaxLength(40).IsRequired();
            d.Property(x => x.Title).HasMaxLength(200).IsRequired();
        });

        builder.Entity<ScheduleExercise>(s =>
        {
            s.HasKey(x => x.Id);
            s.Property(x => x.ExerciseId).HasMaxLength(36);
            s.HasIndex(x => new { x.DayOfWeek, x.ExerciseId }).IsUnique();
            s.HasOne(x => x.Day)
                .WithMany(x => x.Exercises)
                .HasForeignKey(x => x.DayOfWeek)
                .OnDelete(DeleteBehavior.Cascade);
            s.HasOne(x => x.Exercise)
                .WithMany(x => x.ScheduleEntries)
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
            s.HasIndex(x => new { x.DayOfWeek, x.SortOrder });
        });
    }
}
