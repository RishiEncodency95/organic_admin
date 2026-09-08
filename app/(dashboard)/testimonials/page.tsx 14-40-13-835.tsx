"use client";

import { useEffect, useState } from "react";
import { Edit2, Plus, Star, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Table, { Column } from "@/components/ui/Table";
import { testimonialsApi } from "@/lib/testimonialsApi";
import { Testimonial } from "@/lib/types";

type TestimonialForm = {
  name: string;
  photo: string;
  message: string;
  rating: number;
  isApproved: boolean;
};

const emptyForm: TestimonialForm = {
  name: "",
  photo: "",
  message: "",
  rating: 5,
  isApproved: false,
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialForm>(emptyForm);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const data = await testimonialsApi.getAll();
      setTestimonials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      photo: testimonial.photo ?? "",
      message: testimonial.message,
      rating: testimonial.rating,
      isApproved: testimonial.isApproved,
    });
    setEditingId(testimonial._id);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const payload = { ...formData, photo: formData.photo.trim() || undefined };
      if (editingId) {
        await testimonialsApi.update(editingId, payload);
      } else {
        await testimonialsApi.create(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await testimonialsApi.delete(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete testimonial.");
    }
  };

  const toggleApproval = async (testimonial: Testimonial) => {
    try {
      await testimonialsApi.update(testimonial._id, { isApproved: !testimonial.isApproved });
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update approval status.");
    }
  };

  const columns: Column<Testimonial>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-muted">{new Date(row.createdAt).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (row) => <p className="max-w-xl line-clamp-2 text-sm text-text-secondary">{row.message}</p>,
    },
    {
      key: "rating",
      header: "Rating",
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-amber-600">
          <Star className="h-4 w-4 fill-current" />
          {row.rating}
        </span>
      ),
    },
    {
      key: "isApproved",
      header: "Status",
      render: (row) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleApproval(row);
          }}
          className={`rounded px-2 py-1 text-xs font-semibold ${
            row.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {row.isApproved ? "Approved" : "Pending"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              openEditModal(row);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(row._id);
            }}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Testimonials</h1>
          <p className="text-xs text-text-muted">Review, approve, edit, and publish visitor testimonials.</p>
        </div>
        <Button size="sm" onClick={openCreateModal}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Testimonial
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface shadow-sm">
        <Table<Testimonial>
          columns={columns}
          rows={testimonials}
          rowKey={(row) => row._id}
          loading={loading}
          emptyMessage="No testimonials yet."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Testimonial" : "Add Testimonial"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            required
          />
          <Input
            label="Photo URL"
            value={formData.photo}
            onChange={(event) => setFormData({ ...formData, photo: event.target.value })}
            placeholder="/assets/person.jpg or Cloudinary URL"
          />
          <Textarea
            label="Message"
            value={formData.message}
            onChange={(event) => setFormData({ ...formData, message: event.target.value })}
            required
            rows={5}
          />
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <Input
              label="Rating"
              type="number"
              min={1}
              max={5}
              value={formData.rating.toString()}
              onChange={(event) =>
                setFormData({ ...formData, rating: Math.min(5, Math.max(1, Number(event.target.value) || 1)) })
              }
              required
            />
            <label className="mt-5 flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={formData.isApproved}
                onChange={(event) => setFormData({ ...formData, isApproved: event.target.checked })}
              />
              Approved for website
            </label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Testimonial</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
