﻿import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';

import { ListTypeEnum, EventAlertEnum } from "../../models";
import { StatusService, EventAlertService } from "../../services";
import { PagedList, Status } from "../../models/mastodon";
import { NotificationsService } from "angular2-notifications";

@Component({
    selector: 'status-timeline',
    templateUrl: './status-timeline.component.html',
    styleUrls: ['./status-timeline.component.css']
})
export class StatusTimelineComponent implements OnInit, OnChanges {
    @Input() listType: ListTypeEnum;
    @Input() showStatusForm: boolean = false;
    @Input() autoCheckForStatuses: boolean = false;
    @Input() userID: string;
    @Input() search: string;
    @ViewChild('ps') private scrollBar: any;
    // Status Lists 
    statusList: PagedList<Status> = new PagedList<Status>();
    newStatusList: PagedList<Status> = new PagedList<Status>();
    // Functions to call 
    getInitialFeed: Function;
    getPreviousStatuses: Function;
    checkForNewStatuses: Function;
    // Loading variable
    private loading: boolean = false;


    constructor(private statusService: StatusService, private toastService: NotificationsService, private eventAlertService: EventAlertService) {}

    ngOnInit() {
        // Check for required input - we AT LEAST need to know which types of statuses to get
        if (this.listType < 0) throw new Error("TimelineType is required");

        this.setupFunctions();
        this.getInitialFeed();

        this.eventAlertService.getMessage().subscribe(event => {
            switch (event.eventType) {
                case EventAlertEnum.REMOVE_STATUS: {
                    let statusID: string = event.statusID;

                    for (var i = 0; i < this.statusList.Items.length; i++) {
                        let status = this.statusList.Items[i];
                        if (status.Id === statusID) {
                            if (i > -1) {
                                this.statusList.Items.splice(i, 1);
                            }
                            break;
                        }
                    }

                    break;
                }
            }
        });
    }

    /**
     * On state changes do stuff
     * @param changes shows old value vs new value of state change
     */
    ngOnChanges(changes: SimpleChanges): void {
        if ((changes.search && changes.search.previousValue) || (changes.userID && changes.userID.previousValue)) {
            this.getInitialFeed();
        }
    }

