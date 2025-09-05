import React, { useState, useEffect } from "react";
import AlertModal from '@/Components/AlertModal';
import useAlertModal from '@/hooks/useAlertModal';
import ConfirmModal from '@/Components/ConfirmModal';
import useConfirmModal from '@/hooks/useConfirmModal';
import TodoNavControls from "@/features/todos/TodoNavControls";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Button } from "@/Components/ui";
import QuickNotesSidebar from "@/Components/QuickNotesSidebar";
import ScheduleSidebar from "@/features/schedule/ScheduleSidebar";
import TodoDialog from "@/features/todos/components/TodoDialog";
import {
    Calendar,
    X,
    LayoutGrid,
    Kanban,
    Tag,
    Plus,
    Trash2,
    PanelLeftClose,
    PanelLeftOpen,
    StickyNote,
    Edit,
    Eye,
} from "lucide-react";
import TodoKanban from "@/features/todos/TodoKanban";
import TodoCard from "@/features/todos/TodoCard";
import Schedule from "@/features/schedule/components/Schedule";
import ReactMarkdown from "react-markdown";
import { TodosProvider, useTodos } from "@/features/todos/TodosContext";


export default function Todos(props) {
    const { auth, todos: initialTodos, tags: initialTags } = props;

    // Only render if authenticated (let backend handle redirects)
    if (!auth || !auth.user) {
        return null;
    }

    // UI state hooks (not managed by TodosContext)
    const [viewMode, setViewMode] = useState("grid");
    const [activeTagFilter, setActiveTagFilter] = useState(null);
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
    const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isNotesPreviewMode, setIsNotesPreviewMode] = useState(false);
    const [quickNotes, setQuickNotes] = useState(
        localStorage.getItem("kaiba-quick-notes") || ""
    );

    const alertModal = useAlertModal();
    const confirmModal = useConfirmModal();

    return (
        <>
            <TodosProvider
                initialTodos={initialTodos}
                initialTags={initialTags}
                setIsCreateDialogOpen={setIsCreateDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                setIsTagManagerOpen={setIsTagManagerOpen}
                setIsTagDialogOpen={setIsTagDialogOpen}
                showAlert={alertModal.showAlert}
                showConfirm={confirmModal.showConfirm}
            >
                <TodosPageContent
                    auth={auth}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    activeTagFilter={activeTagFilter}
                    setActiveTagFilter={setActiveTagFilter}
                    isTagManagerOpen={isTagManagerOpen}
                    setIsTagManagerOpen={setIsTagManagerOpen}
                    isTagDialogOpen={isTagDialogOpen}
                    setIsTagDialogOpen={setIsTagDialogOpen}
                    isCreateDialogOpen={isCreateDialogOpen}
                    setIsCreateDialogOpen={setIsCreateDialogOpen}
                    isEditDialogOpen={isEditDialogOpen}
                    setIsEditDialogOpen={setIsEditDialogOpen}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isLeftSidebarOpen={isLeftSidebarOpen}
                    setIsLeftSidebarOpen={setIsLeftSidebarOpen}
                    isNotesPreviewMode={isNotesPreviewMode}
                    setIsNotesPreviewMode={setIsNotesPreviewMode}
                    quickNotes={quickNotes}
                    setQuickNotes={setQuickNotes}
                />
            </TodosProvider>
            <AlertModal
                show={alertModal.alert.show}
                title={alertModal.alert.title}
                message={alertModal.alert.message}
                onClose={alertModal.hideAlert}
            />
            <ConfirmModal
                show={confirmModal.confirm.show}
                title={confirmModal.confirm.title}
                message={confirmModal.confirm.message}
                onConfirm={confirmModal.handleConfirm}
                onCancel={confirmModal.handleCancel}
            />
        </>
    );
}

