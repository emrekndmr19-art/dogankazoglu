#!/usr/bin/env python3
"""Generate structured product JSON data from the dogankazoglu2.csv source."""

from __future__ import annotations

import csv
import json
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_SOURCES: Sequence[Tuple[Path, str]] = (
    (BASE_DIR / "dogankazoglu1.csv", "cp1254"),
    (BASE_DIR / "dogankazoglu2.csv", "utf-8-sig"),
)
LEGACY_INPUT = BASE_DIR / "legacy-urunler.json"
OUTPUT_ALL = BASE_DIR / "urunler.json"
GROUP_ORDER: Sequence[str] = (
    "Kağıt Grubu",
    "Plastik Grubu",
    "Kimyasal Grubu",
    "Ambalaj Grubu",
    "Gıda Grubu",
    "Kırtasiye Grubu",
    "Baskılı Model Grubu",
)

CATEGORY_FILES: Dict[str, Path] = {
    "Kağıt Grubu": BASE_DIR / "assets" / "data" / "kagit-grubu.json",
    "Plastik Grubu": BASE_DIR / "assets" / "data" / "plastik-grubu.json",
    "Kimyasal Grubu": BASE_DIR / "assets" / "data" / "kimyasal-grubu.json",
    "Ambalaj Grubu": BASE_DIR / "assets" / "data" / "ambalaj-grubu.json",
    "Gıda Grubu": BASE_DIR / "assets" / "data" / "gida-grubu.json",
    "Kırtasiye Grubu": BASE_DIR / "assets" / "data" / "kirtasiye-grubu.json",
    "Baskılı Model Grubu": BASE_DIR / "assets" / "data" / "baskili-model-grubu.json",
}

GROUP_INDEX = {group: index for index, group in enumerate(GROUP_ORDER)}

CHAR_REPLACEMENTS = str.maketrans({
    "Ð": "Ğ",
    "Ý": "İ",
    "Þ": "Ş",
    "þ": "ş",
    "ð": "ğ",
    "ý": "ı",
    "Â": "Â",
    "Ê": "Ê",
})

FOOD_PREFIXES = ("KHV", "ÇAY", "CAY", "ŞKR", "BHR")
FOOD_KEYWORDS = {
    "ÇAY",
    "KAHVE",
    "NESCAF",
    "COFFE",
    "MEHMET EFENDİ",
    "ŞEKER",
    "TUZ",
    "BAHARAT",
    "KREM",
    "SÜT TOZU",
}
CHEMICAL_PREFIXES = ("KMY",)
CHEMICAL_KEYWORDS = {
    "DETERJAN",
    "TEMİZLEYİCİ",
    "ÇÖZÜCÜ",
    "PARLATICI",
    "SANİT",
    "SANIT",
    "HİJYEN",
    "DISINFECT",
    "DEZENFEKTAN",
    "SABUN",
    "KOLONYA",
    "MENDİL",
    "YUMUŞATICI",
    "PARFÜM",
    "BULAŞIK",
    "YAĞ SÖKÜCÜ",
}
PLASTIC_PREFIXES = ("PLS", "STR", "ELD", "HJY", "APR")
PLASTIC_KEYWORDS = {
    "PLASTİK",
    "STREÇ",
    "MOP",
    "SAP",
    "SÜPÜRGE",
    "ÇÖP KONTEYNER",
    "FIRÇA",
    "ELDİVEN",
    "APARAT",
}
PACKAGING_PREFIXES = ("ALM", "PŞT", "KRT", "KĞT", "AHŞ", "EKJ", "SZD", "KRS", "BNT", "LST")
PACKAGING_KEYWORDS = {
    "BARDAK",
    "KAP",
    "KARIŞTIRICI",
    "KÜRDAN",
    "TABAK",
    "KESE",
    "ÇANTA",
    "POŞET",
    "POSET",
    "TORBA",
    "SERVİS",
    "STREÇ",
    "FOLYO",
    "SIZDIRMAZ",
    "LASTİK",
    "BLOK",
}
STATIONERY_KEYWORDS = {
    "FOTOKOP",
    "POS",
    "KASA",
    "TERMAL",
    "KIRTAS",
    "A4",
    "A5",
    "A6",
}


