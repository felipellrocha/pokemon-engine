FROM golang:latest

RUN mkdir -p /go/src/pidgeot-socket
WORKDIR /go/src/pidgeot-socket

COPY ./pidgeot-socket .

RUN go build -o main .
cmd ["./main"]
