package model

import "context"

type Kategori struct {
	ID           int    `json:"id_kategori"`
	NamaKategori string `json:"nama_kategori"`
}

type ObatKategori struct {
	IDObat     int `json:"id_obat"`
	IDKategori int `json:"id_kategori"`
}

type KategoriRepository interface {
	Create(ctx context.Context, kategori *Kategori) error
	GetAll(ctx context.Context) ([]Kategori, error)

	// Fungsi khusus untuk bridge table
	AssignObatToKategori(ctx context.Context, idObat, idKategori int) error
	RemoveObatFromKategori(ctx context.Context, idObat, idKategori int) error
}

type KategoriUsecase interface {
	CreateKategori(ctx context.Context, kategori *Kategori) error
	GetAllKategori(ctx context.Context) ([]Kategori, error)
	AssignObat(ctx context.Context, idObat, idKategori int) error
	RemoveObat(ctx context.Context, idObat, idKategori int) error
}
