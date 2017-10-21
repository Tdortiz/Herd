﻿import { TestBed, async, inject } from '@angular/core/testing';
import { HttpModule, Http, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Observable } from "rxjs/Observable";

import { AccountService } from './account.service';
import { HttpClientService } from '../http-client-service/http-client.service';
import { Account } from '../../models/mastodon';

describe('Service: Account Service', () => {
    let accountService: AccountService;

    beforeEach(() => {
        // Set up the test bed
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                AccountService,
                { provide: XHRBackend, useClass: MockBackend },
                HttpClientService,
            ]
        });
    });

    // Inject commonly used services
    beforeEach(inject([AccountService], (as: AccountService) => {
        accountService = as;
    }));

    describe('Get User By their mastodonUserID', () => {
        it('should return the user',
            inject([XHRBackend], (mockBackend: MockBackend) => {
                // Create a mockedResponse
                const mockResponse = {
                    Data: {
                        Users: [
                            { MastodonUserId: '1', MastodonDisplayName: 'John Jane' },
                        ]
                    }
                };

                // If there is an HTTP request intercept it and return the above mockedResponse
                mockBackend.connections.subscribe((connection: MockConnection) => {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                });

                // Make the login request from our authentication service
                accountService.getUserByID("1").subscribe((user) => {
                    expect(user.MastodonUserId).toBe("1");
                    expect(user.MastodonDisplayName).toBe("John Jane");
                });
            })
        );

        it('should return nothing when there is no user with that ID',
            inject([XHRBackend], (mockBackend: MockBackend) => {
                // Create a mockedResponse
                const mockResponse = {
                    Data: {
                        Users: []
                    }
                };

                // If there is an HTTP request intercept it and return the above mockedResponse
                mockBackend.connections.subscribe((connection: MockConnection) => {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                });

                // Make the login request from our authentication service
                accountService.getUserByID("-1").subscribe((user) => {
                    expect(user).toBeUndefined();
                });
            })
        );
    });

    describe('search for users', () => {
        it('should return an array of users with name similar to jane',
            inject([XHRBackend], (mockBackend: MockBackend) => {
                // Create a mockedResponse
                const mockResponse = {
                    Data: {
                        Users: [
                            { MastodonUserId: '1', MastodonDisplayName: 'John Jane' },
                            { MastodonUserId: '2', MastodonDisplayName: 'Jane Smith' },
                            { MastodonUserId: '3', MastodonDisplayName: 'Jane Doe' },
                            { MastodonUserId: '4', MastodonDisplayName: 'Doe Jane' },
                        ]
                    }
                };

                // If there is an HTTP request intercept it and return the above mockedResponse
                mockBackend.connections.subscribe((connection: MockConnection) => {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                });

                // Make the login request from our authentication service
                accountService.searchForUser("Jane").subscribe((usercard) => {
                    expect(usercard[0].MastodonUserId).toBe("1");
                    expect(usercard[0].MastodonDisplayName).toBe("John Jane");
                    expect(usercard[1].MastodonUserId).toBe("2");
                    expect(usercard[1].MastodonDisplayName).toBe("Jane Smith");
                    expect(usercard[2].MastodonUserId).toBe("3");
                    expect(usercard[2].MastodonDisplayName).toBe("Jane Doe");
                    expect(usercard[3].MastodonUserId).toBe("4");
                    expect(usercard[3].MastodonDisplayName).toBe("Doe Jane");
                });
            })
        );

        it('should return an empty array when there is no user with a similar name',
            inject([XHRBackend], (mockBackend: MockBackend) => {
                // Create a mockedResponse
                const mockResponse = {
                    Data: {
                        Users: []
                    }
                };

                // If there is an HTTP request intercept it and return the above mockedResponse
                mockBackend.connections.subscribe((connection: MockConnection) => {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                });

                // Make the login request from our authentication service
                accountService.getUserByID("John").subscribe((user) => {
                    expect(user).toBeUndefined();
                });
            })
        );
    });

    describe('Get Followers of user', () => {
        it('should return an array of users that are following this user',
            inject([XHRBackend], (mockBackend: MockBackend) => {
                // Create a mockedResponse
                const mockResponse = {
                    Data: {
                        Users: [new Account(), new Account(), new Account()]
                    }
                };

                mockResponse.Data.Users[0].FollowsActiveUser = true;
                mockResponse.Data.Users[1].FollowsActiveUser = true;
                mockResponse.Data.Users[2].FollowsActiveUser = true;
                

                // If there is an HTTP request intercept it and return the above mockedResponse
                mockBackend.connections.subscribe((connection: MockConnection) => {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                });

                // Make the login request from our authentication service
                accountService.getFollowers("1").subscribe((usercard) => {
                    expect(usercard[0].FollowsActiveUser).toBeTruthy();
                    expect(usercard[1].FollowsActiveUser).toBeTruthy();
                    expect(usercard[2].FollowsActiveUser).toBeTruthy();
                });
            })
        );

        it('should return an empty array when there is no user that follows the specified user',
            inject([XHRBackend], (mockBackend: MockBackend) => {
                // Create a mockedResponse
                const mockResponse = {
                    Data: {
                        Users: []
                    }
                };

                // If there is an HTTP request intercept it and return the above mockedResponse
                mockBackend.connections.subscribe((connection: MockConnection) => {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                });

                // Make the login request from our authentication service
                accountService.getFollowers("1").subscribe((user) => {
                    expect(user.length).toBe(0);
                });
            })
        );
    });

    describe('Get who a user is following', () => {
        it('should return an array of users that the user is following',
            inject([XHRBackend], (mockBackend: MockBackend) => {
                // Create a mockedResponse
                const mockResponse = {
                    Data: {
                        Users: [new Account(), new Account(), new Account()]
                    }
                };

                mockResponse.Data.Users[0].IsFollowedByActiveUser = true;
                mockResponse.Data.Users[1].IsFollowedByActiveUser = true;
                mockResponse.Data.Users[2].IsFollowedByActiveUser = true;


                // If there is an HTTP request intercept it and return the above mockedResponse
                mockBackend.connections.subscribe((connection: MockConnection) => {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                });

                // Make the login request from our authentication service
                accountService.getFollowing("1").subscribe((usercard) => {
                    expect(usercard[0].IsFollowedByActiveUser).toBeTruthy();
                    expect(usercard[1].IsFollowedByActiveUser).toBeTruthy();
                    expect(usercard[2].IsFollowedByActiveUser).toBeTruthy();
                });
            })
        );

        it('should return an empty array when the user follows no one',
            inject([XHRBackend], (mockBackend: MockBackend) => {
                // Create a mockedResponse
                const mockResponse = {
                    Data: {
                        Users: []
                    }
                };

                // If there is an HTTP request intercept it and return the above mockedResponse
                mockBackend.connections.subscribe((connection: MockConnection) => {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                });

                // Make the login request from our authentication service
                accountService.getFollowing("1").subscribe((user) => {
                    expect(user.length).toBe(0);
                });
            })
        );
    });

    describe('Follow a user', () => {

    });
});