import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'brandsfilter',
    pure: false
})
export class BrandListPipe implements PipeTransform {
    transform(array: Brands[], str:string ) {
        if(!!str){
            let newArr = array.filter(item => item.name.indexOf(str) != -1);
            return newArr.slice(0,newArr.length/2);
        } else {
            return array.slice(0, array.length/2)
        }
    }
}

interface Brands {
    id: number, 
    slug: string, 
    name: string
}