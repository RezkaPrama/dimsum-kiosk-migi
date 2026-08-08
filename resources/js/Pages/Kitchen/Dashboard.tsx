import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import MerchantDashboard from '../../Components/MerchantDashboard';
import ThermalPrinter from '../../Components/ThermalPrinter';
import AdminPanel, { SauceRow, SizeRow } from '../../Components/AdminPanel';
import KioskBackground from '../../Components/KioskBackground';
import { Order, MerchantSettings, SauceType } from '../../types';
import { playNewOrderChime } from '../../utils/audio';
import { setSauceInfo, setSizeInfo } from '../../utils/mockData';

/**
 * Sama seperti Kiosk/Index.tsx — halaman ini hanya merender komponen ASLI
 * `MerchantDashboard.tsx` dan `ThermalPrinter.tsx` (termasuk Web Bluetooth
 * printing yang sudah built-in di dalamnya), disambungkan ke Laravel API.
 * `AdminPanel` adalah tambahan baru (bukan bagian mockup asli) untuk kelola
 * saus dinamis & gambar QRIS toko.
 */
export default function KitchenDashboard() {
    const [settings, setSettings] = useState<MerchantSettings>({
        shopName: 'Dimsum Kiosk & Co',
        shopAddress: 'Ruko Culinary Square No. 12, Jakarta',
        whatsappNumber: '6281234567890',
        taxRate: 0.1,
        serviceFee: 2000,
        currencySymbol: 'Rp',
        autoPrintReceipt: false,
        soundAlertEnabled: true,
        merchantPin: '1234',
        laravelApiEnabled: true,
        laravelApiUrl: '',
        laravelApiToken: '',
        whatsappMode: 'laravel',
        whatsappGatewayUrl: '',
        whatsappGatewayToken: '',
        qrisImageUrl: null,
    });

    const [orders, setOrders] = useState<Order[]>([]);
    const [sauces, setSauces] = useState<SauceRow[]>([]);
    const [sizes, setSizes] = useState<SizeRow[]>([]);
    const [availableSauces, setAvailableSauces] = useState<Record<SauceType, boolean>>({});
    const [activePrintedOrder, setActivePrintedOrder] = useState<Order | null>(null);

    useEffect(() => {
        setSettings((prev) => ({ ...prev, laravelApiUrl: window.location.origin }));
    }, []);

    const fetchSizes = async () => {
        try {
            const res = await fetch(`${window.location.origin}/api/sizes`);
            if (res.ok) {
                const data: SizeRow[] = await res.json();
                setSizes(data);
                setSizeInfo(data);
            }
        } catch (err) {
            console.warn('Gagal ambil daftar ukuran', err);
        }
    };

    const fetchSauces = async () => {
        try {
            const res = await fetch(`${window.location.origin}/api/sauces`);
            if (res.ok) {
                const data: SauceRow[] = await res.json();
                setSauces(data);
                setSauceInfo(data);
                const avail: Record<SauceType, boolean> = {};
                data.forEach((s) => { avail[s.id] = s.available; });
                setAvailableSauces(avail);
            }
        } catch (err) {
            console.warn('Gagal ambil daftar saus', err);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${window.location.origin}/api/settings`);
            if (res.ok) {
                const s = await res.json();
                setSettings((prev) => ({ ...prev, qrisImageUrl: s.qrisImageUrl }));
            }
        } catch (err) {
            console.warn('Gagal ambil pengaturan toko', err);
        }
    };

    useEffect(() => {
        fetchSauces();
        fetchSizes();
        fetchSettings();
    }, []);

    useEffect(() => {
        if (!settings.laravelApiUrl) return;

        const fetchOrders = async () => {
            try {
                const res = await fetch(`${settings.laravelApiUrl}/api/orders`);
                if (res.ok) setOrders(await res.json());
            } catch (err) {
                console.warn('Gagal sinkron ke Laravel API', err);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [settings.laravelApiUrl]);

    const handleUpdateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o)));
        if (status === 'ready' && settings.soundAlertEnabled) playNewOrderChime();

        try {
            await fetch(`${settings.laravelApiUrl}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderStatus: status }),
            });
        } catch (err) {
            console.error('Gagal update status ke Laravel API', err);
        }
    };

    const handleUpdatePaymentStatus = async (orderId: string, status: Order['paymentStatus']) => {
        setOrders((prev) => prev.map((o) => (o.id === orderId
            ? { ...o, paymentStatus: status, orderStatus: status === 'paid' ? 'received' : o.orderStatus }
            : o)));

        try {
            await fetch(`${settings.laravelApiUrl}/api/orders/${orderId}/payment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: status }),
            });
        } catch (err) {
            console.error('Gagal update pembayaran ke Laravel API', err);
        }
    };

    return (
        <KioskBackground>
            <div className="p-4 md:p-6">
            <Head title="Dashboard Dapur" />
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-5 space-y-6 md:sticky md:top-6">
                    <ThermalPrinter
                        activeOrder={activePrintedOrder}
                        settings={settings}
                        onClear={() => setActivePrintedOrder(null)}
                    />
                    <AdminPanel
                        sauces={sauces}
                        onSaucesChange={fetchSauces}
                        sizes={sizes}
                        onSizesChange={fetchSizes}
                        qrisImageUrl={settings.qrisImageUrl ?? null}
                        onQrisChange={(url) => setSettings((prev) => ({ ...prev, qrisImageUrl: url }))}
                    />
                </div>
                <div className="md:col-span-7">
                    <MerchantDashboard
                        orders={orders}
                        settings={settings}
                        onUpdateSettings={setSettings}
                        onUpdateOrderStatus={handleUpdateOrderStatus}
                        onUpdatePaymentStatus={handleUpdatePaymentStatus}
                        onTriggerPrint={(order) => setActivePrintedOrder(order)}
                        availableSauces={availableSauces}
                        onToggleSauce={() => { /* dikelola lewat AdminPanel sekarang */ }}
                    />
                </div>
            </div>
            </div>
        </KioskBackground>
    );
}
