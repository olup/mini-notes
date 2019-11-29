package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
)

type fileType struct {
	Filename string
	IsDir    bool
}

func list(root string) []fileType {
	var fileArray []fileType

	f, err := os.Open(root)
	if err != nil {
		log.Fatal(err)
	}
	files, err := f.Readdir(-1)
	f.Close()
	if err != nil {
		log.Fatal(err)
	}
	for _, file := range files {
		fileArray = append(fileArray, fileType{file.Name(), file.IsDir()})
	}
	return fileArray
}

func saveFile(path string, content string) {
	fmt.Println("Saving " + path)
	err := ioutil.WriteFile(path, []byte(content), 0644)
	if err != nil {
		panic(err)
	}
}

func readFile(path string) string {
	content, err := ioutil.ReadFile(path)
	if err != nil {
		panic(err)
	}
	return string(content)
}

func getAppPath() string {
	dir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	return dir
}
