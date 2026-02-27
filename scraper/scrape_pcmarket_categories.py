"""
PCMarket.vn Category Scraper
=============================
Cào dữ liệu danh mục sản phẩm từ https://pcmarket.vn/
Output JSON chuẩn theo Category entity schema (NestJS + MongoDB):

  {
    "_id": ObjectId,
    "name": str,
    "parentId": ObjectId | null,
    "slug": str,          # auto-gen bằng slugify (lower, strict, locale='vi')
    "isDeleted": false,
    "createdAt": ISO datetime,
    "updatedAt": ISO datetime
  }

Usage:
  pip install requests beautifulsoup4 python-slugify
  python scrape_pcmarket_categories.py
"""

import json
import re
import sys
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup
from slugify import slugify


# ─── Config ──────────────────────────────────────────────────────────────────
BASE_URL = "https://pcmarket.vn/"
OUTPUT_FILE = "pcmarket_categories.json"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
}


# ─── Helpers ─────────────────────────────────────────────────────────────────
_slug_counter: dict[str, int] = {}


def generate_object_id() -> str:
    """Tạo ObjectId giả (24 hex chars) dùng timestamp + counter."""
    import hashlib
    import time

    ts = int(time.time() * 1000)
    generate_object_id._counter = getattr(generate_object_id, "_counter", 0) + 1
    raw = f"{ts}-{generate_object_id._counter}"
    return hashlib.md5(raw.encode()).hexdigest()[:24]


def make_slug(name: str) -> str:
    """
    Tạo slug giống pre('save') hook trong category.entity.ts:
      slugify(name, { lower: true, strict: true, locale: 'vi' })
    Nếu trùng thì thêm -1, -2, ...
    """
    base = slugify(name, lowercase=True, separator="-")
    # Loại bỏ ký tự không phải alphanumeric/hyphen (tương đương strict: true)
    base = re.sub(r"[^a-z0-9-]", "", base)
    base = re.sub(r"-+", "-", base).strip("-")

    if not base:
        base = "category"

    slug = base
    count = 1
    while slug in _slug_counter:
        slug = f"{base}-{count}"
        count += 1

    _slug_counter[slug] = 1
    return slug


def build_category(name: str, parent_id=None) -> dict:
    """Tạo 1 document category chuẩn theo entity schema."""
    now = datetime.now(timezone.utc).isoformat()
    return {
        "_id": generate_object_id(),
        "name": name.strip(),
        "parentId": parent_id,
        "slug": make_slug(name),
        "isDeleted": False,
        "createdAt": now,
        "updatedAt": now,
    }


# ─── Scraper ─────────────────────────────────────────────────────────────────
def fetch_page(url: str) -> BeautifulSoup:
    """Fetch HTML và parse bằng BeautifulSoup."""
    print(f"[*] Fetching {url} ...")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding or "utf-8"
        print(f"[+] Status: {resp.status_code}, Size: {len(resp.text)} chars")
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as e:
        print(f"[!] Lỗi khi fetch {url}: {e}")
        sys.exit(1)


def scrape_mega_menu(soup: BeautifulSoup) -> list[dict]:
    """
    Phân tích mega-menu của pcmarket.vn.
    
    Cấu trúc HTML mega-menu pcmarket:
    - .Mega .clearfix chứa toàn bộ menu
    - Mỗi parent category là 1 <li> trong sidebar trái
    - Subcategories nằm trong div con, với các nhóm <a> links
    
    Trả về danh sách categories phẳng (flat) với parentId references.
    """
    categories: list[dict] = []

    # Tìm mega-menu container
    # pcmarket.vn dùng nhiều pattern khác nhau cho mega-menu
    mega_menu = (
        soup.find("div", class_="Mega")
        or soup.find("div", class_="mega-menu")
        or soup.find("div", {"id": "mega-menu"})
        or soup.find("nav", class_="mega")
    )

    if mega_menu:
        print("[+] Tìm thấy mega-menu container (div.Mega hoặc tương đương)")
        return _parse_mega_div(mega_menu)

    # Fallback: tìm theo cấu trúc ul.nav hoặc sidebar danh mục
    nav_menu = (
        soup.find("ul", class_=re.compile(r"cate|menu|nav", re.I))
        or soup.find("div", class_=re.compile(r"category.*menu|menu.*category", re.I))
    )

    if nav_menu:
        print("[+] Tìm thấy nav-menu container")
        return _parse_nav_menu(nav_menu)

    # Fallback 2: tìm tất cả section headings dạng category
    print("[!] Không tìm thấy mega-menu chuẩn, thử parse bằng heading/link pattern...")
    return _parse_by_links(soup)


