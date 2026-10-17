# 🌲 Verity w Mrocznym Lesie Minecraft – Aplikacja 3D

Aplikacja trójwymiarowa (WebGL / Three.js) przedstawiająca postać **Verity** z uniwersum Minecraft (analog horror / seria ARG autorstwa *ThatMob*) uchwyconą w dynamicznym **skoku** pośród gęstego, mrocznego lasu ciemnych dębów (*Dark Oak Forest*).

---

## 🚀 Jak uruchomić aplikację?

1. **Najprostszy sposób:** Kliknij dwukrotnie w plik **`uruchom.bat`**.
2. **Alternatywnie:** Otwórz plik **`index.html`** w dowolnej nowoczesnej przeglądarce internetowej (Microsoft Edge, Google Chrome, Firefox, Opera, Brave).

> **Aplikacja działa w 100% offline.** Wszystkie biblioteki (`three.min.js`, `OrbitControls.js`) oraz generator tekstur proceduralnych i syntezator audio są zawarte lokalnie – nie wymaga dostępu do Internetu ani instalacji środowisk takich jak Node.js czy Python.

---

## 🎮 Główne funkcje aplikacji

### 1. Postać Verity podczas skoku
* **3 Formy postaci do wyboru:**
  * **Minecraft Mob (Postać blokowa):** Klasyczna anatomia postaci ze Steve/Alex rig, żółta głowa z charakterystycznymi pustymi, owalnymi czarnymi oczami i złowrogim, szerokim uśmiechem Verity, ciemne ubranie z naszywką pomocnika i żółtymi zszyciami.
  * **Potwór (True Stalker Form):** Wydłużona, koszmarna sylwetka z długimi kończynami, ostrymi szponami, otwartą paszczą z rzędami zębów i krwistymi źrenicami.
  * **Byt / Kula (Classic Entity):** Kultowa, lewitująca żółta kula znana z filmów analog horror (*"Your personal helper friend!"*), otoczona wirującymi wokselami cienia.
* **Dynamika skoku:**
  * **Stop-klatka (Freeze Frame):** Postać zawieszona w powietrzu w szczytowym punkcie wybicia (apex) z dynamicznym pochyleniem tułowia, uniesionym kolanem, odrzuconą w tył nogą, wyciągniętymi dłońmi i smugami pędu powietrza.
  * **Pętla skoku (Jump Cycle):** Płynna, zapętlona trajektoria paraboli skoku z wybicia z pnia drzewa.
  * **Przycisk "WYSKOCZ TERAZ!" (Spacja):** Natychmiastowe wyzwolenie dynamicznego skoku akcji z efektem uderzenia powietrza i dźwiękiem.

### 2. Otoczenie: Bardzo mroczny las Minecraft (*Dark Oak Forest*)
* **Wokselowe ukształtowanie terenu:** Pofałdowane bloki podzolu, ciemnej ziemi, mchu i omszałego brukowca.
* **Potężne Ciemne Dęby:** Pnie 2x2 z widocznymi słojami drewna i korzeniami wbijającymi się w ściółkę oraz gęste, wielowarstwowe korony liści blokujące światło nieba.
* **Przerażające detale horroru:**
  * Czerwone, świecące ślepia obserwujące gracza z głębi pni drzew i mrugające w ciemności.
  * Płonąca dynia Jack O'Lantern ukryta w korzeniach.
  * Świecące czerwone grzyby w ściółce.
  * Pył i odłamki ziemi wyrzucone w powietrze w punkcie odbicia.
  * Unoszące się w powietrzu zarodniki leśne i cząsteczki mgły.
  * Padający deszcz i losowe wyładowania burzowe (błyskawice rozświetlające korony drzew).

### 3. Kinematografia i perspektywy kamery
* **Kamera kinowa:** Niski, dynamiczny kąt patrzący w górę na skaczącą postać.
* **Zbliżenie na twarz:** Fokus na niepokojącym, zamrożonym uśmiechu Verity.
* **Profil skoku:** Kadr z boku ukazujący anatomię i układ kończyn w locie.
* **Z korony drzew:** Widok z góry przez gałęzie mrocznego lasu.
* **Widok gracza (POV):** Pierwszoosobowa perspektywa uciekającego gracza, na którego rzuca się Verity.
* **Swobodny obrót 360°:** Pełna kontrola nad obrotem, przybliżeniem i przesunięciem.

### 4. Dźwięk i efekty specjalne
* **Wbudowany syntezator Web Audio API:** Generowany proceduralnie w czasie rzeczywistym świst wiatru w konarach drzew, sub-basowy horror drone, świst pędu powietrza przy skoku oraz grzmoty piorunów.
* **Pochodnia gracza:** Dynamiczne ciepłe światło podążające za kamerą, symulujące trzymanie pochodni w dłoni w grze Minecraft.
* **Filtr VHS / Analog Horror:** Efekt kineskopu CRT, linie skanowania (scanlines), winieta oraz nakładka nagrywania `REC ●`.
* **Zrzut ekranu HD:** Zapisanie czystego kadru 3D w pełnej rozdzielczości do pliku `.png`.

---

## ⌨️ Sterowanie

| Klawisz / Mysz | Akcja |
|---|---|
| **Lewy Przycisk Myszy (LPM)** | Obrót kamery 360° wokół postaci |
| **Prawy Przycisk Myszy (PPM)** | Przesuwanie kamery (Pan) |
| **Kółko myszy (Scroll)** | Płynne przybliżanie / oddalanie (Zoom) |
| **Spacja** | Wykonanie natychmiastowego skoku |
| **Klawisz H** | Ukrycie / pokazanie interfejsu (HUD) do zdjęć |

---

## 📁 Struktura plików projektu

```
zadanie 1 antigravity/
├── index.html          # Główna strona aplikacji i interfejs HUD
├── style.css           # Stylizacja mrocznego interfejsu i efekty VHS
├── app.js              # Silnik 3D Three.js, procedury, modele i syntezator audio
├── three.min.js        # Biblioteka Three.js (wersja offline r128)
├── OrbitControls.js    # Kontroler kamery 3D
├── uruchom.bat         # Launcher aplikacji dla systemu Windows
└── README.md           # Dokumentacja projektu
```
