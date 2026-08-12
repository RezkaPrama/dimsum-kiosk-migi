/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, MerchantSettings, CartItem, SauceType } from '../types';

export const DEFAULT_SETTINGS: MerchantSettings = {
  shopName: 'Dimsum Kiosk & Co',
  shopAddress: 'Ruko Culinary Square No. 12, Jakarta',
  whatsappNumber: '6281234567890', // Default mock number, user can change this in settings
  taxRate: 0.1, // 10% tax
  serviceFee: 2000, // Rp 2.000 flat service fee
  currencySymbol: 'Rp',
  autoPrintReceipt: true,
  soundAlertEnabled: true,
  merchantPin: '1234',
  
  // Laravel API Integration
  laravelApiEnabled: false,
  laravelApiUrl: 'http://localhost:8000',
  laravelApiToken: '',

  // WhatsApp Gateway Integration
  whatsappMode: 'direct',
  whatsappGatewayUrl: 'https://api.fonnte.com/send',
  whatsappGatewayToken: ''
};

export const SAUCE_INFO: Record<string, {
  id: SauceType;
  name: string;
  price: number;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  original: {
    id: 'original' as SauceType,
    name: 'Saus Original (Tanpa Saus)',
    price: 0,
    color: '#6b7280',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200'
  },
  mentai: {
    id: 'mentai' as SauceType,
    name: 'Saus Mentai Creamy',
    price: 3000,
    color: '#ff6b35',
    bgColor: 'bg-[#ff6b35]/15',
    textColor: 'text-[#e85a1a]',
    borderColor: 'border-[#ff6b35]/30'
  },
  cheese: {
    id: 'cheese' as SauceType,
    name: 'Saus Keju Melted',
    price: 3000,
    color: '#ffb703',
    bgColor: 'bg-[#ffb703]/15',
    textColor: 'text-[#d49600]',
    borderColor: 'border-[#ffb703]/30'
  },
  tartar: {
    id: 'tartar' as SauceType,
    name: 'Saus Tartar Tangy',
    price: 3000,
    color: '#028090',
    bgColor: 'bg-[#028090]/15',
    textColor: 'text-[#028090]',
    borderColor: 'border-[#028090]/30'
  }
};

const STOCK_IMAGES = [
  '/images/dimsum_cheese_1782869557226.jpg',
  '/images/dimsum_mentai_1782869546221.jpg',
  '/images/dimsum_tartar_1782869569048.jpg',
];

export const SIZE_INFO: Record<string, {
  id: string;
  name: string;
  pcs: number;
  basePrice: number;
  description: string;
  image: string;
  badge?: string;
}> = {
  small: {
    id: 'small', name: 'Small', pcs: 3, basePrice: 15000,
    description: 'Porsi hemat isi 3 pcs dimsum gembul yang bisa Anda pasangkan saus kesukaan sesuka hati.',
    image: STOCK_IMAGES[0], badge: 'HOT SELLER',
  },
  medium: {
    id: 'medium', name: 'Medium', pcs: 6, basePrice: 28000,
    description: 'Porsi puas isi 6 pcs dimsum montok. Bebas mix & match 3 jenis saus rahasia terfavorit kami.',
    image: STOCK_IMAGES[1], badge: 'BEST VALUE',
  },
};

/**
 * Isi ulang SIZE_INFO dari backend (dipanggil setelah fetch /api/sizes).
 * Sama seperti setSauceInfo() — dimutasi di tempat supaya semua komponen yang
 * sudah `import { SIZE_INFO }` otomatis melihat data terbaru lewat live binding modul ES.
 */
export function setSizeInfo(list: { id: string; name: string; pcs: number; base_price: number; description: string | null }[]) {
  Object.keys(SIZE_INFO).forEach((k) => delete (SIZE_INFO as any)[k]);

  list.forEach((s, idx) => {
    (SIZE_INFO as any)[s.id] = {
      id: s.id,
      name: s.name,
      pcs: s.pcs,
      basePrice: s.base_price,
      description: s.description || `Porsi isi ${s.pcs} pcs dimsum lezat.`,
      image: STOCK_IMAGES[idx % STOCK_IMAGES.length],
      badge: idx === 0 ? 'POPULER' : undefined,
    };
  });
}

//  (semua class ditulis literal di sini
//  * supaya ter-scan Tailwind saat build — class yang dibangun dinamis dari
//  * string sembarang TIDAK akan muncul di CSS hasil build).
//  */
export const SAUCE_THEMES: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  gray: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', hex: '#6b7280' },
  red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', hex: '#dc2626' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', hex: '#ea580c' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', hex: '#d97706' },
  lime: { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-300', hex: '#65a30d' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', hex: '#0d9488' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', hex: '#2563eb' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', hex: '#9333ea' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', hex: '#db2777' },
};

/**
 * Isi ulang SAUCE_INFO dari data backend (dipanggil setelah fetch /api/sauces).
 * SAUCE_INFO dimutasi di tempat (bukan direassign) supaya semua komponen yang
 * sudah `import { SAUCE_INFO }` otomatis melihat data terbaru lewat live binding
 * modul ES — tanpa perlu mengubah CustomerKiosk.tsx / MerchantDashboard.tsx dll.
 */
