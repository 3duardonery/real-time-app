import { Component, OnInit } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'PushAppNotifications';
  messages: string[] = [];
  private hubConnection: signalR.HubConnection | undefined;

  ngOnInit(): void {
    // this.startConnection();
    // this.onMessageReceived();
  }

  private startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/chatHub')
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection initialized'))
      .catch((error) => console.log(error));
  }

  private onMessageReceived(): void {
    this.hubConnection?.on('sendmessage', (message) => {
      console.log(message);
    });
  }
}
