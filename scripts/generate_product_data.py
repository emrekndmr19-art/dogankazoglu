#!/usr/bin/env python3
"""Generate a unified product JSON file from the CSV catalog sources."""

from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATHS = [
    BASE_DIR / "dogankazoglu1.csv",
    BASE_DIR / "dogankazoglu2.csv",
]
OUTPUT_ALL = BASE_DIR / "urunler.json"

TURKISH_TRANSLATION_TABLE = str.maketrans("ÇĞİÖŞÜ", "CGIOSU")

FOOD_PREFIXES = {"BHR", "CAY", "KHV", "SKR"}
FOOD_KEYWORDS = {
    "KAHVE",
    "NESCAFE",
    "CAFE",
    "ÇAY",
    "CAY",
    "LIPTON",
    "DOGUS",
    "DOĞUŞ",
    "BAHARAT",
    "KARABIBER",
    "PULBIBER",
    "TUZ",
    "SEKER",
    "ŞEKER",
}

CHEMICAL_PREFIXES = {"KMY"}
CHEMICAL_KEYWORDS = {
    "DETERJAN",
    "TEMIZLEYICI",
    "TEMİZLEYİCİ",
    "SABUN",
    "PARLATICI",
    "SOKUCU",
    "SÖKÜCÜ",
    "YUMUSATICI",
    "YUMUŞATICI",
    "PARFUM",
    "PARFÜM",
    "KIREC",
    "KIREÇ",
    "PAS",
    "CAM",
    "KREM",
}

PAPER_KEYWORDS = {
    "HAVLU",
    "PECETE",
    "PEÇETE",
    "TUVALET",
    "KAGIDI",
    "KAGIT",
    "KAĞIT",
    "DISPENSER",
    "ICHTEN",
    "ICTEN",
    "JUMBO",
}

PLASTIC_PREFIXES = {"PLS", "ELD", "HJY", "APR", "EKJ"}
PLASTIC_KEYWORDS = {
    "PLASTIK",
    "PLASTİK",
    "ELDIVEN",
    "ELDİVEN",
    "PIPET",
    "PİPET",
    "SOS",
    "BARDAK",
    "TABAK",
    "KASE",
    "BONE",
    "GALOŞ",
    "GALOS",
    "KOLLUK",
    "MOP",
    "KOVA",
    "CEKPAS",
    "ÇEKPAS",
    "SAP",
    "FIRCA",
    "FIRÇA",
    "APARAT",
}

PACKAGING_PREFIXES = {"PST", "ALM", "KRT", "STR", "LST", "BNT", "SZD", "AHS", "KRS"}
PACKAGING_KEYWORDS = {
    "POSET",
    "POŞET",
    "ALUMINYUM",
    "ALÜMİNYUM",
    "STREC",
    "STREÇ",
    "KILIT",
    "KİLİT",
    "SIZDIRMAZ",
    "KUTU",
    "TEPSI",
    "TEPSİ",
    "KAPAK",
    "KAP",
    "KASA",
    "LASTIK",
    "LASTİK",
    "RULO",
    "MUAYENE",
    "MASA",
    "ORTUSU",
    "ORTÜSÜ",
    "KRAFT",
    "GAZETE",
    "CANTA",
    "ÇANTA",
    "SERVIS",
    "SERVİS",
}

STATIONERY_PREFIXES = {"KGT"}
STATIONERY_KEYWORDS = {
    "FOTOKOPI",
    "FOTOKOPİ",
    "YAZARKASA",
    "YAZAR KASA",
    "FIS",
    "FİŞ",
    "Z RAPORU",
}

BASKILI_CODE_PATTERNS = ("-BLI", ".AMR", ".SFT")
BASKILI_KEYWORDS = {"BASKILI"}


def _simplify(value: Optional[str]) -> str:
    if not value:
        return ""
    return value.upper().translate(TURKISH_TRANSLATION_TABLE)


def _normalise_multiline(value: str) -> Optional[str]:
    parts = [part.strip() for part in value.replace("\r", "").split("\n") if part.strip()]
    if not parts:
        return None
    return " | ".join(parts)


def _clean_value(value: str) -> Optional[str]:
    value = value.strip()
    return value or None


