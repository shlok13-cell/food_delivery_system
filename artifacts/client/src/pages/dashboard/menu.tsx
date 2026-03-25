import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Leaf, Star, Eye, EyeOff, X, Check } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
  is_veg: boolean;
  is_bestseller: boolean;
  is_available: number;
}

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "",
  emoji: "🍽️", is_veg: false, is_bestseller: false,
};

type FormState = typeof EMPTY_FORM;

function ItemForm({
  initial, onSave, onCancel, loading,
}: {
  initial: FormState;
  onSave: (data: FormState) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 flex gap-3">
          <div className="w-24">
            <label className="block text-xs text-white/40 mb-1">Emoji</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center text-xl focus:outline-none focus:border-orange-500/50"
              value={form.emoji} maxLength={4}
              onChange={e => set("emoji", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-white/40 mb-1">Item Name *</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50"
              placeholder="e.g. Butter Chicken"
              value={form.name} onChange={e => set("name", e.target.value)}
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/40 mb-1">Description *</label>
          <textarea
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 resize-none"
            placeholder="Describe the dish..."
            value={form.description} onChange={e => set("description", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Price (₹) *</label>
          <input
            type="number" min={0} step={1}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50"
            placeholder="e.g. 299"
            value={form.price} onChange={e => set("price", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Category *</label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50"
            placeholder="e.g. Mains, Starters, Drinks"
            value={form.category} onChange={e => set("category", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => set("is_veg", !form.is_veg)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.is_veg ? "bg-green-500 border-green-500" : "border-white/20"}`}
            >
              {form.is_veg && <Check size={12} className="text-white" />}
            </div>
            <span className="text-sm text-white/70 flex items-center gap-1"><Leaf size={14} className="text-green-400" /> Vegetarian</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => set("is_bestseller", !form.is_bestseller)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.is_bestseller ? "bg-orange-500 border-orange-500" : "border-white/20"}`}
            >
              {form.is_bestseller && <Check size={12} className="text-white" />}
            </div>
            <span className="text-sm text-white/70 flex items-center gap-1"><Star size={14} className="text-orange-400" /> Bestseller</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={loading}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm"
        >
          {loading ? "Saving…" : "Save Item"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ available }: { available: number }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${available ? "bg-green-500/15 text-green-400" : "bg-white/5 text-white/30"}`}>
      {available ? "Available" : "Hidden"}
    </span>
  );
}

export default function DashboardMenu() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-menu"],
    queryFn: () => api.get<{ data: MenuItem[] }>("/api/dashboard/menu").then(r => r.data.data),
  });

  const addMutation = useMutation({
    mutationFn: (body: FormState) => api.post("/api/dashboard/menu", { ...body, price: Number(body.price) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-menu"] }); setShowAdd(false); toast.success("Item added!"); },
    onError: () => toast.error("Failed to add item"),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: FormState }) =>
      api.put(`/api/dashboard/menu/${id}`, { ...body, price: Number(body.price) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-menu"] }); setEditId(null); toast.success("Item updated!"); },
    onError: () => toast.error("Failed to update item"),
  });

  const toggleAvail = useMutation({
    mutationFn: ({ id, val }: { id: number; val: number }) =>
      api.put(`/api/dashboard/menu/${id}`, { is_available: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard-menu"] }),
    onError: () => toast.error("Failed to update availability"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/dashboard/menu/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dashboard-menu"] }); toast.success("Item deleted"); },
    onError: () => toast.error("Failed to delete item"),
  });

  function startEdit(item: MenuItem) {
    setEditId(item.id);
    setEditForm({
      name: item.name, description: item.description,
      price: String(item.price), category: item.category,
      emoji: item.emoji, is_veg: item.is_veg, is_bestseller: item.is_bestseller,
    });
  }

  const grouped = (data ?? []).reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Menu Items</h1>
          <p className="text-white/40 text-sm mt-0.5">{data?.length ?? 0} items across {Object.keys(grouped).length} categories</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditId(null); }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {showAdd && (
        <ItemForm
          initial={EMPTY_FORM}
          loading={addMutation.isPending}
          onSave={form => addMutation.mutate(form)}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">{category}</h2>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id}>
                {editId === item.id ? (
                  <ItemForm
                    initial={editForm}
                    loading={editMutation.isPending}
                    onSave={form => editMutation.mutate({ id: item.id, body: form })}
                    onCancel={() => setEditId(null)}
                  />
                ) : (
                  <div className={`bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-opacity ${!item.is_available ? "opacity-50" : ""}`}>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{item.name}</span>
                        {item.is_veg && <Leaf size={13} className="text-green-400 shrink-0" />}
                        {item.is_bestseller && <Star size={13} className="text-orange-400 fill-orange-400 shrink-0" />}
                        <StatusBadge available={item.is_available} />
                      </div>
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                    </div>
                    <span className="text-orange-400 font-bold text-sm shrink-0">₹{item.price}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleAvail.mutate({ id: item.id, val: item.is_available ? 0 : 1 })}
                        title={item.is_available ? "Hide item" : "Show item"}
                        className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {item.is_available ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${item.name}"?`)) deleteMutation.mutate(item.id); }}
                        className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {!isLoading && !data?.length && (
        <div className="text-center py-16 text-white/30">
          <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No menu items yet</p>
          <p className="text-sm mt-1">Click "Add Item" to get started</p>
        </div>
      )}
    </div>
  );
}

function UtensilsCrossed({ size, className }: { size: number; className?: string }) {
  return <span style={{ fontSize: size }} className={className}>🍽️</span>;
}
