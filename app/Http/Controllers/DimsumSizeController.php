<?php

namespace App\Http\Controllers;

use App\Models\DimsumSize;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DimsumSizeController extends Controller
{
    /** GET /api/sizes */
    public function index()
    {
        return response()->json(DimsumSize::where('is_active', true)->orderBy('base_price')->get());
    }

    /** POST /api/sizes — tambah ukuran baru, mis. "Large" isi 9 pcs */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'pcs' => 'required|integer|min:1|max:50',
            'base_price' => 'required|integer|min:0',
            'description' => 'nullable|string|max:255',
        ]);

        $id = Str::slug($validated['name'], '_');
        $original = $id;
        $i = 1;
        while (DimsumSize::where('id', $id)->exists()) {
            $id = $original.'_'.$i++;
        }

        $size = DimsumSize::create([
            'id' => $id,
            'name' => $validated['name'],
            'pcs' => $validated['pcs'],
            'base_price' => $validated['base_price'],
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        return response()->json($size, 201);
    }

    /** PUT /api/sizes/{id} */
    public function update(Request $request, string $size)
    {
        $sizeModel = DimsumSize::findOrFail($size);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:50',
            'pcs' => 'sometimes|integer|min:1|max:50',
            'base_price' => 'sometimes|integer|min:0',
            'description' => 'sometimes|nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $sizeModel->update($validated);

        return response()->json($sizeModel);
    }

    /** DELETE /api/sizes/{id} — minimal harus tersisa 1 ukuran aktif */
    public function destroy(string $size)
    {
        if (DimsumSize::where('is_active', true)->count() <= 1) {
            return response()->json(['message' => 'Minimal harus ada 1 ukuran dimsum yang aktif.'], 422);
        }

        DimsumSize::where('id', $size)->delete();

        return response()->json(['message' => 'Ukuran dihapus.']);
    }
}
