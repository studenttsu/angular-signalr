import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AngularSignalrService } from './angular-signalr.service';
import { IAngularSignalrConfig } from './angular-signalr.interface';
import { config } from './angular-signalr.config';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AngularSignalrService
  ]
})
export class AngularSignalrModule {
  public static config(wsConfig: IAngularSignalrConfig): ModuleWithProviders {
    return {
      ngModule: AngularSignalrModule,
      providers: [{
        provide: config,
        useValue: wsConfig
      }]
    };
  }
}
