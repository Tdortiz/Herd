﻿import { Component, OnInit, Input } from '@angular/core';

import { AccountService } from '../../services';
import { UserCard } from "../../models/mastodon";

import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'searchresults',
    templateUrl: './searchResults.page.html'
})
export class SearchResultsPage implements OnInit {

    search: string;
    userCards: UserCard[]; // List of users that the search found

    // Keeping  it simple for now
    constructor(private accountService: AccountService, private route: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {
        this.route
            .queryParams
            .subscribe(params => {
                this.search = params['searchString'] || "John";
            });


        // hard coding string here for testing
        this.accountService.searchUser(this.search)
            .subscribe(users => {
                this.userCards = users;
            });
    }

    
}