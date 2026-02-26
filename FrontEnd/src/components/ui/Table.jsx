import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Table = ({ children, className }) => (
  <div className="overflow-x-auto">
    <table className={cn('w-full text-left border-collapse', className)}>
      {children}
    </table>
  </div>
);

const TableHead = ({ children, className }) => (
  <thead className={cn('bg-slate-50 border-b border-slate-200', className)}>
    {children}
  </thead>
);

const TableBody = ({ children, className }) => (
  <tbody className={cn('divide-y divide-slate-100', className)}>
    {children}
  </tbody>
);

const TableRow = ({ children, className, onClick }) => (
  <tr
    onClick={onClick}
    className={cn(
      'transition-colors',
      onClick && 'cursor-pointer hover:bg-slate-50',
      className
    )}
  >
    {children}
  </tr>
);

const TableHeader = ({ children, className }) => (
  <th
    className={cn(
      'px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider',
      className
    )}
  >
    {children}
  </th>
);

const TableCell = ({ children, className }) => (
  <td className={cn('px-6 py-4 text-sm text-text-primary', className)}>
    {children}
  </td>
);

const TableEmpty = ({ colSpan, message = 'No data available' }) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-6 py-12 text-center text-text-muted"
    >
      {message}
    </td>
  </tr>
);

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell;
Table.Empty = TableEmpty;

export default Table;
