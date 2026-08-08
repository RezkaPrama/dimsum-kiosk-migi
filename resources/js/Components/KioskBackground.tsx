import { ReactNode } from 'react';

interface KioskBackgroundProps {
    children: ReactNode;
}

/**
 * Background hangat bertema dimsum — dipakai membungkus halaman Kiosk & Kitchen.
 * Warna disesuaikan dengan aksen merah/oranye yang sudah dipakai di CustomerKiosk.tsx
 * & MerchantDashboard.tsx, supaya terasa satu tema, bukan sekadar tempelan.
 */
export default function KioskBackground({ children }: KioskBackgroundProps) {
    return (
        // <div className="min-h-screen bg-[#FBF3E7] relative overflow-hidden">
        //     <div className="fixed -top-24 -left-24 w-96 h-96 bg-red-200/50 rounded-full blur-3xl pointer-events-none z-0" />
        //     <div className="fixed top-1/3 -right-16 w-80 h-80 bg-amber-200/60 rounded-full blur-3xl pointer-events-none z-0" />
        //     <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none z-0" />

        //     <div className="relative z-10">{children}</div>
        // </div>

        // <div className="min-h-screen bg-[#EDE6D8] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="min-h-screen bg-[#dfd2b8] flex items-center justify-center px-4 relative overflow-hidden">
            <div className="fixed -top-24 -left-24 w-96 h-96 bg-amber-200/60 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="fixed top-1/2 -right-12 w-80 h-80 bg-rose-200/50 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="fixed bottom-0 left-1/3 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none z-0" />

            <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
        </div>
    );
}
