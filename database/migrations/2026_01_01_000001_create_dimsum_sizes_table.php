<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dimsum_sizes', function (Blueprint $table) {
            $table->string('id')->primary(); // 'small' | 'medium'
            $table->string('name');
            $table->unsignedTinyInteger('pcs'); // 3 or 6
            $table->unsignedInteger('base_price');
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dimsum_sizes');
    }
};
