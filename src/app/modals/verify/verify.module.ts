import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VerifyComponent} from './verify.component';
import {LoaderModule} from '../../components/modules/loader/loader.module';
import {ReactiveFormsModule} from '@angular/forms';


@NgModule({
    declarations: [VerifyComponent],
    exports: [
        VerifyComponent
    ],
    imports: [
        CommonModule,
        LoaderModule,
        ReactiveFormsModule
    ]
})
export class VerifyModule {
}
