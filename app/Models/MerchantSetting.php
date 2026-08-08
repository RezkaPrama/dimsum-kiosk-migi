<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantSetting extends Model
{
    protected $fillable = [
        'shop_name', 'shop_address', 'whatsapp_number', 'tax_rate',
        'service_fee', 'qris_image_path', 'currency_symbol', 'auto_print_receipt', 'sound_alert_enabled',
    ];

    protected $casts = [
        'auto_print_receipt' => 'boolean',
        'sound_alert_enabled' => 'boolean',
    ];
}