export function setSauceInfo(list: { id: string; name: string; extra_price: number; color: string }[]) {
  Object.keys(SAUCE_INFO).forEach((k) => delete (SAUCE_INFO as any)[k]);

  for (const s of list) {
    const theme = SAUCE_THEMES[s.color] || SAUCE_THEMES.gray;
    // name disimpan sebagai "Saus {Nama}" supaya kompatibel dengan komponen
    // yang mengambil kata kedua lewat `.split(' ')[1]` sebagai label singkat.
    (SAUCE_INFO as any)[s.id] = {
      id: s.id,
      name: `Saus ${s.name}`,
      price: s.extra_price,
      color: theme.hex,
      bgColor: theme.bg,
      textColor: theme.text,
      borderColor: theme.border,
    };
  }
}

/**
 * Format currency to Indonesian Rupiah style (e.g. Rp 15.000)
 */
export function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

/**
 * Generate a simulated QRIS QR Code content string
 * This mimics standard EMVCo QRIS format payload for display
 */
export function generateQRISPayload(orderId: string, amount: number): string {
  const paddedAmount = amount.toString().padStart(12, '0');
  return `00020101021226540014ID.CO.QRIS.WWW011893600002011122334402151234567890123455204581153033605412${paddedAmount}5802ID5912DIMSUM_KIOSK6007JAKARTA62190111${orderId}6304`;
}

/**
 * Format the order details into an elegant WhatsApp message
 */
export function formatWhatsAppMessage(order: Order, settings: MerchantSettings, isForMerchant: boolean = true): string {
  const itemsText = order.items.map((item, index) => {
    // Group piece sauces to make it readable
    const sauceCounts = item.pieceSauces.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sauceDetails = Object.entries(sauceCounts)
      .map(([sauce, count]) => `${count}x ${SAUCE_INFO[sauce as SauceType].name.split(' ')[1]}`)
      .join(', ');

    let details = `• *Dimsum ${SIZE_INFO[item.size]?.name ?? item.size} (${item.pcs} pcs)* x${item.quantity}\n`;
    details += `  _Sauce Custom: ${sauceDetails}_\n`;
    
    if (item.extraSauces.length > 0) {
      const extraList = item.extraSauces.map(es => `+ Extra ${SAUCE_INFO[es.sauce].name.split(' ')[1]} (x${es.quantity})`).join(', ');
      details += `  _Ekstra Saus: ${extraList}_\n`;
    }
    
    if (item.notes) {
      details += `  _Catatan: "${item.notes}"_\n`;
    }
    
    details += `  _Harga: ${formatCurrency(item.totalPrice)}_\n`;
    return details;
  }).join('\n');

  const dateTime = new Date(order.createdAt).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const paymentStatusBadge = order.paymentStatus === 'paid' ? '✅ *LUNAS*' : '⚠️ *BELUM BAYAR*';
  const orderTypeStr = order.isTakeaway ? '🥡 *Take Away*' : `🍽️ *Dine In* (Meja ${order.tableNumber || '-'})`;

  let message = '';
  
  if (isForMerchant) {
    message = `🔥 *PESANAN BARU - ${settings.shopName.toUpperCase()}* 🔥\n\n`;
    message += `*Detail Pelanggan:*\n`;
    message += `👤 Nama: ${order.customerName}\n`;
    message += `📞 WhatsApp: ${order.customerPhone}\n`;
    message += `📅 Waktu: ${dateTime}\n`;
    message += `📍 Tipe: ${orderTypeStr}\n`;
    message += `🔢 No. Antrean: *#${order.orderNumber}* (${order.id})\n\n`;
    message += `*Detail Pesanan:*\n${itemsText}\n`;
    message += `💰 *Rincian Pembayaran:*\n`;
    message += `  Subtotal: ${formatCurrency(order.subtotal)}\n`;
    message += `  Biaya Layanan: ${formatCurrency(settings.serviceFee)}\n`;
    message += `  *Total Bayar: ${formatCurrency(order.totalAmount)}*\n\n`;
    message += `💳 Metode: *${order.paymentMethod.toUpperCase()}*\n`;
    message += `Status Pembayaran: ${paymentStatusBadge}\n\n`;
    message += `Mohon segera diproses di dapur! Terimakasih. 🙏`;
  } else {
    // For customer
    message = `🔔 *STATUS PESANAN - ${settings.shopName.toUpperCase()}* 🔔\n\n`;
    message += `Halo Kak *${order.customerName}*,\n`;
    
    if (order.orderStatus === 'cooking') {
      message += `Pesanan Kakak sedang kami siapkan di dapur dengan cinta! 🧑‍🍳🔥\n\n`;
    } else if (order.orderStatus === 'ready') {
      message += `Hore! Pesanan Kakak sudah *SIAP DIAMBIL/DISAJIKAN*! 🥟✨\n\n`;
    } else if (order.orderStatus === 'completed') {
      message += `Terima kasih banyak sudah memesan di ${settings.shopName}! Selamat menikmati dimsum lezat kami! ❤️🥟\n\n`;
    }

    message += `*Detail Antrean:* *#${order.orderNumber}* (${order.id})\n`;
    message += `📍 Layanan: ${orderTypeStr}\n`;
    message += `💰 Total: *${formatCurrency(order.totalAmount)}* (${order.paymentMethod.toUpperCase()} - ${order.paymentStatus === 'paid' ? 'LUNAS' : 'BAYAR DI KASIR'})\n\n`;
    message += `Silakan tunjukkan pesan ini ke kasir/waiter kami jika diperlukan. Have a delicious day! 😋`;
  }

  return message;
}

