<?php

namespace App\Services;

use App\Models\Order;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = config('services.midtrans.is_sanitized');
        Config::$is3ds = config('services.midtrans.is_3ds');
    }

    /**
     * Buat transaksi QRIS dinamis untuk sebuah order.
     * Mengembalikan array berisi qr_code_url dan token, untuk ditampilkan sbg QR di layar kiosk.
     */
    public function createQrisTransaction(Order $order): array
    {
        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number.'-'.time(),
                'gross_amount' => (int) $order->total_amount,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name,
                'phone' => $order->customer_phone,
            ],
            'enabled_payments' => ['gopay', 'other_qris'],
            'item_details' => $order->items->map(fn ($item) => [
                'id' => (string) $item->id,
                'price' => (int) $item->unit_price,
                'quantity' => $item->quantity,
                'name' => strtoupper($item->size_id).' Dimsum ('.$item->pcs.' pcs)',
            ])->toArray(),
        ];

        $snapToken = Snap::getSnapToken($params);

        $order->update([
            'midtrans_order_id' => $params['transaction_details']['order_id'],
            'qris_expired_at' => now()->addMinutes(15),
        ]);

        return [
            'snap_token' => $snapToken,
            'snap_redirect_url' => 'https://app.'.(config('services.midtrans.is_production') ? '' : 'sandbox.').'midtrans.com/snap/v2/vtweb/'.$snapToken,
        ];
    }

    /**
     * Verifikasi signature webhook notifikasi Midtrans.
     */
    public function verifySignature(array $payload): bool
    {
        $expected = hash('sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].config('services.midtrans.server_key')
        );

        return hash_equals($expected, $payload['signature_key'] ?? '');
    }
}
