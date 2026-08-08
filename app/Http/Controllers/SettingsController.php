<?php

namespace App\Http\Controllers;

use App\Models\MerchantSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /** GET /api/settings */
    public function show()
    {
        $settings = MerchantSetting::first() ?? MerchantSetting::create(['shop_name' => 'Dimsum Kiosk & Co']);

        return response()->json([
            'shopName' => $settings->shop_name,
            'shopAddress' => $settings->shop_address,
            'whatsappNumber' => $settings->whatsapp_number,
            'serviceFee' => $settings->service_fee,
            'qrisImageUrl' => $settings->qris_image_path ? Storage::url($settings->qris_image_path) : null,
        ]);
    }

    /** POST /api/settings/qris-image — upload/ganti gambar QRIS statis milik toko */
    public function uploadQrisImage(Request $request)
    {
        $request->validate([
            'qris_image' => 'required|image|max:5120', // maks 5MB
        ]);

        $settings = MerchantSetting::first() ?? MerchantSetting::create(['shop_name' => 'Dimsum Kiosk & Co']);

        // Hapus gambar lama kalau ada
        if ($settings->qris_image_path) {
            Storage::disk('public')->delete($settings->qris_image_path);
        }

        $path = $request->file('qris_image')->store('qris', 'public');
        $settings->update(['qris_image_path' => $path]);

        return response()->json(['qrisImageUrl' => Storage::url($path)]);
    }

    /** DELETE /api/settings/qris-image — hapus gambar QRIS (kembali ke QR simulasi) */
    public function deleteQrisImage()
    {
        $settings = MerchantSetting::first();

        if ($settings && $settings->qris_image_path) {
            Storage::disk('public')->delete($settings->qris_image_path);
            $settings->update(['qris_image_path' => null]);
        }

        return response()->json(['message' => 'Gambar QRIS dihapus.']);
    }
}
