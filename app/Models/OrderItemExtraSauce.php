<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemExtraSauce extends Model
{
    protected $fillable = ['order_item_id', 'sauce_id', 'quantity', 'price'];

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function sauce(): BelongsTo
    {
        return $this->belongsTo(Sauce::class, 'sauce_id');
    }
}
