package repository

import (
	"database/sql"
	"fmt"

	"github.com/alvinjames-max/jeycyl/internal/models"
)

type AdminRepository struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) *AdminRepository {
	return &AdminRepository{db: db}
}