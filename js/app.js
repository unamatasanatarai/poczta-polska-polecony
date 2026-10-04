// Ścieżka/Data URL do obrazka szablonu (518 x 735 px)
var IMG_SRC = (typeof TEMPLATE_B64 !== 'undefined') ? TEMPLATE_B64 : 'etykieta.jpg';

var templateImage = null;
var canvas = null;
var ctx = null;
var SCALE = 2; // High-DPI 2x Retina & Print scaling factor

// Pamieć podręczna elementów DOM dla optymalizacji
var elementsCache = {};

function getCachedElement(id) {
  if (!elementsCache[id]) {
    elementsCache[id] = document.getElementById(id);
  }
  return elementsCache[id];
}

// Inicjalizacja przy załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
  canvas = document.getElementById('label-canvas');
  ctx = canvas.getContext('2d');

  // Wczytaj zapamiętane dane Nadawcy z localStorage i wypełnij formularz
  wczytajZPamieci();

  // Dodaj nasłuchiwanie zdarzeń blur / change na polach Nadawcy dla natychmiastowej zapisu
  ['nadawca-1', 'nadawca-2', 'nadawca-3', 'nadawca-kod', 'nadawca-miasto'].forEach(function(id) {
    var el = getCachedElement(id);
    if (el) {
      el.addEventListener('blur', zapiszWPamieci);
      el.addEventListener('change', zapiszWPamieci);
    }
  });

  window.addEventListener('beforeunload', zapiszWPamieci);

  // Wczytaj obrazek szablonu
  var img = new Image();
  img.onload = function() {
    templateImage = img;
    var baseW = img.naturalWidth || 518;
    var baseH = img.naturalHeight || 735;
    canvas.width = baseW * SCALE;
    canvas.height = baseH * SCALE;
    rysuj();
  };
  img.onerror = function() {
    // Rysowanie awaryjnej czystej etykiety
    canvas.width = 518 * SCALE;
    canvas.height = 735 * SCALE;
    rysujCzyszczenie();
  };
  img.src = IMG_SRC;
});

function val(id) {
  var el = getCachedElement(id);
  return el ? el.value.trim() : '';
}

function setVal(id, text) {
  var el = getCachedElement(id);
  if (el) el.value = text;
}

function getSelectedFormat() {
  var radios = document.getElementsByName('opt-format');
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) return radios[i].value;
  }
  return '';
}

function setSelectedFormat(valFormat) {
  var radios = document.getElementsByName('opt-format');
  for (var i = 0; i < radios.length; i++) {
    radios[i].checked = (radios[i].value === valFormat);
  }
}

// Główna funkcja rysująca po płótnie (canvas)
function rysuj() {
  if (!canvas || !ctx) return;

  ctx.save();
  ctx.scale(SCALE, SCALE);

  var W = 518;
  var H = 735;

  ctx.clearRect(0, 0, W, H);

  // Narysuj tło szablonu
  if (templateImage) {
    ctx.drawImage(templateImage, 0, 0, W, H);
  } else {
    rysujCzyszczenie();
  }

  // Ustawienia czcionki tekstu
  ctx.font = '16px Arial, sans-serif';
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'alphabetic';

  // Nadawca
  var n1 = val('nadawca-1');
  var n2 = val('nadawca-2');
  var n3 = val('nadawca-3');
  var nKod = val('nadawca-kod');
  var nMiasto = val('nadawca-miasto');

  fillTextAutoShrink(n1, 130, 188, 345, 16);
  fillTextAutoShrink(n2, 130, 219, 345, 16);
  fillTextAutoShrink(n3, 130, 249, 345, 16);
  fillTextAutoShrink(nKod, 130, 279, 90, 16);
  fillTextAutoShrink(nMiasto, 240, 279, 235, 16);

  // 3. Adresat
  var a1 = val('adresat-1');
  var a2 = val('adresat-2');
  var a3 = val('adresat-3');
  var aKod = val('adresat-kod');
  var aMiasto = val('adresat-miasto');

  fillTextAutoShrink(a1, 130, 329, 345, 16);
  fillTextAutoShrink(a2, 130, 359, 345, 16);
  fillTextAutoShrink(a3, 130, 389, 345, 16);
  fillTextAutoShrink(aKod, 130, 420, 90, 16);
  fillTextAutoShrink(aMiasto, 240, 420, 235, 16);

  // 4. Potwierdzenie doręczenia albo zwrotu (Checkbox)
  var elDoreczenia = getCachedElement('opt-doreczenia');
  if (elDoreczenia && elDoreczenia.checked) {
    rysujX(50, 451, 14);
  }

  // 5. SMS / E-mail
  var sms = val('sms-email');
  if (sms) {
    fillTextAutoShrink(sms, 130, 494, 345, 15);
  }

  // 6. Potwierdzenie odbioru (Checkbox)
  var elOdbioru = getCachedElement('opt-odbioru');
  if (elOdbioru && elOdbioru.checked) {
    rysujX(50, 528, 14);
  }

  // 7. Priorytetowa (Checkbox)
  var elPriory = getCachedElement('opt-priory');
  if (elPriory && elPriory.checked) {
    rysujX(243, 528, 14);
  }

  ctx.restore();

  // Zapisuj dane nadawcy w localStorage z odroczeniem (debounced)
  debouncedZapiszWPamieci();
}

