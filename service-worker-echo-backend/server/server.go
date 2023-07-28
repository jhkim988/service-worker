package main

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type Number struct {
	Value int64 `json:"value"`
}

func main() {
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{"*"},
	}))
	e.POST("/echo", func(c echo.Context) error {
		number := new(Number)
		if err := c.Bind(number); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		fmt.Printf("number %d\n", number.Value)
		return c.JSON(http.StatusOK, number)
	})

	e.Logger.Fatal(e.Start(":8080"))
}
