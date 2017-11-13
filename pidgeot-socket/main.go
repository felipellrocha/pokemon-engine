package main

import (
  "fmt"
  "net/http"

  "pidgeot-socket/service"
)

func Health(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")
  w.Write([]byte(`{"status": "ok"}`))
}

func main() {
  hub := service.NewHub()
  go hub.Run()

  http.HandleFunc("/health", Health)
  http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
    fmt.Println("connecting...")
    //fmt.Printf("%#v \n %#v \n", w, r)
    service.ServeWS(hub, w, r)
  })

  fmt.Println("Listening on port 8000")
  if err := http.ListenAndServe("0.0.0.0:8000", nil); err != nil {
    panic(err)
  }
}
