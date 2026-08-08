<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('size_id'); // FK ke dimsum_sizes
            $table->unsignedTinyInteger('pcs');
            $table->json('piece_sauces'); // e.g. ["mentai","cheese","mentai"]
            $table->text('notes')->nullable();
            $table->unsignedInteger('unit_price');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('total_price');
            $table->timestamps();
        });

        // Saus tambahan (extra) per item, beserta qty & harga saat transaksi
        Schema::create('order_item_extra_sauces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->string('sauce_id');
            $table->unsignedTinyInteger('quantity');
            $table->unsignedInteger('price');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_item_extra_sauces');
        Schema::dropIfExists('order_items');
    }
};
