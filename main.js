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

  if (!toggleButton || !overlay || !searchInput || !suggestionsList || !searchForm) {
    return;
  }

  const defaultEmptyMessage = emptyState
    ? emptyState.dataset.defaultMessage || emptyState.textContent.trim()
    : '';

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
      title: 'Hijyen Sanayi Grubu',
      url: 'hijyensanayigrubu.html',
      description: 'Endüstriyel hijyen çözümlerimizi inceleyin.',
      keywords: ['hijyen sanayi', 'sanayi grubu', 'endüstriyel hijyen', 'sanayi ürünleri']
    },
    {
      title: 'Temizlik Ürünleri Grubu',
      url: 'temizlikurunlerigrubu.html',
      description: 'Profesyonel temizlik ürünlerimizi keşfedin.',
      keywords: ['temizlik', 'temizlik ürünleri', 'temizlik grubu', 'profesyonel temizlik']
    },
    {
      title: 'Kağıt Sanayi Grubu',
      url: 'kagit.html',
      description: 'Kağıt ürünleri ve çözümlerimize göz atın.',
      keywords: ['kağıt', 'kagit', 'kağıt sanayi', 'kâğıt ürünleri', 'peçete']
    },
    {
      title: 'Kişisel Hijyen',
      url: 'kisiselhijyen.html',
      description: 'Kişisel bakım ve hijyen ürünlerimizi görün.',
      keywords: ['kişisel hijyen', 'kisisel hijyen', 'kişisel bakım', 'bakım ürünleri']
    },
    {
      title: 'Gıda Grubu',
      url: 'gida.html',
      description: 'Gıda grubu ürünlerimizi keşfedin.',
      keywords: ['gıda', 'gida', 'gıda grubu', 'gıda ürünleri', 'food']
    },
    {
      title: 'Profesyonel Hijyen Ekipmanları',
      url: 'profhijyen.html',
      description: 'Profesyonel kullanım için hijyen ekipmanları.',
      keywords: ['profesyonel hijyen', 'hijyen ekipmanları', 'ekipman', 'profhijyen']
    },
    {
      title: 'İletişim',
      url: 'iletisim.html',
      description: 'Bizimle iletişime geçmenin yolları.',
      keywords: ['iletişim', 'iletisim', 'bize ulaşın', 'bize ulasin', 'telefon', 'mail']
    }
  ];

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
});
