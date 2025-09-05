'use client';

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  createContext,
  useContext,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import tunnel from 'tunnel-rat';
import { Card } from '@/Components/ui/card';
import { ScrollArea, ScrollBar } from '@/Components/ui/scroll-area';
import { cn } from '@/lib/utils';

const t = tunnel();

// DragEndEvent is a TypeScript type, not available in JavaScript runtime

const KanbanContext = createContext({
  columns: [],
  data: [],
  activeCardId: null,
});

export const KanbanBoard = ({ id, children, className }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      className={cn(
        'flex size-full min-h-40 flex-col divide-y overflow-hidden rounded-md border bg-secondary text-xs shadow-sm ring-2 transition-all',
        isOver ? 'ring-primary' : 'ring-transparent',
        className
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export const KanbanCard = ({
  id,
  name,
  children,
  className,
  ...otherProps
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id,
  });
  const { activeCardId } = useContext(KanbanContext);

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Dedicated drag handle (top-left corner)
  return (
    <>
      <div style={style} ref={setNodeRef}>
        <Card
          className={cn(
            'gap-4 rounded-md p-3 shadow-sm',
            isDragging && 'pointer-events-none opacity-30',
            className
          )}
        >
          {/* Drag handle: only this area is draggable */}
          <div className="cursor-grab active:cursor-grabbing inline-flex items-center" {...listeners} {...attributes} tabIndex={0} aria-label="Drag handle" style={{marginRight: 8}}>
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="3" cy="4" r="1.5" fill="#888"/><circle cx="3" cy="8" r="1.5" fill="#888"/><circle cx="3" cy="12" r="1.5" fill="#888"/><circle cx="8" cy="4" r="1.5" fill="#888"/><circle cx="8" cy="8" r="1.5" fill="#888"/><circle cx="8" cy="12" r="1.5" fill="#888"/></svg>
          </div>
          {/* Card content */}
          <div className="flex-1">{children ?? <p className="m-0 font-medium text-sm">{name}</p>}</div>
        </Card>
      </div>
      {activeCardId === id && (
        <t.In>
          <Card
            className={cn(
              'gap-4 rounded-md p-3 shadow-sm ring-2 ring-primary',
              isDragging && 'cursor-grabbing',
              className
            )}
          >
            <div className="cursor-grab active:cursor-grabbing inline-flex items-center" tabIndex={0} aria-label="Drag handle">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="3" cy="4" r="1.5" fill="#888"/><circle cx="3" cy="8" r="1.5" fill="#888"/><circle cx="3" cy="12" r="1.5" fill="#888"/><circle cx="8" cy="4" r="1.5" fill="#888"/><circle cx="8" cy="8" r="1.5" fill="#888"/><circle cx="8" cy="12" r="1.5" fill="#888"/></svg>
            </div>
            <div className="flex-1">{children ?? <p className="m-0 font-medium text-sm">{name}</p>}</div>
          </Card>
        </t.In>
      )}
    </>
  );
};

export const KanbanCards = ({
  children,
  className,
  id,
  ...props
}) => {
  const { data } = useContext(KanbanContext);
  const filteredData = data.filter((item) => item.column === id);
  const items = filteredData.map((item) => item.id);

  return (
    <ScrollArea className="overflow-hidden">
      <SortableContext items={items}>
        <div
          className={cn('flex flex-grow flex-col gap-2 p-2', className)}
          {...props}
        >
          {filteredData.map(children)}
        </div>
      </SortableContext>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

export const KanbanHeader = ({ className, ...props }) => (
  <div className={cn('m-0 p-2 font-semibold text-sm', className)} {...props} />
);

export const KanbanProvider = ({
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  className,
  columns,
  data,
  onDataChange,
  ...props
}) => {
  const [activeCardId, setActiveCardId] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const card = data.find((item) => item.id === event.active.id);
    if (card) {
      setActiveCardId(event.active.id);
    }
    onDragStart?.(event);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeItem = data.find((item) => item.id === active.id);
    const overItem = data.find((item) => item.id === over.id);

    if (!activeItem) {
      return;
    }

    const activeColumn = activeItem.column;
    const overColumn =
      overItem?.column ||
      columns.find(col => col.id === over.id)?.id ||
      columns[0]?.id;

    if (activeColumn !== overColumn) {
      let newData = [...data];
      const activeIndex = newData.findIndex((item) => item.id === active.id);
      const overIndex = newData.findIndex((item) => item.id === over.id);

      newData[activeIndex].column = overColumn;
      newData = arrayMove(newData, activeIndex, overIndex);

      onDataChange?.(newData);
    }

    onDragOver?.(event);
  };

  const handleDragEnd = (event) => {
    setActiveCardId(null);

    onDragEnd?.(event);

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    let newData = [...data];

    const oldIndex = newData.findIndex((item) => item.id === active.id);
    const newIndex = newData.findIndex((item) => item.id === over.id);

    newData = arrayMove(newData, oldIndex, newIndex);

    onDataChange?.(newData);
  };

  const announcements = {
    onDragStart({ active }) {
      const { name, column } = data.find((item) => item.id === active.id) ?? {};

      return `Picked up the card "${name}" from the "${column}" column`;
    },
    onDragOver({ active, over }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};
      const newColumn = columns.find((column) => column.id === over?.id)?.name;

      return `Dragged the card "${name}" over the "${newColumn}" column`;
    },
    onDragEnd({ active, over }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};
      const newColumn = columns.find((column) => column.id === over?.id)?.name;

      return `Dropped the card "${name}" into the "${newColumn}" column`;
    },
    onDragCancel({ active }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};

      return `Cancelled dragging the card "${name}"`;
    },
  };

  return (
    <KanbanContext.Provider value={{ columns, data, activeCardId }}>
      <DndContext
        accessibility={{ announcements }}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
        {...props}
      >
        <div
          className={cn(
            'grid size-full auto-cols-fr grid-flow-col gap-4',
            className
          )}
        >
          {columns.map((column) => children(column))}
        </div>
        {typeof window !== 'undefined' &&
          createPortal(
            <DragOverlay>
              <t.Out />
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </KanbanContext.Provider>
  );
};
