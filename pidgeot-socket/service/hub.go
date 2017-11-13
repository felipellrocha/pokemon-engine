package service

import (
	"fmt"
)

type Hub struct {
  clients map[*Client]bool
  broadcast chan []byte
  register chan *Client
  unregister chan *Client
}

func NewHub() *Hub {
  return &Hub{
    broadcast: make(chan []byte),
    register: make(chan *Client),
    unregister: make(chan *Client),
    clients: make(map[*Client]bool),
  }
}

func (h *Hub) Run() {
  for {
    select {
    case client := <-h.register:
			fmt.Println("registering")
      h.clients[client] = true
    case client := <-h.unregister:
			fmt.Println("unregistering")
      if _, ok := h.clients[client]; ok {
        delete(h.clients, client)
        close(client.send)
      }
    case message := <-h.broadcast:
			fmt.Println("messaging")
      for client := range h.clients {
        select {
        case client.send <- message:
        default:
          close(client.send)
          delete(h.clients, client)
        }
      }
    }
  }
}
