package usecase

import (
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"

	midtransPkg "github.com/akuaruu/apomacy/backend/pkg/transaction"
)

type PaymentUsecase struct{}

func NewPaymentUsecase() *PaymentUsecase {
	return &PaymentUsecase{}
}

func (u *PaymentUsecase) GenerateSnapToken(orderID string, grossAmount int64, paymentMethod string) (string, error) {
	// Filter metode pembayaran yang akan ditampilkan di Pop-up
	var enabledPayments []snap.SnapPaymentType

	switch paymentMethod {
	case "qris":
		enabledPayments = []snap.SnapPaymentType{
			snap.SnapPaymentType("gopay"),
			snap.SnapPaymentType("other_qris"),
		}
	case "bca_va":
		enabledPayments = []snap.SnapPaymentType{
			snap.SnapPaymentType("bca_va"),
		}
	case "mandiri_va":
		enabledPayments = []snap.SnapPaymentType{
			snap.SnapPaymentType("echannel"), // Catatan: Midtrans menggunakan kode "echannel" untuk Mandiri VA
		}
	default:
		// Fallback jika tidak ada yang cocok, tampilkan semua
		enabledPayments = []snap.SnapPaymentType{
			snap.SnapPaymentType("gopay"),
			snap.SnapPaymentType("bca_va"),
		}
	}

	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID,
			GrossAmt: grossAmount,
		},
		EnabledPayments: enabledPayments, // Masukkan array yang sudah difilter
	}

	snapResp, err := midtransPkg.SnapClient.CreateTransaction(req)
	if err != nil {
		return "", err
	}

	return snapResp.Token, nil
}
