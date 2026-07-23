"use client";

import type { Part } from "@/lib/types";

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

interface Props {
  parts: Part[];
  onChange: (parts: Part[]) => void;
}

export default function PartsTable({ parts, onChange }: Props) {
  function addRow() {
    onChange([...parts, { id: newId(), description: "", qty: 1 }]);
  }

  function updateRow(id: string, updates: Partial<Part>) {
    onChange(parts.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }

  function removeRow(id: string) {
    onChange(parts.filter((p) => p.id !== id));
  }

  return (
    <div>
      <table className="w-full border-collapse mb-3">
        <thead>
          <tr>
            <th className="text-left text-[11px] uppercase tracking-wide text-ink-soft font-semibold pb-2 w-12">
              No.
            </th>
            <th className="text-left text-[11px] uppercase tracking-wide text-ink-soft font-semibold pb-2">
              Description
            </th>
            <th className="text-left text-[11px] uppercase tracking-wide text-ink-soft font-semibold pb-2 w-24">
              Qty
            </th>
            <th className="w-9" />
          </tr>
        </thead>
        <tbody>
          {parts.map((p, i) => (
            <tr key={p.id} className="border-b border-[#EEF0F3]">
              <td className="py-1.5 text-sm text-ink-soft">{i + 1}</td>
              <td className="py-1.5 pr-2">
                <input
                  type="text"
                  value={p.description}
                  onChange={(e) =>
                    updateRow(p.id, { description: e.target.value })
                  }
                  placeholder="Part description"
                  className="w-full border border-line rounded-md px-2.5 py-1.5 text-sm bg-[#FCFCFD] focus:outline-none focus:ring-2 focus:ring-[#9DB6E0]"
                />
              </td>
              <td className="py-1.5 pr-2">
                <input
                  type="number"
                  min={1}
                  value={p.qty}
                  onChange={(e) =>
                    updateRow(p.id, { qty: Number(e.target.value) || 1 })
                  }
                  className="w-full border border-line rounded-md px-2.5 py-1.5 text-sm bg-[#FCFCFD] focus:outline-none focus:ring-2 focus:ring-[#9DB6E0]"
                />
              </td>
              <td className="py-1.5 text-center">
                <button
                  type="button"
                  onClick={() => removeRow(p.id)}
                  title="Remove row"
                  className="text-warn hover:bg-warn-soft rounded-md w-7 h-7 leading-none"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={addRow}
        className="text-xs font-semibold border border-line rounded-md px-3 py-1.5 hover:bg-[#F7F8FA]"
      >
        + Add part
      </button>
    </div>
  );
}
