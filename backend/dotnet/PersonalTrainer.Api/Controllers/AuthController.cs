using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PersonalTrainer.Api.Data;
using PersonalTrainer.Api.Dtos;
using PersonalTrainer.Api.Entities;
using PersonalTrainer.Api.Services;

namespace PersonalTrainer.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn,
    TokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(request.Email.Trim());
        if (user is null)
            return Unauthorized(new { error = "Invalid email or password." });

        var check = await signIn.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!check.Succeeded)
            return Unauthorized(new { error = "Invalid email or password." });

        var roles = await users.GetRolesAsync(user);
        var token = tokens.CreateToken(user, roles);
        return Ok(new AuthResponse(token.Token, user.Email ?? request.Email, roles.ToList(), token.ExpiresAt));
    }

    [HttpPost("register")]
    [Authorize(Roles = SeedData.AdminRole)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim();
        if (await users.FindByEmailAsync(email) is not null)
            return Conflict(new { error = "Email already registered." });

        var user = new ApplicationUser { UserName = email, Email = email, EmailConfirmed = true };
        var result = await users.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join("; ", result.Errors.Select(e => e.Description)) });

        await users.AddToRoleAsync(user, SeedData.UserRole);
        return Ok(new { ok = true });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<object>> Me()
    {
        var user = await users.GetUserAsync(User);
        if (user is null) return Unauthorized();
        var roles = await users.GetRolesAsync(user);
        return Ok(new { email = user.Email, roles });
    }
}
