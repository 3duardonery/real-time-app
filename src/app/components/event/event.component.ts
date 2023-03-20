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

  get connectionStatus(): boolean {
    return this.hubConnection?.state == signalR.HubConnectionState.Connected;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.groupName = params['name'];
      this.startConnection();
    });
  }

  /* Estabelece uma conxão com o Hub do SignalR
   */
  private startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/eventHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection initialized');
        this.joinGroup();
      })
      .catch((error) => console.log(error));

    this.hubConnection.onreconnected(() => {
      this.hubConnection?.off('sendtogroup');
      this.joinGroup();
    });
  }

  /* 
  Faz a chamada ao metodo do hub chamado JoinGroup onde o signalR 
  criar um grupo se não existir e adiciona 
  a conexão que está requisitando, ao finalizar essa ação a 
  aplicação cria um listennig para ficar no aguardo das 
  mensagens trocadas dentro desse grupo
   */
  joinGroup(): void {
    this.hubConnection
      ?.invoke('JoinGroup', this.groupName)
      .then(() => this.onMessageReceived())
      .catch((error) => console.log(error));
  }

  /* Habilita um listener para ficar ouvindo tudo que acontece dentro do grupo e do metodo sentogroup
   */
  private onMessageReceived(): void {
    this.hubConnection?.on('sendtogroup', (data) => {
      const event = JSON.parse(data);
      this.events.push({
        title: event.Title,
        id: event.Id,
        dispatchedAt: event.DispatchedAt,
        message: event.Message,
        link: event.Link,
      });
    });
  }
}