def _parse_mega_div(container) -> list[dict]:
    """Parse mega-menu dạng div.Mega (pcmarket pattern)."""
    categories = []

    # Tìm tất cả category items (thường là <li> hoặc <div> con)
    items = container.find_all("li", recursive=False)
    if not items:
        items = container.find_all("div", recursive=False)
    if not items:
        # Thử tìm ul con rồi lấy li
        ul = container.find("ul")
        if ul:
            items = ul.find_all("li", recursive=False)

    for item in items:
        # Parent category: thường là link đầu tiên hoặc text đầu tiên
        parent_link = item.find("a")
        if not parent_link:
            continue

        parent_name = parent_link.get_text(strip=True)
        if not parent_name or parent_name.upper() == "XEM TẤT CẢ":
            continue

        parent_cat = build_category(parent_name)
        categories.append(parent_cat)
        parent_id = parent_cat["_id"]

        # Subcategories: tìm trong submenu div
        sub_container = (
            item.find("div", class_=re.compile(r"sub|drop|child|content", re.I))
            or item.find("ul", class_=re.compile(r"sub|drop|child", re.I))
        )

        if sub_container:
            _extract_subcategories(sub_container, parent_id, categories)
        else:
            # Tìm tất cả links con (trừ link đầu)
            all_links = item.find_all("a")
            for link in all_links[1:]:
                name = link.get_text(strip=True)
                if name and name.upper() != "XEM TẤT CẢ":
                    categories.append(build_category(name, parent_id))

    return categories


def _extract_subcategories(container, parent_id: str, categories: list):
    """
    Trích xuất subcategories từ submenu container.
    
    Pattern pcmarket:
    - Có các nhóm con (columns), mỗi nhóm có heading (level 2) + links (level 3)
    - Heading thường là <a> hoặc <strong> hoặc <h3>/<h4>
    """
    # Tìm các nhóm (columns/groups) trong submenu
    groups = container.find_all(
        ["div", "ul"],
        class_=re.compile(r"col|group|item|block", re.I),
        recursive=False,
    )

    if groups:
        for group in groups:
            _parse_subcategory_group(group, parent_id, categories)
    else:
        # Không có group rõ ràng → parse trực tiếp links
        # Tìm headings làm level 2, links dưới heading làm level 3
        headings = container.find_all(["h2", "h3", "h4", "strong"])
        if headings:
            for heading in headings:
                heading_name = heading.get_text(strip=True)
                if not heading_name or heading_name.upper() == "XEM TẤT CẢ":
                    continue

                level2_cat = build_category(heading_name, parent_id)
                categories.append(level2_cat)
                level2_id = level2_cat["_id"]

                # Tìm links ngay sau heading (siblings)
                sibling = heading.find_next_sibling()
                while sibling:
                    if sibling.name in ["h2", "h3", "h4", "strong"]:
                        break  # Heading mới = group mới
                    links = (
                        sibling.find_all("a")
                        if sibling.name != "a"
                        else [sibling]
                    )
                    for link in links:
                        name = link.get_text(strip=True)
                        if name and name.upper() != "XEM TẤT CẢ":
                            categories.append(build_category(name, level2_id))
                    sibling = sibling.find_next_sibling()
        else:
            # Chỉ có flat links
            links = container.find_all("a")
            for link in links:
                name = link.get_text(strip=True)
                if name and name.upper() != "XEM TẤT CẢ":
                    categories.append(build_category(name, parent_id))


