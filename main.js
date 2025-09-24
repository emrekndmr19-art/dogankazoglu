document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('searchToggle');
  const overlay = document.getElementById('searchOverlay');
  const closeButton = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  const suggestionsList = document.getElementById('searchSuggestions');
  const emptyState = document.getElementById('searchEmptyState');
  const searchForm = document.getElementById('searchForm');

  const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const heroPrevButton = document.querySelector('[data-hero-prev]');
  const heroNextButton = document.querySelector('[data-hero-next]');
  const heroDotsContainer = document.querySelector('[data-hero-dots]');
  const heroContainer = heroDotsContainer
    ? heroDotsContainer.closest('[data-hero-container]')
    : null;

  if (heroSlides.length > 0 && heroPrevButton && heroNextButton && heroDotsContainer) {
    let activeSlideIndex = heroSlides.findIndex((slide) => slide.hasAttribute('data-active'));

    if (activeSlideIndex < 0) {
      activeSlideIndex = 0;
    }

    const baseDotClass =
      'h-2.5 w-2.5 rounded-full bg-white/40 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#262626]';

    let dots = [];

    heroSlides.forEach((slide, index) => {
      if (!slide.id) {
        slide.id = `hero-slide-${index + 1}`;
      }
    });

    const goToSlide = (targetIndex) => {
      if (heroSlides.length === 0) {
        return;
      }

      const normalisedIndex =
        ((targetIndex % heroSlides.length) + heroSlides.length) % heroSlides.length;

      heroSlides.forEach((slide, index) => {
        const isActive = index === normalisedIndex;
        slide.classList.toggle('hidden', !isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');

        if (isActive) {
          slide.setAttribute('data-active', 'true');
        } else {
          slide.removeAttribute('data-active');
        }
      });

      dots.forEach((dot, index) => {
        const isActiveDot = index === normalisedIndex;
        dot.className = `${baseDotClass}${isActiveDot ? ' bg-[#c50000]' : ''}`;
        dot.setAttribute('aria-current', isActiveDot ? 'true' : 'false');
      });

      activeSlideIndex = normalisedIndex;
    };

    heroDotsContainer.innerHTML = '';
    heroDotsContainer.setAttribute('role', 'tablist');
    heroDotsContainer.setAttribute('aria-label', 'Ürün kategorisi slayt gezinme noktaları');

    dots = heroSlides.map((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = baseDotClass;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-controls', slide.id);

      const heading = slide.querySelector('h1');
      const headingText = heading ? heading.textContent.trim() : `${index + 1}. slayt`;
      dot.setAttribute('aria-label', `${headingText} slaytına git`);

      dot.addEventListener('click', () => {
        goToSlide(index);
      });

      heroDotsContainer.appendChild(dot);
      return dot;
    });

    goToSlide(activeSlideIndex);

    if (heroSlides.length <= 1) {
      heroPrevButton.setAttribute('hidden', 'true');
      heroNextButton.setAttribute('hidden', 'true');
      heroDotsContainer.classList.add('hidden');
    } else {
      heroPrevButton.addEventListener('click', () => {
        goToSlide(activeSlideIndex - 1);
      });

      heroNextButton.addEventListener('click', () => {
        goToSlide(activeSlideIndex + 1);
      });

      if (heroContainer) {
        heroContainer.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goToSlide(activeSlideIndex - 1);
          } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            goToSlide(activeSlideIndex + 1);
          }
        });
      }
    }
  }

  const hasSearchOverlay =
    toggleButton &&
    overlay &&
    searchInput &&
    suggestionsList &&
    searchForm;

  const turkishCharMap = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u'
  };
  const searchIndex = [
    {
      title: 'Anasayfa',
      url: 'index.html',
      description: 'Master Hijyen ana sayfasına dönün.',
      keywords: ['anasayfa', 'ana sayfa', 'home', 'master hijyen', 'master', 'başlangıç']
    },
    {
      title: 'Hakkımızda',
      url: 'hakkimizda.html',
      description: 'Master Hijyen hakkında bilgi edinin.',
      keywords: ['hakkımızda', 'hakkimizda', 'kurumsal', 'biz kimiz', 'firma', 'şirket']
    },
    {
      title: 'Ürünlerimiz',
      url: 'urunler.html',
      description: 'Tüm ürün kategorilerimizin yer aldığı sayfa.',
      keywords: ['ürünler', 'ürün', 'ürünlerimiz', 'katalog', 'ürün kataloğu', 'ürün listesi']
    },
    {
      title: 'Kağıt Grubu',
      url: 'kagit-grubu.html',
      description: 'Kağıt havlu, peçete ve rulo çözümlerimizi keşfedin.',
      keywords: ['kağıt', 'kagit', 'kağıt grubu', 'peçete', 'havlu']
    },
    {
      title: 'Plastik Grubu',
      url: 'plastik-grubu.html',
      description: 'Plastik bardak ve servis ekipmanlarımızı inceleyin.',
      keywords: ['plastik', 'tek kullanımlık', 'plastik bardak', 'servis ürünleri']
    },
    {
      title: 'Kimyasal Grubu',
      url: 'kimyasal-grubu.html',
      description: 'Endüstriyel temizlik kimyasallarımızı görüntüleyin.',
      keywords: ['kimyasal', 'temizlik kimyasalları', 'dezenfektan', 'sanayi kimyasalı']
    },
    {
      title: 'Ambalaj Grubu',
      url: 'ambalaj-grubu.html',
      description: 'Koli, streç film ve paketleme ürünlerini keşfedin.',
      keywords: ['ambalaj', 'koli', 'streç film', 'paketleme']
    },
    {
      title: 'Gıda Grubu',
      url: 'gida-grubu.html',
      description: 'İkram ve gıda ürünlerimizi inceleyin.',
      keywords: ['gıda', 'gida', 'gıda grubu', 'ikram', 'kahve']
    },
    {
      title: 'Kırtasiye Grubu',
      url: 'kirtasiye-grubu.html',
      description: 'Ofis kırtasiye ve sarf malzemelerimizi görün.',
      keywords: ['kırtasiye', 'kirtasiye', 'ofis malzemeleri', 'kalem']
    },
    {
      title: 'Baskılı Model Grubu',
      url: 'baskili-model-grubu.html',
      description: 'Özel baskılı bardak ve ambalaj seçeneklerini keşfedin.',
      keywords: ['baskılı', 'baskili', 'özel baskı', 'kurumsal ambalaj']
    },
    {
      title: 'İletişim',
      url: 'iletisim.html',
      description: 'Bizimle iletişime geçmenin yolları.',
      keywords: ['iletişim', 'iletisim', 'bize ulaşın', 'bize ulasin', 'telefon', 'mail']
    }
  ];

  if (hasSearchOverlay) {
    const defaultEmptyMessage = emptyState
      ? emptyState.dataset.defaultMessage || emptyState.textContent.trim()
      : '';

    const normalise = (value = '') =>
      value
        .toLocaleLowerCase('tr-TR')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[çğıöşü]/g, (char) => turkishCharMap[char] || char)
        .trim();

    const tokensForItem = (item) => {
      const baseTokens = [item.title, item.description, ...(item.keywords || [])];
      return baseTokens.map(normalise).filter(Boolean);
    };

    const findMatches = (query) => {
      const normalisedQuery = normalise(query);

      if (!normalisedQuery) {
        return [];
      }

      return searchIndex.filter((item) => {
        const tokens = tokensForItem(item);
        return tokens.some(
          (token) => token.includes(normalisedQuery) || normalisedQuery.includes(token)
        );
      });
    };

    const hideEmptyState = () => {
      if (!emptyState) return;
      emptyState.textContent = defaultEmptyMessage;
      emptyState.classList.add('hidden');
    };

    const showEmptyState = (message = defaultEmptyMessage) => {
      if (!emptyState) return;
      emptyState.textContent = message;
      emptyState.classList.remove('hidden');
    };

    const clearSuggestions = () => {
      suggestionsList.innerHTML = '';
      suggestionsList.classList.add('hidden');
      hideEmptyState();
    };

    const setExpandedState = (isOpen) => {
      toggleButton.setAttribute('aria-expanded', String(isOpen));
    };

    setExpandedState(false);

    const renderSuggestions = (matches) => {
      suggestionsList.innerHTML = '';

      if (matches.length === 0) {
        suggestionsList.classList.add('hidden');
        showEmptyState();
        return;
      }

      suggestionsList.classList.remove('hidden');
      hideEmptyState();

      matches.slice(0, 8).forEach((item) => {
        const listItem = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className =
          'w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none transition flex flex-col gap-1';

        const title = document.createElement('span');
        title.className = 'font-medium text-gray-900';
        title.textContent = item.title;

        const description = document.createElement('span');
        description.className = 'text-sm text-gray-500';
        description.textContent = item.description;

        button.appendChild(title);
        button.appendChild(description);

        button.addEventListener('click', () => {
          window.location.href = item.url;
        });

        listItem.appendChild(button);
        suggestionsList.appendChild(listItem);
      });
    };

    const openOverlay = () => {
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');
      document.body.classList.add('overflow-hidden');
      setExpandedState(true);
      requestAnimationFrame(() => {
        searchInput.focus();
      });
    };

    const closeOverlay = () => {
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
      setExpandedState(false);
      searchInput.value = '';
      clearSuggestions();
    };

    toggleButton.addEventListener('click', openOverlay);

    if (closeButton) {
      closeButton.addEventListener('click', closeOverlay);
    }

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeOverlay();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
        closeOverlay();
      }
    });

    searchInput.addEventListener('input', (event) => {
      const query = event.target.value;

      if (!query.trim()) {
        clearSuggestions();
        return;
      }

      const matches = findMatches(query);
      renderSuggestions(matches);
    });

    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = searchInput.value.trim();

      if (!query) {
        searchInput.focus();
        return;
      }

      const matches = findMatches(query);

      if (matches.length > 0) {
        window.location.href = matches[0].url;
        return;
      }

      suggestionsList.innerHTML = '';
      suggestionsList.classList.add('hidden');
      showEmptyState(`"${query}" ile eşleşen bir sayfa bulunamadı.`);
    });
  }

  const productSections = Array.from(document.querySelectorAll('[data-product-page]'));

  if (productSections.length > 0) {
    const toNormalisedUpper = (value) =>
      (value || '')
        .toLocaleUpperCase('tr-TR')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const slugify = (value) =>
      (value || '')
        .toLocaleLowerCase('tr-TR')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'kategori';

    const createInitials = (value) => {
      if (!value) return 'MH';
      const parts = value
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]);
      const initials = parts.join('');
      return initials ? initials.toLocaleUpperCase('tr-TR') : 'MH';
    };

    const placeholderCache = new Map();
    const createPlaceholder = (name, category) => {
      const cacheKey = `${name || ''}|${category || ''}`;
      const cached = placeholderCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const initials = createInitials(name || category || 'Ürün');
      const label = (name || category || 'Ürün Görseli').slice(0, 36);
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${label}">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fee2e2" />
              <stop offset="100%" stop-color="#fecaca" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#grad)" />
          <text x="200" y="150" text-anchor="middle" font-size="88" font-family="'Poppins', 'Arial', sans-serif" fill="#7f1d1d" font-weight="600">${initials}</text>
          <text x="200" y="205" text-anchor="middle" font-size="20" font-family="'Poppins', 'Arial', sans-serif" fill="#7f1d1d" font-weight="500">${label}</text>
        </svg>
      `;

      const dataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
      placeholderCache.set(cacheKey, dataUrl);
      return dataUrl;
    };

    const CATEGORY_PAGE_MAP = new Map([
      ['Alüminyum Kaplar', 'Ambalaj Grubu'],
      ['Ağır Kir Çözücüler', 'Kimyasal Grubu'],
      ['Baharat Çözümleri', 'Gıda Grubu'],
      ['Bulaşık Kimyasalları', 'Kimyasal Grubu'],
      ['Cam Temizleyiciler', 'Kimyasal Grubu'],
      ['Dispenser Peçeteler', 'Kağıt Grubu'],
      ['Ev Tipi Havlular', 'Kağıt Grubu'],
      ['Garson Peçeteler', 'Kağıt Grubu'],
      ['Hareketli Havlu Ruloları', 'Kağıt Grubu'],
      ['Kahve Çözümleri', 'Gıda Grubu'],
      ['Kare Peçeteler', 'Kağıt Grubu'],
      ['Karton Bardaklar', 'Plastik Grubu'],
      ['Kağıt Havlular', 'Kağıt Grubu'],
      ['Kağıt Kese ve Torbalar', 'Ambalaj Grubu'],
      ['Kilitleme Poşetleri', 'Ambalaj Grubu'],
      ['Kişisel Koruyucu Ürünler', 'Kimyasal Grubu'],
      ['Klozet Kapak Örtüleri', 'Kağıt Grubu'],
      ['Kolonya Çözümleri', 'Kimyasal Grubu'],
      ['Masa Örtüleri', 'Kağıt Grubu'],
      ['Mendiller', 'Kimyasal Grubu'],
      ['Mini Jumbo Tuvalet Kağıtları', 'Kağıt Grubu'],
      ['Mini İçten Çekme Kağıtlar', 'Kağıt Grubu'],
      ['Paketleme Bantları', 'Ambalaj Grubu'],
      ['Paketleme Lastikleri', 'Ambalaj Grubu'],
      ['Profesyonel Temizlik Ekipmanları', 'Kimyasal Grubu'],
      ['Servis Aksesuarları', 'Plastik Grubu'],
      ['Servis Tabakları', 'Plastik Grubu'],
      ['Sos Kapları', 'Plastik Grubu'],
      ['Streç Filmler', 'Ambalaj Grubu'],
      ['Sıvı Sabunlar', 'Kimyasal Grubu'],
      ['Sızdırmaz Kaplar', 'Ambalaj Grubu'],
      ['Tek Kullanımlık Eldivenler', 'Kimyasal Grubu'],
      ['Temizlik Yardımcıları', 'Kimyasal Grubu'],
      ['Tuvalet Kağıtları', 'Kağıt Grubu'],
      ['V Kat Kağıt Ürünleri', 'Kağıt Grubu'],
      ['WC Hijyen Ürünleri', 'Kimyasal Grubu'],
      ['Yüzey Temizleyiciler', 'Kimyasal Grubu'],
      ['Z Kat Havlular', 'Kağıt Grubu'],
      ['Çamaşır Ürünleri', 'Kimyasal Grubu'],
      ['Çay Çözümleri', 'Gıda Grubu'],
      ['İçten Çekmeli Havlular', 'Kağıt Grubu'],
      ['İçten Çekmeli Tuvalet Kağıtları', 'Kağıt Grubu'],
      ['Şeker & Tuz Ürünleri', 'Gıda Grubu'],
    ]);

    const packagingKeywordPattern = /(KARTON|KUTU|AHSAP|SIS|SERVIS|POSET|FOLYO|STREC|TORBA|KILIT|KOLI|PAKETLEME|KONTEYNER|KRAFT|COP)/;
    const plasticKeywordPattern = /(BARDAK|TABAK|KASE|KAP|CATAL|BICAK|KASIK|KARISTIRICI|KULPLU)/;

    const classifyGeneralProduct = (upperName) => {
      if (!upperName) return undefined;
      if (upperName.includes('KIMYASAL') || upperName.includes('DETERJAN')) {
        return 'Kimyasal Grubu';
      }
      if (
        upperName.includes('FOTOKOPI') ||
        upperName.includes('YAZAR') ||
        upperName.includes('KASA') ||
        upperName.includes('POS')
      ) {
        return 'Kırtasiye Grubu';
      }
      if (
        upperName.includes('AMERIKAN SERVIS') ||
        upperName.includes('PISIRME') ||
        upperName.includes('GAZETE') ||
        upperName.includes('SULFIT') ||
        upperName.includes('YAGLI')
      ) {
        return 'Ambalaj Grubu';
      }
      if (packagingKeywordPattern.test(upperName)) {
        return 'Ambalaj Grubu';
      }
      return undefined;
    };

    const determinePrimaryPage = (product) => {
      const mapped = CATEGORY_PAGE_MAP.get(product.kategori);
      if (mapped) {
        return mapped;
      }

      if (product.kategori === 'Genel Ürünler') {
        const generalCategory = classifyGeneralProduct(toNormalisedUpper(product.isim));
        if (generalCategory) {
          return generalCategory;
        }
      }

      const normalisedGroup = toNormalisedUpper(product.grup);
      const normalisedName = toNormalisedUpper(product.isim);
      const normalisedInfo = toNormalisedUpper(product.bilgi);

      if (normalisedGroup === 'GIDA GRUBU') {
        return 'Gıda Grubu';
      }

      if (normalisedGroup === 'HIJYEN SANAYI GRUBU') {
        return 'Kağıt Grubu';
      }

      if (normalisedGroup === 'TEMIZLIK URUNLERI GRUBU' || normalisedGroup === 'KISISEL HIJYEN') {
        return 'Kimyasal Grubu';
      }

      if (normalisedGroup === 'KAGIT SANAYI GRUBU') {
        if (plasticKeywordPattern.test(normalisedName) || plasticKeywordPattern.test(normalisedInfo)) {
          return 'Plastik Grubu';
        }
        if (packagingKeywordPattern.test(normalisedName) || packagingKeywordPattern.test(normalisedInfo)) {
          return 'Ambalaj Grubu';
        }
        return 'Ambalaj Grubu';
      }

      if (normalisedGroup === 'PROFESYONEL HIJYEN EKIPMANLARI') {
        if (packagingKeywordPattern.test(normalisedName) || packagingKeywordPattern.test(normalisedInfo)) {
          return 'Ambalaj Grubu';
        }
        return 'Kimyasal Grubu';
      }

      if (
        normalisedName.includes('KAHVE') ||
        normalisedName.includes('CAY') ||
        normalisedName.includes('NESCAFE') ||
        normalisedName.includes('BAHARAT') ||
        normalisedName.includes('SEKER') ||
        normalisedName.includes('TUZ')
      ) {
        return 'Gıda Grubu';
      }

      if (normalisedName.includes('POS') || normalisedName.includes('FOTOKOPI')) {
        return 'Kırtasiye Grubu';
      }

      return 'Kimyasal Grubu';
    };

    const determineSiteCategories = (product) => {
      const categories = new Set([determinePrimaryPage(product)]);
      const normalisedName = toNormalisedUpper(product.isim);
      const normalisedInfo = toNormalisedUpper(product.bilgi);

      if (
        (normalisedName && normalisedName.includes('BASKI')) ||
        (normalisedInfo && normalisedInfo.includes('BASKI'))
      ) {
        categories.add('Baskılı Model Grubu');
      }

      return Array.from(categories);
    };

    const renderProductCard = (product) => {
      const card = document.createElement('article');
      card.className =
        'bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col transition hover:shadow-md';

      const figure = document.createElement('figure');
      figure.className = 'relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100';

      const image = document.createElement('img');
      image.className = 'h-full w-full object-cover';
      image.loading = 'lazy';
      image.src = product.resim || product.placeholder;
      image.alt = product.isim ? `${product.isim} ürün görseli` : 'Ürün görseli';
      figure.appendChild(image);

      card.appendChild(figure);

      const body = document.createElement('div');
      body.className = 'flex flex-col gap-4 p-6 flex-1';

      const categoryBadge = document.createElement('span');
      categoryBadge.className =
        'inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#c50000]';
      categoryBadge.textContent = product.kategori || 'Ürün';
      body.appendChild(categoryBadge);

      const title = document.createElement('h3');
      title.className = 'text-lg font-semibold text-gray-900 leading-snug';
      title.textContent = product.isim || 'İsimsiz Ürün';
      body.appendChild(title);

      if (product.bilgi) {
        const description = document.createElement('p');
        description.className = 'text-sm text-gray-600';
        description.textContent = product.bilgi;
        body.appendChild(description);
      }

      const meta = document.createElement('dl');
      meta.className = 'mt-auto space-y-2 text-sm text-gray-600';

      const metaItems = [
        { label: 'Ürün Kodu', value: product.kod || 'Belirtilmemiş' },
        { label: 'Birim', value: product.birim || 'Belirtilmemiş' },
        { label: 'KDV', value: product.kdv || '—' },
      ];

      if (product.fiyat) {
        metaItems.push({ label: 'Fiyat', value: product.fiyat });
      }

      metaItems.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between gap-2';

        const term = document.createElement('dt');
        term.className = 'font-medium text-gray-700';
        term.textContent = item.label;

        const definition = document.createElement('dd');
        definition.className = 'text-right text-gray-600';
        definition.textContent = item.value;

        row.appendChild(term);
        row.appendChild(definition);
        meta.appendChild(row);
      });

      body.appendChild(meta);
      card.appendChild(body);

      return card;
    };

    const renderProductSection = (section, products) => {
      const loadingElement = section.querySelector('[data-product-loading]');
      const emptyElement = section.querySelector('[data-product-empty]');
      const summaryElement = section.querySelector('[data-product-summary]');
      const navElement = section.querySelector('[data-product-nav]');
      const contentElement = section.querySelector('[data-product-sections]');

      if (loadingElement) {
        loadingElement.classList.add('hidden');
      }

      if (!products || products.length === 0) {
        if (emptyElement) {
          emptyElement.classList.remove('hidden');
        }
        if (summaryElement) {
          summaryElement.classList.add('hidden');
        }
        if (navElement) {
          navElement.classList.add('hidden');
        }
        if (contentElement) {
          contentElement.innerHTML = '';
        }
        return;
      }

      const categoryGroups = new Map();
      products.forEach((product) => {
        const category = product.kategori || 'Diğer Ürünler';
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, []);
        }
        categoryGroups.get(category).push(product);
      });

      const sortedCategories = Array.from(categoryGroups.entries()).sort((a, b) =>
        a[0].localeCompare(b[0], 'tr-TR', { sensitivity: 'base' })
      );

      if (summaryElement) {
        summaryElement.textContent = `${products.length} ürün · ${sortedCategories.length} alt kategori`;
        summaryElement.classList.remove('hidden');
      }

      if (emptyElement) {
        emptyElement.classList.add('hidden');
      }

      if (navElement) {
        navElement.innerHTML = '';
        if (sortedCategories.length > 1) {
          navElement.classList.remove('hidden');
          sortedCategories.forEach(([category, items]) => {
            const link = document.createElement('a');
            const slug = slugify(`${section.dataset.productPage || 'kategori'}-${category}`);
            link.href = `#${slug}`;
            link.className =
              'inline-flex items-center gap-2 rounded-full border border-[#c50000]/40 bg-white px-4 py-2 text-sm font-medium text-[#c50000] shadow-sm transition hover:bg-[#c50000] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c50000] focus-visible:ring-offset-2';
            link.textContent = `${category} (${items.length})`;
            navElement.appendChild(link);
          });
        } else {
          navElement.classList.add('hidden');
        }
      }

      if (contentElement) {
        contentElement.innerHTML = '';

        sortedCategories.forEach(([category, items]) => {
          const slug = slugify(`${section.dataset.productPage || 'kategori'}-${category}`);
          const categorySection = document.createElement('section');
          categorySection.className = 'space-y-6';
          categorySection.id = slug;

          const header = document.createElement('div');
          header.className = 'flex flex-col gap-2 md:flex-row md:items-end md:justify-between';

          const heading = document.createElement('h2');
          heading.className = 'text-2xl font-semibold text-[#c50000]';
          heading.textContent = category;

          const badge = document.createElement('span');
          badge.className = 'text-sm text-gray-500';
          badge.textContent = `${items.length} ürün`;

          header.appendChild(heading);
          header.appendChild(badge);

          const grid = document.createElement('div');
          grid.className = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';

          items
            .slice()
            .sort((a, b) =>
              (a.isim || '').localeCompare(b.isim || '', 'tr-TR', { sensitivity: 'base' })
            )
            .forEach((product) => {
              grid.appendChild(renderProductCard(product));
            });

          categorySection.appendChild(header);
          categorySection.appendChild(grid);
          contentElement.appendChild(categorySection);
        });
      }
    };

    const showLoadingError = (section, message) => {
      const loadingElement = section.querySelector('[data-product-loading]');
      const emptyElement = section.querySelector('[data-product-empty]');
      const summaryElement = section.querySelector('[data-product-summary]');
      const navElement = section.querySelector('[data-product-nav]');
      const contentElement = section.querySelector('[data-product-sections]');

      if (summaryElement) {
        summaryElement.classList.add('hidden');
      }
      if (navElement) {
        navElement.classList.add('hidden');
      }
      if (contentElement) {
        contentElement.innerHTML = '';
      }
      if (emptyElement) {
        emptyElement.classList.add('hidden');
      }
      if (loadingElement) {
        loadingElement.textContent = message;
        loadingElement.classList.remove('hidden');
      }
    };

    fetch('urunler.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Ürün verileri yüklenemedi: ${response.status}`);
        }
        return response.json();
      })
      .then((products) => {
        const enrichedProducts = products.map((product) => ({
          ...product,
          siteCategories: determineSiteCategories(product),
          placeholder: createPlaceholder(product.isim, product.kategori),
        }));

        const productsByPage = new Map();

        enrichedProducts.forEach((product) => {
          product.siteCategories.forEach((pageName) => {
            if (!productsByPage.has(pageName)) {
              productsByPage.set(pageName, []);
            }
            productsByPage.get(pageName).push(product);
          });
        });

        productSections.forEach((section) => {
          const pageName = section.dataset.productPage || '';
          const pageProducts = productsByPage.get(pageName) || [];
          renderProductSection(section, pageProducts);
        });
      })
      .catch((error) => {
        console.error('Ürün verileri yüklenirken bir hata oluştu:', error);
        productSections.forEach((section) => {
          showLoadingError(section, 'Ürün verileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
        });
      });
  }
});
