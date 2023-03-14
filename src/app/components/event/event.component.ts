import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import * as signalR from '@microsoft/signalr';
import { Event } from 'src/app/shared/models/event.model';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
})
export class EventComponent implements OnInit {
  groupName: string | undefined;
  events: Event[] = [];
  private hubConnection: signalR.HubConnection | undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.groupName = params['name'];
      this.startConnection();
    });
  }

  joinGroup(): void {
    this.hubConnection
      ?.invoke('JoinGroup', this.groupName)
      .then((data) => this.onMessageReceived())
      .catch((error) => console.log(error));
  }

  private startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/chatHub')
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection initialized');
        this.joinGroup();
      })
      .catch((error) => console.log(error));
  }

  private onMessageReceived(): void {
    this.hubConnection?.on('sendtogroup', (data) => {
      console.log(data);

      const event = JSON.parse(data);
      this.events.push({
        details: event.Details,
        id: event.Id,
        dispatchedAt: event.DispatchedAt,
      });
      console.log(this.events);
    });
  }
}
