//go:generate go run -tags generate gen.go

package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"runtime"

	"github.com/zserge/lorca"
)

var environment string

func main() {

	args := []string{}

	if runtime.GOOS == "linux" {
		args = append(args, "--class=Lorca")
	}
	ui, err := lorca.New("", "", 800, 600, args...)
	if err != nil {
		log.Fatal(err)
	}
	defer ui.Close()

	// future implementation : read file on drop
	// argsWithoutProg := os.Args[1:]
	// ui.Eval(fmt.Sprintf(`console.log(%v)`, argsWithoutProg))

	// A simple way to know when UI is ready (uses body.onload event in JS)
	ui.Bind("start", func() {
		log.Println("UI is ready")
	})

	ui.Bind("listFiles", func(root string) []fileType { return list(root) })
	ui.Bind("getAppPath", func() string { return getAppPath() })
	ui.Bind("writeFile", func(path string, content string) { saveFile(path, content) })
	ui.Bind("readFile", func(path string) string { return readFile(path) })

	if environment == "production" {
		ln, err := net.Listen("tcp", "127.0.0.1:0")
		if err != nil {
			log.Fatal(err)
		}
		defer ln.Close()
		go http.Serve(ln, http.FileServer(FS))
		ui.Load(fmt.Sprintf("http://%s", ln.Addr()))
	} else {
		ui.Load(fmt.Sprintf("http://localhost:3000"))
	}

	// Wait until the interrupt signal arrives or browser window is closed
	sigc := make(chan os.Signal)
	signal.Notify(sigc, os.Interrupt)
	select {
	case <-sigc:
	case <-ui.Done():
	}

	log.Println("exiting...")
}
