# System Fakturowania - Działalność Nierejestrowana

Kompletny system fakturowania przeznaczony dla działalności nierejestrowanych, działający lokalnie z bazą danych SQLite.

## Funkcjonalności

### ✅ System logowania
- Jednorazowe logowanie email/hasło
- Bezpieczne sesje użytkownika
- Przekierowanie na dashboard

### ✅ Zarządzanie działalnościami
- Możliwość dodania wielu działalności
- Przechowywanie danych sprzedawcy i limitów
- Przełącznik aktywnej działalności
- Filtrowanie według wybranej działalności

### ✅ Dashboard (styl Firmio)
- Przychód bieżący miesiąc i rok
- Pozostałe kwoty do limitów
- Lista ostatnich faktur
- Czytelne statystyki

### ✅ Moduł faktur
- CRUD dla faktur z pozycjami
- Automatyczna numeracja `INV/{YYYY}/{MM}/{NNN}`
- Filtry i wyszukiwarka
- Kalkulacje na żywo

### ✅ Podgląd i wydruk
- Profesjonalny layout faktury
- Optymalizowany do druku/PDF
- Automatyczne pobieranie danych sprzedawcy

### ✅ Logika limitów
- Brak blokowania przy przekroczeniu
- Wyświetlanie aktualnych sum
- Ręczne ustawianie limitów

## Instalacja i uruchomienie

### Wymagania systemowe
- Node.js 18+ 
- npm lub yarn

### Kroki instalacji

1. **Instalacja zależności:**
```bash
npm install
```

2. **Uruchomienie aplikacji:**
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Dane testowe
- Email: `admin@faktury.pl`
- Hasło: `admin123`

## Struktura projektu

```
├── server/                 # Backend Express.js
│   └── index.ts           # Główny plik serwera z API
├── src/                   # Frontend React
│   ├── components/        # Komponenty React
│   ├── contexts/          # Konteksty (Auth)
│   ├── services/          # Usługi API
│   └── types/            # Definicje TypeScript
├── data/                  # Folder z bazą danych
│   └── app.db            # SQLite database (tworzony automatycznie)
└── package.json          # Konfiguracja projektu
```

## Baza danych

System automatycznie tworzy bazę SQLite w folderze `data/app.db` z następującymi tabelami:

- `users` - użytkownicy systemu
- `businesses` - działalności gospodarcze  
- `invoices` - faktury
- `invoice_items` - pozycje faktur

## Technologie

### Backend
- Express.js - serwer HTTP
- SQLite3 - baza danych 
- bcryptjs - hashowanie haseł
- express-session - sesje użytkownika

### Frontend  
- React 18 - interfejs użytkownika
- TypeScript - typowanie statyczne
- Tailwind CSS - stylowanie
- Lucide React - ikony

## Bezpieczeństwo

- Hashowanie haseł z bcryptjs
- Sesje HTTP z ciasteczkami
- Walidacja po stronie serwera
- Autoryzacja wszystkich operacji

## Funkcjonalności szczegółowe

### Automatyczna numeracja faktur
Format: `INV/{YYYY}/{MM}/{NNN}` - resetuje się co miesiąc dla każdej działalności.

### Kalkulacje podatkowe
- Obsługa różnych stawek podatkowych na pozycję
- Domyślnie 0% (działalność nierejestrowana)
- Automatyczne liczenie sum brutto

### Responsive design
- Dostosowany do urządzeń mobilnych
- Optymalizowany do druku
- Czytelny na wszystkich ekranach

### Limitowanie przychodów
- Miesięczny i roczny limit dla każdej działalności
- Automatyczne obliczanie pozostałych kwot
- Brak blokowania przy przekroczeniu (tylko informacja)

## Wsparcie techniczne

System jest przygotowany do działania w środowisku produkcyjnym lokalnym (VPS, dedykowany serwer). Dla wdrożeń chmurowych może wymagać dodatkowych modyfikacji.

## Licencja

Kod udostępniony na potrzeby demonstracji funkcjonalności systemu fakturowania.