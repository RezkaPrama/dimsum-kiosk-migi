<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class MerchantUser extends Authenticatable
{
    use HasFactory;

    protected $fillable = ['name', 'username', 'pin', 'role', 'is_active', 'last_login_at'];

    protected $hidden = ['pin'];

    protected $casts = [
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    // PIN dipakai sebagai "password" via custom guard (lihat AuthController)
    public function getAuthPassword()
    {
        return $this->pin;
    }
}
