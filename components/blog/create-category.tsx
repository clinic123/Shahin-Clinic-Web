"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    setLoading(false);
    fetchCategories();
  }

  async function handleUpdate(id: string, newName: string) {
    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    setEditingId(null);
    fetchCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      <ul className="space-y-3">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            {editingId === cat.id ? (
              <input
                type="text"
                defaultValue={cat.name}
                onBlur={(e) => handleUpdate(cat.id, e.target.value)}
                className="border px-2 py-1 rounded w-full"
                autoFocus
              />
            ) : (
              <>
                <span>{cat.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(cat.id)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
