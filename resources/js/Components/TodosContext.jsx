import React, { createContext, useContext } from "react";
import useTodosApi from "@/hooks/useTodosApi";

const TodosContext = createContext();

export function TodosProvider({ children, initialTodos, initialTags, ...rest }) {
  const todosApi = useTodosApi({ initialTodos, initialTags, ...rest });
  return (
    <TodosContext.Provider value={todosApi}>
      {children}
    </TodosContext.Provider>
  );
}

export function useTodos() {
  return useContext(TodosContext);
}
