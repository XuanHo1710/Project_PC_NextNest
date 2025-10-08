import Link from 'next/link';

export default function TestOrderSuccess() {
    const testOrderParams = new URLSearchParams({
        orderId: 'ORD123456789',
        customerName: 'Nguyễn Văn A',
        phone: '0123456789',
        address: 'Số 123, Đường ABC, Quận 1, TP.HCM',
        total: '27500000'
    });

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Link
                href={`/order-success?${testOrderParams.toString()}`}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
                Test Order Success Page
            </Link>
        </div>
    );
}