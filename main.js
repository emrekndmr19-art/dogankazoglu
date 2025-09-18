document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('searchInput');
  const suggestionsList = document.getElementById('suggestionsList');
  const searchGoBtn = document.getElementById('searchGo');
  const searchCloseBtn = document.getElementById('searchClose');
  const searchModal = document.getElementById('searchModal');

  if (!searchInput || !suggestionsList) return;

  // Aranabilecek kelimeler ve yönlenecek sayfalar
  const pageMatches = {
    'iş fırsat': 'isfirsati.html',
    'iş': 'isfirsati.html',
    'ürün': 'urunler.html',
    'kayıt': 'kayitsayfasi.html',
    'hakkımızda': 'sirket.html',
    'şirket': 'sirket.html',
    'ana': 'index.html',
    'home': 'index.html'
  };
  const possibleKeys = Object.keys(pageMatches);

  // Kullanıcı yazdıkça eşleşenleri göster
  searchInput.addEventListener('input', function () {
    const val = this.value.trim().toLowerCase();
    suggestionsList.innerHTML = '';
    if (val === '') {
      suggestionsList.classList.add('hidden');
      return;
    }

    const matches = possibleKeys.filter(key => key.includes(val));
    if (matches.length === 0) {
      suggestionsList.classList.add('hidden');
      return;
    }

    matches.forEach(match => {
      const li = document.createElement('li');
      li.textContent = match;
      li.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
      li.addEventListener('click', () => {
        const url = pageMatches[match];
        if (url) window.location.href = url;
      });
      suggestionsList.appendChild(li);
    });

    suggestionsList.classList.remove('hidden');
  });

  // Buton ile arama yönlendirmesi
  if (searchGoBtn) {
    searchGoBtn.addEventListener('click', function () {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        alert('Lütfen bir kelime girin.');
        return;
      }

      const key = possibleKeys.find(k => query.includes(k) || k.includes(query));
      if (key && pageMatches[key]) {
        window.location.href = pageMatches[key];
      } else {
        alert('Aradığınız sayfa bulunamadı.');
      }
    });
  }

  // Modal kapatma (isteğe bağlı)
  if (searchCloseBtn && searchModal) {
    searchCloseBtn.addEventListener('click', function () {
      searchModal.classList.add('hidden');
      searchInput.value = '';
      suggestionsList.innerHTML = '';
      suggestionsList.classList.add('hidden');
    });
  }
});
