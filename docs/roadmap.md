# Melodix App Yol Haritası (Roadmap)

## Faz 1 — Proje Tanımı ve Planlama
**Amaç:** Minimum çalışır ürün (MVP) kapsamını netleştirmek.
- [x] Uygulamanın amacını netleştir (kişisel müzik arşivi, arkadaşlarla paylaşım)
- [x] MVP özelliklerini belirle (kullanıcı girişi, şarkı oynatma, playlist, kütüphane)
- [x] Teknoloji stack’i kesinleştir (React Native, Supabase, Supabase Storage)
- [x] Uygulama adını belirle
- [x] Git repository oluştur
- [x] Basit proje dökümantasyonu yaz

## Faz 2 — Sistem Mimarisi
**Amaç:** Backend ve veri yapısını planlamak.
- [x] Supabase projesi oluştur
- [x] Authentication yapılandır
- [x] Storage bucket planla
- [x] Veritabanı tablolarını tasarla
- [x] Entity ilişkilerini belirle (users, artists, albums, songs, playlists, playlist_songs, liked_songs)
- [ ] ER diagramı çiz

## Faz 3 — Storage Yapısı
**Amaç:** Müzik ve görseller için dosya organizasyonu.
- [x] Supabase Storage bucket oluştur
- [x] Klasör yapısı tasarla (music, covers, artists, albums)
- [x] MP3 yükleme prosedürü belirle
- [x] Cover image standardı belirle

## Faz 4 — Mobile Proje Kurulumu
**Amaç:** React Native uygulamasını başlatmak.
- [x] React Native projesi oluştur (Expo)
- [x] Navigation sistemi kur
- [ ] State management seç
- [ ] UI component yapısını planla
- [x] Klasör yapısı tasarla (screens, components, services, hooks, store)

## Faz 5 — Authentication
**Amaç:** Kullanıcı sistemi.
- [x] Supabase Auth entegrasyonu
- [x] Login ekranı
- [x] Register ekranı
- [x] Session yönetimi
- [x] Logout işlemi

## Faz 6 — Müzik Verisi Yönetimi
**Amaç:** Şarkı metadata yönetimi.
- [ ] Artist ekleme
- [ ] Album ekleme
- [ ] Şarkı ekleme
- [ ] MP3 dosyası upload
- [ ] Cover image upload
- [ ] Admin panel ihtiyacını değerlendirme

## Faz 7 — Şarkı Listeleme
**Amaç:** Kullanıcıların müzikleri görebilmesi.
- [ ] Tüm şarkıları listeleme
- [ ] Album sayfası
- [ ] Artist sayfası
- [ ] Cover gösterimi
- [ ] Duration gösterimi

## Faz 8 — Audio Player
**Amaç:** Uygulamanın çekirdeği.
- [ ] Audio player kütüphanesi seç
- [ ] Play fonksiyonu
- [ ] Pause fonksiyonu
- [ ] Next / Previous
- [ ] Progress bar
- [ ] Seek özelliği
- [ ] Mini player

## Faz 9 — Playlist Sistemi
**Amaç:** Kullanıcı playlist oluşturabilsin.
- [ ] Playlist oluşturma
- [ ] Playlist silme
- [ ] Playlist'e şarkı ekleme
- [ ] Playlist'ten şarkı çıkarma
- [ ] Playlist sıralaması

## Faz 10 — Kütüphane (Library)
**Amaç:** Kullanıcı kişisel müzik koleksiyonu.
- [ ] Liked songs
- [ ] Kullanıcı playlistleri
- [ ] Son dinlenenler

## Faz 11 — Arama
**Amaç:** Müzik bulma.
- [ ] Şarkı arama
- [ ] Sanatçı arama
- [ ] Album arama
- [ ] Arama performans optimizasyonu

## Faz 12 — UI/UX İyileştirme
**Amaç:** Kullanılabilirlik.
- [ ] Dark theme
- [ ] Loading state
- [ ] Empty state
- [ ] Skeleton UI
- [ ] Mini player animasyonu

## Faz 13 — Arkadaşlarla Kullanım
**Amaç:** Küçük sosyal özellikler.
- [ ] Arkadaş davet sistemi
- [ ] Ortak playlist
- [ ] Playlist paylaşımı

## Faz 14 — Performans
- [ ] Caching
- [ ] Audio buffering
- [ ] Lazy loading
- [ ] Image optimization

## Faz 15 — Deployment
- [ ] Test kullanıcıları ekle
- [ ] Crash test
- [ ] Beta dağıtım
