import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoCertifications({ showAddButton = false, onAddClick }) {
  return (
    <div className="text-center py-12 rounded-lg border-4 border-dashed">
      <Award className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-600" />
      <h3 className="text-lg font-medium mb-2">No Certifications Yet</h3>
      <p className="text-muted-foreground mb-4">
        {showAddButton
          ? "Start adding your professional certifications to showcase your achievements."
          : "This faculty member hasn't added any certifications yet."}
      </p>
      {showAddButton && (
        <Button
          onClick={onAddClick}
          className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          Add Your First Certification
        </Button>
      )}
    </div>
  );
}