// Rysowanie ikony 'X' w kratce checkboxa
function rysujX(cx, cy, size) {
  var half = size / 2;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - half, cy - half);
  ctx.lineTo(cx + half, cy + half);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + half, cy - half);
  ctx.lineTo(cx - half, cy + half);
  ctx.stroke();
}

// Rysowanie tekstu z automatycznym i natychmiastowym (O(1)) wyliczaniem stopnia czcionki
function fillTextAutoShrink(text, x, y, maxWidth, maxFontSize, isBold, fontFamily) {
  if (!text) return;
  fontFamily = fontFamily || 'Arial, sans-serif';
  var maxFont = maxFontSize || 16;
  var weight = isBold ? 'bold ' : '';

  ctx.font = weight + maxFont + 'px ' + fontFamily;
  var currentWidth = ctx.measureText(text).width;
  var fontSize = maxFont;

  if (currentWidth > maxWidth) {
    fontSize = Math.max(7, Math.floor(maxFont * (maxWidth / currentWidth) * 10) / 10);
    ctx.font = weight + fontSize + 'px ' + fontFamily;
  }

  ctx.fillText(text, x, y);
}

function rysujCzyszczenie() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 518, 735);
  ctx.strokeStyle = '#cccccc';
  ctx.strokeRect(1, 1, 516, 733);
}

function updateCheckboxCards() {
  document.querySelectorAll('.checkbox-card').forEach(function(card) {
    var cb = card.querySelector('input[type="checkbox"]');
    if (cb && cb.checked) {
      card.classList.add('checked');
    } else {
      card.classList.remove('checked');
    }
  });
}

// Optymalizacja renderowania za pomocą requestAnimationFrame
var renderPending = false;
function aktualizuj() {
  updateCheckboxCards();
  if (!renderPending) {
    renderPending = true;
    requestAnimationFrame(function() {
      rysuj();
      renderPending = false;
    });
  }
}

// Automatyczne formatowanie kodu pocztowego z zachowaniem pozycji kursora (XX-XXX)
function formatKodPocztowy(input) {
  var selStart = input.selectionStart;
  var oldLen = input.value.length;
  var v = input.value.replace(/\D/g, '');
  if (v.length > 2) {
    v = v.substring(0, 2) + '-' + v.substring(2, 5);
  }
  input.value = v;
  var newLen = input.value.length;
  if (selStart !== null) {
    var newPos = Math.max(0, selStart + (newLen - oldLen));
    input.setSelectionRange(newPos, newPos);
  }
}

// Zapisuj dane nadawcy w przeglądarce z odroczeniem (debounce) oraz natychmiast przy wyjściu z pola
var saveTimeout = null;
function debouncedZapiszWPamieci() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(zapiszWPamieci, 200);
}

function zapiszWPamieci() {
  try {
    ['1', '2', '3', 'kod', 'miasto'].forEach(function(key) {
      localStorage.setItem('lp_nadawca_' + key, val('nadawca-' + key));
    });
  } catch (e) {}
}

function wczytajZPamieci() {
  try {
    ['1', '2', '3', 'kod', 'miasto'].forEach(function(key) {
      var saved = localStorage.getItem('lp_nadawca_' + key);
      if (saved !== null) {
        setVal('nadawca-' + key, saved);
      }
    });
  } catch (e) {}
}

