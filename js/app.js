// Ścieżka/Data URL do obrazka szablonu (518 x 735 px)
var IMG_SRC = (typeof TEMPLATE_B64 !== 'undefined') ? TEMPLATE_B64 : 'etykieta.jpg';

var templateImage = null;
var canvas = null;
var ctx = null;

// Inicjalizacja przy załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
  canvas = document.getElementById('label-canvas');
  ctx = canvas.getContext('2d');

  // Wczytaj zapamiętane dane Nadawcy z localStorage
  wczytajZPamieci();

  // Wczytaj obrazek szablonu
  var img = new Image();
  img.src = IMG_SRC;
  img.onload = function() {
    templateImage = img;
    canvas.width = img.naturalWidth || 518;
    canvas.height = img.naturalHeight || 735;
    rysuj();
  };
  img.onerror = function() {
    // Rysowanie awaryjnej czystej etykiety
    canvas.width = 518;
    canvas.height = 735;
    rysujCzyszczenie();
  };
});

function val(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setVal(id, text) {
  var el = document.getElementById(id);
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
  var W = canvas.width;
  var H = canvas.height;

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
  if (document.getElementById('opt-doreczenia').checked) {
    rysujX(50, 451, 14);
  }

  // 5. SMS / E-mail
  var sms = val('sms-email');
  if (sms) {
    fillTextAutoShrink(sms, 160, 494, 315, 15);
  }

  // 6. Potwierdzenie odbioru (Checkbox)
  if (document.getElementById('opt-odbioru').checked) {
    rysujX(50, 528, 14);
  }

  // 7. Priorytetowa (Checkbox)
  if (document.getElementById('opt-priory').checked) {
    rysujX(243, 528, 14);
  }

  // Zapisuj dane nadawcy w localStorage
  zapiszWPamieci();
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

// Rysowanie tekstu z automatycznym zmniejszaniem stopnia czcionki, jeśli tekst przekracza maxWidth
function fillTextAutoShrink(text, x, y, maxWidth, maxFontSize, isBold, fontFamily) {
  if (!text) return;
  fontFamily = fontFamily || 'Arial, sans-serif';
  var fontSize = maxFontSize || 16;
  var weight = isBold ? 'bold ' : '';

  ctx.font = weight + fontSize + 'px ' + fontFamily;
  while (ctx.measureText(text).width > maxWidth && fontSize > 7) {
    fontSize -= 0.5;
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

function aktualizuj() {
  updateCheckboxCards();
  rysuj();
}

// Automatyczne formatowanie kodu pocztowego (XX-XXX)
function formatKodPocztowy(input) {
  var v = input.value.replace(/\D/g, '');
  if (v.length > 2) {
    v = v.substring(0, 2) + '-' + v.substring(2, 5);
  }
  input.value = v;
}

// Zapisuj dane nadawcy w przeglądarce
function zapiszWPamieci() {
  try {
    localStorage.setItem('lp_nadawca_1', val('nadawca-1'));
    localStorage.setItem('lp_nadawca_2', val('nadawca-2'));
    localStorage.setItem('lp_nadawca_3', val('nadawca-3'));
    localStorage.setItem('lp_nadawca_kod', val('nadawca-kod'));
    localStorage.setItem('lp_nadawca_miasto', val('nadawca-miasto'));
  } catch (e) {}
}

function wczytajZPamieci() {
  try {
    if (localStorage.getItem('lp_nadawca_1')) setVal('nadawca-1', localStorage.getItem('lp_nadawca_1'));
    if (localStorage.getItem('lp_nadawca_2')) setVal('nadawca-2', localStorage.getItem('lp_nadawca_2'));
    if (localStorage.getItem('lp_nadawca_3')) setVal('nadawca-3', localStorage.getItem('lp_nadawca_3'));
    if (localStorage.getItem('lp_nadawca_kod')) setVal('nadawca-kod', localStorage.getItem('lp_nadawca_kod'));
    if (localStorage.getItem('lp_nadawca_miasto')) setVal('nadawca-miasto', localStorage.getItem('lp_nadawca_miasto'));
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
  document.getElementById('opt-doreczenia').checked = false;
  document.getElementById('opt-odbioru').checked = true;
  document.getElementById('opt-priory').checked = true;

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
    var el = document.getElementById(id);
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

// Generowanie pliku PDF za pomocą jsPDF
function generujPDF() {
  rysuj();
  if (typeof window.jspdf === 'undefined') {
    alert('Ładowanie biblioteki PDF... Proszę spróbować za chwilę.');
    return;
  }

  var jsPDF = window.jspdf.jsPDF;
  var dataUrl = canvas.toDataURL('image/png');
  var layoutMode = document.getElementById('pdf-layout').value;

  if (layoutMode === 'a6') {
    // Pojedynczy druk format A6 (105 x 148 mm)
    var doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [105, 148]
    });
    doc.addImage(dataUrl, 'PNG', 0, 0, 105, 148);
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
      doc.addImage(dataUrl, 'PNG', 0, 0, labelW, labelH);
    } else if (layoutMode === '2a4') {
      // 2 druki na A4 (góra i dół)
      doc.addImage(dataUrl, 'PNG', 0, 0, labelW, labelH);
      doc.addImage(dataUrl, 'PNG', 0, 148.5, labelW, labelH);
    } else if (layoutMode === '4a4') {
      // 4 druki na A4 (siatka 2x2)
      doc.addImage(dataUrl, 'PNG', 0, 0, labelW, labelH);
      doc.addImage(dataUrl, 'PNG', 105, 0, labelW, labelH);
      doc.addImage(dataUrl, 'PNG', 0, 148.5, labelW, labelH);
      doc.addImage(dataUrl, 'PNG', 105, 148.5, labelW, labelH);
    }

    doc.save('potwierdzenie-nadania-A4.pdf');
  }
}
