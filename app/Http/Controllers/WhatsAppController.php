<?php

namespace App\Http\Controllers;

use App\Services\FonnteService;
use Illuminate\Http\Request;

class WhatsAppController extends Controller
{
    public function __construct(protected FonnteService $fonnte) {}

    /**
     * POST /api/whatsapp/send — dipanggil oleh sendWhatsAppNotification() di
     * resources/js/utils/mockData.ts saat settings.whatsappMode === 'laravel'.
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string',
        ]);

        $sent = $this->fonnte->sendRaw($validated['phone'], $validated['message']);

        return response()->json(['success' => $sent]);
    }
}
