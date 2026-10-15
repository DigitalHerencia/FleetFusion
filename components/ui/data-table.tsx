"use client";

import * as React from "react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  flexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Search,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";

const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns,
  sortFns,
});

type DataTableFeatures = typeof dataTableFeatures;
type DataTableInstance<TData extends RowData> = TanstackTable<
  DataTableFeatures,
  TData
>;

// DataTable Context
interface DataTableContextValue<TData extends RowData> {
  table: DataTableInstance<TData>;
}

const DataTableContext =
  React.createContext<DataTableContextValue<RowData> | null>(null);

function useDataTable<TData extends RowData>() {
  const context = React.useContext(DataTableContext);
  if (!context) {
    throw new Error("DataTable components must be used within a <DataTable />");
  }

  return context as unknown as DataTableContextValue<TData>;
}

// Column Header with sorting
interface DataTableColumnHeaderProps<
  TData extends RowData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
}

function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 data-[state=open]:bg-accent", className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span>{title}</span>
      {column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

// Toolbar
interface DataTableToolbarProps<TData extends RowData> {
  table: DataTableInstance<TData>;
  filterPlaceholder?: string;
  filterColumn?: string;
  showColumnVisibility?: boolean;
}

function DataTableToolbar<TData extends RowData>({
  table,
  filterPlaceholder = "Filter...",
  filterColumn,
  showColumnVisibility = true,
}: DataTableToolbarProps<TData>) {
  const column = filterColumn ? table.getColumn(filterColumn) : undefined;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-1 items-center space-x-2">
        {column ? (
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={filterPlaceholder}
              value={String(column.getFilterValue() ?? "")}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-9 w-[150px] pl-9 lg:w-[250px]"
            />
          </div>
        ) : null}
      </div>

      {showColumnVisibility ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-9">
              <Settings2 className="mr-2 h-4 w-4" />
              Columns
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((tableColumn) => tableColumn.getCanHide())
              .map((tableColumn) => (
                <DropdownMenuCheckboxItem
                  key={tableColumn.id}
                  className="capitalize"
                  checked={tableColumn.getIsVisible()}
                  onCheckedChange={(value) =>
                    tableColumn.toggleVisibility(Boolean(value))
                  }
                >
                  {tableColumn.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

// Pagination
interface DataTablePaginationProps<TData extends RowData> {
  table: DataTableInstance<TData>;
  pageSizeOptions?: number[];
}

function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
  const pagination = table.store.state.pagination;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {selectedCount > 0 ? (
          <>
            {selectedCount} of {filteredCount} row(s) selected.
          </>
        ) : null}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-9 w-[85px]">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pagination.pageIndex + 1} of {table.getPageCount()}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main DataTable component
export interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];

  // Features
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  enablePagination?: boolean;

  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];

  // Search
  filterColumn?: string;
  filterPlaceholder?: string;

  // Empty/Loading
  emptyMessage?: string;
  isLoading?: boolean;

  // Callbacks
  onRowSelectionChange?: (selectedRows: TData[]) => void;
}

function DataTable<TData extends RowData>({
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enableColumnVisibility = true,
  enableRowSelection = false,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50],
  filterColumn,
  filterPlaceholder = "Filter...",
  emptyMessage = "No results.",
  isLoading = false,
  onRowSelectionChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const tableColumns = React.useMemo<
    ColumnDef<DataTableFeatures, TData>[]
  >(() => {
    if (!enableRowSelection) return columns;

    const selectionColumn: ColumnDef<DataTableFeatures, TData> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(Boolean(value))
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns: tableColumns,
    enableSorting,
    enableFilters: enableFiltering,
    enableColumnFilters: enableFiltering,
    enableHiding: enableColumnVisibility,
    enableRowSelection,
    manualPagination: !enablePagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
  });

  const onRowSelectionChangeRef = React.useRef(onRowSelectionChange);
  React.useEffect(() => {
    onRowSelectionChangeRef.current = onRowSelectionChange;
  }, [onRowSelectionChange]);

  React.useEffect(() => {
    const notify = onRowSelectionChangeRef.current;
    if (!notify) return;

    notify(table.getFilteredSelectedRowModel().rows.map((row) => row.original));
  }, [rowSelection, table]);

  const contextValue = React.useMemo(
    () =>
      ({
        table,
      }) as unknown as DataTableContextValue<RowData>,
    [table],
  );

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className="space-y-4">
        {(enableFiltering || enableColumnVisibility) && (
          <DataTableToolbar
            table={table}
            filterPlaceholder={filterPlaceholder}
            {...(filterColumn === undefined ? {} : { filterColumn })}
            showColumnVisibility={enableColumnVisibility}
          />
        )}

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin border-3 border-foreground border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {enablePagination ? (
          <DataTablePagination
            table={table}
            pageSizeOptions={pageSizeOptions}
          />
        ) : null}
      </div>
    </DataTableContext.Provider>
  );
}

export {
  DataTable,
  DataTableColumnHeader,
  DataTableToolbar,
  DataTablePagination,
  dataTableFeatures,
  useDataTable,
};
