import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
}

export function Table<T>({ columns, data, keyExtractor }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                データがありません
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
