package ecs

import (
  "fmt"
  "bytes"
  "encoding/binary"
)

func GetLengthInBytes(data []byte) []byte {
  buffer := new(bytes.Buffer)

  length := len(data)

  if err := binary.Write(buffer, binary.LittleEndian, uint64(length)); err != nil { fmt.Println("error!", err) }

  return append(buffer.Bytes(), data...)
}

