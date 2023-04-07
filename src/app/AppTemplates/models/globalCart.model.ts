import { Product } from "./product.model";

export interface GlobalCart {
    error: number,
    items: Product[],
    message: string,
    minOrderSum: number,
    obsolete: Product[],
    promocode: string|null
}