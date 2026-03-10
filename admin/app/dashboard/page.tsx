'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id: string;
  name: string;
  phone: string;
  plan: string;
  status: string;
  fee: string;
  startDate: string;
  renewalDate: string;
  sheetId: string;
  agentNumber: string;
  notes: string;
}

const PLANS = ['All', 'Starter', 'Pro', 'Premium'];
const STATUSES = ['All', 'Active', 'Trial', 'Suspended', 'Expired'];

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-500/20 text-green-400 border border-green-500/30',
  Expired: 'bg-red-500/20 text-red-400 border border-red-500/30',
  Suspended: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  Trial: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

const PLAN_COLORS: Record<string, string> = {
  Starter: 'bg-slate-500/20 text-slate-300',
  Pro: 'bg-purple-500/20 text-purple-400',
  Premium: 'bg-yellow-500/20 text-yellow-400',
};

const EMPTY_FORM: Partial<Client> = {
  name: '', phone: '', plan: 'Pro', status: 'Active',
  fee: '999', startDate: '', renewalDate: '',
  sheetId: '', agentNumber: '', notes: ''
};

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'expiring'>('all');
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

  // Expiring within 7 days
  const isExpiringSoon = (dateStr: string) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const renewal = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const diff = (renewal.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  };

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchPlan = filterPlan === 'All' || c.plan === filterPlan;
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchTab = activeTab === 'all' || isExpiringSoon(c.renewalDate);

    let matchDate = true;
    if (filterFrom || filterTo) {
      const parts = c.startDate.split('-');
      if (parts.length === 3) {
        const start = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (filterFrom && start < new Date(filterFrom)) matchDate = false;
        if (filterTo && start > new Date(filterTo)) matchDate = false;
      }
    }
    return matchSearch && matchPlan && matchStatus && matchDate && matchTab;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'Active').length,
    trial: clients.filter(c => c.status === 'Trial').length,
    expiring: clients.filter(c => isExpiringSoon(c.renewalDate)).length,
    revenue: clients
      .filter(c => c.status === 'Active' || c.status === 'Trial')
      .reduce((s, c) => s + parseInt(c.fee || '0'), 0),
  };

  const openAdd = () => {
    setEditClient(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (c: Client) => {
    setEditClient(c);
    setForm({ ...c });
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
    if (!confirm('Remove this client permanently?')) return;
    await fetch('/api/clients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchClients();
  };

  const clearFilters = () => {
    setSearch('');
    setFilterPlan('All');
    setFilterStatus('All');
    setFilterFrom('');
    setFilterTo('');
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🤖 Bot Admin Panel</h1>
          <p className="text-slate-400 text-sm">WhatsApp Bot SaaS — Client Manager</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openAdd} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">+ Add Client</button>
          <button onClick={fetchClients} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition">🔄</button>
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }}
            className="bg-slate-700 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition">Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Clients', value: stats.total, icon: '👥', color: 'text-blue-400' },
          { label: 'Active', value: stats.active, icon: '✅', color: 'text-green-400' },
          { label: 'Trial', value: stats.trial, icon: '⏳', color: 'text-blue-400' },
          { label: 'Expiring Soon', value: stats.expiring, icon: '⚠️', color: 'text-yellow-400' },
          { label: 'Monthly Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: '💰', color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-4">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'expiring'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}>
            {tab === 'all' ? '📋 All Clients' : `⚠️ Expiring Soon (${stats.expiring})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">

          {/* Search */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-slate-400 mb-1">Search</label>
            <input
              type="text"
              placeholder="Name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Plan dropdown */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Plan</label>
            <select
              value={filterPlan}
              onChange={e => setFilterPlan(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            >
              {PLANS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {/* Status dropdown */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Start From</label>
            <input
              type="date"
              value={filterFrom}
              onChange={e => setFilterFrom(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Start To</label>
            <input
              type="date"
              value={filterTo}
              onChange={e => setFilterTo(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            />
          </div>

          {/* Clear */}
          <button onClick={clearFilters}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm transition">
            × Clear
          </button>
        </div>

        {/* Active filter chips */}
        {(filterPlan !== 'All' || filterStatus !== 'All' || filterFrom || filterTo || search) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {search && <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">Search: {search}</span>}
            {filterPlan !== 'All' && <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">Plan: {filterPlan}</span>}
            {filterStatus !== 'All' && <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Status: {filterStatus}</span>}
            {filterFrom && <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">From: {filterFrom}</span>}
            {filterTo && <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">To: {filterTo}</span>}
            <span className="text-slate-500 text-xs py-1">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center text-slate-400 py-16">
            <div className="text-4xl mb-3 animate-pulse">🔄</div>
            Loading clients...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-16">
            <div className="text-4xl mb-3">👥</div>
            No clients found. <button onClick={openAdd} className="text-green-400 underline">Add your first client</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700 bg-slate-800/80">
                  {['Client', 'Plan', 'Status', 'Monthly Fee', 'Start Date', 'Renewal Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition ${
                    isExpiringSoon(c.renewalDate) ? 'bg-yellow-500/5' : ''
                  }`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {c.name}
                        {isExpiringSoon(c.renewalDate) && <span className="text-yellow-400 text-xs">⚠️</span>}
                      </div>
                      <div className="text-slate-400 text-xs">{c.phone}</div>
                      {c.notes && <div className="text-slate-500 text-xs mt-0.5 italic">{c.notes}</div>}
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
                    <td className="px-4 py-3 text-green-400 font-bold">₹{c.fee}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{c.startDate}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${
                        isExpiringSoon(c.renewalDate) ? 'text-yellow-400' : 'text-slate-300'
                      }`}>{c.renewalDate}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(c)}
                          className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded transition">
                          ✏️ Edit
                        </button>
                        {c.sheetId && (
                          <a href={`https://docs.google.com/spreadsheets/d/${c.sheetId}`} target="_blank"
                            className="text-green-400 hover:text-green-300 text-xs px-2 py-1 bg-green-500/10 hover:bg-green-500/20 rounded transition">
                            📄 Sheet
                          </a>
                        )}
                        <button onClick={() => handleDelete(c.id)}
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/10 hover:bg-red-500/20 rounded transition">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-slate-600 text-xs mt-6">
        {filtered.length} of {clients.length} clients • Revenue from active+trial: ₹{stats.revenue.toLocaleString()}/mo
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5">
              {editClient ? '✏️ Edit Client' : '➕ Add New Client'}
            </h2>
            <div className="space-y-3">

              {/* Name */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Business Name *</label>
                <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Sri Homes"
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">WhatsApp Number</label>
                <input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="919876543210"
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* Plan dropdown */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Plan</label>
                <select value={form.plan || 'Pro'} onChange={e => setForm({...form, plan: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
                  <option>Starter</option>
                  <option>Pro</option>
                  <option>Premium</option>
                </select>
              </div>

              {/* Status dropdown */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Status</label>
                <select value={form.status || 'Active'} onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
                  <option>Active</option>
                  <option>Trial</option>
                  <option>Suspended</option>
                  <option>Expired</option>
                </select>
              </div>

              {/* Fee */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Monthly Fee (₹)</label>
                <input value={form.fee || ''} onChange={e => setForm({...form, fee: e.target.value})}
                  placeholder="999"
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* Start Date — calendar picker */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                <input type="date" value={
                    form.startDate
                      ? form.startDate.split('-').length === 3 && form.startDate.split('-')[2].length === 4
                        ? `${form.startDate.split('-')[2]}-${form.startDate.split('-')[1]}-${form.startDate.split('-')[0]}`
                        : form.startDate
                      : ''
                  }
                  onChange={e => {
                    const [y, m, d] = e.target.value.split('-');
                    setForm({...form, startDate: `${d}-${m}-${y}`});
                  }}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 cursor-pointer" />
              </div>

              {/* Renewal Date — calendar picker */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Renewal Date</label>
                <input type="date" value={
                    form.renewalDate
                      ? form.renewalDate.split('-').length === 3 && form.renewalDate.split('-')[2].length === 4
                        ? `${form.renewalDate.split('-')[2]}-${form.renewalDate.split('-')[1]}-${form.renewalDate.split('-')[0]}`
                        : form.renewalDate
                      : ''
                  }
                  onChange={e => {
                    const [y, m, d] = e.target.value.split('-');
                    setForm({...form, renewalDate: `${d}-${m}-${y}`});
                  }}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 cursor-pointer" />
              </div>

              {/* Sheet ID */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Google Sheet ID</label>
                <input value={form.sheetId || ''} onChange={e => setForm({...form, sheetId: e.target.value})}
                  placeholder="1BxiMVs0XRA5nFMdKvZ..."
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* Agent Number */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Agent WhatsApp Number</label>
                <input value={form.agentNumber || ''} onChange={e => setForm({...form, agentNumber: e.target.value})}
                  placeholder="919876543210@c.us"
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes</label>
                <textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Any notes about this client..."
                  rows={2}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition">
                {saving ? 'Saving...' : editClient ? '✅ Update Client' : '➕ Add Client'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
