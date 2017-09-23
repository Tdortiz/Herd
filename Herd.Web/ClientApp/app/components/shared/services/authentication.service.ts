﻿import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptionsArgs, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

import { HttpClientService } from '../services/http-client.service';
import { StorageService } from '../models/Storage';
import { User } from "../models/User";

@Injectable()
export class AuthenticationService {
    constructor(private http: Http, private httpClient: HttpClientService, private localStorage: StorageService) { }

    checkIfConnectedToMastodon(): boolean {
        if (localStorage.getItem('connectedToMastodon') === "true") {
            return true;
        }
        return false;
    }

    /**
     * Checks if a person is authenticated by checking their currentUser item in local storage
     */
    isAuthenticated() {
        if (this.localStorage.getItem('currentUser')) {
            return true; //logged in
        }
        return false; // not logged in
    }

    /**
     * POST /api/account/register
     */
    register(user: User) {
        return this.httpClient.post('api/account/register', JSON.stringify(user))
    }

    /**
     * POST /api/account/login
     *
     * @returns : {AppUser Obj}
     */
    login(email: string, password: string) {
        let body = {
            'email': email,
            'password': password
        }
        return this.httpClient.post('api/account/login', body)       
    }

    /**
     * GET /api/account/logout
     */
    logout() {
        // remove user from local storage to log user out & log user out of backend
        this.localStorage.clear();
        return this.http.get('api/account/logout');
    }

    /**
     * Get a oAuth token for the instance
     * GET /api/oauth/url?instance={instance}
     *
     * @returns: { "url": "https://oAuthUrl.com" }
     */
    getOAuthUrl(registrationId: number) {
        let queryString = '?registrationID=' + registrationId;
        return this.httpClient.get('api/oauth/url' + queryString);
    }

    getRegistrationId(instance: string) {
        let queryString = '?instance=' + instance;
        return this.httpClient.get('api/oauth/registration_id' + queryString);
    }

    /**
     * Submit the OAuth Token
     * POST /api/oauth/set_tokens
     *
     * @param instance
     * @param token
     */
    submitOAuthToken(token: string, registrationID: number) {
        let body = {
            'token': token,
            'app_registration_id': registrationID,
        }
        return this.httpClient.post('api/oauth/set_tokens', body);
    }
}