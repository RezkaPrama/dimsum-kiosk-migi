<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number', 'customer_name', 'customer_phone',
        'is_takeaway', 'table_number',
        'subtotal', 'service_charge', 'total_amount',
        'payment_method', 'payment_status',
        'midtrans_order_id', 'midtrans_transaction_id', 'qris_actions_json', 'qris_expired_at',
        'order_status', 'notes', 'wa_notification_sent',
    ];

    protected $casts = [
        'is_takeaway' => 'boolean',
        'wa_notification_sent' => 'boolean',
        'qris_expired_at' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Generate nomor order berurutan, format: DS-1001, DS-1002, dst.
     */
    public static function generateOrderNumber(): string
    {
        $last = static::orderByDesc('id')->first();
        $lastNumber = $last ? (int) str_replace('DS-', '', $last->order_number) : 1000;

        return 'DS-'.($lastNumber + 1);
    }
}
