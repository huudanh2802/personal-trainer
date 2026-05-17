using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PersonalTrainer.Api.Entities;
using PersonalTrainer.Api.Services;

namespace PersonalTrainer.Api.Data;

public static class SeedData
{
    public const string AdminRole = "Admin";
    public const string UserRole = "User";

    public static async Task InitializeAsync(
        AppDbContext db,
        UserManager<ApplicationUser> users,
        RoleManager<IdentityRole> roles,
        IConfiguration config)
    {
        await db.Database.EnsureCreatedAsync();

        if (!await roles.RoleExistsAsync(AdminRole))
            await roles.CreateAsync(new IdentityRole(AdminRole));
        if (!await roles.RoleExistsAsync(UserRole))
            await roles.CreateAsync(new IdentityRole(UserRole));

        if (!await db.Exercises.AnyAsync())
        {
            db.Exercises.AddRange(DefaultExercises());
            await db.SaveChangesAsync();
        }

        if (!await db.WeeklyScheduleDays.AnyAsync())
        {
            foreach (var (dow, type, title, ids) in DefaultScheduleEntries())
            {
                db.WeeklyScheduleDays.Add(new WeeklyScheduleDay
                {
                    DayOfWeek = dow,
                    DayType = type,
                    Title = title,
                });
                await db.SaveChangesAsync();
                db.ChangeTracker.Clear();

                var order = 0;
                foreach (var exerciseId in ids)
                {
                    db.ScheduleExercises.Add(new ScheduleExercise
                    {
                        DayOfWeek = dow,
                        ExerciseId = exerciseId,
                        SortOrder = order++,
                    });
                }
                await db.SaveChangesAsync();
                db.ChangeTracker.Clear();
            }
        }

        var adminEmail = config["Admin:Email"] ?? "admin@personal-trainer.local";
        var adminPassword = config["Admin:Password"] ?? "ChangeMe123!";
        var admin = await users.FindByEmailAsync(adminEmail);
        if (admin is null)
        {
            admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
            };
            var result = await users.CreateAsync(admin, adminPassword);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        if (!await users.IsInRoleAsync(admin, AdminRole))
            await users.AddToRoleAsync(admin, AdminRole);
    }

