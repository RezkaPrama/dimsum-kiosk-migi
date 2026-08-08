<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merchant_users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('pin'); // di-hash, PIN 4-6 digit untuk login cepat di tablet dapur
            $table->enum('role', ['admin', 'kasir', 'dapur'])->default('kasir');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });

        Schema::create('merchant_settings', function (Blueprint $table) {
            $table->id();
            $table->string('shop_name')->default('Dimsum Kiosk');
            $table->string('shop_address')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->decimal('tax_rate', 5, 4)->default(0);
            $table->unsignedInteger('service_fee')->default(0);
            $table->string('currency_symbol')->default('Rp');
            $table->boolean('auto_print_receipt')->default(true);
            $table->boolean('sound_alert_enabled')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merchant_settings');
        Schema::dropIfExists('merchant_users');
    }
};
