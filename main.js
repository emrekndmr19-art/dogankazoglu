document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('searchToggle');
  const overlay = document.getElementById('searchOverlay');
  const closeButton = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  const suggestionsList = document.getElementById('searchSuggestions');
  const emptyState = document.getElementById('searchEmptyState');
  const searchForm = document.getElementById('searchForm');

  const sliderWrappers = document.querySelectorAll('[data-hero-slider-wrapper]');

  const initHeroSlider = (wrapper) => {
    const slider = wrapper.querySelector('[data-hero-slider]');
    const slides = slider ? Array.from(slider.querySelectorAll('[data-hero-slide]')) : [];
    const prevButton = wrapper.querySelector('[data-hero-prev]');
    const nextButton = wrapper.querySelector('[data-hero-next]');
    const heroContainer = wrapper.closest('[data-hero]') ?? wrapper;
    const dotButtons = Array.from(heroContainer.querySelectorAll('[data-hero-dot]'));

    if (!slider || slides.length === 0) {
      return;
    }

    let activeIndex = slides.findIndex((slide) => !slide.classList.contains('opacity-0'));
    if (activeIndex < 0) {
      activeIndex = 0;
    }

    const activeDotClasses = [
      'bg-white',
      'text-[#c50000]',
      'border-white/80',
      'shadow-sm',
      'hover:bg-white/90'
    ];
    const inactiveDotClasses = [
      'bg-white/10',
      'text-white/80',
      'border-white/50',
      'hover:bg-white/20'
    ];

    const applyDotState = (dot, isActive) => {
      activeDotClasses.forEach((className) => {
        dot.classList.toggle(className, isActive);
      });
      inactiveDotClasses.forEach((className) => {
        dot.classList.toggle(className, !isActive);
      });
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    };

    function updateSlides(index) {
      if (slides.length === 0) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('opacity-100', isActive);
        slide.classList.toggle('opacity-0', !isActive);
        slide.classList.toggle('pointer-events-none', !isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      dotButtons.forEach((dot, dotIndex) => {
        applyDotState(dot, dotIndex === activeIndex);
      });
    }

    let autoplayId = null;
    const autoplayDelay = 8000;

    function stopAutoplay() {
      if (autoplayId) {
        window.clearInterval(autoplayId);
        autoplayId = null;
      }
    }

    function startAutoplay() {
      if (slides.length <= 1) {
        return;
      }

      stopAutoplay();
      autoplayId = window.setInterval(() => {
        updateSlides(activeIndex + 1);
      }, autoplayDelay);
    }

    const handleManualNavigation = (targetIndex) => {
      updateSlides(targetIndex);
      if (slides.length > 1) {
        startAutoplay();
      }
    };

    const goToPrevious = () => {
      handleManualNavigation(activeIndex - 1);
    };

    const goToNext = () => {
      handleManualNavigation(activeIndex + 1);
    };

    prevButton?.addEventListener('click', goToPrevious);
    nextButton?.addEventListener('click', goToNext);

    slider.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    });

    dotButtons.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = Number.parseInt(dot.dataset.heroDot, 10);
        if (!Number.isNaN(target)) {
          handleManualNavigation(target);
        }
      });
    });

    updateSlides(activeIndex);

    if (slides.length > 1) {
      if (!document.hidden) {
        startAutoplay();
      }

      const pauseAutoplay = () => {
        stopAutoplay();
      };

      const resumeAutoplay = () => {
        if (!document.hidden) {
          startAutoplay();
        }
      };

      slider.addEventListener('mouseenter', pauseAutoplay);
      slider.addEventListener('mouseleave', resumeAutoplay);
      slider.addEventListener('focusin', pauseAutoplay);
      slider.addEventListener('focusout', resumeAutoplay);

      if (prevButton) {
        prevButton.addEventListener('mouseenter', pauseAutoplay);
        prevButton.addEventListener('mouseleave', resumeAutoplay);
        prevButton.addEventListener('focusin', pauseAutoplay);
        prevButton.addEventListener('focusout', resumeAutoplay);
      }

      if (nextButton) {
        nextButton.addEventListener('mouseenter', pauseAutoplay);
        nextButton.addEventListener('mouseleave', resumeAutoplay);
        nextButton.addEventListener('focusin', pauseAutoplay);
        nextButton.addEventListener('focusout', resumeAutoplay);
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      });
    } else {
      prevButton?.setAttribute('disabled', 'true');
      nextButton?.setAttribute('disabled', 'true');
    }
  };

  sliderWrappers.forEach((wrapper) => {
    initHeroSlider(wrapper);
  });

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
