import { useState } from 'react';
import { Plus, Trash2, Pencil, X, Check, QrCode, Upload, Palette } from 'lucide-react';
import { SAUCE_THEMES } from '../utils/mockData';

export interface SauceRow {
    id: string;
    name: string;
    extra_price: number;
    color: string; // key tema, mis. 'orange'
    available: boolean;
}

export interface SizeRow {
    id: string;
    name: string;
    pcs: number;
    base_price: number;
    description: string | null;
    is_active: boolean;
}

interface AdminPanelProps {
    sauces: SauceRow[];
    onSaucesChange: () => void; // dipanggil setelah create/update/delete supaya parent refetch
    sizes: SizeRow[];
    onSizesChange: () => void;
    qrisImageUrl: string | null;
    onQrisChange: (url: string | null) => void;
}

const API = () => window.location.origin;

export default function AdminPanel({ sauces, onSaucesChange, sizes, onSizesChange, qrisImageUrl, onQrisChange }: AdminPanelProps) {
    const [tab, setTab] = useState<'sauces' | 'sizes' | 'qris'>('sauces');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formName, setFormName] = useState('');
    const [formPrice, setFormPrice] = useState('3000');
    const [formColor, setFormColor] = useState('orange');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // form khusus untuk ukuran
    const [sizeFormName, setSizeFormName] = useState('');
    const [sizeFormPcs, setSizeFormPcs] = useState('3');
    const [sizeFormPrice, setSizeFormPrice] = useState('15000');
    const [sizeFormDesc, setSizeFormDesc] = useState('');
    const [showAddSizeForm, setShowAddSizeForm] = useState(false);
    const [editingSizeId, setEditingSizeId] = useState<string | null>(null);

    function resetForm() {
        setFormName('');
        setFormPrice('3000');
        setFormColor('orange');
        setShowAddForm(false);
        setEditingId(null);
        setError(null);
    }

    async function handleCreateSauce() {
        if (!formName.trim()) return;
        try {
            const res = await fetch(`${API()}/api/sauces`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formName, extra_price: Number(formPrice), color: formColor }),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Gagal menambah saus');
            resetForm();
            onSaucesChange();
        } catch (err: any) {
            setError(err.message);
        }
    }

    async function handleUpdateSauce(id: string) {
        try {
            const res = await fetch(`${API()}/api/sauces/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formName, extra_price: Number(formPrice), color: formColor }),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Gagal mengubah saus');
            resetForm();
            onSaucesChange();
        } catch (err: any) {
            setError(err.message);
        }
    }

    async function handleToggleAvailable(sauce: SauceRow) {
        await fetch(`${API()}/api/sauces/${sauce.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ available: !sauce.available }),
        });
        onSaucesChange();
    }

    async function handleDeleteSauce(id: string) {
        if (id === 'original') return;
        if (!confirm('Hapus saus ini? Menu yang sudah pernah pakai saus ini tidak terpengaruh.')) return;
        try {
            const res = await fetch(`${API()}/api/sauces/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error((await res.json()).message || 'Gagal menghapus saus');
            onSaucesChange();
        } catch (err: any) {
            setError(err.message);
        }
    }

    function startEdit(sauce: SauceRow) {
        setEditingId(sauce.id);
        setFormName(sauce.name);
        setFormPrice(String(sauce.extra_price));
        setFormColor(sauce.color);
        setShowAddForm(false);
    }

    function resetSizeForm() {
        setSizeFormName('');
        setSizeFormPcs('3');
        setSizeFormPrice('15000');
        setSizeFormDesc('');
        setShowAddSizeForm(false);
        setEditingSizeId(null);
        setError(null);
    }

    async function handleCreateSize() {
        if (!sizeFormName.trim()) return;
        try {
            const res = await fetch(`${API()}/api/sizes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: sizeFormName, pcs: Number(sizeFormPcs),
                    base_price: Number(sizeFormPrice), description: sizeFormDesc || null,
                }),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Gagal menambah ukuran');
            resetSizeForm();
            onSizesChange();
        } catch (err: any) {
            setError(err.message);
        }
    }

    async function handleUpdateSize(id: string) {
        try {
            const res = await fetch(`${API()}/api/sizes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: sizeFormName, pcs: Number(sizeFormPcs),
                    base_price: Number(sizeFormPrice), description: sizeFormDesc || null,
                }),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Gagal mengubah ukuran');
            resetSizeForm();
            onSizesChange();
        } catch (err: any) {
            setError(err.message);
        }
    }

    async function handleDeleteSize(id: string) {
        if (!confirm('Hapus ukuran ini?')) return;
        try {
            const res = await fetch(`${API()}/api/sizes/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error((await res.json()).message || 'Gagal menghapus ukuran');
            onSizesChange();
        } catch (err: any) {
            setError(err.message);
        }
    }

    function startEditSize(size: SizeRow) {
        setEditingSizeId(size.id);
        setSizeFormName(size.name);
        setSizeFormPcs(String(size.pcs));
        setSizeFormPrice(String(size.base_price));
        setSizeFormDesc(size.description || '');
        setShowAddSizeForm(false);
    }

    async function handleUploadQris(file: File) {
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('qris_image', file);
            const res = await fetch(`${API()}/api/settings/qris-image`, { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Gagal upload gambar QRIS');
            const data = await res.json();
            onQrisChange(data.qrisImageUrl);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }

    async function handleDeleteQris() {
        if (!confirm('Hapus gambar QRIS? Layar customer akan kembali memakai QR simulasi.')) return;
        await fetch(`${API()}/api/settings/qris-image`, { method: 'DELETE' });
        onQrisChange(null);
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setTab('sauces')}
                    className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all ${tab === 'sauces' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    🥫 Saus
                </button>
                <button
                    onClick={() => setTab('sizes')}
                    className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all ${tab === 'sizes' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    📦 Ukuran
                </button>
                <button
                    onClick={() => setTab('qris')}
                    className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-all ${tab === 'qris' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    📷 QRIS
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-xs font-semibold px-4 py-2 border-b border-red-100">{error}</div>
            )}

            {tab === 'sauces' && (
                <div className="p-4 space-y-3">
                    {sauces.map((sauce) => {
                        const theme = SAUCE_THEMES[sauce.color] || SAUCE_THEMES.gray;
                        const isEditing = editingId === sauce.id;

                        if (isEditing) {
                            return (
                                <div key={sauce.id} className="border border-red-200 bg-red-50/50 rounded-xl p-3 space-y-2">
                                    <input value={formName} onChange={(e) => setFormName(e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nama saus" />
                                    <div className="flex gap-2">
                                        <input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} type="number"
                                            className="w-28 border rounded-lg px-3 py-2 text-sm" placeholder="Harga extra" />
                                        <ColorPicker value={formColor} onChange={setFormColor} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdateSauce(sauce.id)} className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                                            <Check className="w-3.5 h-3.5" /> Simpan
                                        </button>
                                        <button onClick={resetForm} className="px-3 py-2 border rounded-lg text-xs font-bold">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={sauce.id} className={`flex items-center justify-between border rounded-xl p-3 ${sauce.available ? 'border-gray-200' : 'border-gray-100 opacity-50'}`}>
                                <div className="flex items-center gap-2.5">
                                    <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: theme.hex }} />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{sauce.name}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {sauce.extra_price > 0 ? `+Rp ${sauce.extra_price.toLocaleString('id-ID')}` : 'Gratis'} · {sauce.available ? 'Tersedia' : 'Stok Habis'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => handleToggleAvailable(sauce)} title="Toggle stok"
                                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100">
                                        <span className="text-[10px] font-bold">{sauce.available ? 'ON' : 'OFF'}</span>
                                    </button>
                                    <button onClick={() => startEdit(sauce)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100">
                                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                                    </button>
                                    {sauce.id !== 'original' && (
                                        <button onClick={() => handleDeleteSauce(sauce.id)} className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50">
                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {showAddForm ? (
                        <div className="border border-red-200 bg-red-50/50 rounded-xl p-3 space-y-2">
                            <input value={formName} onChange={(e) => setFormName(e.target.value)} autoFocus
                                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nama saus baru, mis. Sambal Matah" />
                            <div className="flex gap-2">
                                <input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} type="number"
                                    className="w-28 border rounded-lg px-3 py-2 text-sm" placeholder="Harga extra" />
                                <ColorPicker value={formColor} onChange={setFormColor} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleCreateSauce} className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                                    <Plus className="w-3.5 h-3.5" /> Tambah Saus
                                </button>
                                <button onClick={resetForm} className="px-3 py-2 border rounded-lg text-xs font-bold">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => { setShowAddForm(true); setEditingId(null); }}
                            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-xs font-bold text-gray-500 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                            <Plus className="w-4 h-4" /> Tambah Jenis Saus Baru
                        </button>
                    )}
                </div>
            )}

            {tab === 'sizes' && (
                <div className="p-4 space-y-3">
                    {sizes.map((size) => {
                        const isEditing = editingSizeId === size.id;

                        if (isEditing) {
                            return (
                                <div key={size.id} className="border border-red-200 bg-red-50/50 rounded-xl p-3 space-y-2">
                                    <input value={sizeFormName} onChange={(e) => setSizeFormName(e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nama ukuran, mis. Large" />
                                    <div className="flex gap-2">
                                        <input value={sizeFormPcs} onChange={(e) => setSizeFormPcs(e.target.value)} type="number"
                                            className="w-20 border rounded-lg px-3 py-2 text-sm" placeholder="Pcs" />
                                        <input value={sizeFormPrice} onChange={(e) => setSizeFormPrice(e.target.value)} type="number"
                                            className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Harga" />
                                    </div>
                                    <input value={sizeFormDesc} onChange={(e) => setSizeFormDesc(e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Deskripsi singkat (opsional)" />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdateSize(size.id)} className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                                            <Check className="w-3.5 h-3.5" /> Simpan
                                        </button>
                                        <button onClick={resetSizeForm} className="px-3 py-2 border rounded-lg text-xs font-bold">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={size.id} className={`flex items-center justify-between border rounded-xl p-3 ${size.is_active ? 'border-gray-200' : 'border-gray-100 opacity-50'}`}>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{size.name} <span className="text-gray-400 font-normal">({size.pcs} pcs)</span></p>
                                    <p className="text-[10px] text-gray-400">Rp {size.base_price.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => startEditSize(size)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100">
                                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                                    </button>
                                    <button onClick={() => handleDeleteSize(size.id)} className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50">
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {showAddSizeForm ? (
                        <div className="border border-red-200 bg-red-50/50 rounded-xl p-3 space-y-2">
                            <input value={sizeFormName} onChange={(e) => setSizeFormName(e.target.value)} autoFocus
                                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nama ukuran baru, mis. Large" />
                            <div className="flex gap-2">
                                <input value={sizeFormPcs} onChange={(e) => setSizeFormPcs(e.target.value)} type="number"
                                    className="w-20 border rounded-lg px-3 py-2 text-sm" placeholder="Pcs" />
                                <input value={sizeFormPrice} onChange={(e) => setSizeFormPrice(e.target.value)} type="number"
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Harga" />
                            </div>
                            <input value={sizeFormDesc} onChange={(e) => setSizeFormDesc(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Deskripsi singkat (opsional)" />
                            <div className="flex gap-2">
                                <button onClick={handleCreateSize} className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                                    <Plus className="w-3.5 h-3.5" /> Tambah Ukuran
                                </button>
                                <button onClick={resetSizeForm} className="px-3 py-2 border rounded-lg text-xs font-bold">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => { setShowAddSizeForm(true); setEditingSizeId(null); }}
                            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-xs font-bold text-gray-500 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                            <Plus className="w-4 h-4" /> Tambah Ukuran Baru
                        </button>
                    )}
                </div>
            )}

            {tab === 'qris' && (
                <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-500">
                        Upload gambar QRIS statis milik toko Anda (dari QRIS BCA/OVO/GoPay Merchant/dll). Kalau diisi, layar customer akan menampilkan gambar ini, menggantikan QR simulasi bawaan.
                    </p>

                    {qrisImageUrl ? (
                        <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3">
                            <img src={qrisImageUrl} alt="QRIS Toko" className="w-40 h-40 object-contain border rounded-lg" />
                            <div className="flex gap-2 w-full">
                                <label className="flex-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5">
                                    <Upload className="w-3.5 h-3.5" /> Ganti Gambar
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleUploadQris(e.target.files[0])} />
                                </label>
                                <button onClick={handleDeleteQris} className="px-3 py-2 border border-red-200 text-red-600 rounded-lg">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-red-300">
                            <QrCode className="w-8 h-8 text-gray-300" />
                            <span className="text-xs font-bold text-gray-500">{uploading ? 'Mengunggah...' : 'Klik untuk upload gambar QRIS'}</span>
                            <input type="file" accept="image/*" className="hidden" disabled={uploading}
                                onChange={(e) => e.target.files?.[0] && handleUploadQris(e.target.files[0])} />
                        </label>
                    )}
                </div>
            )}
        </div>
    );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex-1 flex items-center gap-1.5 border rounded-lg px-2 flex-wrap">
            <Palette className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {Object.entries(SAUCE_THEMES).filter(([k]) => k !== 'gray').map(([key, theme]) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onChange(key)}
                    title={key}
                    className={`w-5 h-5 rounded-full border-2 ${value === key ? 'border-gray-900 scale-110' : 'border-white'}`}
                    style={{ backgroundColor: theme.hex }}
                />
            ))}
        </div>
    );
}