function TodosPageContent({
    auth,
    viewMode,
    setViewMode,
    activeTagFilter,
    setActiveTagFilter,
    isTagManagerOpen,
    setIsTagManagerOpen,
    isTagDialogOpen,
    setIsTagDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    isLeftSidebarOpen,
    setIsLeftSidebarOpen,
    isNotesPreviewMode,
    setIsNotesPreviewMode,
    quickNotes,
    setQuickNotes,
}) {
    const {
        todos, setTodos,
        tags, setTags,
        todoForm, setTodoForm,
        tagForm, setTagForm,
        handleCreateTag,
        handleDeleteTag,
        handleCreateTodo,
        handleUpdateTodo,
        handleToggleComplete,
        openEditDialog,
        handleDeleteTodo,
    } = useTodos();


    const handleKanbanDragEnd = () => {
        // TODO: Implement drag and drop functionality
        console.log('Kanban drag end - to be implemented');
    };

    // (Initial data loading is now handled in useTodosApi or via props)

    // Auto-save notes every 2 seconds
    useEffect(() => {
        if (!isNotesPreviewMode) {
            const interval = setInterval(() => {
                localStorage.setItem("kaiba-quick-notes", quickNotes);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [quickNotes, isNotesPreviewMode]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Todos</h2>}
            sidebarControls={{
                isLeftOpen: isLeftSidebarOpen,
                isRightOpen: isSidebarOpen,
                onLeftToggle: () => setIsLeftSidebarOpen(!isLeftSidebarOpen),
                onRightToggle: () => setIsSidebarOpen(!isSidebarOpen)
            }}
            navControls={
                <TodoNavControls
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    tags={tags}
                    onCreateTag={handleCreateTag}
                    onDeleteTag={handleDeleteTag}
                    activeTagFilter={activeTagFilter}
                    onTagFilterChange={setActiveTagFilter}
                    isTagManagerOpen={isTagManagerOpen}
                    setIsTagManagerOpen={setIsTagManagerOpen}
                    isTagDialogOpen={isTagDialogOpen}
                    setIsTagDialogOpen={setIsTagDialogOpen}
                    isCreateDialogOpen={isCreateDialogOpen}
                    setIsCreateDialogOpen={setIsCreateDialogOpen}
                    tagForm={tagForm}
                    setTagForm={setTagForm}
                    handleCreateTag={handleCreateTag}
                    handleDeleteTag={handleDeleteTag}
                />
            }
        >
            <Head title="Todos" />

            <div className="flex min-h-screen">
                {/* Schedule Sidebar (modularized) */}
                <ScheduleSidebar
                    isOpen={isLeftSidebarOpen}
                    onClose={() => setIsLeftSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <div className={`flex-1 transition-all duration-300 ease-in-out ${
                    isLeftSidebarOpen ? 'ml-80' : 'ml-0'
                } ${
                    isSidebarOpen ? 'mr-80' : 'mr-0'
                }`}>
                    <div className="py-12">
                        <div className="max-w-8xl mx-auto sm:px-6 lg:px-8 pt-12">
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {/* The Add ToDo button is now in TodoNavControls. No code needed here. */}
                            </div>
                        </div>
                    </div>

                    <> {/* Conditional View Rendering with tag/project filter */}
                    {(() => {
                        // Filter todos by activeTagFilter (project)
                        const filteredTodos = activeTagFilter
                            ? todos.filter(todo => todo.tags && todo.tags.some(tag => tag.id === activeTagFilter))
                            : todos;
                        if (viewMode === 'kanban') {
                            return (
                                <div className="h-[calc(100vh-16rem)]">
                                    <TodoKanban
                                        todos={filteredTodos}
                                        onToggleComplete={handleToggleComplete}
                                        onEditTodo={openEditDialog}
                                        onDeleteTodo={handleDeleteTodo}
                                        onDragEnd={handleKanbanDragEnd}
                                        activeTagFilter={activeTagFilter}
                                    />
                                </div>
                            );
                        } else {
                            return (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredTodos.map((todo) => (
                                    <TodoCard
                                        key={todo.id}
                                        todo={todo}
                                        onToggleComplete={handleToggleComplete}
                                        onEdit={openEditDialog}
                                        onDelete={handleDeleteTodo}
                                        variant="grid"
                                        />
                                    ))}
                                </div>
                            );
                        }
                    })()}

                    {/* Show empty state if no todos after filtering */}
                    {(() => {
                        const filteredTodos = activeTagFilter
                            ? todos.filter(todo => todo.tags && todo.tags.some(tag => tag.id === activeTagFilter))
                            : todos;
                        if (filteredTodos.length === 0) {
                            return (
                                <div className="text-center py-12">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No todos yet</h3>
                                    <p className="text-gray-600 mb-4">Get started by creating your first todo item.</p>
                                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Todo
                                    </Button>
                                </div>
                            );
                        }
                        return null;
                    })()}</>

                    <TodoDialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        mode="edit"
                    />

                    {/* Create Todo Dialog (moved for global access) */}
                    <TodoDialog
                        open={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                        mode="create"
                    />
                    </div>
                </div>
            </div>

            {/* Quick Notes Sidebar (modularized) */}
            <QuickNotesSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isNotesPreviewMode={isNotesPreviewMode}
                setIsNotesPreviewMode={setIsNotesPreviewMode}
                quickNotes={quickNotes}
                setQuickNotes={setQuickNotes}
            />
            </div>
        </AuthenticatedLayout>
    );
}
