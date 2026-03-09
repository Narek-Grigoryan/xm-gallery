import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes'; // You will need to create app.routes.ts

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes)
  ]
};
