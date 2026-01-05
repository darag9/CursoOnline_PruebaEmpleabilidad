using Microsoft.AspNetCore.Mvc;
using CursoOnline.Application.Services;
using CursoOnline.Application.DTOs;

namespace CursoOnline.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await authService.RegisterAsync(request.Email, request.Password);
        
        if (result.Succeeded)
        {
            return Ok(new { message = "Usuario registrado con éxito" });
        }
        
        return BadRequest(result.Errors);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var authResult = await authService.LoginAsync(request.Email, request.Password);
    
        if (authResult == null)
        {
            return Unauthorized(new { message = "Credenciales inválidas" });
        }
    
        return Ok(new 
        { 
            token = authResult.Token, 
            user = new 
            { 
                email = authResult.Email,
                name = authResult.Email.Split('@')[0], // Un nombre temporal basado en el email
                role = authResult.Role
            } 
        });
    }
}