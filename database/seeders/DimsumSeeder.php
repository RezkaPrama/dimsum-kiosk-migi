<?php

namespace Database\Seeders;

use App\Models\DimsumSize;
use App\Models\MerchantSetting;
use App\Models\MerchantUser;
use App\Models\Sauce;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DimsumSeeder extends Seeder
{
    public function run(): void
    {
        MerchantSetting::firstOrCreate([], [
            'shop_name' => 'Dimsum Kiosk',
            'shop_address' => 'Jl. Contoh No. 1',
            'whatsapp_number' => '6281234567890',
            'service_fee' => 2000,
        ]);

        DimsumSize::upsert([
            ['id' => 'small', 'name' => 'Small', 'pcs' => 3, 'base_price' => 15000, 'description' => 'Isi 3 pcs', 'is_active' => true],
            ['id' => 'medium', 'name' => 'Medium', 'pcs' => 6, 'base_price' => 28000, 'description' => 'Isi 6 pcs', 'is_active' => true],
        ], ['id']);

        Sauce::upsert([
            ['id' => 'original', 'name' => 'Original', 'extra_price' => 0, 'color' => 'gray', 'available' => true],
            ['id' => 'mentai', 'name' => 'Mentai', 'extra_price' => 3000, 'color' => 'orange', 'available' => true],
            ['id' => 'cheese', 'name' => 'Cheese', 'extra_price' => 3000, 'color' => 'amber', 'available' => true],
            ['id' => 'tartar', 'name' => 'Tartar', 'extra_price' => 3000, 'color' => 'teal', 'available' => true],
        ], ['id']);

        MerchantUser::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin Kiosk',
                'pin' => Hash::make('1234'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}
