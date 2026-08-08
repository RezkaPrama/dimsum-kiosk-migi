<?php

namespace App\Http\Controllers;

use App\Models\Sauce;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SauceController extends Controller
{
    /** GET /api/sauces */
    public function index()
    {
        return response()->json(Sauce::orderByRaw("id = 'original' desc")->orderBy('name')->get());
    }

    /** POST /api/sauces — tambah saus baru */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'extra_price' => 'required|integer|min:0',
            'color' => 'required|string', // key tema warna, mis. 'orange', 'teal', dll
        ]);

        $id = Str::slug($validated['name'], '_');

        // Pastikan id unik kalau nama mirip
        $original = $id;
        $i = 1;
        while (Sauce::where('id', $id)->exists()) {
            $id = $original.'_'.$i++;
        }

        $sauce = Sauce::create([
            'id' => $id,
            'name' => $validated['name'],
            'extra_price' => $validated['extra_price'],
            'color' => $validated['color'],
            'available' => true,
        ]);

        return response()->json($sauce, 201);
    }

    /** PUT /api/sauces/{id} — edit nama/harga/warna/status tersedia */
    public function update(Request $request, string $sauce)
    {
        $sauceModel = Sauce::findOrFail($sauce);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:50',
            'extra_price' => 'sometimes|integer|min:0',
            'color' => 'sometimes|string',
            'available' => 'sometimes|boolean',
        ]);

        $sauceModel->update($validated);

        return response()->json($sauceModel);
    }

    /** DELETE /api/sauces/{id} — hapus saus (kecuali "original") */
    public function destroy(string $sauce)
    {
        if ($sauce === 'original') {
            return response()->json(['message' => 'Saus "Original" tidak bisa dihapus (dipakai sebagai pilihan tanpa saus).'], 422);
        }

        Sauce::where('id', $sauce)->delete();

        return response()->json(['message' => 'Saus dihapus.']);
    }
}
