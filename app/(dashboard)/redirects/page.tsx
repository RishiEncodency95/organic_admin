"use client";

import { useState, useEffect } from "react";
import Table, { Column } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { redirectsApi, Redirect } from "@/lib/redirectsApi";

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ source: "", destination: "", permanent: true, isActive: true });
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const data = await redirectsApi.getAll();
      setRedirects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await redirectsApi.update(editingId, formData);
      } else {
        await redirectsApi.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this redirect?")) {
      try {
        await redirectsApi.delete(id);
        loadData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete.");
      }
    }
  };

  const toggleStatus = async (redirect: Redirect) => {
    try {
      await redirectsApi.update(redirect._id, { isActive: !redirect.isActive });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<Redirect>[] = [
    { 
      key: "source", 
      header: "Source URL",
      render: (row: Redirect) => row.source 
    },
    { 
      key: "destination", 
      header: "Destination URL",
      render: (row: Redirect) => row.destination 
    },
    { 
      key: "permanent", 
      header: "Type",
      render: (row: Redirect) => (row.permanent ? "301 Permanent" : "302 Temporary")
    },
    {
      key: "isActive",
      header: "Status",
      render: (row: Redirect) => (
        <span 
          onClick={(e) => { e.stopPropagation(); toggleStatus(row); }}
          className={`cursor-pointer px-2 py-1 rounded text-xs font-semibold ${row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row: Redirect) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setFormData({ source: row.source, destination: row.destination, permanent: row.permanent, isActive: row.isActive });
              setEditingId(row._id);
              setIsModalOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(row._id); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">301 Redirect Manager</h1>
          <p className="text-xs text-text-muted">Manage URL redirects to preserve SEO when page slugs change.</p>
        </div>
        <Button size="sm" onClick={() => {
          setFormData({ source: "/", destination: "/", permanent: true, isActive: true });
          setEditingId(null);
          setIsModalOpen(true);
        }}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Redirect
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-surface-border shadow-sm overflow-hidden">
        <Table<Redirect> columns={columns} rows={redirects} rowKey={(r) => r._id} loading={loading} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Redirect" : "Add Redirect"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Source URL (e.g. /old-page)"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            required
          />
          <Input
            label="Destination URL (e.g. /new-page)"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            required
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.permanent} onChange={(e) => setFormData({ ...formData, permanent: e.target.checked })} />
              301 Permanent (Recommended)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
              Active
            </label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Redirect</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
