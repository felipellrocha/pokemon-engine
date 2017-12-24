package resources

import (
	"fmt"

  "bytes"
  "net/http"
  "time"

  "github.com/gorilla/websocket"

  "game/pidgeot-socket/ecs"
)


const (
  // Time allowed to write a message to the peer.
  writeWait = 10 * time.Second

  // Time allowed to read the next pong message from the peer.
  pongWait = 60 * time.Second

  // Send pings to peer with this period. Must be less than pongWait.
  pingPeriod = (pongWait * 9) / 10

  // Maximum message size allowed from peer.
  maxMessageSize = 1500

  MTU = 1500
)

var (
  newline = []byte{'\n'}
  space   = []byte{' '}
)

type Client struct {
  Eid ecs.EID
  hub *Hub
  conn *websocket.Conn
  send chan []byte
}

func (c *Client) ReadPump() {
  defer func() {
    c.hub.unregister <- c
    c.conn.Close()
  }()

  c.conn.SetReadLimit(maxMessageSize)
  c.conn.SetReadDeadline(time.Now().Add(pongWait))
  c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

  for {
    _, message, err := c.conn.ReadMessage()
    if err != nil {
      if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) { fmt.Printf("%+v\n", err) }
      break
    }
    message = bytes.Trim(message, " \n\t")
    input := Input{
      Eid: c.Eid,
    }

    if err := GetInput(message, &input); err != nil { fmt.Println("Input error", err) }
    select {
      case c.hub.Inputs <-input:
      default:
        fmt.Println("Missed input: ", input)
    }
  }
}

func (c *Client) WritePump() {
  ticker := time.NewTicker(pingPeriod)
  defer func() {
    ticker.Stop()
    c.conn.Close()
  }()

  for {
    select {
    case message, ok := <-c.send:
      c.conn.SetWriteDeadline(time.Now().Add(writeWait))

      if !ok {
        c.conn.WriteMessage(websocket.CloseMessage, []byte{})
        return
      }

      w, err := c.conn.NextWriter(websocket.BinaryMessage)
      if err != nil { return }
      w.Write(message)

      n := len(c.send)
      for i := 0; i < n; i++ {
        w.Write(<-c.send)
      }

      if err := w.Close(); err != nil { return }
    case <-ticker.C:
      c.conn.SetWriteDeadline(time.Now().Add(writeWait))
      if err := c.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
        return
      }
    }
  }
}

func ServeWS(hub *Hub, w http.ResponseWriter, r *http.Request) {

  protocol := make([]string, 1)
  protocol[0] = "binary"

  var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    Subprotocols: protocol,
    CheckOrigin: func(r *http.Request) bool {
      // permissive for now
      return true
    },
  }

  conn, err := upgrader.Upgrade(w, r, nil)
  if err != nil {
    panic(err)
  }

  client := &Client{hub: hub, conn: conn, send: make(chan []byte, MTU)}

  client.hub.register <- client

  go client.WritePump()
  go client.ReadPump()
}
