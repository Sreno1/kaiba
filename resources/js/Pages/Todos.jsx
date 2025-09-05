import React, { useState, useEffect } from "react";
import AlertModal from '@/Components/AlertModal';
import useAlertModal from '@/hooks/useAlertModal';
import ConfirmModal from '@/Components/ConfirmModal';
import useConfirmModal from '@/hooks/useConfirmModal';
import TodoNavControls from "@/features/todos/TodoNavControls";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    Button,
} from "@/Components/ui";
import QuickNotesSidebar from "@/Components/QuickNotesSidebar";
import ScheduleSidebar from "@/features/schedule/ScheduleSidebar";
import TodoDialog from "@/features/todos/components/TodoDialog";
import TagManagerDialog from "@/features/tags/TagManagerDialog";
import {
    Plus,
    Tag,
    Eye,
    Award,
    Activity,
} from "lucide-react";
import TodoKanban from "@/features/todos/TodoKanban";
import TodoCard from "@/features/todos/TodoCard";
import TodoList from "@/features/todos/TodoList";
import TodoTable from "@/features/todos/TodoTable";
import { TodosProvider, useTodos } from "@/features/todos/TodosContext";
import AdvancedFilters from "@/features/todos/AdvancedFilters";
import TodoStats from "@/features/todos/TodoStats";