    private setupFunctions() {
        switch (+this.listType) {
            case ListTypeEnum.HOME: {
                // Set getInitialFeed 
                this.getInitialFeed = function (): void {
                    this.statusList.Items = [];
                    this.loading = true;
                    let progress = this.toastService.info("Retrieving", "home timeline ...", { timeOut: 0 });

                    this.statusService.search({ onlyOnActiveUserTimeline: true })
                        .finally(() => this.loading = false)
                        .subscribe(statusList => {
                            this.toastService.remove(progress.id);
                            this.statusList = statusList;
                        }, error => {
                            this.toastService.error("Error", error.error);
                        });
                }

                // Set getPreviousStatuses
                this.getPreviousStatuses = function (): void {
                    this.loading = true;
                    this.statusService.search({ onlyOnActiveUserTimeline: true, maxID: this.statusList.PageInformation.EarlierPageMaxID })
                        .finally(() => this.loading = false)
                        .subscribe(newStatusList => {
                            this.appendItems(this.statusList.Items, newStatusList.Items);
                            this.statusList.PageInformation = newStatusList.PageInformation;
                            this.triggerScroll();
                        });
                }

                // Set checkForNewStatuses
                this.checkForNewStatuses = function (): void {
                    this.statusService.search({ onlyOnActiveUserTimeline: true, sinceID: this.statusList.Items[0].Id })
                        .finally(() => this.loading = false)
                        .subscribe(newStatusList => {
                            this.newStatusList = newStatusList;
                        });
                }
                break;
            }
            case ListTypeEnum.LOCAL: {
                // Set getInitialFeed 
                this.getInitialFeed = function (): void {
                    this.statusList.Items = [];
                    this.loading = true;
                    let progress = this.toastService.info("Retrieving", "local timeline ...", { timeOut: 0 });

                    this.statusService.search({ onlyOnPublicTimeline: true })
                        .finally(() => this.loading = false)
                        .subscribe(statusList => {
                            this.toastService.remove(progress.id);
                            this.statusList = statusList;
                        }, error => {
                            this.toastService.error("Error", error.error);
                        });
                }

                // Set getPreviousStatuses
                this.getPreviousStatuses = function (): void {
                    this.loading = true;
                    this.statusService.search({ onlyOnPublicTimeline: true, maxID: this.statusList.PageInformation.EarlierPageMaxID })
                        .finally(() => this.loading = false)
                        .subscribe(newStatusList => {
                            this.appendItems(this.statusList.Items, newStatusList.Items);
                            this.statusList.PageInformation = newStatusList.PageInformation;
                            this.triggerScroll();
                        });
                }

                // Set checkForNewStatuses
                this.checkForNewStatuses = function (): void {
                    this.statusService.search({ onlyOnPublicTimeline: true, sinceID: this.statusList.Items[0].Id })
                        .finally(() => this.loading = false)
                        .subscribe(newStatusList => {
                            this.newStatusList = newStatusList;
                        });
                }
                break;
            }
            case ListTypeEnum.PROFILE: {
                // Set getInitialFeed 
                this.getInitialFeed = function (): void {
                    this.statusList.Items = [];
                    this.loading = true;
                    this.statusService.search({ authorMastodonUserID: this.userID })
                        .finally(() => this.loading = false)
                        .subscribe(statusList => {
                            this.statusList = statusList;
                        }, error => {
                            this.toastService.error("Error", error.error);
                        });
                }

                // Set getPreviousStatuses
                this.getPreviousStatuses = function (): void {
                    this.loading = true;
                    this.statusService.search({ authorMastodonUserID: this.userID, maxID: this.statusList.PageInformation.EarlierPageMaxID })
                        .finally(() => this.loading = false)
                        .subscribe(newStatusList => {
                            this.appendItems(this.statusList.Items, newStatusList.Items);
                            this.statusList.PageInformation = newStatusList.PageInformation;
                            this.triggerScroll();
                        });
                }

                // Set checkForNewStatuses
                this.checkForNewStatuses = function (): void {
                    this.statusService.search({ authorMastodonUserID: this.userID, sinceID: this.statusList.Items[0].Id })
                        .subscribe(newStatusList => {
                            this.newStatusList = newStatusList;
                        });
                }
                break;
            }
            case ListTypeEnum.SEARCH: {
                // Set getInitialFeed 
                this.loading = true;
                this.getInitialFeed = function (): void {
                    this.statusList.Items = [];
                    this.statusService.search({ hashtag: this.search })
                        .finally(() => this.loading = false)
                        .subscribe(statusList => {
                            this.statusList = statusList;
                        });
                }

                // Set getPreviousStatuses
                this.getPreviousStatuses = function (): void {
                    this.loading = true;
                    this.statusService.search({ hashtag: this.search, maxID: this.statusList.PageInformation.EarlierPageMaxID })
                        .finally(() => this.loading = false)
                        .subscribe(newStatusList => {
                            this.appendItems(this.statusList.Items, newStatusList.Items);
                            this.statusList.PageInformation = newStatusList.PageInformation;
                            this.triggerScroll();
                        });
                }

                // Set checkForNewStatuses
                this.checkForNewStatuses = function (): void {
                    this.statusService.search({ hashtag: this.search, sinceID: this.statusList.Items[0].Id })
                        .subscribe(newStatusList => {
                            this.newStatusList = newStatusList;
                        });
                }
                break;
            }
        }

        if (this.autoCheckForStatuses) setInterval(() => { this.checkForNewStatuses(); }, 10 * 1000);
    }

    /** ----------------------------------------------------------- Button Actions ----------------------------------------------------------- */

    /**
     * Add the new items to main feed array, scroll to top, empty newItems
     */
    private viewNewItems() {
        this.prependItems(this.statusList.Items, this.newStatusList.Items);
        this.scrollToTop();
        this.newStatusList = new PagedList<Status>();
    }

    /**
     * Scrolls the status area to the top
     */
    private scrollToTop() {
        this.scrollBar.directiveRef.scrollToTop(0, 500);
    }

    /** ----------------------------------------------------------- Infinite Scrolling ----------------------------------------------------------- */

    private triggerScroll() {
        this.scrollBar.directiveRef.scrollToY(this.scrollBar.directiveRef.position(true).y - 1);
        this.scrollBar.directiveRef.scrollToY(this.scrollBar.directiveRef.position(true).y + 1);
    }

    /**
     * When reach end of page, load next
     * @param event
     */
    private reachEnd(event: any) {
        // This check prevents this from being called prematurely on page load
        if (event.target.getAttribute('class').indexOf("ps--scrolling-y") >= 0) {
            this.getPreviousStatuses();
        }
    }

    /** Infinite Scrolling Handling */
    private addItems(oldItems: any[], newItems: any[], _method: any) {
        oldItems[_method].apply(oldItems, newItems);
    }

    /**
     * Add items to end of list
     * @param startIndex
     * @param endIndex
     */
    private appendItems(oldItems: any[], newItems: any[]) {
        this.addItems(oldItems, newItems, 'push');
    }

    /**
     * Add items to beginning of list
     * @param startIndex
     * @param endIndex
     */
    private prependItems(oldItems: any[], newItems: any[]) {
        this.addItems(oldItems, newItems, 'unshift');
    }

}