    private static IEnumerable<Exercise> DefaultExercises() =>
    [
        Ex("1", "Kettlebell Swings", "WM8g4Mlu5Zs", "The BEST Kettlebell Swing Tutorial",
            "Kettlebell swing how-to · Squat University · youtube.com/shorts/WM8g4Mlu5Zs", true, 3, "15",
            "1 rep = one full hip swing: hike the bell back with flat back and vertical shins, then snap hips forward; bell floats near chest height at the top; let it swing back through your legs with control. Each out-and-back cycle is one rep.",
            "Hinge at the hips and snap forward using your glutes.", "Power"),
        Ex("2", "Dumbbell Goblet Squat", "eLX_dyvooKQ", "How to Perform Dumbbell Goblet Squat",
            "Dumbbell goblet squat · The Strength Center · youtube.com/shorts/eLX_dyvooKQ", true, 3, "12",
            "1 rep = start standing tall with weight at your chest, squat down to your safe depth (aim for thighs about parallel) while keeping heels down and torso tall, then stand back up until hips and knees are straight again.",
            "Hold one dumbbell at chest height. Keep your heels down.", "Legs"),
        Ex("3", "Treadmill Incline Walk", "NAsObfFJXvE", "Focus on the 1:1 work-to-rest ratio (1 min fast / 1 min slow)",
            "Incline walk how-to (12-3-30 style) · Live Lean TV · youtube.com/watch?v=NAsObfFJXvE", false, 1, "20 mins",
            "This part is time-based, not \"reps\": one completion = walking the full duration (e.g. 20 minutes) at your target incline and speed without stopping the block early.",
            "Set incline to 5% and walk at 5.0 km/h.", "Cardio"),
        Ex("4", "Dumbbell Reverse Lunges", "RZKXLMxPF_I", "Dumbbell Reverse Lunges | Proper Form",
            "Dumbbell reverse lunges · youtube.com/watch?v=RZKXLMxPF_I", true, 3, "10",
            "1 rep = step one leg back, lower until both knees bend safely, then drive through front heel back to standing.",
            "Keep torso upright and control each step.", "Lower Body"),
        Ex("5", "Plank with Shoulder Taps", "gKA5LBy7WAI", "How To Properly Do a Plank with Shoulder Taps",
            "Plank with shoulder taps · youtube.com/watch?v=gKA5LBy7WAI", true, 3, "20",
            "1 rep = from stable plank, tap opposite shoulder with one hand while minimizing hip sway.",
            "Brace core and keep hips level.", "Core"),
        Ex("6", "Kettlebell Russian Twists", "PkGPokybYaU", "How To Do A KETTLEBELL RUSSIAN TWIST",
            "Kettlebell Russian twist · youtube.com/watch?v=PkGPokybYaU", true, 3, "20",
            "1 rep = rotate from one side to the other with controlled torso movement while feet or heels are grounded.",
            "Rotate through core, not just arms.", "Core"),
        Ex("7", "Dumbbell Overhead Press", "vlFGTI5JzjI", "The PERFECT Dumbbell Shoulder Press",
            "Dumbbell shoulder press · youtube.com/watch?v=vlFGTI5JzjI", true, 3, "10",
            "1 rep = press dumbbells overhead until arms are extended, then lower under control to shoulder level.",
            "Avoid over-arching your lower back.", "Upper Body"),
        Ex("8", "Dumbbell Renegade Rows", "wTqlJ0aoJlM", "Renegade Row: Core & Back Builder",
            "Renegade row · youtube.com/watch?v=wTqlJ0aoJlM", true, 3, "8",
            "1 rep = from plank on dumbbells, row one dumbbell to ribcage while keeping hips square.",
            "Move slowly and brace your core.", "Upper Body"),
        Ex("9", "Push-ups", "I9fsqKE5XHo", "Push-ups for Beginners",
            "Push-ups for beginners · youtube.com/watch?v=I9fsqKE5XHo", true, 3, "10",
            "1 rep = chest moves toward floor with straight line body, then press back to start.",
            "Use incline variation if needed.", "Upper Body"),
        Ex("10", "Bicep Curls", "K5hFLVJnnsw", "Dumbbell Bicep Curls Demonstration and Lateral Raise Tip",
            "Bicep curls · youtube.com/watch?v=K5hFLVJnnsw", true, 3, "12",
            "1 rep = curl dumbbells up while elbows stay near torso, then lower slowly.",
            "Control both up and down phases.", "Upper Body"),
        Ex("11", "Lateral Raises", "K5hFLVJnnsw", "Dumbbell Bicep Curls Demonstration and Lateral Raise Tip",
            "Lateral raise segment · youtube.com/watch?v=K5hFLVJnnsw", true, 3, "12",
            "1 rep = raise dumbbells out to shoulder height with slight elbow bend, then lower with control.",
            "Keep shoulders down and neck relaxed.", "Upper Body"),
        Ex("12", "Dumbbell Floor Press", "lNdi7VEf2Ew", "Dumbbell Floor Press - Exercise Tutorial",
            "Dumbbell floor press · youtube.com/watch?v=lNdi7VEf2Ew", true, 3, "12",
            "1 rep = press dumbbells from floor position to full elbow extension and lower to triceps touch.",
            "Great chest/triceps press with shoulder-friendly range.", "Upper Body"),
        Ex("13", "Dumbbell Thrusters", "cPzfRo_jti0", "How To Properly Do A Dumbbell Thruster",
            "Dumbbell thruster · youtube.com/watch?v=cPzfRo_jti0", true, 4, "10",
            "1 rep = full squat into standing drive that continues into an overhead press in one fluid motion.",
            "Keep core tight and move explosively but controlled.", "Metabolic"),
        Ex("14", "Mountain Climbers", "cnyTQDSE884", "How to Do Mountain Climbers | The Right Way",
            "Mountain climbers · youtube.com/watch?v=cnyTQDSE884", true, 4, "30",
            "1 rep = drive one knee toward chest from plank. Alternate sides.",
            "Maintain a strong plank line.", "Metabolic"),
        Ex("15", "Dumbbell Sumo Deadlifts", "De9OUZz5W_I", "Dumbbell Sumo Deadlift (Full Tutorial)",
            "Dumbbell sumo deadlift · youtube.com/watch?v=De9OUZz5W_I", true, 4, "12",
            "1 rep = hinge at hips with wide stance, lower dumbbell(s) under control, then stand by driving through heels.",
            "Keep chest tall and back neutral.", "Metabolic"),
        Ex("17", "Steady State Cardio", "Ib5ga-vL5VY", "Keep a consistent \"zone 2\" pace where you are slightly breathless",
            "Zone 2 cardio guidance · youtube.com/watch?v=Ib5ga-vL5VY", false, 1, "30 mins",
            "Complete the full time block at an easy-moderate sustainable pace.",
            "Nasal breathing possible but slightly challenged.", "Cardio"),
        Ex("18", "Active Recovery Stretch", "qjKdwhEWoyM", "Full Body Stretching Routine on the Mat",
            "Full-body stretch routine · youtube.com/watch?v=qjKdwhEWoyM", false, 1, "20 mins",
            "Move through full-body stretches without forcing range of motion.",
            "Prioritize breathing and mobility quality.", "Recovery"),
        Ex("19", "Pull-up Bar Assisted Pull-ups", "gx0RWT7WbmA", "Assisted Pull-Up Form for Beginners",
            "Assisted pull-up form · youtube.com/watch?v=gx0RWT7WbmA", true, 4, "6",
            "1 rep = start from a dead hang with shoulders active, pull until chin clears the bar, then lower with control. Use a chair or band for assistance if needed.",
            "Build upper-back and arm strength with controlled full range.", "Upper Body"),
        Ex("21", "Negative Pull-ups", "gbPURTSxQLY", "How To Do a Negative Pull-Up | Exercise Guide",
            "Negative pull-up how-to · Bodybuilding.com · youtube.com/watch?v=gbPURTSxQLY", true, 3, "5",
            "1 rep = jump or step to chin-over-bar, then lower slowly for 3–5 seconds with tight core and lats engaged until arms are fully extended; release and reset.",
            "Eccentric pull-up lowers build lat and grip strength toward full pull-ups.", "Upper Body"),
        Ex("22", "Dynamic Warm-Up", "divaflydT7M", "5 Minute Dynamic Warm Up",
            "Dynamic warm-up · TIFF x DAN · youtube.com/watch?v=divaflydT7M", false, 1, "5 mins",
            "Follow the full 5-minute routine: leg swings, bear crawls, toe-touch squats, butt kicks, and shoulder mobility—move continuously with control.",
            "Low-impact full-body warm-up before every session to raise heart rate and prep joints.", "Warm-up"),
        Ex("20", "Treadmill Intervals", "P8fmIvqQEf4", "Beginner Treadmill Interval Technique and Pacing",
            "Treadmill intervals · youtube.com/watch?v=P8fmIvqQEf4", false, 8, "1 min",
            "1 rep = one full minute at a faster treadmill pace. Rest 30-45 seconds between rounds at a light walk before the next interval.",
            "Interval treadmill work to improve conditioning and cardiovascular capacity.", "Cardio"),
    ];

