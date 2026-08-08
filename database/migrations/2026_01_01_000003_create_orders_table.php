<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // e.g. "DS-1001"
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->boolean('is_takeaway')->default(true);
            $table->string('table_number')->nullable();

            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('service_charge')->default(0);
            $table->unsignedInteger('total_amount');

            $table->enum('payment_method', ['cash', 'qris']);
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid');

            // Midtrans QRIS fields
            $table->string('midtrans_order_id')->nullable()->unique();
            $table->string('midtrans_transaction_id')->nullable();
            $table->text('qris_actions_json')->nullable(); // simpan qr_code url dari Midtrans
            $table->timestamp('qris_expired_at')->nullable();

            $table->enum('order_status', [
                'pending_payment', 'received', 'cooking', 'ready', 'completed', 'cancelled',
            ])->default('pending_payment');

            $table->text('notes')->nullable();
            $table->boolean('wa_notification_sent')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