def _contains_any(value: str, keywords: Iterable[str]) -> bool:
    if not value:
        return False
    return any(keyword and keyword in value for keyword in keywords)


def _assign_group(code: str, name: str, info: Optional[str] = None) -> str:
    simplified_code = _simplify(code)
    simplified_name = _simplify(name)
    simplified_info = _simplify(info)

    prefix = simplified_code.split(".")[0].split("-")[0]

    def matches(keywords: Iterable[str]) -> bool:
        return _contains_any(simplified_name, keywords) or _contains_any(simplified_info, keywords)

    if prefix in FOOD_PREFIXES or matches(FOOD_KEYWORDS):
        return "Gıda Grubu"

    if prefix in CHEMICAL_PREFIXES or matches(CHEMICAL_KEYWORDS):
        return "Kimyasal Grubu"

    if (
        any(pattern in simplified_code for pattern in BASKILI_CODE_PATTERNS)
        or matches(BASKILI_KEYWORDS)
    ):
        return "Baskılı Model Grubu"

    is_packaging_prefix = prefix in PACKAGING_PREFIXES
    is_plastic_prefix = prefix in PLASTIC_PREFIXES
    is_stationery_prefix = prefix in STATIONERY_PREFIXES
    is_master_prefix = prefix == "MASTER"

    looks_packaging = matches(PACKAGING_KEYWORDS)
    looks_plastic = matches(PLASTIC_KEYWORDS)
    looks_stationery = matches(STATIONERY_KEYWORDS)
    looks_paper = matches(PAPER_KEYWORDS) or is_master_prefix

    if is_stationery_prefix or looks_stationery:
        if looks_packaging:
            return "Ambalaj Grubu"
        return "Kırtasiye Grubu"

    if is_packaging_prefix:
        return "Ambalaj Grubu"

    if is_plastic_prefix:
        return "Plastik Grubu"

    if is_master_prefix:
        if looks_packaging:
            return "Ambalaj Grubu"
        return "Kağıt Grubu"

    if looks_plastic:
        return "Plastik Grubu"

    if looks_packaging:
        return "Ambalaj Grubu"

    if looks_paper:
        return "Kağıt Grubu"

    if simplified_name and ("URUN" in simplified_name or "ÜRÜN" in simplified_name):
        return "Ambalaj Grubu"

    return "Ambalaj Grubu"


