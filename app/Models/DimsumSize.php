<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DimsumSize extends Model
{
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['id', 'name', 'pcs', 'base_price', 'description', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
