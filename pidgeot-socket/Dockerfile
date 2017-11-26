FROM golang:latest

RUN mkdir -p /go/src/fighter
WORKDIR /go/src/fighter

COPY ./pidgeot-socket ./pidgeot-socket
WORKDIR /go/src/fighter/pidgeot-socket

RUN go build -o main .

cmd ["./main"]