def _assign_subcategory(name: str) -> str:
    upper_name = (name or "").upper()

    if "MASA ÖRTÜSÜ" in upper_name:
        return "Masa Örtüleri"
    if "Z HAVLU" in upper_name:
        return "Z Kat Havlular"
    if "HAREKETLİ HAVLU" in upper_name:
        return "Hareketli Havlu Ruloları"
    if "İÇTEN ÇEKME HAVLU" in upper_name:
        return "İçten Çekmeli Havlular"
    if "MİNİ İÇTEN ÇEKME" in upper_name:
        return "Mini İçten Çekme Kağıtlar"
    if "MİNİ JUMBO" in upper_name:
        return "Mini Jumbo Tuvalet Kağıtları"
    if "İÇTEN ÇEKME TUVALET KAĞIDI" in upper_name:
        return "İçten Çekmeli Tuvalet Kağıtları"
    if "EV TİPİ HAVLU" in upper_name:
        return "Ev Tipi Havlular"
    if "TUVALET KAĞIDI" in upper_name:
        return "Tuvalet Kağıtları"
    if "V KAT" in upper_name:
        return "V Kat Kağıt Ürünleri"
    if "DİSPENSER PEÇETE" in upper_name:
        return "Dispenser Peçeteler"
    if "GARSON PEÇETE" in upper_name:
        return "Garson Peçeteler"
    if "KARE PEÇETE" in upper_name:
        return "Kare Peçeteler"
    if "MENDİL" in upper_name:
        return "Mendiller"
    if "HAVLU" in upper_name:
        return "Kağıt Havlular"

    if "ELDİVEN" in upper_name:
        return "Tek Kullanımlık Eldivenler"
    if "BONE" in upper_name or "GALOŞ" in upper_name or "KOLLUK" in upper_name:
        return "Kişisel Koruyucu Ürünler"
    if "PİPET" in upper_name:
        return "Pipetler"
    if "SOS KAP" in upper_name:
        return "Sos Kapları"
    if "BARDAK" in upper_name:
        if "KARTON" in upper_name or "PAP" in upper_name:
            return "Karton Bardaklar"
        return "Plastik Bardaklar"
    if "TABAK" in upper_name:
        return "Servis Tabakları"
    if "KASE" in upper_name:
        return "Servis Kaseleri"
    if "STREÇ" in upper_name:
        return "Streç Filmler"

    if "ALÜMİNYUM" in upper_name and "KAPAK" in upper_name:
        return "Alüminyum Kapaklar"
    if "ALÜMİNYUM" in upper_name:
        return "Alüminyum Kaplar"
    if "SIZDIRMAZ" in upper_name:
        return "Sızdırmaz Kaplar"
    if "LASTİK" in upper_name:
        return "Paketleme Lastikleri"
    if "KARIŞTIRICI" in upper_name or "KÜRDAN" in upper_name:
        return "Servis Aksesuarları"
    if "BANT" in upper_name:
        return "Paketleme Bantları"

    if "POŞET" in upper_name:
        if "ÇÖP" in upper_name or "KONTEYNER" in upper_name or "DÖK" in upper_name:
            return "Çöp Poşetleri"
        if "KİLİTLİ" in upper_name:
            return "Kilitli Poşetler"
        if "GIDA" in upper_name or "ŞARKÜTERİ" in upper_name:
            return "Gıda Poşetleri"
        if "TAKVİYELİ" in upper_name:
            return "Takviyeli Taşıma Poşetleri"
        return "Taşıma Poşetleri"

    if "RULO" in upper_name and "POŞET" not in upper_name:
        return "Rulo Ürünler"

    if "FOTOKOP" in upper_name or "A4" in upper_name:
        return "Ofis Kağıtları"
    if "KASA" in upper_name or "POS" in upper_name:
        return "Kasa ve Pos Ruloları"
    if "AMERİKAN SERVİS" in upper_name:
        return "Amerikan Servisler"
    if "GAZETE" in upper_name:
        return "Gazete Kağıtları"
    if "SÜLFİT" in upper_name or "SULFIT" in upper_name:
        return "Baskılı Kağıtlar"
    if "ÇANTA" in upper_name or "CANTA" in upper_name:
        return "Kağıt Çantalar"
    if "KESE" in upper_name or "TORBA" in upper_name or "POĞAÇA" in upper_name or "POGACA" in upper_name:
        return "Kağıt Kese ve Torbalar"

    if "KAHVE" in upper_name or "NESCAF" in upper_name or "COFFE" in upper_name:
        return "Kahve Çözümleri"
    if "ÇAY" in upper_name or "LİPTON" in upper_name or "DOĞUŞ" in upper_name:
        return "Çay Çözümleri"

    if "KOLONYA" in upper_name:
        return "Kolonya Çözümleri"
    if "SIVI SABUN" in upper_name or "KÖPÜK SABUN" in upper_name:
        return "Sıvı Sabunlar"
    if "BULAŞIK MAKİNE" in upper_name or "BULAŞIK" in upper_name:
        return "Bulaşık Kimyasalları"
    if "YAĞ SÖKÜCÜ" in upper_name or "KİREÇ PAS" in upper_name:
        return "Ağır Kir Çözücüler"
    if "ÇAMAŞIR" in upper_name:
        return "Çamaşır Ürünleri"
    if "YÜZEY TEMİZLEYİCİ" in upper_name:
        return "Yüzey Temizleyiciler"
    if "CAM TEMİZLEYİCİ" in upper_name:
        return "Cam Temizleyiciler"
    if "WC" in upper_name:
        return "WC Hijyen Ürünleri"
    if "SÜNGER" in upper_name or "BEZ" in upper_name or "TOPTEL" in upper_name:
        return "Temizlik Yardımcıları"
    if (
        "MOP" in upper_name
        or "ÇEKPAS" in upper_name
        or "APARAT" in upper_name
        or "SAP" in upper_name
        or "FIRÇA" in upper_name
        or "TEMİZLİK ARABASI" in upper_name
    ):
        return "Profesyonel Temizlik Ekipmanları"
    if "KLOZET KAPAK ÖRTÜSÜ" in upper_name:
        return "Klozet Kapak Örtüleri"
    if "ŞEKER" in upper_name or "TUZ" in upper_name:
        return "Şeker & Tuz Ürünleri"
    if "BAHARAT" in upper_name or "KARABİBER" in upper_name or "PULBİBER" in upper_name:
        return "Baharat Çözümleri"

    return "Genel Ürünler"


