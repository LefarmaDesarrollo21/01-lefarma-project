import { useState } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Column {
  id: string;
  header: string;
}

interface FilterConfigProps {
  tableId: string;
  allColumns: Column[];
  searchableColumns: string[];
  visibleColumns: string[];
  onSearchColumnsChange: (columnIds: string[]) => void;
  onVisibleColumnsChange: (columnIds: string[]) => void;
  onReset: () => void;
}

export const FilterConfig = ({
  tableId,
  allColumns,
  searchableColumns,
  visibleColumns,
  onSearchColumnsChange,
  onVisibleColumnsChange,
  onReset,
}: FilterConfigProps) => {
  const [open, setOpen] = useState(false);

  const handleSearchColumnToggle = (columnId: string, checked: boolean) => {
    if (checked) {
      onSearchColumnsChange([...searchableColumns, columnId]);
    } else {
      onSearchColumnsChange(searchableColumns.filter((id) => id !== columnId));
    }
  };

  const handleVisibleColumnToggle = (columnId: string, checked: boolean) => {
    if (checked) {
      onVisibleColumnsChange([...visibleColumns, columnId]);
    } else {
      onVisibleColumnsChange(visibleColumns.filter((id) => id !== columnId));
    }
  };

  const handleReset = () => {
    onReset();
    toast.success("Configuración restaurada a valores por defecto");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurar tabla
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar tabla</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Searchable Columns Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Buscar en estas columnas</Label>
            <div className="space-y-2">
              {allColumns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`search-${tableId}-${column.id}`}
                    checked={searchableColumns.includes(column.id)}
                    onCheckedChange={(checked) =>
                      handleSearchColumnToggle(column.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`search-${tableId}-${column.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {column.header}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Visible Columns Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Columnas visibles</Label>
            <div className="space-y-2">
              {allColumns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`visible-${tableId}-${column.id}`}
                    checked={visibleColumns.includes(column.id)}
                    onCheckedChange={(checked) =>
                      handleVisibleColumnToggle(column.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`visible-${tableId}-${column.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {column.header}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Restaurar defaults
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
