import * as React from "react";

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={className}>{children}</div>
  );
}

export function TabsList({ children, className }) {
  return (
    <div className={`inline-flex rounded-lg bg-muted p-1 dark:bg-muted/40 ${className || ''}`}>{children}</div>
  );
}

export function TabsTrigger({ value, active, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none
        ${active
          ? "bg-background text-primary shadow dark:bg-background dark:text-primary"
          : "text-muted-foreground hover:text-primary hover:bg-accent dark:hover:bg-accent/40"}
        ${className || ''}`}
      aria-selected={active}
      aria-controls={`tab-panel-${value}`}
      id={`tab-${value}`}
      role="tab"
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, active, children, className }) {
  if (!active) return null;
  return (
    <div
      id={`tab-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      className={className}
    >
      {children}
    </div>
  );
} 