def _parse_subcategory_group(group, parent_id: str, categories: list):
    """Parse 1 nhóm subcategory (1 column trong mega-menu)."""
    links = group.find_all("a")
    if not links:
        return

    # Link đầu tiên trong group thường là heading (level 2)
    first_link = links[0]
    first_name = first_link.get_text(strip=True)

    # Kiểm tra xem link đầu là heading hay chỉ là item thường
    is_heading = (
        first_link.find_parent(["h2", "h3", "h4", "strong"]) is not None
        or "title" in (first_link.get("class", []) or [])
        or first_link.find("strong") is not None
    )

    if is_heading or len(links) > 1:
        # Link đầu = Level 2 category
        if first_name and first_name.upper() != "XEM TẤT CẢ":
            level2_cat = build_category(first_name, parent_id)
            categories.append(level2_cat)
            level2_id = level2_cat["_id"]

            # Links còn lại = Level 3
            for link in links[1:]:
                name = link.get_text(strip=True)
                if name and name.upper() != "XEM TẤT CẢ":
                    categories.append(build_category(name, level2_id))
    else:
        # Chỉ có 1 link = item thường (level 2)
        if first_name and first_name.upper() != "XEM TẤT CẢ":
            categories.append(build_category(first_name, parent_id))


def _parse_nav_menu(nav) -> list[dict]:
    """Parse dạng ul/li menu navigation."""
    categories = []
    items = nav.find_all("li", recursive=False)

    for item in items:
        link = item.find("a")
        if not link:
            continue

        name = link.get_text(strip=True)
        if not name or name.upper() == "XEM TẤT CẢ":
            continue

        parent_cat = build_category(name)
        categories.append(parent_cat)

        # Tìm submenu
        sub_ul = item.find("ul")
        if sub_ul:
            sub_items = sub_ul.find_all("li", recursive=False)
            for sub_item in sub_items:
                sub_link = sub_item.find("a")
                if sub_link:
                    sub_name = sub_link.get_text(strip=True)
                    if sub_name and sub_name.upper() != "XEM TẤT CẢ":
                        level2_cat = build_category(sub_name, parent_cat["_id"])
                        categories.append(level2_cat)

                        # Level 3
                        sub_sub_ul = sub_item.find("ul")
                        if sub_sub_ul:
                            for level3_item in sub_sub_ul.find_all("li"):
                                l3_link = level3_item.find("a")
                                if l3_link:
                                    l3_name = l3_link.get_text(strip=True)
                                    if l3_name and l3_name.upper() != "XEM TẤT CẢ":
                                        categories.append(
                                            build_category(l3_name, level2_cat["_id"])
                                        )

    return categories


def _parse_by_links(soup: BeautifulSoup) -> list[dict]:
    """
    Fallback: parse tất cả links có URL pattern của pcmarket category.
    Dùng URL structure để suy ra hierarchy.
    """
    categories = []
    seen_urls = set()

    # Tìm tất cả links trỏ tới category pages
    all_links = soup.find_all("a", href=re.compile(r"pcmarket\.vn/[^#?]+"))

    for link in all_links:
        href = link.get("href", "")
        name = link.get_text(strip=True)

        if not name or name.upper() == "XEM TẤT CẢ" or href in seen_urls:
            continue
        if any(skip in href for skip in ["/ad.php", "/cart", "/dang-", "/lien-he", "/tin-"]):
            continue

        seen_urls.add(href)

    # Tại đây chỉ thu thập links, không xác định được hierarchy
    # → Dùng manual fallback
    print("[!] Không thể tự động xác định hierarchy. Dùng manual scraping...")
    return _manual_scrape(soup)


