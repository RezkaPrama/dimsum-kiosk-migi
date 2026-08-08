<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    protected string $token;
    protected string $apiUrl;

    public function __construct()
    {
        $this->token = config('services.fonnte.token');
        $this->apiUrl = config('services.fonnte.api_url');
    }

    /**
     * Kirim notifikasi status pesanan ke nomor customer.
     */
    public function sendOrderNotification(Order $order): bool
    {
        $message = $this->buildMessage($order);

        return $this->send($order->customer_phone, $message);
    }

    protected function buildMessage(Order $order): string
    {
        return match ($order->order_status) {
            'received' => "Halo {$order->customer_name}! 👋\nPesanan #{$order->order_number} sudah kami terima dan akan segera diproses. Terima kasih sudah memesan di Dimsum Kiosk! 🥟",
            'cooking' => "Pesanan #{$order->order_number} sedang dimasak 🔥. Mohon ditunggu ya!",
            'ready' => "Pesanan #{$order->order_number} sudah siap! 🎉 Silakan diambil di counter.",
            'completed' => "Terima kasih {$order->customer_name}! Pesanan #{$order->order_number} telah selesai. Sampai jumpa lagi! 🙏",
            'cancelled' => "Mohon maaf, pesanan #{$order->order_number} dibatalkan. Hubungi kami jika ada pertanyaan.",
            default => "Update pesanan #{$order->order_number}: status {$order->order_status}",
        };
    }

    /**
     * Kirim pesan WA bebas (dipanggil dari endpoint /api/whatsapp/send).
     */
    public function sendRaw(string $phone, string $message): bool
    {
        return $this->send($phone, $message);
    }

    protected function send(string $phone, string $message): bool
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->asForm()->post($this->apiUrl, [
                'target' => $this->formatPhone($phone),
                'message' => $message,
                'countryCode' => '62',
            ]);

            if (! $response->successful()) {
                Log::warning('Fonnte WA gagal terkirim', ['phone' => $phone, 'response' => $response->body()]);

                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('Fonnte WA error: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Ubah nomor lokal (08xx) menjadi format internasional (628xx) yang dibutuhkan Fonnte.
     */
    protected function formatPhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '62'.substr($phone, 1);
        }

        return $phone;
    }
}
