#!/usr/bin/env python3
"""Generate structured product JSON data from the dogankazoglu2.csv source."""

from __future__ import annotations

import csv
import json
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "dogankazoglu2.csv"
OUTPUT_ALL = BASE_DIR / "urunler2.json"
CATEGORY_FILES: Dict[str, Path] = {
    "Gıda Grubu": BASE_DIR / "assets" / "data" / "gida-grubu.json",
    "Hijyen Sanayi Grubu": BASE_DIR / "assets" / "data" / "hijyen-sanayi.json",
    "Kağıt Sanayi Grubu": BASE_DIR / "assets" / "data" / "kagit-sanayi.json",
    "Kişisel Hijyen": BASE_DIR / "assets" / "data" / "kisisel-hijyen.json",
    "Profesyonel Hijyen Ekipmanları": BASE_DIR / "assets" / "data" / "profesyonel-hijyen.json",
    "Temizlik Ürünleri Grubu": BASE_DIR / "assets" / "data" / "temizlik-urunleri.json",
}

GIDA_KEYWORDS = {"ŞEKER", "TUZ", "BAHARAT"}
KISISEL_KEYWORDS = {"ELDİVEN", "BONE", "GALOŞ", "KOLLUK", "MASK", "KOLONYA", "MENDİL", "LOSYON"}
KISISEL_KMY_KEYWORDS = {"KOLONYA", "MENDİL"}
PERSONAL_FROM_HJY = {"BONE", "KOLLUK", "GALOŞ"}
HIJYEN_KEYWORDS = {"HAVLU", "TUVALET KAĞIDI", "PEÇETE"}
TEMIZ_KEYWORDS = {"DETERJAN", "TEMİZLEYİCİ", "ÇÖZÜCÜ", "PARLATICI", "SABUN", "BLOK", "PARFÜMÜ", "YAĞ SÖKÜCÜ", "YUMUŞATICI"}
PACKAGING_PREFIXES = {"KRT", "KĞT", "ALM", "PLS", "PŞT", "EKJ", "AHŞ", "SZD", "LST", "STR"}


def _normalise_multiline(value: str) -> Optional[str]:
    parts = [part.strip() for part in value.replace("\r", "").split("\n") if part.strip()]
    if not parts:
        return None
    return " | ".join(parts)


def _clean_value(value: str) -> Optional[str]:
    value = value.strip()
    return value or None


def _assign_group(code: str, name: str) -> str:
    upper_code = code.upper()
    upper_name = name.upper()

    if any(keyword in upper_name for keyword in GIDA_KEYWORDS) or upper_code.startswith("BHR"):
        return "Gıda Grubu"

    if upper_code.startswith("ELD") or any(keyword in upper_name for keyword in KISISEL_KEYWORDS):
        return "Kişisel Hijyen"

    if upper_code.startswith("HJY") and any(keyword in upper_name for keyword in PERSONAL_FROM_HJY):
        return "Kişisel Hijyen"

    if upper_code.startswith("KMY") and any(keyword in upper_name for keyword in KISISEL_KMY_KEYWORDS):
        return "Kişisel Hijyen"

    if upper_code.startswith("KMY"):
        return "Temizlik Ürünleri Grubu"

    if upper_code.startswith("HJY"):
        return "Profesyonel Hijyen Ekipmanları"

    if upper_code.startswith("APR") or "APARAT" in upper_name or "TEMİZLİK ARABASI" in upper_name or "KONTEYNER" in upper_name:
        return "Profesyonel Hijyen Ekipmanları"

    if upper_code.startswith("MASTER") or any(keyword in upper_name for keyword in HIJYEN_KEYWORDS):
        return "Hijyen Sanayi Grubu"

    if any(keyword in upper_name for keyword in TEMIZ_KEYWORDS):
        return "Temizlik Ürünleri Grubu"

    prefix = upper_code.split(".")[0].split("-")[0]
    if prefix in PACKAGING_PREFIXES or upper_code.startswith("BNT") or upper_code.startswith("STR"):
        return "Kağıt Sanayi Grubu"

    return "Kağıt Sanayi Grubu"