export default function Todos(props) {
    const { auth, todos: initialTodos, tags: initialTags } = props;

    // Only render if authenticated (let backend handle redirects)
    if (!auth || !auth.user) {
        return null;
    }

    // UI state hooks (not managed by TodosContext)
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem("kaiba-view-mode") || "grid";
    });
    const [activeTagFilter, setActiveTagFilter] = useState(null);
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isNotesPreviewMode, setIsNotesPreviewMode] = useState(false);
    const [quickNotes, setQuickNotes] = useState(
        localStorage.getItem("kaiba-quick-notes") || ""
    );
    const [advancedFilters, setAdvancedFilters] = useState({});
    const [showStats, setShowStats] = useState(false);
    
    // Kanban column visibility state
    const [kanbanColumnsState, setKanbanColumnsState] = useState({
        showBackburner: true,
        showCompleted: true,
        groupByMode: 'status',
        setShowBackburner: null,
        setShowCompleted: null,
        setGroupByMode: null
    });

    const alertModal = useAlertModal();
    const confirmModal = useConfirmModal();

    // Handle view mode change with localStorage persistence
    const handleViewModeChange = (newViewMode) => {
        setViewMode(newViewMode);
        localStorage.setItem("kaiba-view-mode", newViewMode);
    };

    return (
        <>
            <TodosProvider
                initialTodos={initialTodos}
                initialTags={initialTags}
                setIsCreateDialogOpen={setIsCreateDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                setIsTagManagerOpen={setIsTagManagerOpen}
                showAlert={alertModal.showAlert}
                showConfirm={confirmModal.showConfirm}
            >
                <TodosPageContent
                    auth={auth}
                    viewMode={viewMode}
                    setViewMode={handleViewModeChange}
                    activeTagFilter={activeTagFilter}
                    setActiveTagFilter={setActiveTagFilter}
                    isTagManagerOpen={isTagManagerOpen}
                    setIsTagManagerOpen={setIsTagManagerOpen}
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
                    kanbanColumnsState={kanbanColumnsState}
                    setKanbanColumnsState={setKanbanColumnsState}
                    advancedFilters={advancedFilters}
                    setAdvancedFilters={setAdvancedFilters}
                    showStats={showStats}
                    setShowStats={setShowStats}
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
    kanbanColumnsState,
    setKanbanColumnsState,
    advancedFilters,
    setAdvancedFilters,
    showStats,
    setShowStats,
}) {
    const {
        todos,
        tags,
        tagForm,
        setTagForm,
        setTodoForm,
        handleCreateTag,
        handleDeleteTag,
        handleUpdateTodoField,
        handleToggleComplete,
        openEditDialog,
        handleDeleteTodo,
    } = useTodos();


    const handleKanbanDragEnd = async (changes) => {
        // Handle multiple changes from kanban drag and drop
        // Each change contains: { id, todo, status?, priority? }
        try {
            // Process each change sequentially to avoid race conditions
            for (const change of changes) {
                const { id, status, priority } = change;
                const updates = {};
                
                // Only update fields that have changed
                if (status !== undefined) {
                    updates.status = status;
                }
                if (priority !== undefined) {
                    updates.priority = priority;
                }
                
                // Only make API call if there are actual updates
                if (Object.keys(updates).length > 0) {
                    await handleUpdateTodoField(id, updates);
                }
            }
        } catch (error) {
            console.error('Error updating todos from kanban:', error);
            // Error messages are already handled in handleUpdateTodoField
        }
    };

    const handleKanbanColumnsVisibilityChange = (newState) => {
        setKanbanColumnsState(newState);
    };

    const handleAddTodoFromKanban = (presetValues) => {
        // Pre-fill the todo form with the column-specific values
        setTodoForm({
            title: "",
            description: "",
            status: presetValues.status || "todo",
            priority: presetValues.priority || "medium",
            due_date: "",
            tag_ids: [],
            ...presetValues
        });
        setIsCreateDialogOpen(true);
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
                    setIsCreateDialogOpen={setIsCreateDialogOpen}
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
                    
                    {/* Statistics Dashboard */}
                    {showStats && (
                        <div className="mb-6">
                            <TodoStats
                                todos={todos}
                                className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border"
                            />
                        </div>
                    )}
                    
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {/* Advanced Filters */}
                                <AdvancedFilters
                                    filters={advancedFilters}
                                    onFiltersChange={setAdvancedFilters}
                                    tags={tags}
                                    todos={todos}
                                />
                                
                                {/* Stats Toggle */}
                                <Button
                                    variant={showStats ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowStats(!showStats)}
                                    className="h-8"
                                >
                                    <Activity className="w-4 h-4 mr-1" />
                                    <span className="hidden sm:inline">Stats</span>
                                </Button>
                            </div>
                        </div>
                        
                        {/* Tag Filter Buttons */}
                        <div className="flex gap-2 items-center flex-wrap">
                            <Button
                                variant={!activeTagFilter ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTagFilter(null)}
                                className="h-8"
                            >
                                All
                            </Button>
                            {tags.slice(0, 7).map(tag => (
                                <Button
                                    key={tag.id}
                                    variant={activeTagFilter === tag.id ? 'default' : 'outline'}
                                    size="sm"
                                    style={{ 
                                        borderColor: tag.color, 
                                        color: activeTagFilter === tag.id ? 'white' : tag.color,
                                        backgroundColor: activeTagFilter === tag.id ? tag.color : 'transparent'
                                    }}
                                    onClick={() => setActiveTagFilter(tag.id)}
                                    className="flex items-center gap-1 h-8 px-2"
                                >
                                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: tag.color }}></span>
                                    <span className="hidden md:inline">{tag.name}</span>
                                </Button>
                            ))}
                            {tags.length > 7 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs text-muted-foreground h-8 px-2"
                                >
                                    +{tags.length - 7}
                                </Button>
                            )}
                            
                            {/* Separator */}
                            <div className="h-6 w-px bg-border ml-2" />
                            
                            {/* Tag Manager Button */}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8"
                                onClick={() => setIsTagManagerOpen(true)}
                            >
                                <Tag className="w-4 h-4 md:mr-1" />
                                <span className="hidden md:inline">Tags</span>
                            </Button>

                            {/* Show hidden kanban columns buttons - only show in kanban view and status mode */}
                            {viewMode === 'kanban' && kanbanColumnsState.groupByMode === 'status' && (
                                <>
                                    {!kanbanColumnsState.showBackburner && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => kanbanColumnsState.setShowBackburner?.(true)}
                                            className="h-8 text-xs"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            Show Backburner
                                        </Button>
                                    )}
                                    {!kanbanColumnsState.showCompleted && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => kanbanColumnsState.setShowCompleted?.(true)}
                                            className="h-8 text-xs"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            Show Completed
                                        </Button>
                                    )}
                                </>
                            )}

                            {/* Priority/Status toggle buttons - only show in kanban view */}
                            {viewMode === 'kanban' && (
                                <>
                                    {/* Separator */}
                                    <div className="h-6 w-px bg-border ml-2" />
                                    
                                    <Button
                                        variant={kanbanColumnsState.groupByMode === 'status' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => kanbanColumnsState.setGroupByMode?.('status')}
                                        className="h-8"
                                    >
                                        <Activity className="w-4 h-4 md:mr-1" />
                                        <span className="hidden md:inline">Status</span>
                                    </Button>
                                    <Button
                                        variant={kanbanColumnsState.groupByMode === 'priority' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => kanbanColumnsState.setGroupByMode?.('priority')}
                                        className="h-8"
                                    >
                                        <Award className="w-4 h-4 md:mr-1" />
                                        <span className="hidden md:inline">Priority</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <> {/* Conditional View Rendering with tag/project filter */}
                    {(() => {
                        // Apply advanced filters first, then tag filter
                        let filteredTodos = todos;
                        
                        // Apply advanced filters
                        if (advancedFilters.search) {
                            const searchLower = advancedFilters.search.toLowerCase();
                            filteredTodos = filteredTodos.filter(todo =>
                                todo.title.toLowerCase().includes(searchLower) ||
                                (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
                                (todo.tags && todo.tags.some(tag => tag.name.toLowerCase().includes(searchLower)))
                            );
                        }
                        
                        if (advancedFilters.status?.length > 0) {
                            filteredTodos = filteredTodos.filter(todo =>
                                advancedFilters.status.includes(todo.status)
                            );
                        }
                        
                        if (advancedFilters.priority?.length > 0) {
                            filteredTodos = filteredTodos.filter(todo =>
                                advancedFilters.priority.includes(todo.priority)
                            );
                        }
                        
                        if (advancedFilters.tags?.length > 0) {
                            filteredTodos = filteredTodos.filter(todo =>
                                todo.tags && todo.tags.some(tag => advancedFilters.tags.includes(tag.id))
                            );
                        }
                        
                        if (advancedFilters.overdue) {
                            filteredTodos = filteredTodos.filter(todo => todo.is_overdue);
                        }
                        
                        if (advancedFilters.due_within) {
                            const daysFromNow = advancedFilters.due_within;
                            filteredTodos = filteredTodos.filter(todo => {
                                if (!todo.due_date || todo.status === 'completed') return false;
                                const daysUntilDue = Math.ceil((new Date(todo.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                                return daysUntilDue >= 0 && daysUntilDue <= daysFromNow;
                            });
                        }
                        
                        if (advancedFilters.recent_days) {
                            const daysAgo = advancedFilters.recent_days;
                            filteredTodos = filteredTodos.filter(todo => {
                                const daysSinceCreated = Math.ceil((new Date() - new Date(todo.created_at)) / (1000 * 60 * 60 * 24));
                                return daysSinceCreated <= daysAgo;
                            });
                        }
                        
                        // Apply tag filter (legacy filter)
                        if (activeTagFilter) {
                            filteredTodos = filteredTodos.filter(todo => 
                                todo.tags && todo.tags.some(tag => tag.id === activeTagFilter)
                            );
                        }
                        
                        switch (viewMode) {
                            case 'kanban':
                                return (
                                    <div className="h-[calc(100vh-16rem)]">
                                        <TodoKanban
                                            todos={filteredTodos}
                                            onToggleComplete={handleToggleComplete}
                                            onEditTodo={openEditDialog}
                                            onDeleteTodo={handleDeleteTodo}
                                            onDragEnd={handleKanbanDragEnd}
                                            onColumnsVisibilityChange={handleKanbanColumnsVisibilityChange}
                                            onAddTodo={handleAddTodoFromKanban}
                                            activeTagFilter={activeTagFilter}
                                        />
                                    </div>
                                );
                            case 'list':
                                return (
                                    <TodoList
                                        todos={filteredTodos}
                                        onToggleComplete={handleToggleComplete}
                                        onEditTodo={openEditDialog}
                                        onDeleteTodo={handleDeleteTodo}
                                        onAddTodo={() => setIsCreateDialogOpen(true)}
                                    />
                                );
                            case 'table':
                                return (
                                    <TodoTable
                                        todos={filteredTodos}
                                        onToggleComplete={handleToggleComplete}
                                        onEditTodo={openEditDialog}
                                        onDeleteTodo={handleDeleteTodo}
                                        onAddTodo={() => setIsCreateDialogOpen(true)}
                                    />
                                );
                            case 'grid':
                            default:
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
                                        
                                        {/* Add Todo Button - styled as grid item */}
                                        <div className="group">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsCreateDialogOpen(true)}
                                                className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground border-2 border-dashed border-muted hover:border-muted-foreground/50 transition-colors rounded-lg bg-card hover:bg-muted/20"
                                            >
                                                <Plus className="w-8 h-8" />
                                                <span className="text-sm font-medium">Add Todo</span>
                                                <span className="text-xs opacity-75">Click to create a new todo</span>
                                            </Button>
                                        </div>
                                    </div>
                                );
                        }
                    })()}

                    {/* Show empty state if no todos after filtering */}
                    {(() => {
                        // Apply the same filtering logic as above
                        let filteredTodos = todos;
                        
                        // Apply advanced filters
                        if (advancedFilters.search) {
                            const searchLower = advancedFilters.search.toLowerCase();
                            filteredTodos = filteredTodos.filter(todo =>
                                todo.title.toLowerCase().includes(searchLower) ||
                                (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
                                (todo.tags && todo.tags.some(tag => tag.name.toLowerCase().includes(searchLower)))
                            );
                        }
                        
                        if (advancedFilters.status?.length > 0) {
                            filteredTodos = filteredTodos.filter(todo =>
                                advancedFilters.status.includes(todo.status)
                            );
                        }
                        
                        if (advancedFilters.priority?.length > 0) {
                            filteredTodos = filteredTodos.filter(todo =>
                                advancedFilters.priority.includes(todo.priority)
                            );
                        }
                        
                        if (advancedFilters.tags?.length > 0) {
                            filteredTodos = filteredTodos.filter(todo =>
                                todo.tags && todo.tags.some(tag => advancedFilters.tags.includes(tag.id))
                            );
                        }
                        
                        if (advancedFilters.overdue) {
                            filteredTodos = filteredTodos.filter(todo => todo.is_overdue);
                        }
                        
                        if (advancedFilters.due_within) {
                            const daysFromNow = advancedFilters.due_within;
                            filteredTodos = filteredTodos.filter(todo => {
                                if (!todo.due_date || todo.status === 'completed') return false;
                                const daysUntilDue = Math.ceil((new Date(todo.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                                return daysUntilDue >= 0 && daysUntilDue <= daysFromNow;
                            });
                        }
                        
                        if (advancedFilters.recent_days) {
                            const daysAgo = advancedFilters.recent_days;
                            filteredTodos = filteredTodos.filter(todo => {
                                const daysSinceCreated = Math.ceil((new Date() - new Date(todo.created_at)) / (1000 * 60 * 60 * 24));
                                return daysSinceCreated <= daysAgo;
                            });
                        }
                        
                        // Apply tag filter (legacy filter)
                        if (activeTagFilter) {
                            filteredTodos = filteredTodos.filter(todo => 
                                todo.tags && todo.tags.some(tag => tag.id === activeTagFilter)
                            );
                        }
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

            {/* Tag Manager Dialog */}
            <TagManagerDialog
                open={isTagManagerOpen}
                onOpenChange={setIsTagManagerOpen}
                tags={tags}
                tagForm={tagForm}
                setTagForm={setTagForm}
                handleCreateTag={handleCreateTag}
                handleDeleteTag={handleDeleteTag}
                onTagFilterChange={setActiveTagFilter}
            />
            </div>
        </AuthenticatedLayout>
    );
}
