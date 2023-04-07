export interface OrdersHistroyResponse {
    error: number;
    message: string;
    count: number;
    pages: number;
    total_count: number;
    items: OrderHistoryItem[];
}

export interface OrderHistoryItem {
    id: number;
    number: number;
    customer_id: number;
    recipient_id: number;
    recipientName: string;
    recipientAddress: string;
    supplier_id: number;
    supplierName: string;
    amount: string;
    status: number;
    statusName: string;
    comment: string;
    delivery_date: number;
    created_at: number;
    products: Product[];
}

interface Product {
    order_product_id: number;
    product_id: number;
    img: string;
    name: string;
    desc: string;
    quantity: number;
    price: string;
    amount: string;
}
