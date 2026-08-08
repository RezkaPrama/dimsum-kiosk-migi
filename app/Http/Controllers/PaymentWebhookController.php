<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\FonnteService;
use App\Services\MidtransService;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    public function __construct(
        protected MidtransService $midtrans,
        protected FonnteService $fonnte,
    ) {}

    /**
     * Endpoint yang didaftarkan sebagai "Payment Notification URL" di dashboard Midtrans.
     * URL: POST /api/webhooks/midtrans
     */
    public function handle(Request $request)
    {
        $payload = $request->all();

        if (! $this->midtrans->verifySignature($payload)) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $order = Order::where('midtrans_order_id', $payload['order_id'])->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;

        if (in_array($transactionStatus, ['capture', 'settlement']) && $fraudStatus !== 'deny') {
            $order->update([
                'payment_status' => 'paid',
                'order_status' => 'received',
                'midtrans_transaction_id' => $payload['transaction_id'] ?? null,
            ]);

            $this->fonnte->sendOrderNotification($order->fresh());
        } elseif (in_array($transactionStatus, ['expire', 'cancel', 'deny'])) {
            $order->update(['order_status' => 'cancelled']);
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * Endpoint polling dari app (opsional) untuk cek status realtime tanpa nunggu webhook.
     */
    public function status(Order $order)
    {
        return response()->json([
            'payment_status' => $order->payment_status,
            'order_status' => $order->order_status,
        ]);
    }
}
