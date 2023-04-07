export class Products {
    items?:[]
}

export class AddBasketRequest {
    product_id: number;
    supplier_id?: number;
    quantity?: number;
}

export class AddBasketResponse {
    id: number;
    customer_id: number;
    product_id: number;
    supplier_id: number;
    quantity: number;
}