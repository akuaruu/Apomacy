package midtrans

import (
	"log"
	"os"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

// SnapClient akan digunakan oleh Usecase nanti
var SnapClient snap.Client

func Init() {
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	if serverKey == "" {
		log.Fatal("MIDTRANS_SERVER_KEY belum di-set di .env")
	}

	env := midtrans.Sandbox
	if os.Getenv("MIDTRANS_IS_PRODUCTION") == "true" {
		env = midtrans.Production
	}

	SnapClient.New(serverKey, env)
	log.Println("Midtrans Snap Client berhasil diinisialisasi")
}
