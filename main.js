document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const suggestionsList = document.getElementById("suggestionsList");

  // Aranabilir veriler ve yönlendirme eşleştirmeleri
  const pages = {
    "temizlik": "temizlik.html",
    "gida": "gida.html",
    "gıda": "gida.html",
    "kırtasiye": "kirtasiye.html",
    "kirtasiye": "kirtasiye.html",
    "anasayfa": "index.html",
    "hakkımızda": "hakkimizda.html",
    "iletisim": "iletisim.html"
  };

  const keywords = Object.keys(pages);

  // Arama kutusunda yazdıkça önerileri güncelle
  searchInput.addEventListener("input", function () {
    const inputValue = this.value.toLowerCase();
    suggestionsList.innerHTML = "";

    if (inputValue.length === 0) {
      suggestionsList.classList.add("hidden");
      return;
    }

    const matches = keywords.filter(keyword => keyword.includes(inputValue));

    if (matches.length > 0) {
      matches.forEach(match => {
        const li = document.createElement("li");
        li.textContent = match;
        li.classList.add("px-4", "py-2", "cursor-pointer", "hover:bg-gray-100", "text-sm");
        li.addEventListener("click", function () {
          window.location.href = pages[match];
        });
        suggestionsList.appendChild(li);
      });
      suggestionsList.classList.remove("hidden");
    } else {
      suggestionsList.classList.add("hidden");
    }
  });

  // Form gönderilince yönlendirme
  window.performSearch = function (event) {
    event.preventDefault();
    const query = searchInput.value.trim().toLowerCase();

    if (pages[query]) {
      window.location.href = pages[query];
    } else {
      alert("Aradığınız sayfa bulunamadı.");
    }
  };
});
