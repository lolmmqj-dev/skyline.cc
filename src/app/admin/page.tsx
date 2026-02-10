'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Shield, Trash2, CheckCircle, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

type AdminUser = {
    uid: number;
    email: string;
    username: string;
    subscription_status: string;
    subscription_expires: string | null;
    is_banned: boolean;
    ban_reason: string | null;
    created_at: string;
    last_ip: string | null;
    avatar_url: string | null;
};

type GeneratedKey = {
    code: string;
    duration_days: number;
};

const DAY_OPTIONS = [
    { label: '1 day', value: 1 },
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
    { label: 'Lifetime', value: 0 },
    { label: 'Remove', value: -1 },
];

export default function AdminPage() {
    const router = useRouter();
    const [me, setMe] = useState<any>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [keys, setKeys] = useState<GeneratedKey[]>([]);
    const [keyDays, setKeyDays] = useState(30);
    const [keyCount, setKeyCount] = useState(1);
    const [ipBan, setIpBan] = useState('');
    const [ipReason, setIpReason] = useState('');
    const [grantDays, setGrantDays] = useState<Record<number, number>>({});
    const [uidEdits, setUidEdits] = useState<Record<number, string>>({});

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('skyline_user');
        if (!stored) {
            router.replace('/');
            return;
        }
        const parsed = JSON.parse(stored);
        if (!parsed?.uid || parsed.uid !== 1) {
            router.replace('/');
            return;
        }
        setMe(parsed);
        setToken(localStorage.getItem('skyline_session'));
    }, [router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users${query ? `?q=${encodeURIComponent(query)}` : ''}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            setUsers(data.users || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (me) {
            fetchUsers();
        }
    }, [me]);

    const handleSubscription = async (uid: number, days: number) => {
        await fetch('/api/admin/subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ uid, days }),
        });
        fetchUsers();
    };

    const handleBanUser = async (uid: number) => {
        await fetch('/api/admin/users/ban', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ uid }),
        });
        fetchUsers();
    };

    const handleUnbanUser = async (uid: number) => {
        await fetch('/api/admin/users/unban', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ uid }),
        });
        fetchUsers();
    };

    const handleDeleteUser = async (uid: number) => {
        await fetch('/api/admin/users/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ uid }),
        });
        fetchUsers();
    };

    const handleChangeUid = async (oldUid: number) => {
        const raw = uidEdits[oldUid];
        const newUid = Number(raw);
        if (!raw || Number.isNaN(newUid) || newUid <= 0 || newUid === oldUid) {
            return;
        }
        const res = await fetch('/api/admin/users/uid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ oldUid, newUid }),
        });
        const data = await res.json();
        if (data.success) {
            setUidEdits((prev) => ({ ...prev, [oldUid]: '' }));
            fetchUsers();
        }
    };

    const handleGenerateKeys = async () => {
        const res = await fetch('/api/admin/keys/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ durationDays: keyDays, count: keyCount }),
        });
        const data = await res.json();
        setKeys(data.keys || []);
    };

    const handleBanIp = async () => {
        if (!ipBan) return;
        await fetch('/api/admin/ip-bans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ ip: ipBan, reason: ipReason }),
        });
        setIpBan('');
        setIpReason('');
    };

    if (!me) {
        return null;
    }

    return (
        <div className="min-h-screen pt-24 px-4 pb-10">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                    <button onClick={fetchUsers} className="btn-ghost text-sm">
                        Refresh
                    </button>
                </div>

                <div className="card-custom p-6">
                    <div className="flex items-center gap-3">
                        <Search size={18} className="text-gray-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="form-input flex-1"
                            placeholder="Search by UID, email or username"
                        />
                        <button onClick={fetchUsers} className="btn-primary">
                            Search
                        </button>
                    </div>
                </div>

                <div className="card-custom p-6">
                    <h2 className="text-xl font-bold mb-4">Users</h2>
                    {loading ? (
                        <div className="text-gray-400">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-gray-400">
                                    <tr>
                                        <th className="text-left py-2">UID</th>
                                        <th className="text-left py-2">User</th>
                                        <th className="text-left py-2">Status</th>
                                        <th className="text-left py-2">Expires</th>
                                        <th className="text-left py-2">IP</th>
                                        <th className="text-left py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => {
                                        const selectedDays = grantDays[u.uid] ?? 30;
                                        return (
                                            <tr key={u.uid} className="border-t border-white/5">
                                            <td className="py-2">{u.uid}</td>
                                            <td className="py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                                                        {u.avatar_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs text-gray-500">no</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-semibold">{u.username}</div>
                                                        <div className="text-gray-400">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2">
                                                {u.is_banned ? (
                                                    <span className="text-red-400">Banned</span>
                                                ) : (
                                                    <span className="text-green-400">{u.subscription_status}</span>
                                                )}
                                            </td>
                                            <td className="py-2">
                                                {u.subscription_expires
                                                    ? new Date(u.subscription_expires).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="py-2 text-gray-400">{u.last_ip || '-'}</td>
                                            <td className="py-2">
                                                <div className="flex flex-wrap gap-2">
                                                    <select
                                                        className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs"
                                                        value={selectedDays}
                                                        onChange={(e) =>
                                                            setGrantDays((prev) => ({
                                                                ...prev,
                                                                [u.uid]: Number(e.target.value),
                                                            }))
                                                        }
                                                    >
                                                        {DAY_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="btn-ghost text-xs"
                                                        onClick={() => handleSubscription(u.uid, selectedDays)}
                                                    >
                                                        <CheckCircle size={14} /> Grant
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={uidEdits[u.uid] ?? ''}
                                                            onChange={(e) =>
                                                                setUidEdits((prev) => ({
                                                                    ...prev,
                                                                    [u.uid]: e.target.value,
                                                                }))
                                                            }
                                                            className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs w-24"
                                                            placeholder="New UID"
                                                        />
                                                        <button
                                                            className="btn-ghost text-xs"
                                                            onClick={() => handleChangeUid(u.uid)}
                                                        >
                                                            Set UID
                                                        </button>
                                                    </div>
                                                    {u.is_banned ? (
                                                        <button className="btn-ghost text-xs" onClick={() => handleUnbanUser(u.uid)}>
                                                            <Shield size={14} /> Unban
                                                        </button>
                                                    ) : (
                                                        <button className="btn-ghost text-xs" onClick={() => handleBanUser(u.uid)}>
                                                            <Ban size={14} /> Ban
                                                        </button>
                                                    )}
                                                    <button className="btn-ghost text-xs" onClick={() => handleDeleteUser(u.uid)}>
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="card-custom p-6">
                        <h2 className="text-xl font-bold mb-4">IP Ban</h2>
                        <input
                            value={ipBan}
                            onChange={(e) => setIpBan(e.target.value)}
                            className="form-input mb-3"
                            placeholder="IP address"
                        />
                        <input
                            value={ipReason}
                            onChange={(e) => setIpReason(e.target.value)}
                            className="form-input mb-3"
                            placeholder="Reason (optional)"
                        />
                        <button onClick={handleBanIp} className="btn-primary w-full">
                            Ban IP
                        </button>
                    </motion.div>

                    <motion.div className="card-custom p-6">
                        <h2 className="text-xl font-bold mb-4">Key Generator</h2>
                        <div className="flex gap-3 mb-3">
                            <select
                                className="bg-black/30 border border-white/10 rounded px-3 py-2 text-sm flex-1"
                                value={keyDays}
                                onChange={(e) => setKeyDays(Number(e.target.value))}
                            >
                                {DAY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={keyCount}
                                onChange={(e) => setKeyCount(Number(e.target.value))}
                                className="form-input w-24"
                            />
                        </div>
                        <button onClick={handleGenerateKeys} className="btn-primary w-full">
                            Generate
                        </button>
                        {keys.length > 0 && (
                            <div className="mt-4 space-y-2 text-sm">
                                {keys.map((k) => (
                                    <div key={k.code} className="font-mono text-cyan-300">
                                        {k.code}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
