import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import type { CourseDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
    Search,
    Plus,
    LogOut,
    BookOpen,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Edit,
    Globe,
    GlobeLock,
} from 'lucide-react';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState<CourseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'Draft' | 'Published' | ''>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            navigate('/auth');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchCourses();
    }, [search, statusFilter, page]);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.searchCourses({
                search,
                status: statusFilter || undefined,
                page,
                pageSize: 10,
            });
            setCourses(response.items);
            setTotalPages(response.totalPages);
        } catch (error) {
            toast.error('No se pudieron cargar los cursos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        if (!newCourseTitle.trim()) return;
        setIsCreating(true);
        try {
            await apiClient.createCourse(newCourseTitle);
            setNewCourseTitle('');
            setDialogOpen(false);
            fetchCourses();
            toast.success('Curso creado correctamente');
        } catch (error) {
            toast.error('No se pudo crear el curso');
        } finally {
            setIsCreating(false);
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await apiClient.publishCourse(id);
            fetchCourses();
            toast.success('Curso publicado correctamente');
        } catch (error: any) {
            const message = error.response?.data?.message || 'No se puede publicar un curso sin lecciones';
            toast.error(message);
        }
    };

    const handleUnpublish = async (id: string) => {
        try {
            await apiClient.unpublishCourse(id);
            fetchCourses();
            toast.success('Curso despublicado correctamente');
        } catch (error) {
            toast.error('No se pudo despublicar el curso');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    if (!user || user.role !== 'Admin') return null;

    return (
        <div className="min-h-screen bg-secondary/30">
            {/* Header */}
            <header className="bg-card border-b shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">CursoOnline</h1>
                            <p className="text-sm text-muted-foreground">Panel de Administración</p>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold">Gestión de Cursos</h2>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Curso
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Curso</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <Input
                                    placeholder="Título del curso"
                                    value={newCourseTitle}
                                    onChange={(e) => setNewCourseTitle(e.target.value)}
                                />
                                <Button
                                    onClick={handleCreateCourse}
                                    disabled={isCreating || !newCourseTitle.trim()}
                                    className="w-full"
                                >
                                    {isCreating ? 'Creando...' : 'Crear Curso'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar cursos..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value as 'Draft' | 'Published' | '');
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todos los estados</SelectItem>
                                    <SelectItem value="Draft">Borrador</SelectItem>
                                    <SelectItem value="Published">Publicado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Course List */}
                <div className="grid gap-4">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Card key={i}>
                                <CardContent className="py-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-48" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                        <Skeleton className="h-9 w-24" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : courses.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No se encontraron cursos</p>
                            </CardContent>
                        </Card>
                    ) : (
                        courses.map((course) => (
                            <Card key={course.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="py-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">{course.title}</h3>
                                                <Badge
                                                    variant={course.status === 'Published' ? 'default' : 'secondary'}
                                                >
                                                    {course.status === 'Published' ? 'Publicado' : 'Borrador'}
                                                </Badge>
                                                {course.status === 'Draft' && course.totalLessons === 0 && (
                                                    <div className="flex items-center gap-1 text-warning">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span className="text-sm">Sin lecciones</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {course.totalLessons} lecciones • Actualizado:{' '}
                                                {new Date(course.updatedAt).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/admin/course/${course.id}`)}
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Editar
                                            </Button>
                                            {course.status === 'Draft' ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePublish(course.id)}
                                                    disabled={course.totalLessons === 0}
                                                >
                                                    <Globe className="w-4 h-4 mr-2" />
                                                    Publicar
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUnpublish(course.id)}
                                                >
                                                    <GlobeLock className="w-4 h-4 mr-2" />
                                                    Despublicar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}