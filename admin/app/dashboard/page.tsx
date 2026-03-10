'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id: string;
  name: string;
  phone: string;
  plan: string;
  status: string;
  startDate: string;
  renewalDate: string;
  fee: string;
  sheetId: string;
  agentNumber: string;
  totalLeads: string;
  totalMessages: string;
  lastActive: string;
  notes: string;
}

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-500/20 text-green-400',
  Expired: 'bg-red-500/20 text-red-400',
  Suspended: 'bg-yellow-500/20 text-yellow-400',
  Trial: 'bg-blue-500/20 text-blue-400',
};

const PLAN_COLORS: Record<string, string> = {
  Starter: 'bg-slate-500/20 text-slate-300',
  Pro: 'bg-purple-500/20 text-purple-400',
  Premium: 'bg-yellow-500/20 text-yellow-400',
};

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const fetchClients = async () => {
    setLoading(true);
    const res = await fetch('/api/clients');
    if (res.status === 401) { router.push('/'); return; }
    const data = await res.json();
    setClients(data.clients || []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.plan.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'Active').length,
    revenue: clients.filter(c => c.status === 'Active').reduce((s, c) => s + parseInt(c.fee || '0'), 0),
    leads: clients.reduce((s, c) => s + parseInt(c.totalLeads || '0'), 0),
  };

  const openAdd = () => {
    setEditClient(null);
    setForm({ status: 'Active', plan: 'Pro', fee: '999' });
    setShowModal(true);
  };

  const openEdit = (client: Client) => {
    setEditClient(client);
    setForm(client);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/clients', {
      method: editClient ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editClient ? { ...form, id: editClient.id } : form),
    });
    setSaving(false);
    setShowModal(false);
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this client?')) return;
    await fetch('/api/clients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchClients();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">🤖 Bot Admin Panel</h1>
          <p className="text-slate-400 text-sm">Manage all your WhatsApp bot clients</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openAdd} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            + Add Client
          </button>
          <button onClick={fetchClients} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition">
            🔄 Refresh
          </button>
          <button onClick={handleLogout} className="bg-slate-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition">
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Clients', value: stats.total, icon: '👥', color: 'text-blue-400' },
          { label: 'Active Bots', value: stats.active, icon: '✅', color: 'text-green-400' },
          { label: 'Monthly Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: '💰', color: 'text-yellow-400' },
          { label: 'Total Leads', value: stats.leads, icon: '🎯', color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-5">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, phone, plan..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-800 text-white rounded-lg px-4 py-2 w-full md:w-80 outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center text-slate-400 py-16">Loading clients...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-16">No clients found. Click + Add Client to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  {['Client', 'Plan', 'Status', 'Fee', 'Renewal', 'Leads', 'Last Active', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-slate-400 text-xs">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[c.plan] || 'bg-slate-600 text-slate-300'}`}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-slate-600 text-slate-300'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-green-400 font-semibold">₹{c.fee}</td>
                    <td className="px-4 py-3 text-slate-300">{c.renewalDate}</td>
                    <td className="px-4 py-3">
                      <span className="text-purple-400 font-semibold">{c.totalLeads || '0'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{c.lastActive || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-blue-500/10 rounded">Edit</button>
                        {c.sheetId && (
                          <a href={`https://docs.google.com/spreadsheets/d/${c.sheetId}`} target="_blank" className="text-green-400 hover:text-green-300 text-xs px-2 py-1 bg-green-500/10 rounded">Sheet</a>
                        )}
                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/10 rounded">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-5">{editClient ? '✏️ Edit Client' : '➕ Add New Client'}</h2>
            <div className="space-y-3">
              {([
                ['name', 'Business Name', 'Sri Homes'],
                ['phone', 'WhatsApp Number', '919876543210'],
                ['plan', 'Plan', 'Starter / Pro / Premium'],
                ['status', 'Status', 'Active / Trial / Suspended / Expired'],
                ['fee', 'Monthly Fee (₹)', '999'],
                ['startDate', 'Start Date', '10-03-2026'],
                ['renewalDate', 'Renewal Date', '10-04-2026'],
                ['sheetId', 'Google Sheet ID', '1BxiMVs0XRA5...'],
                ['agentNumber', 'Agent WhatsApp', '919876543210@c.us'],
                ['totalLeads', 'Total Leads', '0'],
                ['totalMessages', 'Total Messages', '0'],
                ['lastActive', 'Last Active', '10-03-2026'],
                ['notes', 'Notes', 'Any notes...'],
              ] as [keyof Client, string, string][]).map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 mb-1">{label}</label>
                  <input
                    value={(form[key] as string) || ''}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold text-sm transition">
                {saving ? 'Saving...' : editClient ? 'Update Client' : 'Add Client'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
