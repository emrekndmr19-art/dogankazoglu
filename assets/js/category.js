(function () {
  const formatCount = (count) => {
    if (typeof count !== 'number') {
      return '';
    }

    if (count === 0) {
      return '0 ürün';
    }

    return `${count} ürün listelendi`;
  };

  const createCard = (product) => {
    const card = document.createElement('article');
    card.className = 'border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition bg-white flex flex-col gap-4';

    const mediaWrapper = document.createElement('div');
    mediaWrapper.className = 'aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs uppercase tracking-wider';

    if (product && product.resim) {
      const img = document.createElement('img');
      img.src = product.resim;
      img.alt = product.isim ? `${product.isim} ürün görseli` : 'Ürün görseli';
      img.className = 'h-full w-full object-cover rounded-lg';
      mediaWrapper.textContent = '';
      mediaWrapper.appendChild(img);
    } else {
      mediaWrapper.textContent = 'Fotoğraf eklenecek';
    }

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'space-y-2';

    const name = document.createElement('h3');
    name.className = 'text-base font-semibold text-gray-900';
    name.textContent = product && product.isim ? product.isim : 'İsimsiz ürün';
    contentWrapper.appendChild(name);

    if (product && product.kategori) {
      const badge = document.createElement('span');
      badge.className = 'inline-flex items-center justify-center text-xs font-semibold text-[#c50000] bg-red-50 px-3 py-1 rounded-full';
      badge.textContent = product.kategori;
      contentWrapper.appendChild(badge);
    }

    if (product && product.kod) {
      const code = document.createElement('p');
      code.className = 'text-sm text-gray-500';
      code.textContent = `Ürün Kodu: ${product.kod}`;
      contentWrapper.appendChild(code);
    }

    if (product && product.bilgi) {
      const details = document.createElement('p');
      details.className = 'text-sm text-gray-600';
      details.textContent = product.bilgi;
      contentWrapper.appendChild(details);
    }

    if (product) {
      const metaItems = [];
      if (product.birim) {
        metaItems.push(`Birim: ${product.birim}`);
      }
      if (product.kdv) {
        metaItems.push(`KDV: ${product.kdv}`);
      }
      if (product.fiyat) {
        metaItems.push(`Fiyat: ${product.fiyat}`);
      }

      if (metaItems.length > 0) {
        const meta = document.createElement('p');
        meta.className = 'text-xs text-gray-400';
        meta.textContent = metaItems.join(' • ');
        contentWrapper.appendChild(meta);
      }
    }

    card.appendChild(mediaWrapper);
    card.appendChild(contentWrapper);

    return card;
  };

  const renderProducts = (section, products) => {
    const grid = section.querySelector('[data-category-grid]');
    const countEl = section.querySelector('[data-product-count]');
    const emptyState = section.querySelector('[data-empty-state]');

    if (!grid) {
      return;
    }

    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = '';

      if (emptyState) {
        emptyState.textContent = section.dataset.emptyMessage || 'Bu kategori için ürünler hazırlanıyor.';
        emptyState.hidden = false;
      }

      if (countEl) {
        countEl.textContent = formatCount(0);
      }

      return;
    }

    const fragment = document.createDocumentFragment();
    products.forEach((product) => {
      fragment.appendChild(createCard(product));
    });

    grid.innerHTML = '';
    grid.appendChild(fragment);

    if (emptyState) {
      emptyState.hidden = true;
    }

    if (countEl) {
      countEl.textContent = formatCount(products.length);
    }
  };

  const handleError = (section) => {
    const emptyState = section.querySelector('[data-empty-state]');
    const countEl = section.querySelector('[data-product-count]');
    const grid = section.querySelector('[data-category-grid]');

    if (grid) {
      grid.innerHTML = '';
    }

    if (countEl) {
      countEl.textContent = '';
    }

    if (emptyState) {
      emptyState.textContent = section.dataset.errorMessage || 'Ürünler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.';
      emptyState.hidden = false;
    }
  };

  const initialiseCategorySections = () => {
    const sections = document.querySelectorAll('[data-category-root]');

    if (!sections.length) {
      return;
    }

    sections.forEach((section) => {
      const dataSource = section.dataset.categoryJson;
      if (!dataSource) {
        return;
      }

      const countEl = section.querySelector('[data-product-count]');
      const emptyState = section.querySelector('[data-empty-state]');

      if (countEl) {
        countEl.textContent = 'Ürünler yükleniyor…';
      }

      if (emptyState) {
        emptyState.hidden = true;
      }

      fetch(dataSource)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Veri yüklenemedi: ${response.status}`);
          }

          return response.json();
        })
        .then((data) => {
          renderProducts(section, data);
        })
        .catch((error) => {
          console.error('Kategori verisi yüklenirken hata oluştu:', error);
          handleError(section);
        });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseCategorySections);
  } else {
    initialiseCategorySections();
  }
})();
