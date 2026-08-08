<?php

use App\Http\Controllers\DimsumSizeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\SauceController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\WhatsAppController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==== Halaman (Inertia) — merender komponen asli mockup apa adanya ====
Route::get('/', fn () => Inertia::render('Kiosk/Index'))->name('kiosk.index');
Route::get('/kitchen', fn () => Inertia::render('Kitchen/Dashboard'))->name('kitchen.dashboard');

/*
|--------------------------------------------------------------------------
| "API" dipanggil via fetch() langsung dari komponen React asli mockup
|--------------------------------------------------------------------------
| CustomerKiosk.tsx & MerchantDashboard.tsx (App.tsx aslinya) memanggil
| endpoint ini TANPA header CSRF token (fetch polos, bukan axios+bootstrap.ts),
| jadi grup ini sengaja dikecualikan dari VerifyCsrfToken supaya tidak kena 419.
*/
Route::prefix('api')->withoutMiddleware(VerifyCsrfToken::class)->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/orders/{orderNumber}/status', [OrderController::class, 'updateStatus']);
    Route::put('/orders/{orderNumber}/payment', [OrderController::class, 'updatePayment']);
    Route::post('/whatsapp/send', [WhatsAppController::class, 'send']);

    Route::get('/sauces', [SauceController::class, 'index']);
    Route::post('/sauces', [SauceController::class, 'store']);
    Route::put('/sauces/{sauce}', [SauceController::class, 'update']);
    Route::delete('/sauces/{sauce}', [SauceController::class, 'destroy']);

    Route::get('/sizes', [DimsumSizeController::class, 'index']);
    Route::post('/sizes', [DimsumSizeController::class, 'store']);
    Route::put('/sizes/{size}', [DimsumSizeController::class, 'update']);
    Route::delete('/sizes/{size}', [DimsumSizeController::class, 'destroy']);

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::post('/settings/qris-image', [SettingsController::class, 'uploadQrisImage']);
    Route::delete('/settings/qris-image', [SettingsController::class, 'deleteQrisImage']);
});

// ==== Webhook Midtrans (kalau nanti QRIS asli disambungkan) ====
Route::post('/webhooks/midtrans', [PaymentWebhookController::class, 'handle'])
    ->withoutMiddleware(VerifyCsrfToken::class);
