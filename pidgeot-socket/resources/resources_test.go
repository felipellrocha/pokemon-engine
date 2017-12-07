package resources

import (
  "testing"
)

func TestCheckOverlap (t *testing.T) {
  if ok := IsOverlapping(0, 50, 40, 90); !ok {
    t.Error("Expected true, got ", ok)
  }

  if ok := IsOverlapping(0, 50, 50, 90); !ok {
    t.Error("Expected true, got ", ok)
  }

  if ok := IsOverlapping(0, 50, 51, 90); ok {
    t.Error("Expected false, got ", ok)
  }
}

func TestOverlapCalculation (t *testing.T) {
  if length := CalculateOverlap(0, 50, 40, 90); length != 10 {
    t.Error("Expected 10, got ", length)
  }
}
