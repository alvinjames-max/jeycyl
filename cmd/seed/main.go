package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"
	"golang.org/x/term"

	"github.com/alvinjames-max/jeycyl/internal/database"
	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
)

func main() {
	username := flag.String("username", "", "admin username (required)")
	dbPath := flag.String("db", "./orders.db", "path to the SQLite database")
	flag.Parse()

	if *username == "" {
		fmt.Fprintln(os.Stderr, "usage: go run cmd/seed/main.go -username=<name>")
		os.Exit(1)
	}

	db, err := database.New(*dbPath)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer db.Close()

	adminRepo := repository.NewAdminRepository(db)

	existing, err := adminRepo.GetByUsername(*username)
	if err != nil {
		log.Fatalf("checking existing admin: %v", err)
	}
	if existing != nil {
		log.Fatalf("admin %q already exists", *username)
	}

	fmt.Print("Enter password: ")
	passwordBytes, err := term.ReadPassword(int(os.Stdin.Fd()))
	fmt.Println()
	if err != nil {
		log.Fatalf("reading password: %v", err)
	}
	if len(passwordBytes) < 8 {
		log.Fatal("password must be at least 8 characters")
	}

	fmt.Print("Confirm password: ")
	confirmBytes, err := term.ReadPassword(int(os.Stdin.Fd()))
	fmt.Println()
	if err != nil {
		log.Fatalf("reading password confirmation: %v", err)
	}
	if string(passwordBytes) != string(confirmBytes) {
		log.Fatal("passwords do not match")
	}

	hash, err := bcrypt.GenerateFromPassword(passwordBytes, bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("hashing password: %v", err)
	}

	id, err := adminRepo.Create(&models.Admin{
		Username:     *username,
		PasswordHash: string(hash),
	})
	if err != nil {
		log.Fatalf("creating admin: %v", err)
	}

	fmt.Printf("admin %q created with id %d\n", *username, id)
}
