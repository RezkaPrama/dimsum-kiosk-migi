<?php

namespace App\Http\Controllers;

use App\Models\DimsumSize;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Sauce;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controller ini SENGAJA bicara dalam bentuk JSON camelCase yang persis sama
 * dengan interface `Order` di resources/js/types.ts (hasil mockup AI Studio),
 * supaya komponen React (CustomerKiosk.tsx, MerchantDashboard.tsx) BISA DIPAKAI
 * APA ADANYA tanpa diubah sama sekali — cukup diarahkan ke Laravel API ini.
 */
class OrderController extends Controller
{
    /** GET /api/orders → daftar semua order (dipakai App.tsx / dashboard polling) */
    public function index()
    {
        $orders = Order::with('items.extraSauces')->latest()->get();

        return response()->json($orders->map(fn (Order $o) => $this->toMockShape($o)));
    }

    /** POST /api/orders → terima objek Order utuh dari CustomerKiosk.tsx apa adanya */
    public function store(Request $request)
    {
        $data = $request->all();

        $order = DB::transaction(function () use ($data) {
            $order = Order::create([
                'order_number' => $data['id'], // mis. "DS-9023" — dipakai sbg primary identifier di mockup
                'customer_name' => $data['customerName'],
                'customer_phone' => $data['customerPhone'],
                'is_takeaway' => $data['isTakeaway'] ?? true,
                'table_number' => $data['tableNumber'] ?? null,
                'subtotal' => $data['subtotal'],
                'service_charge' => $data['serviceCharge'] ?? 0,
                'total_amount' => $data['totalAmount'],
                'payment_method' => $data['paymentMethod'],
                'payment_status' => $data['paymentStatus'] ?? 'unpaid',
                'order_status' => $data['orderStatus'] ?? 'received',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                /** @var OrderItem $orderItem */
                $orderItem = $order->items()->create([
                    'size_id' => $item['size'],
                    'pcs' => $item['pcs'],
                    'piece_sauces' => $item['pieceSauces'],
                    'notes' => $item['notes'] ?? null,
                    'unit_price' => $item['unitPrice'],
                    'quantity' => $item['quantity'],
                    'total_price' => $item['totalPrice'],
                ]);

                foreach ($item['extraSauces'] ?? [] as $extra) {
                    $orderItem->extraSauces()->create([
                        'sauce_id' => $extra['sauce'],
                        'quantity' => $extra['quantity'],
                        'price' => $extra['price'],
                    ]);
                }
            }

            return $order->load('items.extraSauces');
        });

        return response()->json($this->toMockShape($order), 201);
    }

    /** PUT /api/orders/{orderNumber}/status → body: { orderStatus: '...' } */
    public function updateStatus(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $order->update(['order_status' => $request->input('orderStatus')]);

        return response()->json($this->toMockShape($order->fresh('items.extraSauces')));
    }

    /** PUT /api/orders/{orderNumber}/payment → body: { paymentStatus: '...' } */
    public function updatePayment(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $status = $request->input('paymentStatus');

        $order->update([
            'payment_status' => $status,
            'order_status' => $status === 'paid' ? 'received' : $order->order_status,
        ]);

        return response()->json($this->toMockShape($order->fresh('items.extraSauces')));
    }

    /** Ubah model Eloquent (snake_case) jadi bentuk persis interface Order di types.ts (camelCase) */
    protected function toMockShape(Order $order): array
    {
        return [
            'id' => $order->order_number,
            'orderNumber' => str_pad((string) $order->id, 3, '0', STR_PAD_LEFT),
            'customerName' => $order->customer_name,
            'customerPhone' => $order->customer_phone,
            'isTakeaway' => (bool) $order->is_takeaway,
            'tableNumber' => $order->table_number,
            'items' => $order->items->map(fn (OrderItem $item) => [
                'id' => (string) $item->id,
                'size' => $item->size_id,
                'pcs' => $item->pcs,
                'pieceSauces' => $item->piece_sauces,
                'extraSauces' => $item->extraSauces->map(fn ($e) => [
                    'sauce' => $e->sauce_id,
                    'quantity' => $e->quantity,
                    'price' => $e->price,
                ])->values(),
                'notes' => $item->notes ?? '',
                'unitPrice' => $item->unit_price,
                'quantity' => $item->quantity,
                'totalPrice' => $item->total_price,
            ])->values(),
            'subtotal' => $order->subtotal,
            'serviceCharge' => $order->service_charge,
            'totalAmount' => $order->total_amount,
            'paymentMethod' => $order->payment_method,
            'paymentStatus' => $order->payment_status,
            'orderStatus' => $order->order_status,
            'createdAt' => $order->created_at->toISOString(),
            'notes' => $order->notes,
        ];
    }
}
