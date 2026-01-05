using CursoOnline.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CursoOnline.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Lesson> Lessons => Set<Lesson>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Course>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.HasQueryFilter(c => !c.IsDeleted);
        });

        builder.Entity<Lesson>(entity =>
        {
            entity.HasKey(l => l.Id);
            entity.HasIndex(l => new { l.CourseId, l.Order }).IsUnique();
            entity.HasQueryFilter(l => !l.IsDeleted);
        });

        var adminId = "b74ddd14-6340-4840-95c2-db12554843e5";
        var hasher = new PasswordHasher<IdentityUser>();

        var testUser = new IdentityUser
        {
            Id = adminId,
            UserName = "admin@test.com",
            NormalizedUserName = "ADMIN@TEST.COM",
            Email = "admin@test.com",
            NormalizedEmail = "ADMIN@TEST.COM",
            EmailConfirmed = true
        };

        // Contraseña: Password123!
        testUser.PasswordHash = hasher.HashPassword(testUser, "Password123!");

        builder.Entity<IdentityUser>().HasData(testUser);
    }
}