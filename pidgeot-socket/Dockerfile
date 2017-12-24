FROM golang:latest

RUN mkdir -p /go/src/game
WORKDIR /go/src/game

COPY ./pidgeot-socket ./pidgeot-socket
WORKDIR /go/src/game/pidgeot-socket

RUN go build -o main .

cmd ["./main"]
