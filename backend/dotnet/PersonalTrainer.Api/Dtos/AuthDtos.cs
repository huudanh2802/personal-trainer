namespace PersonalTrainer.Api.Dtos;

public sealed record LoginRequest(string Email, string Password);

public sealed record AuthResponse(string Token, string Email, IReadOnlyList<string> Roles, DateTime ExpiresAt);

public sealed record RegisterRequest(string Email, string Password);
