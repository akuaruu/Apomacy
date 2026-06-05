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

func (u *PaymentUsecase) GenerateSnapToken(orderID string, grossAmount int64, paymentMethod string, items []midtrans.ItemDetails) (string, error) {

	// 1. Logika Bypass Menu Pembayaran (Hanya masukkan 1 opsi spesifik)
	var enabledPayments []snap.SnapPaymentType

	switch paymentMethod {
	case "qris":
		enabledPayments = []snap.SnapPaymentType{snap.SnapPaymentType("other_qris")}
	case "bca":
		enabledPayments = []snap.SnapPaymentType{snap.SnapPaymentType("bca_va")}
	case "mandiri":
		enabledPayments = []snap.SnapPaymentType{snap.SnapPaymentType("echannel")}
	default:
		enabledPayments = []snap.SnapPaymentType{snap.SnapPaymentType("other_qris")}
	}

	// 2. Buat Request ke Midtrans
	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID,
			GrossAmt: grossAmount,
		},
		EnabledPayments: enabledPayments,
		Items:           &items, // Masukkan daftar barang agar tidak kosong!
	}

	snapResp, err := midtransPkg.SnapClient.CreateTransaction(req)
	if err != nil {
		return "", err
	}

	return snapResp.Token, nil
}