    private static Exercise Ex(
        string id, string name, string youtubeId, string youtubeTitle, string videoCredit,
        bool videoLoop, int sets, string reps, string repGuide, string description, string category) =>
        new()
        {
            Id = id,
            Name = name,
            YoutubeId = youtubeId,
            YoutubeTitle = youtubeTitle,
            VideoCredit = videoCredit,
            VideoLoop = videoLoop,
            Sets = sets,
            Reps = reps,
            RepGuide = repGuide,
            Description = description,
            Category = category,
        };

    private static IEnumerable<(int Dow, string Type, string Title, string[] Ids)> DefaultScheduleEntries() =>
    [
        (0, "active_recovery", "Sunday: Active Recovery", ["18"]),
        (1, "lower_core", "Monday: Lower Body & Core", ["1", "2", "4", "5", "6"]),
        (2, "cardio_intervals", "Tuesday: Treadmill Intervals + Incline Walk", ["20", "3"]),
        (3, "upper_strength", "Wednesday: Pull-up + Upper Body Strength", ["21", "19", "7", "8", "9", "10", "11", "12"]),
        (4, "active_recovery", "Thursday: Active Recovery", ["18"]),
        (5, "metabolic", "Friday: Metabolic + Treadmill Finisher", ["13", "14", "15", "20"]),
        (6, "steady_state", "Saturday: Steady State Cardio", ["17"]),
    ];
}