// Przycisk "Wstaw dane przykładowe"
function wypelnijPrzyklad() {
  setVal('nadawca-1', 'Jan Kowalski');
  setVal('nadawca-2', 'ul. Przykładowa 15 m. 3');
  setVal('nadawca-3', 'Budynek B, II piętro');
  setVal('nadawca-kod', '00-001');
  setVal('nadawca-miasto', 'Warszawa');

  setVal('adresat-1', 'Anna Nowak');
  setVal('adresat-2', 'ul. Kwiatowa 7');
  setVal('adresat-3', 'pokój 402');
  setVal('adresat-kod', '30-002');
  setVal('adresat-miasto', 'Kraków');

  setVal('sms-email', '600-111-222');
  var optDor = getCachedElement('opt-doreczenia');
  var optOdb = getCachedElement('opt-odbioru');
  var optPrio = getCachedElement('opt-priory');

  if (optDor) optDor.checked = false;
  if (optOdb) optOdb.checked = true;
  if (optPrio) optPrio.checked = true;

  rysuj();
}

// Zamiana danych Nadawcy z Adresatem
function zamienNadawceZAdresatem() {
  var t1 = val('nadawca-1'), t2 = val('nadawca-2'), t3 = val('nadawca-3'), tk = val('nadawca-kod'), tm = val('nadawca-miasto');
  setVal('nadawca-1', val('adresat-1'));
  setVal('nadawca-2', val('adresat-2'));
  setVal('nadawca-3', val('adresat-3'));
  setVal('nadawca-kod', val('adresat-kod'));
  setVal('nadawca-miasto', val('adresat-miasto'));

  setVal('adresat-1', t1);
  setVal('adresat-2', t2);
  setVal('adresat-3', t3);
  setVal('adresat-kod', tk);
  setVal('adresat-miasto', tm);

  rysuj();
}

// Przycisk "Wyczyść"
function wyczyscFormularz() {
  ['nadawca-1','nadawca-2','nadawca-3','nadawca-kod','nadawca-miasto',
   'adresat-1','adresat-2','adresat-3','adresat-kod','adresat-miasto','sms-email'].forEach(function(id) {
    setVal(id, '');
  });

  ['opt-doreczenia','opt-odbioru','opt-priory'].forEach(function(id) {
    var el = getCachedElement(id);
    if (el) el.checked = false;
  });

  rysuj();
}

// Pobieranie obrazu PNG
function zapiszPNG() {
  rysuj();
  var link = document.createElement('a');
  link.download = 'list-polecony-' + (val('adresat-1') || 'druk') + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Drukowanie bezpośrednie przez przeglądarkę
function drukuj() {
  rysuj();
  window.print();
}

// Generowanie pliku PDF za pomocą jsPDF z wydajną kompresją JPEG
function generujPDF() {
  rysuj();
  if (typeof window.jspdf === 'undefined') {
    alert('Ładowanie biblioteki PDF... Proszę spróbować za chwilę.');
    return;
  }

  var jsPDF = window.jspdf.jsPDF;
  var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  var layoutSelect = getCachedElement('pdf-layout');
  var layoutMode = layoutSelect ? layoutSelect.value : '1a4';

  if (layoutMode === 'a6') {
    // Pojedynczy druk format A6 (105 x 148 mm)
    var doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [105, 148]
    });
    doc.addImage(dataUrl, 'JPEG', 0, 0, 105, 148);
    doc.save('list-polecony-A6.pdf');
  } else {
    // Strona A4 (210 x 297 mm)
    var doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    var labelW = 105;
    var labelH = 148.5;

    if (layoutMode === '1a4') {
      // 1 druk na arkuszu A4 w lewym górnym rogu
      doc.addImage(dataUrl, 'JPEG', 0, 0, labelW, labelH);
    } else if (layoutMode === '2a4') {
      // 2 druki na A4 (góra i dół)
      doc.addImage(dataUrl, 'JPEG', 0, 0, labelW, labelH);
      doc.addImage(dataUrl, 'JPEG', 0, 148.5, labelW, labelH);
    } else if (layoutMode === '4a4') {
      // 4 druki na A4 (siatka 2x2)
      doc.addImage(dataUrl, 'JPEG', 0, 0, labelW, labelH);
      doc.addImage(dataUrl, 'JPEG', 105, 0, labelW, labelH);
      doc.addImage(dataUrl, 'JPEG', 0, 148.5, labelW, labelH);
      doc.addImage(dataUrl, 'JPEG', 105, 148.5, labelW, labelH);
    }

    doc.save('potwierdzenie-nadania-A4.pdf');
  }
}

