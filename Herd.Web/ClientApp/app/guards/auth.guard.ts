﻿import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../services';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private authService: AuthenticationService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.authService.isAuthenticated() && document.cookie.indexOf("HERD_SESSION=") >= 0) {
            // Were authenticated but we didnt pick our instance yet
            let url = state.url;
            if (url != "/instance-picker" && !this.authService.checkIfConnectedToMastodon()) {
                this.router.navigateByUrl('/instance-picker');
                return false;
            }
            return true;
        }
        // not logged in so redirect to login page with the return url
        this.router.navigateByUrl('/login', { queryParams: { returnUrl: state.url } });
        return false;
    }

}