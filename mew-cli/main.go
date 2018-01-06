package main

import (
  "github.com/spf13/cobra"
)

func main() {
  root := &cobra.Command{
    Use: "mew",
    Short: "Maintain the project",
  }

  root.AddCommand(PidgeotCreateAI)

  root.Execute()
}