def _read_csv_rows(csv_path: Path) -> List[List[str]]:
    encodings = ("utf-8-sig", "cp1254", "latin-1")
    last_error: Optional[Exception] = None

    for encoding in encodings:
        try:
            with csv_path.open("r", encoding=encoding, newline="") as handle:
                reader = csv.reader(handle, delimiter=";")
                return list(reader)
        except UnicodeDecodeError as exc:  # pragma: no cover - defensive branch
            last_error = exc

    if last_error is not None:
        raise RuntimeError(f"CSV dosyası okunamadı: {csv_path}") from last_error

    return []


def _load_rows(csv_path: Path) -> Iterable[Dict[str, str]]:
    rows = _read_csv_rows(csv_path)

    if len(rows) <= 4:
        return []

    normalised_rows: List[Dict[str, str]] = []
    for raw_row in rows[4:]:
        if not any(cell.strip() for cell in raw_row):
            continue

        padded = list(raw_row[:8])
        if len(padded) < 8:
            padded.extend(["" for _ in range(8 - len(padded))])

        record = {
            "code": padded[2].strip(),
            "name": padded[3],
            "info": padded[4],
            "unit": padded[5],
            "vat": padded[6],
            "price": padded[7],
        }
        normalised_rows.append(record)

    return normalised_rows


def _product_key(code: str, name: str, info: Optional[str]) -> Tuple[str, ...]:
    code_clean = code.strip().upper()
    if code_clean:
        return ("code", code_clean)

    name_clean = " ".join((name or "").upper().split())
    info_clean = " ".join((info or "").upper().split()) if info else ""
    return ("name", name_clean, info_clean)


def _merge_product(existing: Dict[str, Optional[str]], new_values: Dict[str, Optional[str]]) -> None:
    for field in ("kod", "isim", "bilgi", "birim", "kdv", "kategori", "grup"):
        value = new_values.get(field)
        if value:
            existing[field] = value

    fiyat = new_values.get("fiyat")
    if fiyat is not None:
        existing["fiyat"] = fiyat


def generate_products() -> List[Dict[str, Optional[str]]]:
    existing_sources = [path for path in CSV_PATHS if path.exists()]
    if not existing_sources:
        raise FileNotFoundError(
            "CSV kaynağı bulunamadı: "
            + ", ".join(str(path) for path in CSV_PATHS)
        )

    products: List[Dict[str, Optional[str]]] = []
    product_index: Dict[Tuple[str, ...], Dict[str, Optional[str]]] = {}

    for csv_path in existing_sources:
        for row in _load_rows(csv_path):
            code = row.get("code", "").strip()
            name_raw = row.get("name", "")
            info_raw = row.get("info", "")
            unit_raw = row.get("unit", "")
            vat_raw = row.get("vat", "")
            price_raw = row.get("price", "")

            name = _normalise_multiline(name_raw) or code or "İsimsiz Ürün"
            info = _normalise_multiline(info_raw)

            group = _assign_group(code, name, info)
            subcategory = _assign_subcategory(name)

            product = {
                "kod": code or None,
                "isim": name,
                "bilgi": info,
                "birim": _clean_value(unit_raw),
                "kdv": _clean_value(vat_raw),
                "fiyat": _clean_value(price_raw),
                "kategori": subcategory,
                "grup": group,
                "resim": None,
            }

            key = _product_key(code, name, info)
            existing = product_index.get(key)
            if existing:
                _merge_product(existing, product)
            else:
                product_index[key] = product

    products = list(product_index.values())

    products.sort(key=lambda item: (item["grup"], item["kategori"], item["isim"]))
    return products


def _write_json(path: Path, data: Iterable[Dict[str, Optional[str]]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(list(data), handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def main() -> None:
    products = generate_products()
    _write_json(OUTPUT_ALL, products)

    summary_counter: Counter[str] = Counter()
    for product in products:
        group = product.get("grup")
        if group:
            summary_counter[group] += 1

    print(json.dumps(dict(summary_counter), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