def _fix_text(value: str) -> str:
    return value.translate(CHAR_REPLACEMENTS)


def _normalise_multiline(value: str) -> Optional[str]:
    cleaned = _fix_text(value).replace("\r", "")
    parts = [part.strip() for part in cleaned.split("\n") if part.strip()]
    if not parts:
        return None
    return " | ".join(parts)


def _clean_value(value: str) -> Optional[str]:
    fixed = _fix_text(value).strip()
    if not fixed:
        return None
    if fixed.startswith("?"):
        fixed = fixed.replace("?", "₺", 1)
    return fixed


def _assign_group(code: str, name: str, info: Optional[str]) -> str:
    upper_code = code.upper()
    upper_name = name.upper()
    upper_info = info.upper() if info else ""
    combined = f"{upper_name} {upper_info}".strip()

    if "BASKILI" in combined:
        return "Baskılı Model Grubu"

    if upper_code.startswith(FOOD_PREFIXES) or any(keyword in combined for keyword in FOOD_KEYWORDS):
        return "Gıda Grubu"

    if upper_code.startswith(CHEMICAL_PREFIXES) or any(keyword in combined for keyword in CHEMICAL_KEYWORDS):
        return "Kimyasal Grubu"

    if any(keyword in combined for keyword in STATIONERY_KEYWORDS):
        if "POŞ" not in combined and "POŞET" not in combined and "POSET" not in combined:
            return "Kırtasiye Grubu"

    if upper_code.startswith(PLASTIC_PREFIXES) or any(keyword in combined for keyword in PLASTIC_KEYWORDS):
        return "Plastik Grubu"

    prefix = upper_code.split(".")[0].split("-")[0]
    if prefix in PACKAGING_PREFIXES or any(keyword in combined for keyword in PACKAGING_KEYWORDS):
        return "Ambalaj Grubu"

    return "Kağıt Grubu"


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
    if "KAHVE" in upper_name or "COFFE" in upper_name or "NESCAF" in upper_name:
        if "KARIŞTIRICI" not in upper_name and "BARDAK" not in upper_name:
            return "Kahveler"
    if "ÇAY" in upper_name or "CAY" in upper_name:
        if "KARIŞTIRICI" not in upper_name and "BARDAK" not in upper_name:
            return "Çaylar"
    if "ŞEKER" in upper_name or "TUZ" in upper_name:
        return "Şeker & Tuz Ürünleri"
    if "BAHARAT" in upper_name or "KARABİBER" in upper_name or "PULBİBER" in upper_name:
        return "Baharat Çözümleri"
    if "MASA ÖRTÜSÜ" in upper_name:
        return "Masa Örtüleri"
    if "KLOZET KAPAK ÖRTÜSÜ" in upper_name:
        return "Klozet Kapak Örtüleri"
    return "Genel Ürünler"


def _load_rows(csv_path: Path, encoding: str) -> Iterable[Dict[str, str]]:
    with csv_path.open("r", encoding=encoding, newline="") as handle:
        reader = csv.reader(handle, delimiter=";")
        rows = list(reader)

    if len(rows) <= 4:
        return []

    header = [_fix_text(cell) for cell in rows[3]]
    normalised_rows: List[Dict[str, str]] = []
    for raw_row in rows[4:]:
        if not any(cell.strip() for cell in raw_row):
            continue
        record = {key: _fix_text(value) for key, value in zip(header, raw_row)}
        normalised_rows.append(record)
    return normalised_rows


