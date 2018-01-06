package main

import (
  "fmt"
  "os"
  "strings"
  "io/ioutil"
  "path/filepath"

  "text/template"

  "github.com/spf13/cobra"
)

var PidgeotCreateAI = &cobra.Command{
  Use: "pidgeot",
  Short: "Maintain the Pidgeot microservice",
  Run: func(cmd *cobra.Command, args []string) {
    dir, _ := os.Getwd()

    files, _ := ioutil.ReadDir("./")

    for _, f := range files {
      filename := f.Name()
      source := string(filepath.Join(dir, filename)[:])
      destination := source[:len(source) - 2] + "go"

      stat, err := os.Stat(source)
      if (err == nil && stat.IsDir()) || !strings.HasSuffix(source, "ai") {
        continue
      }

      d, err := ParseFile(source)
      if err != nil {
        fmt.Println(err)
      }

      data := d.(*Data)

      file, _ := ioutil.ReadFile(source)

      data.Body = string(file)

      templatePath := filepath.Join(dir, "templates/", data.Template)
      tpl, _ := template.ParseFiles(templatePath)

      dest, err := os.Create(destination)
      if err != nil {
          return
      }
      defer dest.Close()

      tpl.Execute(dest, data)
    }
  },
}
