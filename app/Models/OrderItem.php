<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'size_id', 'pcs', 'piece_sauces',
        'notes', 'unit_price', 'quantity', 'total_price',
    ];

    protected $casts = [
        'piece_sauces' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function extraSauces(): HasMany
    {
        return $this->hasMany(OrderItemExtraSauce::class);
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(DimsumSize::class, 'size_id');
    }
}
