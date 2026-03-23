# Melodix App - Entity Relationship (ER) Diagram

Aşağıdaki diyagram, Melodix uygulamasının Supabase üzerinde kurgulanan veritabanı tablolarının birbirleriyle olan ilişkilerini (Entity-Relationship) göstermektedir.

```mermaid
erDiagram
    PROFILES {
        uuid id PK "Referans: auth.users.id"
        string username
        string full_name
        string avatar_url
        timestamp updated_at
    }
    ARTISTS {
        uuid id PK
        string name
        text bio
        string image_url
        timestamp created_at
    }
    ALBUMS {
        uuid id PK
        string title
        uuid artist_id FK
        date release_date
        string cover_url
        timestamp created_at
    }
    SONGS {
        uuid id PK
        string title
        uuid album_id FK
        uuid artist_id FK
        integer duration "Saniye cinsinden"
        string audio_url
        timestamp created_at
    }
    PLAYLISTS {
        uuid id PK
        uuid user_id FK "Referans: profiles.id"
        string name
        text description
        string cover_image_url
        boolean is_public
        timestamp created_at
    }
    PLAYLIST_SONGS {
        uuid playlist_id PK,FK
        uuid song_id PK,FK
        timestamp added_at
    }
    LIKED_SONGS {
        uuid user_id PK,FK "Referans: profiles.id"
        uuid song_id PK,FK
        timestamp liked_at
    }

    PROFILES ||--o{ PLAYLISTS : "Oluşturur"
    PROFILES ||--o{ LIKED_SONGS : "Beğenir"
    ARTISTS ||--o{ ALBUMS : "Yayınlar"
    ARTISTS ||--o{ SONGS : "Söyler"
    ALBUMS ||--o{ SONGS : "İçerir"
    PLAYLISTS ||--o{ PLAYLIST_SONGS : "İçerir"
    SONGS ||--o{ PLAYLIST_SONGS : "Eklenir"
    SONGS ||--o{ LIKED_SONGS : "Beğenilir"
```

## Tablo İlişkileri Açıklaması
- **PROFILES:** `auth.users` tablosuna (Supabase Auth) birebir bağlı kullanıcı profil bilgilerini (kullanıcı adı, avatar vb.) tutar.
- **ARTISTS & ALBUMS & SONGS:** Bir sanatçının birden çok albümü ve şarkısı olabilir. Şarkılar bir albüme bağlıdır. (Bu yapı, "Single" türündeki şarkılar için tek şarkılık albüm mantığıyla da kurgulanabilir).
- **PLAYLISTS:** `PROFILES` tablosuna bağlıdır (Kullanıcı listeleri).
- **PLAYLIST_SONGS:** Many-to-Many (Çoka çok) ilişki tablosudur. Bir çalma listesinde birden fazla şarkı olur, bir şarkı birden fazla çalma listesinde bulunabilir.
- **LIKED_SONGS:** Many-to-Many ilişki tablosudur. Hangi kullanıcının hangi şarkıyı beğendiğini asenkron tarih verisiyle saklar.
