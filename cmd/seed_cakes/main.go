// seed_cakes — Seeds sample cakes + variants directly into the SQLite DB.
// Run with: go run ./cmd/seed_cakes
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/alvinjames-max/jeycyl/internal/database"
	"github.com/alvinjames-max/jeycyl/internal/models"
	"github.com/alvinjames-max/jeycyl/internal/repository"
)

type variantSeed struct {
	size   string
	flavor string
	mod    float64
}

type cakeSeed struct {
	cake     *models.Cake
	variants []variantSeed
}

func main() {
	dbPath := "./orders.db"
	if len(os.Args) > 1 {
		dbPath = os.Args[1]
	}

	db, err := database.New(dbPath)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer db.Close()

	cakeRepo := repository.NewCakeRepository(db)

	seeds := []cakeSeed{
		{
			cake: &models.Cake{Name: "Classic Chocolate Fudge", Description: "Rich, velvety chocolate cake layered with silky fudge frosting. A timeless crowd-pleaser for every occasion.", BasePrice: 2500, IsAvailable: true},
			variants: []variantSeed{{"6 inch", "", 0}, {"8 inch", "", 800}, {"10 inch", "", 1800}},
		},
		{
			cake: &models.Cake{Name: "Vanilla Bean Dream", Description: "Light, fluffy vanilla sponge with real Madagascar vanilla bean buttercream. Elegant and universally loved.", BasePrice: 2200, IsAvailable: true},
			variants: []variantSeed{{"6 inch", "", 0}, {"8 inch", "", 700}, {"10 inch", "", 1500}},
		},
		{
			cake: &models.Cake{Name: "Red Velvet Royale", Description: "Striking crimson sponge with tangy cream cheese frosting. A showstopper for birthdays and celebrations.", BasePrice: 2800, IsAvailable: true},
			variants: []variantSeed{{"6 inch", "", 0}, {"8 inch", "", 900}},
		},
		{
			cake: &models.Cake{Name: "Lemon Drizzle Delight", Description: "Zesty lemon sponge soaked in tangy lemon syrup, topped with a crisp sugar glaze. Bright and refreshing.", BasePrice: 2000, IsAvailable: true},
			variants: []variantSeed{{"6 inch", "", 0}, {"8 inch", "", 600}},
		},
		{
			cake: &models.Cake{Name: "Strawberry Bliss", Description: "Fresh strawberry sponge with whipped cream and macerated strawberry compote. A summer favourite all year round.", BasePrice: 2600, IsAvailable: true},
			variants: []variantSeed{{"6 inch", "", 0}, {"8 inch", "Extra berries", 1000}},
		},
		{
			cake: &models.Cake{Name: "Caramel Salted Toffee", Description: "Moist caramel sponge drizzled with hand-made salted toffee sauce, topped with crunchy praline pieces.", BasePrice: 3000, IsAvailable: true},
			variants: []variantSeed{{"6 inch", "", 0}, {"8 inch", "", 1000}, {"10 inch", "", 2000}},
		},
		{
			cake: &models.Cake{Name: "Carrot & Walnut", Description: "Warmly spiced carrot cake packed with walnuts and topped with rich cream cheese frosting. Wholesome and indulgent.", BasePrice: 2400, IsAvailable: true},
			variants: []variantSeed{{"6 inch", "", 0}, {"8 inch", "", 700}},
		},
		{
			cake: &models.Cake{Name: "Black Forest Gateau", Description: "Layers of dark chocolate sponge, whipped cream and morello cherries, finished with chocolate shavings.", BasePrice: 3200, IsAvailable: true},
			variants: []variantSeed{{"8 inch", "", 0}, {"10 inch", "", 1200}},
		},
		{
			cake: &models.Cake{Name: "Coconut Paradise", Description: "Tender coconut sponge with coconut cream filling and toasted desiccated coconut coating. Tropical and exotic.", BasePrice: 2700, IsAvailable: true},
		},
		{
			cake: &models.Cake{Name: "Mango Tango Chiffon", Description: "Light chiffon cake layered with fresh mango mousse and real mango chunks. A Kenyan summer in a slice.", BasePrice: 2900, IsAvailable: true},
		},
		{
			cake: &models.Cake{Name: "Wedding Elegance Tier", Description: "Our signature multi-tier white fondant wedding cake, customisable with your colour scheme and floral decorations.", BasePrice: 8500, IsAvailable: true},
			variants: []variantSeed{{"2 Tier", "", 0}, {"3 Tier", "Custom colours", 4000}, {"4 Tier", "Full custom", 9000}},
		},
		{
			cake: &models.Cake{Name: "Birthday Funfetti", Description: "Colourful funfetti sponge packed with rainbow sprinkles inside and out. The ultimate fun birthday cake for all ages.", BasePrice: 1800, IsAvailable: false},
		},
	}

	for _, s := range seeds {
		id, err := cakeRepo.Create(s.cake)
		if err != nil {
			log.Printf("SKIP cake %q: %v", s.cake.Name, err)
			continue
		}
		fmt.Printf("✓ Cake #%d: %s @ KES %.0f\n", id, s.cake.Name, s.cake.BasePrice)

		for _, v := range s.variants {
			_, err := db.Exec(
				`INSERT INTO cake_variants (cake_id, size, flavor, price_modifier) VALUES (?, ?, ?, ?)`,
				id, v.size, v.flavor, v.mod,
			)
			if err != nil {
				log.Printf("  SKIP variant %s: %v", v.size, err)
			} else {
				extra := ""
				if v.flavor != "" {
					extra = " (" + v.flavor + ")"
				}
				fmt.Printf("  + %s%s +KES %.0f\n", v.size, extra, v.mod)
			}
		}
	}

	fmt.Println("\n✅ Seeding complete! Run: go run ./cmd/server")
}
