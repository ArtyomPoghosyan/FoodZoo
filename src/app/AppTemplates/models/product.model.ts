import { Brand } from "./brands.model";
import { breadcrumbs } from "./breadcrumbs.model";
import { ProductImages } from "./product-images.model";

export interface Product {
    batchSize: number,
    brand: Brand,
    breadcrumbs: breadcrumbs[],
    censoredImage: [],
    desc: string,
    discount: {
        endDays: string,
        maxCount: null|number,
        percent: number,
        price: number,
    }|null,
    fullName: string,
    hasAction: number,
    hasCensored: boolean,
    id: number,
    images: [],
    isFavorite: number,
    isNew: number,
    mainImage: ProductImages,
    manufacture: string,
    measure: string,
    minOrderAmount: number,
    name: string,
    pack: string,
    price: number,
    quantity: number,
    seo: {},
    slug: string,
    unit: string,
    unitSize: number
}