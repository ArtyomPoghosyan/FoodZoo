// angular
import { NgModule, ViewEncapsulation, Component } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// components
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { AppLocalStorageService } from './AppTemplates/services/storages/app-local-storage.service';
import { SsrLocalStorageService } from './AppTemplates/services/storages/ssr-local-storage.service';
import { AppSessionStorageService } from './AppTemplates/services/storages/app-session-storage.service';
import { SsrSessionStorageService } from './AppTemplates/services/storages/ssr-session-storage.service';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    NoopAnimationsModule,
    ServerTransferStateModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: AppLocalStorageService,
      useClass: SsrLocalStorageService
    },
    {
      provide: AppSessionStorageService,
      useClass: SsrSessionStorageService
    }
  ]
})
export class AppServerModule {}
