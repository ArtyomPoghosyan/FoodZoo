import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterStringArray',
    pure: false
})
export class ExponentialStrengthPipe implements PipeTransform {
    transform(array: string[], str:string ) {
        if(!!str){
            let newArr = array.filter(item => item.indexOf(str) != -1);
            if(newArr.length > 0){
                return newArr.slice(0,newArr.length/2);
            } else {
                return array.slice(0, array.length/2)
            }
        } else {
            return array.slice(0, array.length/2)
        }
    }
}