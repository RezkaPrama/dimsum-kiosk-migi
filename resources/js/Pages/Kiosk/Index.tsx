import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import CustomerKiosk from '../../Components/CustomerKiosk';
import KioskBackground from '../../Components/KioskBackground';
import { Order, MerchantSettings, SauceType } from '../../types';
import { playNewOrderChime } from '../../utils/audio';
import { setSauceInfo, setSizeInfo } from '../../utils/mockData';

/**
 * Halaman ini TIDAK menulis ulang tampilan kiosk — ia hanya merender komponen
 * asli `CustomerKiosk.tsx` (persis dari mockup AI Studio) dan menyambungkannya
 * ke Laravel API sungguhan lewat `settings.laravelApiEnabled = true`.
 * CustomerKiosk.tsx sendiri tidak diubah sama sekali.
 */
export default function KioskIndex() {
    const [settings, setSettings] = useState<MerchantSettings>({
        shopName: 'Dimsum Kiosk & Co',
        shopAddress: 'Ruko Culinary Square No. 12, Jakarta',
        whatsappNumber: '6281234567890',
        taxRate: 0.1,
        serviceFee: 2000,
        currencySymbol: 'Rp',
        autoPrintReceipt: true,
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
    const [cookingStatuses, setCookingStatuses] = useState<Record<string, Order['orderStatus']>>({});
    const [availableSauces, setAvailableSauces] = useState<Record<SauceType, boolean>>({});

    // Set laravelApiUrl ke origin saat ini (baru bisa diakses di client/browser)
    useEffect(() => {
        setSettings((prev) => ({ ...prev, laravelApiUrl: window.location.origin }));
    }, []);

    // Ambil daftar saus dinamis + pengaturan toko (termasuk gambar QRIS) sekali di awal,
    // lalu polling ringan tiap 15 detik supaya perubahan dari dashboard dapur ikut update.
    useEffect(() => {
        if (!settings.laravelApiUrl) return;

        const syncMeta = async () => {
            try {
                const [saucesRes, sizesRes, settingsRes] = await Promise.all([
                    fetch(`${settings.laravelApiUrl}/api/sauces`),
                    fetch(`${settings.laravelApiUrl}/api/sizes`),
                    fetch(`${settings.laravelApiUrl}/api/settings`),
                ]);

                if (saucesRes.ok) {
                    const sauces = await saucesRes.json();
                    setSauceInfo(sauces);
                    const avail: Record<SauceType, boolean> = {};
                    sauces.forEach((s: any) => { avail[s.id] = s.available; });
                    setAvailableSauces(avail);
                }

                if (sizesRes.ok) {
                    setSizeInfo(await sizesRes.json());
                }

                if (settingsRes.ok) {
                    const s = await settingsRes.json();
                    setSettings((prev) => ({ ...prev, qrisImageUrl: s.qrisImageUrl, shopName: s.shopName || prev.shopName }));
                }
            } catch (err) {
                console.warn('Gagal sinkron data toko', err);
            }
        };

        syncMeta();
        const interval = setInterval(syncMeta, 15000);
        return () => clearInterval(interval);
    }, [settings.laravelApiUrl]);

    // Polling status pesanan supaya tracker di layar sukses ter-update realtime
    useEffect(() => {
        if (!settings.laravelApiUrl) return;

        const fetchOrders = async () => {
            try {
                const res = await fetch(`${settings.laravelApiUrl}/api/orders`);
                if (res.ok) {
                    const data: Order[] = await res.json();
                    setOrders(data);
                    const statuses: Record<string, Order['orderStatus']> = {};
                    data.forEach((o) => { statuses[o.id] = o.orderStatus; });
                    setCookingStatuses(statuses);
                }
            } catch (err) {
                console.warn('Gagal sinkron ke Laravel API', err);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [settings.laravelApiUrl]);

    const handleSubmitOrder = async (newOrder: Order) => {
        if (settings.soundAlertEnabled) playNewOrderChime();

        try {
            await fetch(`${settings.laravelApiUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(newOrder),
            });
        } catch (err) {
            console.error('Gagal mengirim order ke Laravel API', err);
        }

        setOrders((prev) => [newOrder, ...prev]);
        setCookingStatuses((prev) => ({ ...prev, [newOrder.id]: newOrder.orderStatus }));
    };

    return (
        <KioskBackground>
            <Head title="Pesan Dimsum" />
            <CustomerKiosk
                settings={settings}
                onSubmitOrder={handleSubmitOrder}
                orders={orders}
                activeCookingStatuses={cookingStatuses}
                availableSauces={availableSauces}
            />
        </KioskBackground>
    );
}