def _load_legacy_products(path: Path) -> List[Dict[str, Optional[str]]]:
    if not path.exists():
        return []

    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)

    legacy_products: List[Dict[str, Optional[str]]] = []
    for entry in data:
        if not isinstance(entry, dict):
            continue

        name_source = entry.get("isim") or entry.get("name") or ""
        if not isinstance(name_source, str):
            continue

        name = _fix_text(name_source).strip()
        if not name:
            continue

        info_raw = entry.get("bilgi")
        info = _normalise_multiline(info_raw) if isinstance(info_raw, str) else None

        code_raw = entry.get("kod")
        code = _clean_value(code_raw) if isinstance(code_raw, str) else None

        unit_raw = entry.get("birim")
        unit = _clean_value(unit_raw) if isinstance(unit_raw, str) else None

        vat_raw = entry.get("kdv")
        vat = _clean_value(vat_raw) if isinstance(vat_raw, str) else None

        price_raw = entry.get("fiyat")
        price = _clean_value(price_raw) if isinstance(price_raw, str) else None

        category_hint_raw = entry.get("kategori")
        category_hint = _clean_value(category_hint_raw) if isinstance(category_hint_raw, str) else None

        group_hint_raw = entry.get("grup")
        group_hint = _clean_value(group_hint_raw) if isinstance(group_hint_raw, str) else None

        subcategory = _assign_subcategory(name)
        if category_hint and (not subcategory or subcategory == "Genel Ürünler"):
            subcategory = category_hint

        group = group_hint or _assign_group(code or "", name, info)

        image_raw = entry.get("resim")
        if isinstance(image_raw, str):
            image = image_raw.strip() or None
        else:
            image = None

        legacy_products.append(
            {
                "kod": code,
                "isim": name,
                "bilgi": info,
                "birim": unit,
                "kdv": vat,
                "fiyat": price,
                "kategori": subcategory or category_hint or "Genel Ürünler",
                "grup": group,
                "resim": image,
            }
        )

    return legacy_products


def generate_products() -> List[Dict[str, Optional[str]]]:
    products: List[Dict[str, Optional[str]]] = []
    missing_sources: List[Path] = []

    for csv_path, encoding in CSV_SOURCES:
        if not csv_path.exists():
            missing_sources.append(csv_path)
            continue

        for row in _load_rows(csv_path, encoding):
            code = row.get("ÜRÜN KOD", "").strip()
            name_raw = row.get("ÜRÜN İSİM", "")
            info_raw = row.get("ÜRÜN BİLGİ", "")
            unit_raw = row.get("BİRİM", "")
            vat_raw = row.get("KDV", "")
            price_raw = row.get("FİYAT.", "")

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
            products.append(product)

    if missing_sources:
        missing_str = ", ".join(str(path) for path in missing_sources)
        raise FileNotFoundError(f"Eksik CSV kaynakları: {missing_str}")

    products.extend(_load_legacy_products(LEGACY_INPUT))

    seen_names = set()
    unique_products: List[Dict[str, Optional[str]]] = []
    for product in products:
        name = product.get("isim")
        if isinstance(name, str):
            normalised_name = " ".join(name.split())
            key = normalised_name.casefold()
        else:
            normalised_name = None
            key = None

        if key and key in seen_names:
            continue

        if key:
            seen_names.add(key)

        if normalised_name is not None and name != normalised_name:
            product["isim"] = normalised_name

        unique_products.append(product)

    products = unique_products

    def _sort_key(item: Dict[str, Optional[str]]) -> Tuple[int, str, str]:
        group = item.get("grup") or ""
        category = item.get("kategori") or ""
        name = item.get("isim") or ""
        return (GROUP_INDEX.get(group, len(GROUP_ORDER)), category, name)

    products.sort(key=_sort_key)
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

    for group_name in GROUP_ORDER:
        output_path = CATEGORY_FILES[group_name]
        entries = sorted(
            grouped.get(group_name, []),
            key=lambda item: (
                item.get("kategori") or "",
                item.get("isim") or "",
            ),
        )
        _write_json(output_path, entries)

    summary = {group: len(grouped.get(group, [])) for group in GROUP_ORDER}
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
