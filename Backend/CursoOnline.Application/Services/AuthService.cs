using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using CursoOnline.Application.DTOs;

namespace CursoOnline.Application.Services;

public class AuthService(IConfiguration config, UserManager<IdentityUser> userManager)
{
    public async Task<AuthResponse?> LoginAsync(string email, string password)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null || !await userManager.CheckPasswordAsync(user, password))
            return null;

        var roles = await userManager.GetRolesAsync(user);
        var mainRole = roles.FirstOrDefault() ?? "Student";
    
        var token = GenerateToken(user.UserName!, mainRole);

        return new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            Role = mainRole
        };
    }

    public async Task<IdentityResult> RegisterAsync(string email, string password, string role = "Student")
    {
        var user = new IdentityUser { UserName = email, Email = email };
        var result = await userManager.CreateAsync(user, password);
        
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, role);
        }
        return result;
    }
    
    public string GenerateToken(string username, string role)
    {
        var jwtKey = config["Jwt:Key"] ?? "MiClaveSuperSecretaDeAlMenos32Caracteres";
        var key = Encoding.ASCII.GetBytes(jwtKey);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] 
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role) 
            }),
            Expires = DateTime.UtcNow.AddHours(8),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}