def _manual_scrape(soup: BeautifulSoup) -> list[dict]:
    """
    Manual scraping dựa trên cấu trúc đã biết của pcmarket.vn mega-menu.
    Kết hợp việc tìm link theo text/URL pattern.
    """
    categories = []

    # Danh sách parent categories (từ sidebar trái mega-menu)
    parent_defs = [
        {
            "name": "PC Gaming, Streaming",
            "url_pattern": "bo-pc-gaming-livestream",
        },
        {
            "name": "PC Workstation",
            "url_pattern": "pc-workstation",
        },
        {
            "name": "PC AMD Gaming",
            "url_pattern": "pc-amd-gaming",
        },
        {
            "name": "PC Văn Phòng",
            "url_pattern": "pc-van-phong",
        },
        {
            "name": "PC Giả Lập Ảo Hóa",
            "url_pattern": "pc-gia-lap-ao-hoa",
        },
        {
            "name": "Linh Kiện Máy Tính",
            "url_pattern": "linh-kien-may-tinh",
        },
        {
            "name": "PC Mini",
            "url_pattern": "pc-mini",
        },
        {
            "name": "Màn Hình Máy Tính",
            "url_pattern": "monitor-man-hinh",
        },
        {
            "name": "Gaming Gear",
            "url_pattern": "gaming-gear",
        },
        {
            "name": "Loa, Mic, Webcam",
            "url_pattern": "loa-mic-webcam",
        },
    ]

    for pdef in parent_defs:
        parent_cat = build_category(pdef["name"])
        categories.append(parent_cat)

        # Tìm links thuộc parent này dựa trên URL proximity
        # Mega-menu section thường chứa links ngay sau parent
        _find_sub_links_for_parent(soup, pdef, parent_cat["_id"], categories)

    return categories


def _find_sub_links_for_parent(
    soup: BeautifulSoup,
    parent_def: dict,
    parent_id: str,
    categories: list,
):
    """Tìm subcategory links cho 1 parent category."""
    # Tìm section chứa parent (thường h2/h3 hoặc link có text khớp parent name)
    pattern = parent_def["url_pattern"]

    # Tìm tất cả elements chứa parent link
    parent_links = soup.find_all("a", href=re.compile(re.escape(pattern)))

    for parent_link in parent_links:
        # Tìm container cha gần nhất chứa submenu
        container = parent_link.find_parent(["li", "div"])
        if not container:
            continue

        # Tìm submenu trong container
        sub_div = container.find(
            ["div", "ul"],
            class_=re.compile(r"sub|drop|mega|content|child", re.I),
        )
        if not sub_div:
            # Tìm sibling div
            sub_div = container.find("div")

        if not sub_div:
            continue

        # Parse subcategories
        seen_names = set()
        all_sub_links = sub_div.find_all("a")

        # Nhóm links theo heading pattern (strong, h2-h4, hoặc link có style khác)
        current_level2_id = parent_id

        for link in all_sub_links:
            name = link.get_text(strip=True)
            href = link.get("href", "")

            if not name or name.upper() in ("XEM TẤT CẢ", ""):
                continue
            if name in seen_names:
                continue
            if pattern in href:
                continue  # Skip parent link

            seen_names.add(name)

            # Kiểm tra xem đây là heading (level 2) hay item (level 3)
            is_heading = bool(
                link.find_parent(["h2", "h3", "h4", "strong"])
                or link.find("strong")
                or link.parent.name in ["h2", "h3", "h4", "strong"]
            )

            if is_heading:
                level2_cat = build_category(name, parent_id)
                categories.append(level2_cat)
                current_level2_id = level2_cat["_id"]
            else:
                categories.append(build_category(name, current_level2_id))

        if seen_names:
            break  # Đã tìm được subcategories


