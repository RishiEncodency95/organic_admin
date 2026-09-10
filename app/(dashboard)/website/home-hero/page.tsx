"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchHomeHeros,
  createHomeHero,
  updateHomeHero,
  deleteHomeHero,
  HomeHero,
} from "@/store/slices/home/homeHeroSlice";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save, Trash2, Edit, Plus, Image as ImageIcon } from "lucide-react";

export default function HomeHeroPage() {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.homeHero);

  const [formData, setFormData] = useState<Partial<HomeHero>>({
    tagline: "",
    titlePrimary: "",
    titleSecondary: "",
    subtitle: "",
    description: "",
    date: "",
    location: "",
    status: "active",
    button1Name: "",
    button1Link: "",
    button2Name: "",
    button2Link: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchHomeHeros());
  }, [dispatch]);

  // Load the first available hero by default if none is selected
  useEffect(() => {
    if (data && data.length > 0 && !isEditing) {
      const hero = data[0];
      setFormData(hero);
      setIsEditing(true);
    }
  }, [data, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "img" && key !== "_id" && key !== "createdAt" && key !== "updatedAt" && key !== "__v") {
          form.append(key, (formData as any)[key] || "");
        }
      });

      if (selectedFile) {
        form.append("img", selectedFile);
      }

      if (formData._id) {
        // Update
        await dispatch(updateHomeHero({ id: formData._id, formData: form })).unwrap();
        toast.success("Home Hero updated successfully!");
      } else {
        // Create
        await dispatch(createHomeHero(form)).unwrap();
        toast.success("Home Hero created successfully!");
        setIsEditing(true);
      }
      dispatch(fetchHomeHeros());
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err || "An error occurred while saving.");
    }
  };

  const handleDelete = async () => {
    if (!formData._id) return;
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        await dispatch(deleteHomeHero(formData._id)).unwrap();
        toast.success("Home Hero deleted successfully!");
        handleNew();
      } catch (err: any) {
        toast.error(err || "Failed to delete.");
      }
    }
  };

  const handleNew = () => {
    setFormData({
      tagline: "",
      titlePrimary: "",
      titleSecondary: "",
      subtitle: "",
      description: "",
      date: "",
      location: "",
      status: "active",
      button1Name: "",
      button1Link: "",
      button2Name: "",
      button2Link: "",
    });
    setSelectedFile(null);
    setIsEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-6">
      {/* HEADER WITH ACTION BUTTONS */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Home Hero Section</h1>
          <p className="text-sm text-gray-500">Manage the main hero banner on the homepage</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleNew} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
          {formData._id && (
            <Button variant="danger" onClick={handleDelete} disabled={loading}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          <Input
            label="Tagline"
            name="tagline"
            value={formData.tagline || ""}
            onChange={handleInputChange}
            placeholder="e.g. INDIA'S LARGEST"
          />
          <Input
            label="Primary Title"
            name="titlePrimary"
            value={formData.titlePrimary || ""}
            onChange={handleInputChange}
            placeholder="e.g. Bharat Organic"
          />
          <Input
            label="Secondary Title"
            name="titleSecondary"
            value={formData.titleSecondary || ""}
            onChange={handleInputChange}
            placeholder="e.g. Expo 2027"
          />
          <Input
            label="Subtitle"
            name="subtitle"
            value={formData.subtitle || ""}
            onChange={handleInputChange}
            placeholder="e.g. Celebrating Organic Lifestyle"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              className="min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Enter brief description..."
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              name="date"
              value={formData.date || ""}
              onChange={handleInputChange}
              placeholder="e.g. 24-25 August 2027"
            />
            <Input
              label="Location"
              name="location"
              value={formData.location || ""}
              onChange={handleInputChange}
              placeholder="e.g. New Delhi"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Button 1 Name"
              name="button1Name"
              value={formData.button1Name || ""}
              onChange={handleInputChange}
            />
            <Input
              label="Button 1 Link"
              name="button1Link"
              value={formData.button1Link || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Button 2 Name"
              name="button2Name"
              value={formData.button2Name || ""}
              onChange={handleInputChange}
            />
            <Input
              label="Button 2 Link"
              name="button2Link"
              value={formData.button2Link || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Status</label>
            <select
              name="status"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.status || "active"}
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t">
            <label className="text-[13px] font-semibold text-gray-700">Hero Image</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
              {formData.img && !selectedFile && (
                <div className="h-12 w-12 shrink-0 rounded border overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`http://localhost:5000/uploads/organic_expo/${formData.img}`} alt="Current" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
