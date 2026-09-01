# Admin güvenliği ve deployment notları

Admin hesabı yalnızca `ADMIN_USERNAME` ve `ADMIN_PASSWORD` environment
variables üzerinden doğrulanır. Kaynak kodda, frontend bundle'ında veya
loglarda sabit kullanıcı adı/parola bulunmaz; uygulama varsayılan hesap
oluşturmaz.

## Zorunlu production ayarları

- `ADMIN_USERNAME`: tek yönetici hesabının kullanıcı adı.
- `ADMIN_PASSWORD`: güçlü ve benzersiz bir parola. Uzun bir parola yöneticisi
  parolası kullanılması önerilir; başka servislerde tekrar kullanılmamalıdır.
- `SESSION_SECRET`: production'da en az 32 karakterlik rastgele değer.

`SESSION_SECRET` eksik veya production'da çok kısa ise uygulama başlatılmaz.
Session cookie `HttpOnly`, `Secure`, `SameSite=Lax` ve 30 dakikalık hareketsizlik
zaman aşımıyla çalışır.

## İsteğe bağlı TOTP 2FA

2FA kullanılacaksa, authenticator uygulamasında oluşturulan Base32 secret
yalnızca `ADMIN_TOTP_SECRET` environment variable olarak tanımlanmalıdır.
Secret kaynak koda, Git'e, frontend'e veya loglara yazılmamalı; uygulama
tarafından otomatik oluşturulmamalıdır. Bu değer tanımlandığında production
login parola sonrasında 6 haneli TOTP kodu ister.

Kurulum sırası:

1. Authenticator uygulamasında Burem Elektronik için yeni bir TOTP kaydı açın.
   Algorithm olarak SHA-256, 30 saniye period ve 6 hane kullanın.
2. Verilen Base32 secret'ı güvenli bir parola yöneticisine kaydedin.
3. Render production environment variables içine `ADMIN_TOTP_SECRET` olarak
   ekleyin ve deployment'ı yeniden başlatın.
4. Yeni login akışını doğrulayın; ardından eski authenticator kaydını
   kaldırmadan önce yedek erişim planınızı kontrol edin.

`ADMIN_TOTP_SECRET` yoksa mevcut parola login'i çalışır, ancak production
loglarında 2FA'nın etkin olmadığı açıkça belirtilir.