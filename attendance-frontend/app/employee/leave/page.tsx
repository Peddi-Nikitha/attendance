"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Leave = { id: string; type: string; reason: string; from: string; to: string; status: "Pending" | "Approved" | "Rejected" };

export default function EmployeeLeavePage() {
  const [leaves, setLeaves] = useState<Leave[]>([
    { id: "1", type: "Sick", reason: "Fever", from: "2025-10-15", to: "2025-10-16", status: "Approved" },
  ]);
  const [form, setForm] = useState({ type: "Casual", reason: "", from: "", to: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from || !form.to) return;
    setLeaves((l) => [
      { id: String(Date.now()), type: form.type, reason: form.reason || "—", from: form.from, to: form.to, status: "Pending" },
      ...l,
    ]);
    setForm({ type: "Casual", reason: "", from: "", to: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Leave</h1>
        <p className="text-sm text-slate-600">Apply Leave (Type, Reason, Date Range) and track statuses.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Apply Leave" />
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option>Casual</option>
                  <option>Sick</option>
                  <option>Privilege</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Reason</label>
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Optional"
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">From</label>
                  <input type="date" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">To</label>
                  <input type="date" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} />
                </div>
              </div>
              <Button type="submit">Submit</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Status Tracking" />
          <CardContent>
            <div className="space-y-2">
              {leaves.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
                  <div>
                    <div className="font-medium text-slate-800">{l.type} Leave</div>
                    <div className="text-xs text-slate-500">{l.from} → {l.to} • {l.reason}</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    l.status === "Approved" ? "bg-green-50 text-green-700" : l.status === "Rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                  }`}>{l.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


