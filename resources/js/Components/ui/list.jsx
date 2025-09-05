'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const List = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("divide-y divide-border bg-background", className)}
    {...props}
  />
));
List.displayName = "List";

const ListItem = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center space-x-4 p-4 hover:bg-muted/50 transition-colors",
      className
    )}
    {...props}
  />
));
ListItem.displayName = "ListItem";

const ListItemContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 min-w-0", className)}
    {...props}
  />
));
ListItemContent.displayName = "ListItemContent";

const ListItemMeta = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}
    {...props}
  />
));
ListItemMeta.displayName = "ListItemMeta";

const ListItemActions = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center space-x-2", className)}
    {...props}
  />
));
ListItemActions.displayName = "ListItemActions";

export { List, ListItem, ListItemContent, ListItemMeta, ListItemActions };