def _assign_subcategory(name: str) -> str:
    upper_name = name.upper()

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
    if "ELDİVEN" in upper_name:
        return "Tek Kullanımlık Eldivenler"
    if "BONE" in upper_name or "GALOŞ" in upper_name or "KOLLUK" in upper_name:
        return "Kişisel Koruyucu Ürünler"
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
    if "HAVLU" in upper_name:
        return "Kağıt Havlular"
    if "POŞET" in upper_name or "KİLİTLİ" in upper_name:
        return "Kilitleme Poşetleri"
    if "SOS KAP" in upper_name:
        return "Sos Kapları"
    if "ALÜMİNYUM" in upper_name:
        return "Alüminyum Kaplar"
    if "SIZDIRMAZ" in upper_name:
        return "Sızdırmaz Kaplar"
    if "TABAK" in upper_name:
        return "Servis Tabakları"
    if "KESE" in upper_name or "TORBA" in upper_name or "POĞAÇA" in upper_name:
        return "Kağıt Kese ve Torbalar"
    if "KARTON BARDAK" in upper_name:
        return "Karton Bardaklar"
    if "KARIŞTIRICI" in upper_name or "KÜRDAN" in upper_name:
        return "Servis Aksesuarları"
    if "LASTİK" in upper_name:
        return "Paketleme Lastikleri"
    if "BANT" in upper_name:
        return "Paketleme Bantları"
    if "STREÇ" in upper_name:
        return "Streç Filmler"
    if "SÜNGER" in upper_name or "BEZ" in upper_name or "TOPTEL" in upper_name:
        return "Temizlik Yardımcıları"
    if "MOP" in upper_name or "ÇEKPAS" in upper_name or "APARAT" in upper_name or "SAP" in upper_name or "FIRÇA" in upper_name or "TEMİZLİK ARABASI" in upper_name:
        return "Profesyonel Temizlik Ekipmanları"
    if "ŞEKER" in upper_name or "TUZ" in upper_name:
        return "Şeker & Tuz Ürünleri"
    if "BAHARAT" in upper_name or "KARABİBER" in upper_name or "PULBİBER" in upper_name:
        return "Baharat Çözümleri"
    if "MASA ÖRTÜSÜ" in upper_name:
        return "Masa Örtüleri"
    if "KLOZET KAPAK ÖRTÜSÜ" in upper_name:
        return "Klozet Kapak Örtüleri"
    return "Genel Ürünler"


def _load_rows(csv_path: Path) -> Iterable[Dict[str, str]]:
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle, delimiter=";")
        rows = list(reader)

    if len(rows) <= 4:
        return []

    header = rows[3]
    normalised_rows: List[Dict[str, str]] = []
    for raw_row in rows[4:]:
        if not any(cell.strip() for cell in raw_row):
            continue
        record = dict(zip(header, raw_row))
        normalised_rows.append(record)
    return normalised_rows


def generate_products() -> List[Dict[str, Optional[str]]]:
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV kaynağı bulunamadı: {CSV_PATH}")

    products: List[Dict[str, Optional[str]]] = []

    for row in _load_rows(CSV_PATH):
        code = row.get("ÜRÜN KOD", "").strip()
        name_raw = row.get("ÜRÜN İSİM", "")
        info_raw = row.get("ÜRÜN BİLGİ", "")
        unit_raw = row.get("BİRİM", "")
        vat_raw = row.get("KDV", "")
        price_raw = row.get("FİYAT.", "")

        name = _normalise_multiline(name_raw) or code or "İsimsiz Ürün"
        info = _normalise_multiline(info_raw)

        group = _assign_group(code, name)
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
        products.append(product)

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

    grouped: Dict[str, List[Dict[str, Optional[str]]]] = defaultdict(list)
    for product in products:
        grouped[product["grup"]].append(product)

    for group_name, output_path in CATEGORY_FILES.items():
        entries = sorted(grouped.get(group_name, []), key=lambda item: (item["kategori"], item["isim"]))
        _write_json(output_path, entries)

    summary = {group: len(items) for group, items in grouped.items()}
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
