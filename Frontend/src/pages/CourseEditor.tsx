import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import type { CourseDto, LessonDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Plus,
    GripVertical,
    Trash2,
    BookOpen,
    FileText,
} from 'lucide-react';

export default function CourseEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState<CourseDto | null>(null);
    const [lessons, setLessons] = useState<LessonDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState<LessonDto | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            navigate('/auth');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [courseData, lessonsData] = await Promise.all([
                apiClient.getCourse(id!),
                apiClient.getLessons(id!),
            ]);
            setCourse(courseData);
            setLessons(lessonsData.sort((a, b) => a.order - b.order));
        } catch (error) {
            toast.error('No se pudo cargar el curso');
            navigate('/admin');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateLesson = async () => {
        if (!newLessonTitle.trim() || !id) return;
        setIsCreating(true);
        try {
            await apiClient.createLesson(id, newLessonTitle);
            setNewLessonTitle('');
            setDialogOpen(false);
            fetchData();
            toast.success('Lección creada correctamente');
        } catch (error) {
            toast.error('No se pudo crear la lección');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteLesson = async () => {
        if (!lessonToDelete) return;
        try {
            await apiClient.deleteLesson(lessonToDelete.id);
            setLessonToDelete(null);
            fetchData();
            toast.success('Lección eliminada correctamente');
        } catch (error) {
            toast.error('No se pudo eliminar la lección');
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination || !id) return;

        const items = Array.from(lessons);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setLessons(items);

        try {
            await apiClient.reorderLessons(id, items.map((l) => l.id));
            toast.success('Orden actualizado');
        } catch (error) {
            toast.error('No se pudo actualizar el orden');
            fetchData();
        }
    };

    if (!user || user.role !== 'Admin') return null;

    // ... (El resto del JSX se mantiene igual ya que no usa toast directamente)
    return (
        <div className="min-h-screen bg-secondary/30">
            {/* Header */}
            <header className="bg-card border-b shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-primary-foreground" />
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-6 w-48" />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h1 className="font-bold text-lg">{course?.title}</h1>
                                    <Badge
                                        variant={course?.status === 'Published' ? 'default' : 'secondary'}
                                    >
                                        {course?.status === 'Published' ? 'Publicado' : 'Borrador'}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Lecciones</h2>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Lección
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Crear Nueva Lección</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <Input
                                    placeholder="Título de la lección"
                                    value={newLessonTitle}
                                    onChange={(e) => setNewLessonTitle(e.target.value)}
                                />
                                <Button
                                    onClick={handleCreateLesson}
                                    disabled={isCreating || !newLessonTitle.trim()}
                                    className="w-full"
                                >
                                    {isCreating ? 'Creando...' : 'Crear Lección'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i}>
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-6 w-6" />
                                        <Skeleton className="h-5 flex-1" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : lessons.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">
                                Este curso no tiene lecciones aún
                            </p>
                            <Button onClick={() => setDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Añadir primera lección
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="lessons">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-3"
                                >
                                    {lessons.map((lesson, index) => (
                                        <Draggable
                                            key={lesson.id}
                                            draggableId={lesson.id}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`transition-shadow ${
                                                        snapshot.isDragging ? 'shadow-lg' : ''
                                                    }`}
                                                >
                                                    <CardContent className="py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                {...provided.dragHandleProps}
                                                                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                <GripVertical className="w-5 h-5" />
                                                            </div>
                                                            <span className="text-sm font-medium text-muted-foreground w-8">
                                                                {index + 1}.
                                                            </span>
                                                            <span className="flex-1 font-medium">
                                                                {lesson.title}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-muted-foreground hover:text-destructive"
                                                                onClick={() => setLessonToDelete(lesson)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}

                <AlertDialog
                    open={!!lessonToDelete}
                    onOpenChange={() => setLessonToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar lección?</AlertDialogTitle>
                            <AlertDialogDescription>
                                ¿Estás seguro de que deseas eliminar "{lessonToDelete?.title}"?
                                Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteLesson}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
}