# ─── Import Script Generator ─────────────────────────────────────────────────
def generate_import_script(categories: list[dict], output_path: str = "import_categories.js"):
    """
    Tạo file JS để import categories vào MongoDB.
    Chạy bằng: mongosh < import_categories.js
    """
    lines = [
        '// Auto-generated import script for pcmarket.vn categories',
        '// Run: mongosh "mongodb://localhost:27017/your_db" < import_categories.js',
        '',
        'db = db.getSiblingDB("project_pc");  // <-- Đổi tên DB cho đúng',
        '',
        '// Clear existing categories (CẢNH BÁO: xóa hết data cũ!)',
        '// db.categories.deleteMany({});',
        '',
        'const categories = ' + json.dumps(categories, ensure_ascii=False, indent=2) + ';',
        '',
        '// Map temp _id sang real ObjectId',
        'const idMap = {};',
        'const docs = categories.map(cat => {',
        '  const realId = new ObjectId();',
        '  idMap[cat._id] = realId;',
        '  return { ...cat, _realId: realId };',
        '});',
        '',
        '// Insert với proper ObjectId references',
        'docs.forEach(doc => {',
        '  db.categories.insertOne({',
        '    _id: doc._realId,',
        '    name: doc.name,',
        '    parentId: doc.parentId ? (idMap[doc.parentId] || null) : null,',
        '    slug: doc.slug,',
        '    isDeleted: doc.isDeleted,',
        '    createdAt: new Date(doc.createdAt),',
        '    updatedAt: new Date(doc.updatedAt),',
        '  });',
        '});',
        '',
        'print(`✅ Imported ${docs.length} categories successfully!`);',
        'print("Parents: " + db.categories.countDocuments({ parentId: null }));',
        'print("Children: " + db.categories.countDocuments({ parentId: { $ne: null } }));',
    ]

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"[+] Import script saved: {output_path}")


# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  PCMarket.vn Category Scraper")
    print("  Output chuẩn theo category.entity.ts")
    print("=" * 60)

    soup = fetch_page(BASE_URL)

    # Parse mega-menu
    categories = scrape_mega_menu(soup)

    if not categories:
        print("[!] Không tìm thấy categories nào! Thử debug HTML structure...")
        # Debug: in ra tất cả các class chính
        for tag in soup.find_all(["div", "nav", "ul"], class_=True):
            classes = " ".join(tag.get("class", []))
            if any(
                kw in classes.lower()
                for kw in ["menu", "cate", "mega", "nav", "sidebar"]
            ):
                print(f"  Found: <{tag.name} class='{classes}'>")
        return

    # Thống kê
    parents = [c for c in categories if c["parentId"] is None]
    children = [c for c in categories if c["parentId"] is not None]

    print(f"\n{'=' * 60}")
    print(f"  Kết quả scraping:")
    print(f"  - Tổng categories: {len(categories)}")
    print(f"  - Parent categories (level 1): {len(parents)}")
    print(f"  - Sub-categories (level 2+): {len(children)}")
    print(f"{'=' * 60}")

    # In tree view
    print("\n📂 Category Tree:")
    id_map = {c["_id"]: c for c in categories}
    for parent in parents:
        print(f"  ├── {parent['name']}  (slug: {parent['slug']})")
        level2 = [c for c in categories if c["parentId"] == parent["_id"]]
        for i, child in enumerate(level2):
            prefix = "  │   └──" if i == len(level2) - 1 else "  │   ├──"
            print(f"{prefix} {child['name']}  (slug: {child['slug']})")
            level3 = [c for c in categories if c["parentId"] == child["_id"]]
            for j, grandchild in enumerate(level3):
                prefix3 = (
                    "  │       └──" if j == len(level3) - 1 else "  │       ├──"
                )
                print(f"{prefix3} {grandchild['name']}  (slug: {grandchild['slug']})")

    # Save JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(categories, f, ensure_ascii=False, indent=2)
    print(f"\n[+] Categories saved: {OUTPUT_FILE}")

    # Generate import script
    generate_import_script(categories)

    # Sample output
    print(f"\n📋 Sample document (first category):")
    print(json.dumps(categories[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
