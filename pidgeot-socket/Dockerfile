FROM golang:latest

RUN mkdir -p /go/src/fighter
WORKDIR /go/src/fighter

COPY ./pidgeot-socket ./pidgeot-socket

RUN go build -o main ./pidgeot-socket
cmd ["./main"]
