import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AppConfigService } from './core/config/app-config.service';
import { httpAuthInterceptor } from './core/http-auth.interceptor';
import { httpErrorInterceptor } from './core/http-error.interceptor';
import { httpRefreshInterceptor } from './core/http-refresh.interceptor';
import { httpPlatformApiKeyInterceptor } from './core/http-platform-api-key.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([httpPlatformApiKeyInterceptor, httpAuthInterceptor, httpErrorInterceptor, httpRefreshInterceptor])),
        {
            provide: APP_INITIALIZER,
            multi: true,
            deps: [AppConfigService],
            useFactory: (configService: AppConfigService) => () => configService.load()
        }
    ]
};
