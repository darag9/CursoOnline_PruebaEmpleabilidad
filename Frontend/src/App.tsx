import { Toaster } from "@/components/ui/sonner"; // Solo dejamos Sonner
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import StudentDashboard from "@/pages/StudentDashboard.tsx";
import CourseEditor from "@/pages/CourseEditor.tsx";
import AdminDashboard from "@/pages/AdminDashboard.tsx";
import Auth from "@/pages/Auth.tsx";
// ... tus imports de pages

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster position="top-right" richColors />
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        <Route path="/login" element={<Auth />} />

                        <Route path="/auth" element={<Navigate to="/login" replace />} />

                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/course/:id" element={<CourseEditor />} />
                        <Route path="/student" element={<StudentDashboard />} />

                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
