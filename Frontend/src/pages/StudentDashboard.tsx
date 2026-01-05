import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import type { CourseSummaryDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, LogOut, BookOpen, GraduationCap, FileText } from 'lucide-react';

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState<CourseSummaryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/auth');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchCourses();
    }, [search]);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.getPublishedCourses(search || undefined);
            setCourses(data);
        } catch (error) {
            toast.error('No se pudieron cargar los cursos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-secondary/30">
            {/* Header */}
            <header className="bg-card border-b shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">CursoOnline</h1>
                            <p className="text-sm text-muted-foreground">Portal del Estudiante</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Hola, <span className="font-medium text-foreground">{user.name}</span>
            </span>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Explora Nuestros Cursos</h2>
                    <p className="text-muted-foreground">
                        Encuentra el curso perfecto para ti y comienza a aprender hoy
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-md mx-auto mb-10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar cursos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : courses.length === 0 ? (
                        <div className="col-span-full">
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        No se encontraron cursos disponibles
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        courses.map((course) => (
                            <Card key={course.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">{course.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <FileText className="w-4 h-4" />
                                        {course.totalLessons} lecciones
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {course.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {course.description}
                                        </p>
                                    )}
                                    <Button className="w-full mt-4" variant="outline">
                                        Ver Curso
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}