﻿import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs, RequestOptions, RequestMethod } from '@angular/http';
import 'rxjs/Rx';

import { HttpClientService } from './http-client.service';
import { Status } from '../models/mastodon';
import { Observable } from "rxjs/Observable";

@Injectable()
export class MastodonService {

    constructor(private http: Http, private httpClient: HttpClientService) {}

    // Get a list of posts for the home feed
    getHomeFeed(): Observable<Status[]> {
        return this.httpClient.get('api/feed/new_items')
            .map(response => response.RecentPosts as Status[]);
    }

    getStatus(statusId: number, includeAncestors: boolean, includeDescendants: boolean): Observable<Status> {
        let queryString = '?statusId=' + statusId
                        + '&includeAncestors=' + includeAncestors
                        + '&includeDescendants=' + includeDescendants;
        return this.httpClient.get('api/feed/get_status' + queryString)
            .map(response => response.MastodonPost as Status);
    }

    /**
     * Make a new status on the home feed
     *
     * @param message
     * @param visibility
     *      Direct = 3
     *      Private = 2
     *      Unlisted = 1
     *      Public = 0
     * @param replayStatusId
     * @param sensitive
     * @param spoilerText
     */
    makeNewPost(message: string, visibility: number, replyStatusId?: number, sensitive?: boolean, spoilerText?: string) {
        if (replyStatusId && replyStatusId < 0) {
            replyStatusId = undefined;
        }

        let body = {
            'message': message,
            'visibility': visibility,
            'replyStatusId': replyStatusId || null,
            'sensitive': sensitive || false,
            'spoilerText': spoilerText || null,
        }
        return this.httpClient.post('api/feed/new_post', body);
    }

}