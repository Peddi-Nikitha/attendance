"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDataStore, Employee } from "@/lib/datastore";

export default function AdminEmployeesPage() {
  const store = useDataStore();
  const [, force] = useState(0);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [role, setRole] = useState("");
  const [draft, setDraft] = useState<Omit<Employee, "id">>({ name: "", email: "", department: "", role: "employee", manager: "" });

  useEffect(() => {
    const unsub = store.subscribe(() => force((x) => x + 1));
    return () => unsub();
  }, [store]);

  const filtered = useMemo(() => {
    return store.employees.filter((e) =>
      (!q || e.name.toLowerCase().includes(q.toLowerCase()) || e.email.toLowerCase().includes(q.toLowerCase())) &&
      (!dept || e.department === dept) &&
      (!role || e.role === (role as any))
    );
  }, [store.employees, q, dept, role]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Employee Management</h1>
        <p className="text-sm text-slate-600">Add/Edit/Delete and filter by Department/Role.</p>
      </div>

      <Card>
        <CardHeader title="Add Employee" />
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-5">
            <input className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" placeholder="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            <input className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm sm:col-span-2" placeholder="Email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
            <input className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" placeholder="Department" value={draft.department} onChange={(e) => setDraft((d) => ({ ...d, department: e.target.value }))} />
            <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as any }))}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mt-3">
            <Button onClick={() => { if (!draft.name || !draft.email) return; store.addEmployee(draft); setDraft({ name: "", email: "", department: "", role: "employee", manager: "" }); }}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Employees" />
        <CardContent>
          <div className="mb-3 grid gap-3 sm:grid-cols-3">
            <input className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" placeholder="Search name/email" value={q} onChange={(e) => setQ(e.target.value)} />
            <input className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" placeholder="Filter Department" value={dept} onChange={(e) => setDept(e.target.value)} />
            <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-600">
                  <th className="border-b border-slate-200 px-3 py-2 font-medium">Name</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-medium">Email</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-medium">Department</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-medium">Role</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-800">{e.name}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{e.email}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{e.department}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{e.role}</td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <a className="rounded border border-slate-200 px-2 py-1" href={`/admin/employees?id=${e.id}`}>View</a>
                        <button className="rounded border border-slate-200 px-2 py-1" onClick={() => store.updateEmployee(e.id, { department: prompt("Department", e.department) || e.department })}>Edit</button>
                        <button className="rounded border border-slate-200 px-2 py-1 text-rose-600" onClick={() => store.deleteEmployee(e.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


