<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sauces', function (Blueprint $table) {
            $table->string('id')->primary(); // 'original' | 'mentai' | 'cheese' | 'tartar'
            $table->string('name');
            $table->unsignedInteger('extra_price')->default(0); // harga tambahan jika dipilih sbg extra sauce
            $table->string('color')->nullable();
            $table->boolean('available')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sauces');
    }
};