/**
 * Returns a wa.me URL for the order message
 */
export function getWhatsAppURL(phone: string, text: string): string {
  // Clean phone number (remove +, spaces, leading 0 to 62)
  let cleanedPhone = phone.replace(/[^0-9]/g, '');
  if (cleanedPhone.startsWith('0')) {
    cleanedPhone = '62' + cleanedPhone.substring(1);
  }
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate standard mock initial orders for KDS dashboard display
 */
export function getMockOrders(): Order[] {
  const now = new Date();
  
  return [
    {
      id: 'DS-9023',
      orderNumber: '001',
      customerName: 'Ahmad Faisal',
      customerPhone: '081234567890',
      isTakeaway: false,
      tableNumber: '05',
      items: [
        {
          id: 'cart-1',
          size: 'medium',
          pcs: 6,
          pieceSauces: ['mentai', 'mentai', 'cheese', 'cheese', 'tartar', 'tartar'],
          extraSauces: [{ sauce: 'mentai', quantity: 1, price: 3000 }],
          notes: 'Minta sendok garpu extra',
          unitPrice: 28000,
          quantity: 1,
          totalPrice: 31000
        }
      ],
      subtotal: 31000,
      serviceCharge: 2000,
      totalAmount: 33000,
      paymentMethod: 'qris',
      paymentStatus: 'paid',
      orderStatus: 'ready',
      createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString() // 25 mins ago
    },
    {
      id: 'DS-9024',
      orderNumber: '002',
      customerName: 'Siti Rahma',
      customerPhone: '085712345678',
      isTakeaway: true,
      items: [
        {
          id: 'cart-2',
          size: 'small',
          pcs: 3,
          pieceSauces: ['mentai', 'mentai', 'mentai'],
          extraSauces: [],
          notes: 'Agak garing ya dimsumnya',
          unitPrice: 15000,
          quantity: 2,
          totalPrice: 30000
        }
      ],
      subtotal: 30000,
      serviceCharge: 2000,
      totalAmount: 32000,
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      orderStatus: 'cooking',
      createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString() // 10 mins ago
    }
  ];
}

/**
 * Sends an automated WhatsApp notification via configured Gateway (e.g. Fonnte)
 */
export async function sendWhatsAppNotification(
  phone: string,
  text: string,
  settings: MerchantSettings
): Promise<{ success: boolean; message: string }> {
  if (settings.whatsappMode === 'direct') {
    // Direct mode is client-side redirect, so we return success but instruct user to open the URL
    return { success: true, message: 'Direct link generated' };
  }

  // Clean phone number
  let cleanedPhone = phone.replace(/[^0-9]/g, '');
  if (cleanedPhone.startsWith('0')) {
    cleanedPhone = '62' + cleanedPhone.substring(1);
  }

  if (settings.whatsappMode === 'fonnte') {
    if (!settings.whatsappGatewayToken) {
      return { success: false, message: 'Token Fonnte belum diisi di Pengaturan Toko.' };
    }

    try {
      const response = await fetch(settings.whatsappGatewayUrl || 'https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': settings.whatsappGatewayToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: cleanedPhone,
          message: text
        })
      });

      const resData = await response.json();
      if (response.ok && (resData.status === true || resData.status === 'success')) {
        return { success: true, message: 'WhatsApp terkirim via Fonnte!' };
      } else {
        return { success: false, message: resData.reason || 'Gagal mengirim pesan via Fonnte.' };
      }
    } catch (err: any) {
      return { success: false, message: 'Koneksi error: ' + (err.message || err) };
    }
  }

  if (settings.whatsappMode === 'laravel') {
    if (!settings.laravelApiUrl) {
      return { success: false, message: 'Laravel API URL belum diisi di Pengaturan Toko.' };
    }

    try {
      const response = await fetch(`${settings.laravelApiUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.laravelApiToken ? { 'Authorization': `Bearer ${settings.laravelApiToken}` } : {})
        },
        body: JSON.stringify({
          phone: cleanedPhone,
          message: text
        })
      });

      if (response.ok) {
        return { success: true, message: 'WhatsApp terkirim via Laravel API!' };
      } else {
        return { success: false, message: 'Laravel API mengembalikan status: ' + response.status };
      }
    } catch (err: any) {
      return { success: false, message: 'Gagal menghubungi Laravel API: ' + (err.message || err) };
    }
  }

  return { success: false, message: 'Metode WhatsApp tidak dikenal.' };
}

