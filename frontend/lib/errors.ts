import axios from "axios";

interface ApiErrorPayload {
  error?: unknown;
  message?: unknown;
  detail?: unknown;
  error_messages?: unknown;
}

const asText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const extractApiMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message.trim() : "";
  }

  const data: unknown = error.response?.data;
  if (typeof data === "string") return data.trim();
  if (!data || typeof data !== "object") return error.message.trim();

  const payload = data as ApiErrorPayload;

  if (Array.isArray(payload.error_messages)) {
    return payload.error_messages.map(asText).filter(Boolean).join(" ");
  }

  return (
    asText(payload.error) ||
    asText(payload.message) ||
    asText(payload.detail) ||
    error.message.trim()
  );
};

const isTechnicalMessage = (message: string): boolean =>
  /(?:sqlstate|duplicate key|unique constraint|foreign key|violates .* constraint|cannot scan|failed to scan|invalid input syntax|pq:|pgx|postgres|queryrow|rows affected|internal server|panic|stack trace|relation .* does not exist|column .* does not exist)/i.test(
    message,
  );

const mapKnownMessage = (message: string): string | null => {
  const normalized = message.toLowerCase();

  if (/duplicate key|unique constraint|sudah digunakan|already exists/.test(normalized)) {
    if (/email|username|user_username|user_email/.test(normalized)) {
      return "Email tersebut sudah terdaftar. Gunakan email lain atau masuk dengan akun yang sudah ada.";
    }
    if (/no_telp|telepon|phone/.test(normalized)) {
      return "Nomor telepon tersebut sudah terdaftar. Gunakan nomor lain.";
    }
    if (/no_member/.test(normalized)) {
      return "Nomor member sudah digunakan. Muat ulang halaman lalu coba kembali.";
    }
    if (/kode_obat/.test(normalized)) {
      return "Kode obat sudah digunakan. Gunakan kode yang berbeda.";
    }
    if (/kode_supplier/.test(normalized)) {
      return "Kode supplier sudah digunakan. Gunakan kode yang berbeda.";
    }
    if (/no_transaksi/.test(normalized)) {
      return "Nomor transaksi sudah digunakan. Silakan ulangi proses transaksi.";
    }
    return "Data yang sama sudah terdaftar. Periksa kembali input Anda.";
  }

  if (/foreign key|violates foreign key/.test(normalized)) {
    return "Data tidak dapat diproses karena masih digunakan oleh data lain.";
  }
  if (/username atau password salah|kredensial/.test(normalized)) {
    return "Email atau kata sandi salah. Periksa kembali data login Anda.";
  }
  if (/token tidak valid|expired|header authorization|sesi tidak valid/.test(normalized)) {
    return "Sesi Anda telah berakhir. Silakan masuk kembali.";
  }
  if (/stok .*tidak mencukupi|stok obat tidak mencukupi/.test(normalized)) {
    return "Stok obat tidak mencukupi. Perbarui jumlah item lalu coba kembali.";
  }
  if (/upload ke storage|upload ke supabase|supabase storage|konfigurasi env supabase|status(?: code)?\s*:?\s*\d+/.test(normalized)) {
    return "File gagal diunggah ke penyimpanan. Periksa kembali format dan ukuran file, lalu coba kembali.";
  }
  if (/format request|binding|required field/.test(normalized)) {
    return "Format data belum sesuai. Periksa kembali semua kolom yang wajib diisi.";
  }
  if (/tidak ditemukan|not found/.test(normalized)) {
    return "Data yang diminta tidak ditemukan atau sudah dihapus.";
  }

  return null;
};

export const getErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

export function getUserFriendlyError(
  error: unknown,
  fallback = "Terjadi kesalahan. Silakan coba kembali.",
): string {
  const rawMessage = extractApiMessage(error);
  const mapped = rawMessage ? mapKnownMessage(rawMessage) : null;
  if (mapped) return mapped;

  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "Permintaan terlalu lama diproses. Periksa koneksi Anda lalu coba kembali.";
    }
    if (!error.response) {
      return "Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba kembali.";
    }

    if (error.response.status === 401) return "Sesi Anda telah berakhir. Silakan masuk kembali.";
    if (error.response.status === 403) return "Anda tidak memiliki izin untuk melakukan tindakan ini.";
    if (error.response.status === 404) return "Data yang diminta tidak ditemukan atau sudah dihapus.";
  }

  if (!rawMessage) return fallback;
  if (isTechnicalMessage(rawMessage)) return fallback;

  return rawMessage.length <= 180 ? rawMessage : fallback;
}
