# Turkish (tr) SEO research: PintDownload

Researched 2026-10-14/15 for Turkey, with Northern Cyprus and the Turkish-speaking diaspora served by the same pages. Full data, including the raw autocomplete output, is in `tr.json`.

## Decisions at a glance

- **hreflang `tr`** (language only), `<html lang="tr">`, `og:locale` `tr_TR`, URL prefix `/tr`. Autocomplete for `gl=de` and `gl=cy` returns the same Turkish queries as `gl=tr`, so `tr-TR` would push diaspora searchers to the English x-default. Every competitor checked declares `tr`, and Pinterest's own help center uses `/tr/`.
- **15 pages ship, 4 are skipped**: carousel, story/Idea Pin, Chrome and the SEO title generator (reasons below).
- **Slugs** are transliterated Turkish ASCII, matching what people type (`pinterest-video-indir`). The Turkish-only competitor indirpin.com.tr uses the same pattern.
- **Blocking typography bug**: the shipped Big Shoulders files are the `latin` subset and have no **İ, Ş, Ğ**. Nearly every Turkish H1 contains İ (`İNDİR`). The `latin-ext` files are already in `node_modules/@fontsource`; see Typography.
- **Honesty gate**: the audio page can only be called "MP3 Dönüştürücü" once the product outputs real audio. Today the "MP3" button saves the video stream under a `.mp3` filename. A fallback title is ready.

## Pages

All titles are 40–62 characters and all descriptions 120–158. They were checked with the repo's own `check_html_file()` from `scripts/seo_health_check.py`: 0 errors, 0 warnings.

| EN slug | TR path | Primary keyword | Title (chars) | Desc |
|---|---|---|---|---|
| index | `/tr` | pinterest indirici | Pinterest İndirici — Video, Fotoğraf ve GIF Ücretsiz İndir (58) | 156 |
| pinterest-pin-downloader | `/tr/pinterest-pin-indir` | pinterest pin indir | Pinterest Pin İndir — Linkten Video, Fotoğraf ve GIF Kaydet (59) | 150 |
| pinterest-video-downloader | `/tr/pinterest-video-indir` | pinterest video indir | Pinterest Video İndir — HD MP4, Filigransız ve Ücretsiz (55) | 153 |
| pinterest-image-downloader | `/tr/pinterest-fotograf-indir` | pinterest fotoğraf indir | Pinterest Fotoğraf İndir — HD Resim ve Duvar Kağıdı Kaydet (58) | 151 |
| pinterest-gif-downloader | `/tr/pinterest-gif-indir` | pinterest gif indir | Pinterest GIF İndir — Hareketli GIF'leri Ücretsiz Kaydet (56) | 151 |
| pinterest-board-downloader | `/tr/pinterest-pano-indir` | pinterest pano indirme | Pinterest Pano İndirme — Tüm Panoyu ZIP Olarak Kaydet (53) | 155 |
| pinterest-profile-downloader | `/tr/pinterest-profil-indir` | pinterest profil indir | Pinterest Profil İndir — Tüm Pinleri ZIP Olarak Kaydet (54) | 154 |
| pinterest-profile-picture-downloader | `/tr/pinterest-profil-fotografi-indir` | pinterest profil fotoğrafı indir | Pinterest Profil Fotoğrafı İndir — PP'yi Tam Boy ve HD Gör (58) | 153 |
| pinterest-carousel-downloader | **skip** | — | — | — |
| pinterest-story-downloader | **skip** | — | — | — |
| pinterest-audio-downloader | `/tr/pinterest-mp3-donusturucu` | pinterest mp3 dönüştürücü | Pinterest MP3 Dönüştürücü — Video Pininin Sesini İndir (54) | 158 |
| pinterest-4k-downloader | `/tr/pinterest-4k-video-indir` | pinterest 4k video indir | Pinterest 4K ve HD Video İndir — Kaynak Kalitesinde MP4 (55) | 158 |
| pinterest-to-mp4 | `/tr/pinterest-mp4-donusturucu` | pinterest mp4 dönüştürücü | Pinterest MP4 Dönüştürücü — Pin Linkini MP4'e Çevir (51) | 156 |
| pinterest-video-downloader-chrome | **skip** | — | — | — |
| pinterest-seo-title-generator | **skip** | — | — | — |
| how-to-download-pinterest-videos | `/tr/pinterestten-video-nasil-indirilir` | pinterestten video nasıl indirilir | Pinterest'ten Video Nasıl İndirilir? Telefon ve PC Rehberi (58) | 152 |
| how-to-download-pinterest-video-in-gallery | `/tr/pinterest-video-galeriye-kaydetme` | pinterest video galeriye kaydetme | Pinterest Video Galeriye Kaydetme — iPhone ve Android Rehberi (61) | 152 |
| how-to-download-pinterest-video-on-laptop | `/tr/pinterest-video-indir-pc` | pinterest video indir pc | Pinterest Video İndir PC — Bilgisayara ve Laptopa MP4 Kaydet (60) | 158 |
| download-pinterest-videos-iphone-android | `/tr/pinterest-video-indir-iphone-android` | pinterest video indir iphone | Pinterest Video İndir iPhone ve Android — Uygulamasız MP4 (57) | 156 |

### Per-page detail

#### Pinterest İndirici  `/tr`

- **Demand:** high. **Primary:** pinterest indirici. **Secondary:** pinterestten indirme, pinterest downloader, pinterest indir ücretsiz, pinterest video indirici, pinterest fotoğraf indirici, pinterest link indir
- **Title:** Pinterest İndirici — Video, Fotoğraf ve GIF Ücretsiz İndir
- **Description:** Pinterest videolarını MP4, fotoğrafları, GIF'leri, panoları ve profilleri linkle indirin. Ücretsiz; üyelik, uygulama ya da APK gerekmez, filigran eklemeyiz.
- **H1:** Pinterest İndirici
- **Autocomplete evidence:**
  - TR 'pinterest indirici' -> pinterest indirici video | pinterest video indirici hd | pinterest fotoğraf indirici | pinterest gif indirici | pinterest özel indirici
  - TR 'pinterestten indir' -> pinterestten indirme | pinterestten video indir | pinterestten foto indirme | pinterestten gif indirme | pinterestten video indirip instagramda paylaşma
  - TR 'pinterest downloader' (English term used in TR) -> hd | photo | gif | 4k | online | app
  - TR 'pinterest indir ücretsiz' -> ... ücretsiz apk | telefona indir ücretsiz türkçe (mixed with app-install intent)
  - Bare 'pinterest indir' is NOT a target: autocomplete adds apk/pc/windows/mac and the Turkey-region SERP (DuckDuckGo kl=tr-tr) is all Pinterest app listings (tr.pinterest.com, Google Play, Microsoft Store, App Store, APKPure).
- **FAQ topics:**
  - Pinterest'ten üye olmadan / giriş yapmadan indirme yapabilir miyim?
  - Ücretsiz mi? Uygulama ya da APK indirmem gerekiyor mu? (autocomplete: 'pinterest indir apk', 'pinterest video indirici apk'; answer: no app, no APK, works in the browser)
  - Neleri indirebilirim: video, fotoğraf, GIF, karusel Pin kartları, pano, profil, profil fotoğrafı
  - Pinterest'teki 'Kaydet' ile cihaza indirmek arasındaki fark (Kaydet only pins to a board; 'Kaydetmeler' tab)
  - Pinterest'in kendi 'Görüntüyü indir' seçeneği varken neden bu araç? (videoda yok; GIF/pano/profil yok)
  - Filigran var mı? (biz eklemeyiz; içerik üreticisinin videoya koyduğu yazı/filigran kalır)
  - Gizli pano veya gizli hesaptaki Pinleri indirebilir miyim? (hayır, yalnızca herkese açık)
  - İndirilen dosyalar nereye gidiyor? ('pinterest indirilenler nereye gidiyor' is searched)
  - Pinterest'ten video indirmek yasal mı? ('pinterestten video indirmek yasal mı' is searched): kişisel kullanım, telif hakkı içerik sahibinde
  - İndirdiğim videoyu Instagram'da paylaşabilir miyim? ('pinterestten video indirip instagramda paylaşma'): yalnızca izinle ve kaynak göstererek
- **Notes:** Home owns the generic 'downloader' intent; 'pinterest video indir' belongs to the video page to avoid cannibalisation. Display H1 renders PINTEREST İNDİRİCİ: needs Turkish uppercase rules and the latin-ext font subset (see typography).

#### Pinterest Pin İndir  `/tr/pinterest-pin-indir`

- **Demand:** medium. **Primary:** pinterest pin indir. **Secondary:** pinterest pin indirici, pinterest link indir, pinterest linkle video indir, pinterest pin video indir, pinterest pin nasıl indirilir
- **Title:** Pinterest Pin İndir — Linkten Video, Fotoğraf ve GIF Kaydet
- **Description:** Tek bir Pinterest Pin linkini yapıştırın; fotoğrafı, MP4 videoyu, GIF'i ya da karusel Pininin tüm kartlarını indirin. pin.it kısa linkleri de çalışır.
- **H1:** Pinterest Pin İndir
- **Autocomplete evidence:**
  - TR 'pinterest pin indir' -> pinterest pin indirici | pinterest pin video indir | pinterest toplu pin indirme | pinterest pin nasıl indirilir
  - TR 'pinterest link' -> pinterest link indir | pinterest link video indir | pinterest link to mp4 | pinterest linkle video indir | pinterest link downloader
  - TR 'pin indir' -> pin indir video | pin indir foto | pin indir hd (but also 'pin indirim' = discounts, so always pair with 'pinterest')
  - Carousel has no Turkish download demand (see carousel row), so this page absorbs it: 'karusel Pin' + 'kart' wording from Pinterest TR help (node/1251).
- **FAQ topics:**
  - Pinterest Pin linki nedir, nasıl kopyalanır? (uygulamada paylaş simgesi > 'Bağlantıyı kopyala'; pin.it kısa link; tarayıcıda /pin/ içeren adres)
  - Karusel Pinin tüm kartlarını (çoklu fotoğraflı Pin) indirebilir miyim?
  - Pin aracı video ve GIF'lerde çalışır mı?
  - Pano ya da profil linkim neden burada çalışmadı? (doğru araca yönlendir)
  - Linkle indirme ücretsiz mi, giriş gerekiyor mu?
- **Notes:** Angle: 'paste any single Pin link, get the right file'. Pinterest TR writes 'Pin' capitalised and suffixes it without an apostrophe (Pinin, Pine, Pinleri), so follow that in body copy.

#### Pinterest Video İndir  `/tr/pinterest-video-indir`

- **Demand:** high. **Primary:** pinterest video indir. **Secondary:** pinterest video indirici, pinterest video indirme, pinterestten video indir, pinterest video indir online, pinterest video indirici hd, pinterest video download
- **Title:** Pinterest Video İndir — HD MP4, Filigransız ve Ücretsiz
- **Description:** Pinterest video indir: video Pininin linkini yapıştırın, HD MP4 dosyasını filigran eklemeden kaydedin. pin.it linki de olur; uygulama ve üyelik gerekmez.
- **H1:** Pinterest Video İndir
- **Autocomplete evidence:**
  - TR 'pinterest video indir' -> download | indirme uygulaması | indir galeriye | indirici apk | indirme nasıl olur | indir pc | indir savepin | indir kp | indirici hd | indir ios
  - TR 'pinterest video indirme' -> uygulaması | download | nasıl olur | online
  - TR 'pinterest video' -> download | downloader | kaydetme | indirme uygulaması | indir galeriye | dönüştürücü | kaydedici
  - Same Turkish suggestions for gl=de and gl=cy (diaspora and Northern Cyprus search in Turkish).
  - Turkey-region SERP top 10 for 'pinterest video indir': pingrab.app/tr, klickpin.com/tr, pindown.io, indirpin.com.tr, 3 Google Play apps, pintiger.com/tr, vidssave.com/tr/pin.
- **FAQ topics:**
  - Pinterest videosu MP4 olarak nasıl indirilir?
  - Hangi kalitede iner: 720p mi 1080p mi? (kaynakta ne varsa; daha yüksek çözünürlük üretmeyiz)
  - iPhone ve Android'de çalışır mı? (Safari / Chrome; uygulama yok)
  - Pinterest video neden indiremiyorum? ('pinterest video neden indiremiyorum', 'pinterest video indiremiyorum' are searched): görsel Pin, gizli Pin, silinmiş Pin
  - Pinterest video indirme uygulaması / APK gerekiyor mu? (hayır; APK'ların riskini dürüstçe anlat)
  - Sadece sesini alabilir miyim? (MP3 sayfasına bağlantı)
  - Bütün panodaki videoları indirebilir miyim? (pano aracı)
  - Filigransız mı? (biz filigran eklemeyiz)
- **Notes:** Biggest Turkish head term. Competitor titles all lead with 'Pinterest Video İndir' or 'Pinterest Video İndirici'; ours adds HD MP4 + filigransız, which are the attributes Turkish searchers append.

#### Pinterest Fotoğraf İndir  `/tr/pinterest-fotograf-indir`

- **Demand:** high. **Primary:** pinterest fotoğraf indir. **Secondary:** pinterest resim indir, pinterest görsel indirme, pinterest fotoğraf indir hd, pinterestten fotoğraf indirme, pinterest duvar kağıdı indir, pinterestten kaliteli fotoğraf indirme
- **Title:** Pinterest Fotoğraf İndir — HD Resim ve Duvar Kağıdı Kaydet
- **Description:** Pinterest fotoğraf ve resimlerini en büyük boyutuyla indirin. Duvar kağıdı, çizim ya da tarif görseli fark etmez: linki yapıştırın, HD JPG'yi kaydedin.
- **H1:** Pinterest Fotoğraf İndir
- **Autocomplete evidence:**
  - TR 'pinterest fotoğraf indir' -> indirme | indirici | indiremiyorum | indir hd | indir 4k | indirme linki | indirme hd | indir galeriye | indirme izni | indirme nasıl yapılır
  - TR 'pinterest resim indir' -> resim indirici | resim indirme online | resim indiremiyorum | hd resim indirme | toplu resim indirme
  - TR 'pinterest görsel indir' -> görsel indirme | görsel indirici | görsel indiremiyorum
  - TR 'pinterestten fotoğraf indirme' -> telefona | kaliteli | bilgisayara | galeriye | yüksek kalite
  - TR 'pinterest duvar kağıdı indir' -> duvar kağıdı indirme | nasıl indirilir | canlı duvar kağıdı indirme | iphone pinterest duvar kağıdı indirme
  - Competitor slugs: savepin.app/.../tr/pinterest-fotograf-indir, indirpin.com.tr/pinterest-fotograf-indirici/
- **FAQ topics:**
  - Pinterest'ten hesapsız fotoğraf nasıl indirilir?
  - Orijinal boyut mu, küçük önizleme mi gelir? (Pinterest'in sunduğu en büyük herkese açık sürüm; piksel uydurmayız)
  - Pinterest fotoğraf indiremiyorum, neden? ('pinterest fotoğraf indiremiyorum', 'resim indiremiyorum' are searched)
  - Pinterest'in 'Görüntüyü indir' seçeneğinden farkı ne?
  - 'Fotoğraf indirme izni' / galeri izni nasıl verilir? (Pinterest uygulamasının Fotoğraflar izni; tarayıcıda gerekmez)
  - Canlı (hareketli) duvar kağıdı indirebilir miyim? (o bir video Pin: video aracına yönlendir)
  - Çoklu fotoğraflı (karusel) Pinin bütün kartlarını alabilir miyim?
  - Toplu resim indirme: bütün panoyu ZIP olarak indir
- **Notes:** Turkish searchers use fotoğraf, resim and görsel interchangeably; use all three in body and alt text. Wallpaper is a big sub-intent in TR ('pinterest duvar kağıdı', 'iphone duvar kağıdı'), so mention it in title and H2s. Also catches people who want a profile picture idea found on Pinterest ('pinterest pp' ideas).

#### Pinterest GIF İndir  `/tr/pinterest-gif-indir`

- **Demand:** medium. **Primary:** pinterest gif indir. **Secondary:** pinterest gif indirme, pinterest gif indirici, pinterestten gif indirme, pinterest hareketli gif indirme, pinterest gif nasıl indirilir
- **Title:** Pinterest GIF İndir — Hareketli GIF'leri Ücretsiz Kaydet
- **Description:** Pinterest GIF'lerini hareketi bozulmadan indirin. GIF Pininin linkini yapıştırın, döngüyü kaydedin; üyelik ve filigran yok, telefonda ve PC'de çalışır.
- **H1:** Pinterest GIF İndir
- **Autocomplete evidence:**
  - TR 'pinterest gif indir' -> gif indirme | gif indirici | gif indirme nasıl yapılır | hareketli gif indirme | video indir gif
  - TR 'pinterest gif' -> gif indir | gif indirme | gif download | gif downloader | gif nasıl indirilir | gif indirici | gif dönüştürücü
  - TR 'pinterest hareketli' -> hareketli gif | hareketli gif indirme | hareketli pp | hareketli duvar kağıdı indirme
  - TR 'pinterestten gif' -> pinterestten gif indirme | pinterestten gif nasıl indirilir
- **FAQ topics:**
  - Pinterest'ten GIF nasıl indirilir?
  - GIF neden fotoğraf olarak (tek kare) iniyor?
  - Galeride hareketli kalır mı? (iPhone Fotoğraflar oynatır; bazı Android galerileri ilk kareyi gösterir)
  - GIF'i MP4'e çevirebilir miyim? / MP4 dönüştürücüden farkı
  - Pinterest hesabı gerekiyor mu?
  - Hareketli PP (profil fotoğrafı) için GIF kullanabilir miyim? ('pinterest hareketli pp' is searched; answer depends on the target app, keep it short)
- **Notes:** 'hareketli' (animated) is the native word; use 'hareketli GIF' in H2s.

#### Pinterest Pano İndirme  `/tr/pinterest-pano-indir`

- **Demand:** medium. **Primary:** pinterest pano indirme. **Secondary:** pinterest tüm panoyu indirme, pinterest panosu indirme, pinterest toplu fotoğraf indirme, pinterest toplu indirme, pinterest toplu pin indirme
- **Title:** Pinterest Pano İndirme — Tüm Panoyu ZIP Olarak Kaydet
- **Description:** Herkese açık bir Pinterest panosunun linkini yapıştırın, pinleri tek ZIP dosyasında toplu indirin. Fotoğraflar ve videolar birlikte gelir; üyelik gerekmez.
- **H1:** Pinterest Pano İndirme
- **Autocomplete evidence:**
  - TR 'pinterest pano indir' -> only 'pinterest pano indirme' (so the noun form is the query people type)
  - TR 'pinterest tüm pano' -> pinterest tüm panoyu indirme | pinterest pano indirme | pinterest panosu
  - TR 'pinterest panosu' -> pinterest panosu indirme (other completions are board ideas: hayal panosu, vizyon panosu)
  - TR 'pinterest toplu indir' -> toplu indirme | toplu fotoğraf indirme | toplu pin indirme
  - TR 'pinterest board indir' -> [] (Turks say 'pano', not 'board')
  - Competitor: klickpin.com/tr/pin-board-downloader titled 'Pinterest Pano İndirici'
- **FAQ topics:**
  - Bütün bir Pinterest panosu nasıl indirilir?
  - Pano linki neye benzer, nasıl kopyalanır? (pinterest.com/kullanıcıadı/pano-adı; uygulamada panoyu aç > paylaş > 'Bağlantıyı kopyala')
  - Gizli panoyu indirebilir miyim? (hayır; 'pinterest gizli pano' is searched)
  - Bir panodan kaç Pin gelir? (sayfa yüklemesinde görünen herkese açık Pinler, güvenli bir sınıra kadar; çok büyük panolarda hepsi gelmeyebilir; sayı uydurma)
  - Pano mu profil mi: hangisini kullanmalıyım?
  - Karusel Pinlerin bütün kartları ZIP'e girer mi?
  - Telefonda ZIP nasıl açılır? (iPhone Dosyalar uygulaması; Android Dosyalarım / Files)
- **Notes:** Slug uses 'indir' for consistency with the other tool slugs; title/H1 use 'indirme' because that is the autocomplete form. The 'toplu' (bulk) cluster belongs here, not on the profile page.

#### Pinterest Profil İndir  `/tr/pinterest-profil-indir`

- **Demand:** low. **Primary:** pinterest profil indir. **Secondary:** pinterest profil indirme, pinterest tüm pinleri indirme, pinterest kullanıcının pinlerini indirme
- **Title:** Pinterest Profil İndir — Tüm Pinleri ZIP Olarak Kaydet
- **Description:** Herkese açık bir Pinterest profilindeki pinleri fotoğraf ve videolarıyla tek ZIP dosyasında indirin. Profil linkini yapıştırmanız yeterli; giriş gerekmez.
- **H1:** Pinterest Profil İndir
- **Autocomplete evidence:**
  - TR 'pinterest profil indir' -> pinterest profil indir | pinterest profil resmi indirme | pinterest profil foto indir
  - TR 'pinterest profil indirme' -> pinterest profil indirme | pinterest profil resmi indirme
  - TR 'pinterest tüm pinleri indir' -> pinterest tüm pinleri indirme
  - Empty: 'pinterest hesap indir', 'pinterest kullanıcı pinleri', 'pinterest profil zip'. Demand is real but small and half of it is profile-picture intent.
  - Competitor: klickpin.com/tr/pin-profile-downloader 'Pinterest Profil İndirici'
- **FAQ topics:**
  - Bir Pinterest profilindeki Pinleri nasıl indiririm? (uygulamada profili aç > paylaş > 'Bağlantıyı kopyala'; Pinterest TR uses 'Profili görüntüle')
  - Profil indirme ile pano indirme farkı nedir?
  - Kullanıcının bütün Pinlerini indirebilir miyim? (dürüst sınır: profil yanıtında görünen herkese açık Pinler)
  - Gizli hesaplar çalışır mı? (hayır)
  - Profil indirmek yasal mı? (kişisel arşiv; yeniden paylaşım için izin)
  - Sadece profil fotoğrafını (PP) istiyorum: doğru araç bu mu? (PP sayfasına yönlendir; demand overlap seen in autocomplete)
- **Notes:** Keep, but low priority and write it fully (no thin page). Put a prominent 'Sadece PP mi lazım?' link above the fold because 'pinterest profil indir' completions are half profile-picture intent.

#### Pinterest Profil Fotoğrafı İndir  `/tr/pinterest-profil-fotografi-indir`

- **Demand:** medium. **Primary:** pinterest profil fotoğrafı indir. **Secondary:** pinterest pp indir, pinterest profil resmi indirme, pinterest profil fotoğrafı büyütme, pinterest pp büyütme, pinterest pp hd, pinterest profil fotoğrafı indirme
- **Title:** Pinterest Profil Fotoğrafı İndir — PP'yi Tam Boy ve HD Gör
- **Description:** Pinterest profil fotoğrafını (PP) tam boyutta görün ve indirin. Herkese açık profil linkini yapıştırın, en büyük resmi kaydedin; giriş yok, filigran yok.
- **H1:** Pinterest Profil Fotoğrafı İndir (subline: PP büyütme ve HD indirme)
- **Autocomplete evidence:**
  - TR 'pinterest profil fotoğrafı' -> ... indirme | büyütme | kaldırma (rest are idea searches: kız, tatlı, erkek, kedi)
  - TR 'pinterest profil resmi' -> pinterest profil resmi indirme (rest are ideas)
  - TR 'pinterest pp indir' -> itself; 'pinterest pp indirme' -> itself; 'pinterest pp büyütme' -> itself; 'pinterest pp hd' -> itself
  - TR 'pp büyütme' -> insta | hd | facebook | spotify (PP büyütme is an established Turkish genre of tool)
  - TR 'pp indir' -> insta | indirici | hd | tt | tiktok
  - Ambiguity: 'pinterest pp' -> pp fotoları, pp girl, pp erkek, pp kız, ppler: most people want profile-picture IDEAS found on Pinterest, i.e. a normal image pin. Route them to the photo tool in an FAQ.
  - Pinterest TR UI calls it 'profil resmi' ('Profil resmini güncelle'); searchers say 'profil fotoğrafı' and 'PP'.
- **FAQ topics:**
  - Pinterest profil fotoğrafı tam boy / HD nasıl indirilir?
  - Pinterest PP büyütme: indirmeden önce tam boy görebilir miyim?
  - Hangi çözünürlük gelir? (Pinterest avatarları genelde yaklaşık 600×600 piksele kadar; daha büyüğünü üretmeyiz)
  - Pinterest'te gördüğüm bir PP fotoğrafını (Pin) nasıl indiririm? (fotoğraf aracına yönlendir; 'pinterest pp' idea intent)
  - Gizli profillerin fotoğrafı indirilebilir mi? (hayır)
  - Dosya formatı nedir? (JPG ya da PNG, kaynağa göre)
  - Başkasının profil fotoğrafını kullanabilir miyim? (gizlilik ve izin; kişisel kullanım)
- **Notes:** Use 'PP' in title and subline: it is how Turks say profile picture. Do not translate 'DP'. H1 subline matches the EN page's subline pattern.

#### Pinterest MP3 Dönüştürücü  `/tr/pinterest-mp3-donusturucu`

- **Demand:** low-medium. **Primary:** pinterest mp3 dönüştürücü. **Secondary:** pinterest video mp3, pinterest video sesi indirme, pinterest mp3 downloader, pinterest video mp3 download
- **Title:** Pinterest MP3 Dönüştürücü — Video Pininin Sesini İndir
- **Description:** Herkese açık Pinterest video Pininin sesini indirin: linki yapıştırın, ses dosyasını kaydedin. Ücretsiz ve üyeliksiz; yalnızca hakkınız olan sesleri saklayın.
- **H1:** Pinterest MP3 Dönüştürücü
- **Ship condition:** Ship this title and H1 only once the product outputs a real audio file. Today DownloaderForm.tsx saves the video stream under a .mp3 filename (saveProxyDownload(videoUrl, mp3Name), around lines 1898 and 2072) and the trimmer exports WAV. A Turkish page promising 'MP3 dönüştürücü' would then be untrue. Until real MP3 (or M4A) extraction exists, use the fallback below, which targets 'pinterest video sesi indirme'.
- **Fallback:** `/tr/pinterest-video-sesi-indir`: Pinterest Video Sesi İndir — Video Pininin Sesini Kaydet (56) / Herkese açık Pinterest video Pininin sesini indirin: linki yapıştırın, ses dosyasını kaydedin. Ücretsiz ve üyeliksiz; yalnızca hakkınız olan sesleri saklayın. (158)
- **Autocomplete evidence:**
  - TR 'pinterest mp3' -> pinterest mp3 dönüştürücü (1st) | mp3 downloader | mp3 download | mp3 converter | mp3 downloader online | mp3 video downloader
  - TR 'pinterest video mp3' -> mp3 download | mp3 downloader | download mp3 converter | to mp3 convert
  - TR 'pinterest video sesi' -> pinterest video sesi indirme
  - Empty in Turkish: 'pinterest ses indir', 'müzik indir', 'şarkı indir', 'mp3 indir', 'videodan ses', 'videodan müzik'. Turks search with 'mp3 dönüştürücü' (the YouTube-to-MP3 habit), not 'ses indir'.
- **FAQ topics:**
  - Pinterest videosunun sesi nasıl indirilir?
  - Pinterest'ten müzik indirmek yasal mı? (telif hakkı; yalnızca hakkınız olan sesler)
  - Pinimde neden ses dosyası çıkmıyor? (sessiz video, görsel Pin, akışta ses yok)
  - Videodaki şarkının adını nasıl bulurum? (Shazam gibi; we do not identify songs; 'pinterest şarkı bulma' had no completions so keep this short)
  - Pinterest hesabı gerekiyor mu?
- **Notes:** Low-medium demand, mostly via the English-loan 'mp3 downloader' strings. Honesty first (see shipCondition).

#### Pinterest 4K ve HD Video İndir  `/tr/pinterest-4k-video-indir`

- **Demand:** medium. **Primary:** pinterest 4k video indir. **Secondary:** pinterest hd video indir, pinterest kaliteli video indir, pinterest video indir yüksek kalite, pinterest 1080p video download, pinterest hd indir
- **Title:** Pinterest 4K ve HD Video İndir — Kaynak Kalitesinde MP4
- **Description:** Pinterest videosunu Pinin sunduğu en yüksek kalitede indirin: 1080p varsa 1080p, 4K yüklendiyse 4K. Görüntüyü büyütüp sahte 4K üretmeyiz; MP4 olarak kaydedin.
- **H1:** Pinterest 4K ve HD Video İndir
- **Autocomplete evidence:**
  - TR 'pinterest 4k' -> pinterest 4k video indir (1st) | 4k wallpaper | 4k indir | 4k duvar kağıdı | 4k downloader | 4k video download free
  - TR 'pinterest hd' -> hd video indir | hd indir | hd foto indir | hd downloader | hd fotoğraf indirme
  - TR 'pinterest kaliteli indir' -> kaliteli indirme | kaliteli fotoğraf indirme | kaliteli video indir
  - TR 'pinterest yüksek kalite' -> yüksek kalite video indir | yüksek kalite indirme
  - TR 'pinterest video kalite' -> pinterest video kalitesi düşüyor | kaliteli video indir | video indir yüksek kalite
- **FAQ topics:**
  - Pinterest videoları gerçekten 4K mı? (çoğu 720p ya da 1080p; 4K ancak yükleyen 4K yüklediyse)
  - En yüksek kaliteyi nasıl seçerim? (birden çok akış varsa listeden)
  - Pinterest'te video kalitesi neden düşüyor? ('pinterest video kalitesi düşüyor' is searched: uygulama bağlantıya göre düşük akış oynatır; indirilen dosya en iyi akıştır)
  - Fotoğrafları 4K indirebilir miyim? ('pinterest fotoğraf indir 4k' is searched: orijinal boyut, foto aracına yönlendir)
  - 1080p video PC'de ve telefonda oynar mı?
- **Notes:** Uses the 4K query but states the honest rule in title, description and first paragraph (PRODUCT.md: no fake 4K). The EN page's 'uncompressed 4K ultra quality' claim must not be carried over. The video page keeps 'HD' only as an attribute so the two do not compete on 'hd video indir'.

#### Pinterest MP4 Dönüştürücü  `/tr/pinterest-mp4-donusturucu`

- **Demand:** medium. **Primary:** pinterest mp4 dönüştürücü. **Secondary:** pinterest video dönüştürücü mp4, pinterest to mp4, pinterest mp4 video indir, pinterest link to mp4, pinterest video mp4
- **Title:** Pinterest MP4 Dönüştürücü — Pin Linkini MP4'e Çevir
- **Description:** Pinterest video linkini MP4 dosyasına dönüştürün. Herkese açık Pin linkini yapıştırın, her telefonda ve PC'de oynayan MP4'ü indirin; üyelik ve filigran yok.
- **H1:** Pinterest MP4 Dönüştürücü
- **Autocomplete evidence:**
  - TR 'pinterest mp4' -> pinterest mp4 | mp4 dönüştürücü | mp4 download | mp4 video indir | mp4 converter | to 4k mp4
  - TR 'pinterest mp4 dönüştürücü' -> pinterest mp4 dönüştürücü | pinterest video dönüştürücü mp4
  - TR 'pinterest to mp4' -> converter | downloader | video downloader | online | download | hd
  - TR 'pinterest link' -> pinterest link to mp4
  - TR 'pinterest video' -> pinterest video dönüştürücü
  - Empty: 'pinterest mp4 indir', 'pinterest mp4 çevirici' (so use 'dönüştürücü', not 'çevirici', as the noun; 'çevir' is fine as the verb in the title)
- **FAQ topics:**
  - Pinterest videosu MP4'e nasıl dönüştürülür?
  - MP4'e dönüştürmek ücretsiz mi?
  - MP4 dönüştürücü ile video indirici arasındaki fark ne? (aynı motor; bu sayfa link > MP4 işini anlatır)
  - GIF'i MP4'e çevirebilir miyim? ('pinterest mp4 to gif' is also searched: GIF aracına yönlendir)
  - iPhone ve Android'de çalışır mı?
- **Notes:** Differentiate from the video page with the converter framing (link > MP4). 'Dönüştürmek' is honest when the source is an HLS stream and the user gets a single MP4; avoid implying transcoding of quality.

#### Pinterest'ten Video Nasıl İndirilir?  `/tr/pinterestten-video-nasil-indirilir`

- **Demand:** high. **Primary:** pinterestten video nasıl indirilir. **Secondary:** pinterest video nasıl indirilir, pinterestten video indirme nasıl yapılır, pinterest video indirme nasıl olur, pinterest uygulamasından video indirme, pinterest video neden indiremiyorum
- **Title:** Pinterest'ten Video Nasıl İndirilir? Telefon ve PC Rehberi
- **Description:** Pinterest'ten video nasıl indirilir? Uygulamada Paylaş → Bağlantıyı kopyala, linki yapıştır, MP4'ü kaydet. iPhone, Android ve PC için adım adım anlatım.
- **H1:** Pinterest'ten Video Nasıl İndirilir?
- **Autocomplete evidence:**
  - TR 'pinterestten video nasıl indirilir' -> android | pc | iphone | nasıl galeriye indirilir | telefona nasıl video indirilir
  - TR 'pinterest video nasıl indirilir' -> iphone | android | pinterest uygulamasından video nasıl indirilir
  - TR 'pinterestten video' -> nasıl indirilir android/pc/iphone | nasıl kaydedilir | kaydetme | nasıl galeriye kaydedilir | indirme nasıl yapılır
  - TR 'pinterest video indirme' -> indirme nasıl olur
  - TR 'pinterest video indirilmiyor' -> pinterest video indiremiyorum | pinterest video neden indiremiyorum
  - Ranking content in Turkish: tamindir.com 'Pinterest Video İndirme Nasıl Yapılır?' (H2s: 'Programsız', 'Programları')
- **FAQ topics:**
  - Pinterest uygulamasında video indirme düğmesi neden yok? (çoğu video Pininde yalnızca 'Kaydet' ve paylaş var; 'Görüntüyü indir' görseller içindir)
  - Pinterest video neden indiremiyorum? (gizli, silinmiş, görsel Pin, yanlış link)
  - Programsız / uygulamasız indirebilir miyim? (tamindir's 'programsız' framing: yes, in the browser)
  - Pinterest'ten video indirmek yasal mı?
  - İndirdiğim video nereye kaydedildi? (İndirilenler / Dosyalar / Galeri)
  - Ekran kaydı yerine neden indirme? (kalite, ses, dosya boyutu)
- **Notes:** Hub guide: one section per device linking to the iPhone/Android and PC pages. Use Pinterest's exact Turkish UI labels in steps. Year in title omitted on purpose (needs yearly upkeep); add '(2026)' only if someone owns refreshing it.

#### Pinterest Video Galeriye Kaydetme  `/tr/pinterest-video-galeriye-kaydetme`

- **Demand:** high. **Primary:** pinterest video galeriye kaydetme. **Secondary:** pinterest galeriye kaydetme, pinterestten video indir galeriye, pinterest galeriye video kaydetme iphone, pinterest video nasıl galeriye kaydedilir, pinterest galeriye fotoğraf kaydetme
- **Title:** Pinterest Video Galeriye Kaydetme — iPhone ve Android Rehberi
- **Description:** Pinterest videosunu galeriye kaydetme: linki kopyalayın, MP4'ü indirin, Fotoğraflar'a ya da Galeri'ye kaydedin. Video galeriye gelmiyorsa çözümü burada.
- **H1:** Pinterest Video Galeriye Kaydetme
- **Autocomplete evidence:**
  - TR 'pinterest video indir' -> 'pinterest video indir galeriye' (3rd suggestion), also for gl=de and gl=cy
  - TR 'pinterest galeriye kaydetme' -> galeriye video kaydetme | galeriye fotoğraf kaydetme | galeriye video kaydetme iphone | kolaj galeriye kaydetme
  - TR 'pinterest galeri' -> galeriye fotoğraf kaydetme | galeriye video kaydetme | galeri izni nasıl verilir | galeriye nasıl kaydedilir
  - TR 'pinterestten galeriye' -> pinterestten galeriye nasıl video indirilir | galeriye kaydetme | galeriye fotoğraf indirme | video indir galeriye
  - TR 'pinterestten indir' -> 'pinterestten indirdiğim fotoğraflar galeriye gelmiyor' (top suggestion: a real support pain)
  - TR 'pinterest videoları galeriye' -> pinterest videoları galeriye kaydetme | pinterest teki videoları nasıl galeriye yükleyebiliriz
- **FAQ topics:**
  - Pinterest'ten indirdiğim video/fotoğraf galeriye gelmiyor, neden? (iPhone Safari dosyayı Dosyalar > İndirilenler'e koyar: paylaş > 'Videoyu Kaydet' ile Fotoğraflar'a geçer; Android'de İndirilenler klasörü, galeri yenilenmesi)
  - Pinterest galeri izni nasıl verilir? (Ayarlar > Uygulamalar > Pinterest > İzinler > Fotoğraflar ve videolar: only for Pinterest's own 'Görüntüyü indir')
  - Uygulama olmadan galeriye kaydedebilir miyim?
  - Galeriye kaydetmek ücretli mi, giriş gerekiyor mu?
  - Kolajı galeriye nasıl kaydederim? ('pinterest kolaj galeriye kaydetme' is searched: Pinterest's 'Kolaja ekle' feature; answer briefly or skip)
- **Notes:** Owns 'galeri' and the where-did-my-file-go troubleshooting. The iPhone/Android page owns per-OS download steps. Cross-link both.

#### Pinterest Video İndir: PC ve Laptop  `/tr/pinterest-video-indir-pc`

- **Demand:** medium. **Primary:** pinterest video indir pc. **Secondary:** pinterestten video nasıl indirilir pc, pinterest pc video downloader, pinterestten bilgisayara fotoğraf indirme, pinterest bilgisayara indir, pinterest video indirme programı
- **Title:** Pinterest Video İndir PC — Bilgisayara ve Laptopa MP4 Kaydet
- **Description:** Pinterest videolarını Windows PC, Mac veya laptopa indirin. Tarayıcıda Pin linkini kopyalayıp yapıştırın; MP4 İndirilenler klasörüne iner. Program kurmak yok.
- **H1:** Pinterest Video İndir: PC ve Laptop
- **Autocomplete evidence:**
  - TR 'pinterest video indir' -> 'pinterest video indir pc' (6th)
  - TR 'pinterestten video' -> 'pinterestten video nasıl indirilir pc'
  - TR 'pinterestten fotoğraf indirme' -> 'pinterestten bilgisayara fotoğraf indirme'
  - TR 'pinterest pc video' -> pc video downloader | download pc video
  - TR 'pinterest indirme programı' -> itself; 'pinterest ten video indirme programı' appears under 'pinterest'ten indirme' (Turks call desktop software 'program')
  - 'laptop' is not the Turkish word here: 'pinterest laptop' completes only to wallpapers and laptop bags. 'pinterest bilgisayar' completes to wallpapers too, plus 'pinterest bilgisayara nasıl indirilir' (= install the app). Empty: 'pinterest bilgisayara video indirme', 'pinterest video indir mac', 'pinterest video indir laptop'.
- **FAQ topics:**
  - Windows PC'de veya Mac'te Pinterest videosu nasıl indirilir?
  - Program ya da eklenti kurmam gerekiyor mu? ('pinterest video indirme programı' is searched: no)
  - 1080p videoyu bilgisayara indirebilir miyim?
  - Chromebook'ta çalışır mı?
  - İndirdiğim video bilgisayarda nerede? (İndirilenler klasörü; tarayıcının indirme geçmişi)
  - Tek tıkla indirme için yer işareti aracı (bookmarklet) nasıl kurulur? (absorbs the skipped Chrome page)
- **Notes:** Slug follows the searched form 'pc'. 'Laptop' stays in the title as a secondary term because the English page targets it and Turks use the loanword 'laptop' for the device.

#### Pinterest Video İndir: iPhone ve Android  `/tr/pinterest-video-indir-iphone-android`

- **Demand:** high. **Primary:** pinterest video indir iphone. **Secondary:** pinterest video indir android, pinterest video nasıl indirilir iphone, pinterest video nasıl indirilir android, pinterest telefona video indirme, pinterest video indir ios, pinterest video indirme uygulaması ios
- **Title:** Pinterest Video İndir iPhone ve Android — Uygulamasız MP4
- **Description:** iPhone'da Safari, Android'de Chrome ile Pinterest videosunu telefona indirin: Bağlantıyı kopyala'ya dokunun, linki yapıştırın, MP4'ü kaydedin. Uygulama yok.
- **H1:** Pinterest Video İndir: iPhone ve Android
- **Autocomplete evidence:**
  - TR 'pinterest video indir iphone' -> itself | pinterest video indir galeriye iphone
  - TR 'pinterest nasıl indirilir' -> pinterest video nasıl indirilir iphone | pinterest video nasıl indirilir android
  - TR 'pinterest video indir android' -> itself; 'pinterest android video indirme' -> pinterest video indirme android
  - TR 'pinterest telefona' -> telefona video indirme | telefona fotoğraf kaydetme | telefona kaydetme
  - TR 'pinterest video indir' -> 'pinterest video indir ios' (10th); 'pinterest indirme uygulaması' -> pinterest video indirme uygulaması ios
  - TR 'pinterest iphone' / 'pinterest android' alone are wallpaper / app queries, so always pair with 'video indir'.
- **FAQ topics:**
  - iPhone'da Pinterest videosu Fotoğraflar'a nasıl kaydedilir? (Safari > İndirilenler > paylaş > 'Videoyu Kaydet')
  - Android'de Galeri'ye / Google Fotoğraflar'a nasıl kaydedilir?
  - Neden App Store ya da Play Store uygulaması gerekmiyor? (APK ve reklamlı uygulama riskleri; 'pinterest video indirici apk' is searched)
  - iPad'de çalışır mı?
  - Samsung'da indirilen video nerede? (Dosyalarım > İndirilenler)
- **Notes:** Per-OS download steps. Overlaps the gallery guide on 'galeriye ... iphone'; keep the split described there and cross-link.

### Skipped pages

- **pinterest-carousel-downloader**: No Turkish download demand. Empty autocomplete for 'pinterest karusel', 'pinterest karusel indir', 'pinterest çoklu fotoğraf indirme', 'pinterest kaydırmalı pin indir', 'pinterest birden fazla fotoğraf indirme', 'pinterest albüm indir'. 'pinterest carousel' completes to English design-idea queries; 'pinterest kaydırmalı' / 'çoklu fotoğraf' complete to how-to-create queries. Fold carousel into the Pin page (FAQ + H2 'Karusel Pinin tüm kartları') and the photo page. Do not emit a /tr carousel URL or hreflang for it; the EN page keeps no tr alternate. If ever built: Pinterest TR calls it 'karusel' with 'kart' per slide (help.pinterest.com/tr/node/1251); slug would be 'pinterest-karusel-indir' (indirpin.com.tr uses pinterest-karusel-indirici).
- **pinterest-story-downloader**: Intent mismatch and no demand. 'pinterest hikaye indir' and 'pinterest fikir pini indir' return nothing; 'pinterest fikir pini' only completes to 'nasıl yapılır'. 'pinterest story' in Turkish means Instagram-story backgrounds and quote images found on Pinterest (story fikirleri, story arka plan, story sözleri, araba story indir, fake story indir), which are ordinary image or video pins. Idea Pins were also folded into standard Pins by Pinterest. Route 'story indir' searchers to the photo and video pages instead. Opportunity instead: an H2 or FAQ on the photo page, 'Instagram story için Pinterest görseli indirme', which captures the real 'pinterest story indirme' intent.
- **pinterest-video-downloader-chrome**: No Turkish demand for a Pinterest download extension, and the intent does not match the product. Empty: 'pinterest video indir chrome', 'pinterest chrome eklentisi', 'pinterest indirme eklentisi', 'pinterest video indirme eklentisi', 'pinterest yer işareti'. 'pinterest eklenti' / 'pinterest uzantısı' / 'pinterest kaydet düğmesi' point at Pinterest's own Save-button extension, and 'pinterest chrome' completes to nails, themes and wallpapers. PintDownload's Chrome tool is a bookmarklet, not a store extension, so searchers wanting an installable 'eklenti' would bounce. Put the bookmarklet ('yer işareti aracı') as an H2 on the PC guide instead. Turkish users say 'eklenti' (searched: 'chrome video indirme eklentisi'); Chrome's own UI says 'uzantı'. Revisit only if a real extension ships.
- **pinterest-seo-title-generator**: No Turkish demand and an ambiguous vocabulary. Empty: 'pinterest başlık oluşturucu', 'pinterest hashtag oluşturucu', 'pinterest seo türkçe', 'pinterest pin başlığı', 'pinterest başlık nasıl yazılır'. 'pinterest başlık' completes to bed headboards (yatak başlığı, baza başlık), 'pinterest etiket' to label designs, 'pinterest anahtar' to keychains, 'pinterest seo' to K-pop names. The generator prompt (src/pages/api/generate-seo.ts) is English-only, so a Turkish page would also promise output the tool does not produce. 'pinterest seo nedir' exists (informational); a Turkish blog article could serve it later, not a tool page.

## What wins in Turkish search

- **Verb forms.** People type the bare imperative `indir` (pinterest video indir), the noun `indirme` (pinterest pano indirme, galeriye kaydetme), and `indirici` for the tool (pinterest indirici). The ablative is usually typed without an apostrophe: `pinterestten`.
- **Words people actually use:** `pano` (never "board"), `PP` and `profil fotoğrafı`, `galeriye`, `filigransız`, `kaliteli` / `yüksek kalite`, `dönüştürücü` (not `çevirici`), `pc` / `bilgisayar` (not `laptop`, which only completes to wallpapers), `program` for desktop software.
- **Avoid bare `pinterest indir`.** The Turkey-region SERP is the Pinterest app on every store, and autocomplete adds apk, pc, windows and mac.
- **Ambiguities to defuse in FAQs:** `pinterest pp` (profile-picture ideas = image pins), `pinterest story` (Instagram story backgrounds), `pinterest kaydet` (pin to a board, not to the phone), `pinterest başlık` (headboards), `pin indirim` (discounts).
- **Pain points worth an FAQ answer:** "pinterestten indirdiğim fotoğraflar galeriye gelmiyor", "pinterest video neden indiremiyorum", "pinterest indirilenler nereye gidiyor", "pinterestten video indirmek yasal mı", "pinterestten video indirip instagramda paylaşma", APK questions.

## Competitors

Turkey-region SERP (DuckDuckGo `kl=tr-tr`) for **pinterest video indir**: pingrab.app/tr, klickpin.com/tr, pindown.io, indirpin.com.tr, three Google Play apps, pintiger.com/tr and vidssave.com/tr/pin. Most of these are machine-translated multilingual sites:

- **SavePin** (https://www.savepin.app/pinterest-downloader/tr/): "Pinterest Video İndir - Ücretsiz Pinterest Video İndirme Aracı | SavePin". Brand appears in Turkish autocomplete ('pinterest video indir savepin'). Repeats the exact phrase 'Pinterest Video İndir' in nearly every H2. Turkish slug for the photo page. Uses fake-looking 'user reviews' with Indian names on the Turkish photo page.
- **KlickPin** (https://klickpin.com/tr/): "Pinterest Video İndirici - Tek Tıkla HD Videolar, GIF'ler ve Görseller İndirin!". Ranks #2 in the Turkey-region SERP and appears in autocomplete as 'kp' ('pinterest video indir kp', and its title is itself an autocomplete suggestion). English slugs, machine-translated Turkish ('Mı KlickPin Mobil Cihazlarda mı Çalışıyorsunuz?', 'Is KlickPin Kullanıma uygun?'). The same FAQ block repeats on every tool page.
- **PinGrab** (https://www.pingrab.app/tr): "Pinterest Video İndirme — PinGrab | Ücretsiz Online Araç". #1 in the Turkey-region SERP for 'pinterest video indir'. Single Turkish page, broken H1, typo 'filigranlsız' in the meta description.
- **İndirPin** (https://indirpin.com.tr/): "Pinterest Video İndirici - HD MP4 Videoları Ücretsiz İndir". Turkey-only .com.tr site, #4 in the Turkey-region SERP. Uses transliterated Turkish slugs (pinterest-fotograf-indirici, pinterest-gif-indirici, pinterest-karusel-indirici), which supports our slug choice. H2s target 'Galeriye Nasıl İndiririm?' and 'PC'nize Nasıl İndirirsiniz?'.
- **PinLoad** (https://pinload.app/tr): "PinLoad - Ucretsiz Pinterest Video Indirici | HD Videolar, Resimler ve GIF'ler". Home title and meta drop Turkish diacritics ('Ucretsiz', 'cevrimici', 'calisir'), a quality gap our pages can exploit. Appears in autocomplete as 'pinterest downloader pinload'.
- **ScreenApp** (https://screenapp.io/tr/features/pinterest-video-downloader): "Pinterest Video İndirici - Ücretsiz HD, Filigransız". Requires a free account; uses 'filigransız' in the title. Its FAQ set is the closest to ours (secret board, 4K honesty, failed link).
- **VidsSave** (https://vidssave.com/tr/pin): "Pinterest İndirici – Ücretsiz Full HD 1080p indirme". Multi-platform downloader; #9 in the Turkey-region SERP.
- **Tamindir (Turkish software portal, guide)** (https://www.tamindir.com/blog/pinterest-video-indirme_74055/): "Pinterest Video İndirme Nasıl Yapılır? - Tamindir". Informational competitor for the how-to guide. H2s: 'Pinterest Video İndirme Programsız', 'Pinterest Video İndirme Programları'. Turks frame no-install methods as 'programsız'.

Opportunity: native Turkish with correct diacritics, quoting Pinterest's real Turkish labels, with honest scope. None of the competitors does all three.

## Pinterest's Turkish UI labels (use exactly)

- **Pin:** Pin (capitalised; inflected without an apostrophe: Pinin, Pine, Pini, Pinler, Pinleri). Video pin: 'video Pini'.
- **Save (to a board):** Kaydet ('Pinin altındaki Kaydet'e dokunun'). Saved tab: 'Kaydetmeler'. NOT a download.
- **Share:** No text label in help; described as the share icon ('paylaşım simgesi'). In copy: 'paylaş simgesine dokunun'.
- **Copy link:** Bağlantıyı kopyala
- **Send:** Gönder
- **Download image:** Görüntüyü indir (desktop: 'Görüntünün yanındaki ... simgesine tıklayın' then 'Görüntüyü indir'e tıklayın'; mobile: 'Pinin alt kısmındaki ... simgesine dokunun' then 'Görüntüyü indir'e dokunun')
- **Three-dot menu:** üç nokta simgesi (help pages print the English placeholder 'the ellipsis icon'); menu items seen: İndir, Kolaja ekle, Şikayet et
- **Download (board video / menu):** İndir
- **Where images land:** Android: Galeri; iPhone: Fotoğraflar (per download-an-image article)
- **Board:** pano (plural panolar; 'Pano oluştur'; 'panonuza')
- **Secret board:** gizli pano ('Bu panoyu gizli tut')
- **Create:** Oluştur
- **Close-up view:** yakından bakış görünümü
- **Profile:** profil; 'Profili görüntüle', 'Profili düzenle', under the photo 'Düzenle'
- **Profile picture:** profil resmi ('Profil resmini güncelle'); the article also uses 'profil fotoğrafı'
- **Idea Pin:** Fikir Pini (button 'Fikir Pini Oluştur'); Idea Pins have since merged into standard Pins
- **Carousel:** karusel (Pin); each slide is a 'kart'
- **Collage:** Kolaj ('Kolaja ekle')
- **React / favourite:** Tepki ver; favorilere ekle
- **Home feed:** ana sayfa akışı
- **Help center locale:** Pinterest serves Turkish help at /tr/ (not /tr-tr/), the same language-only code we use for hreflang.

Sources: https://help.pinterest.com/tr/article/save-pins-on-pinterest (fetched raw HTML); https://help.pinterest.com/tr/article/download-an-image; https://help.pinterest.com/tr/article/interact-with-pins; https://help.pinterest.com/tr/node/66 (Pin, pano ve profil paylaşma); https://help.pinterest.com/tr/article/edit-your-profile; https://help.pinterest.com/tr/node/1251 (karusel); https://business.pinterest.com/tr/blog/creator-letter-theres-a-new-way-to-create-on-pinterest/ ('Fikir Pini Oluştur' label)

## Glossary

Write native Turkish with polite plural imperatives in body copy ('yapıştırın', 'indirin'); bare imperatives on buttons and in titles ('İndir', 'Yapıştır'), which is standard Turkish UI and matches how people search ('pinterest video indir'). Quote Pinterest's Turkish UI labels exactly. Never transliterate English UI words when Pinterest has a Turkish one.

### Product terms

- **download (verb, button, title):** indir
- **download (noun, process):** indirme
- **downloader:** indirici (Pinterest İndirici, Video İndirici)
- **save to device:** kaydet / cihaza kaydet. Disambiguate from Pinterest's 'Kaydet' (pin to board): say 'telefona/bilgisayara indir' or 'galeriye kaydet'.
- **link / URL:** link in headings and keywords (searched: 'linkten', 'linkle', 'link indir'); bağlantı when quoting the app ('Bağlantıyı kopyala'). Input label: 'Pinterest linki'.
- **paste:** yapıştır
- **copy link:** Bağlantıyı kopyala (exact Pinterest label)
- **short link:** kısa link (pin.it)
- **video pin:** video Pini
- **image / photo:** fotoğraf (main), resim and görsel as synonyms; 'Görüntüyü indir' only when quoting Pinterest
- **GIF:** GIF; animated = hareketli; suffixes with apostrophe: GIF'i, GIF'ler, GIF'leri
- **carousel:** karusel Pin; slides = kartlar; plain-language helper: 'çoklu fotoğraflı Pin'
- **Idea Pin / story:** Fikir Pini. Avoid 'story' / 'hikaye' for the format (in Turkish searches 'story' means Instagram story backgrounds).
- **board:** pano (never 'board')
- **profile:** profil
- **profile picture:** profil fotoğrafı; colloquial PP ('pe pe'); Pinterest UI says 'profil resmi'. Do not use DP or avatar in Turkish copy.
- **PP enlarge / view full size:** PP büyütme / tam boy görme
- **ZIP:** ZIP dosyası; 'ZIP'le' / 'ZIP olarak'
- **bulk:** toplu (toplu indirme)
- **MP4 / MP3:** MP4'ü, MP4'e, MP3'e (apostrophe before suffix; vowel harmony follows the spoken 'em-pe-dört' / 'em-pe-üç')
- **converter:** dönüştürücü (searched); 'çevirici' has no demand; 'çevir' is fine as a verb
- **HD / quality:** HD, yüksek kalite, kaliteli (colloquial, searched), orijinal çözünürlük
- **watermark:** filigran; without = filigransız
- **free:** ücretsiz (titles); 'bedava' is colloquial, keep out of titles
- **no signup / login:** üye olmadan, kayıt olmadan, giriş yapmadan; adjective: üyeliksiz
- **no app / no install:** uygulamasız, uygulama indirmeden; desktop: 'program kurmadan' / 'programsız'
- **extension:** eklenti (what people search) / uzantı (Chrome's own UI)
- **bookmarklet:** yer işareti aracı (bookmarklet) — explain once; Chrome bar = 'yer işaretleri çubuğu'
- **public / private:** herkese açık / gizli (gizli pano, gizli hesap)
- **creator:** içerik üreticisi; credit = 'kaynak gösterin' / 'içerik üreticisini etiketleyin'
- **copyright:** telif hakkı
- **FAQ:** Sıkça Sorulan Sorular (SSS)
- **how it works:** Nasıl çalışır?
- **step:** Adım (1. adım)
- **related tools:** İlgili araçlar
- **not affiliated:** PintDownload'un Pinterest Inc. ile bir bağlantısı yoktur; Pinterest tarafından onaylanmamıştır.
- **existing i18n.ts fixes:** processingText 'HD Medya Çıkarılıyor…' is a literal translation, use 'Dosya hazırlanıyor…'. heroSubtitle promises '1080p HD' for everything (overclaim) — use 'en yüksek mevcut kalitede'. 'Chrome Aracı' should not be linked from TR (Chrome page skipped).

### Devices

- **iPhone Photos app:** Fotoğraflar
- **iPhone Files app:** Dosyalar (Downloads folder: İndirilenler)
- **iOS share-sheet actions:** Videoyu Kaydet, Görüntüyü Kaydet, Dosyalar'a Kaydet
- **camera roll:** Fotoğraflar / Son Öğeler (avoid the dated 'Film Rulosu')
- **Android gallery:** Galeri; Google Fotoğraflar; Samsung file manager: Dosyalarım
- **Downloads:** İndirilenler
- **settings path for permissions:** Ayarlar > Uygulamalar > Pinterest > İzinler > Fotoğraflar ve videolar
- **desktop:** bilgisayar, PC, laptop (all used); Mac; Windows

### Claim-ticket metaphor

The cloakroom ticket is familiar in Turkey ('vestiyer fişi', 'emanet fişi'): hand something in, get a numbered slip, collect at the counter. Use it in decorative labels only; every button keeps a plain verb.

- **claim ticket:** emanet fişi (or vestiyer fişi in playful copy)
- **ticket (generic):** fiş for the paper slip; 'bilet' reads as event/transport and loses the claim sense
- **Admit one · public link (header label):** EMANET FİŞİ · HERKESE AÇIK LİNK (do not translate 'Admit one' literally; 'TEK KİŞİLİK' reads like a cinema seat)
- **No. (serial):** No. (same in Turkish)
- **stub (tear-off primary action):** Button text stays 'İNDİR'. The tear-off part is 'koçan' only if the word is ever needed in alt text.
- **collect (receipt button):** İNDİR on the button; 'TESLİM AL' only as a decorative stamp/label
- **receipt:** fiş
- **counter:** gişe / teslim gişesi (only in decorative copy)
- **Ready · Video pin (band):** HAZIR · VİDEO PİNİ
- **Void (error stamp):** GEÇERSİZ
- **Try another link:** Başka bir link deneyin
- **Fetching from Pinterest…:** Pinterest'ten alınıyor…
- **Saves as:** Dosya adı:
- **Play preview:** Önizlemeyi oynat
- **Try it on PintDownload (tool ticket):** PintDownload'da deneyin

## Formats

- **locale:** tr-TR (Intl)
- **numbers:** Decimal comma, dot for thousands: 1.234,5. File size with a space: 12,4 MB. Specs unformatted: 1080p, 720p, 4K, 600×600 piksel.
- **percent:** Percent sign BEFORE the number: %100, %40 (Turkish convention; competitors write '%100 Ücretsiz').
- **dates:** dd.mm.yyyy (15.10.2026). Long: 15 Ekim 2026 (month capitalised inside a specific date per TDK); with weekday: 15 Ekim 2026 Perşembe. Use Intl.DateTimeFormat('tr-TR').
- **time:** 24-hour, 21.16 in prose (TDK) or 21:16 in UI.
- **ordinals:** Number + dot: 1. adım, 2. adım.
- **quotes:** Curly double quotes “ ” in prose; apostrophe before suffixes on proper nouns, abbreviations and numbers (Pinterest'ten, iPhone'da, PC'ye, MP4'ü, GIF'leri). Typographic ’ in body copy; straight ' is acceptable in <title> and meta.
- **capitalisation:** Titles in title case as written here (Turkish SERP norm). Sentence case in H2 source strings (CSS uppercases the gothic). Never capitalise a suffix after an apostrophe (Pinterest'ten, not Pinterest'Ten).
- **currency:** Not needed (free). If ever shown: 0 ₺ / ₺0. JSON-LD offers can keep price '0'.
- **pluralUnits:** Turkish nouns stay singular after numbers: 1 dosya / 25 dosya, 10 Pin (never '10 Pinler').
- **htmlLang:** tr
- **ogLocale:** tr_TR
- **hreflang:** tr

## Typography

- **missingGlyphs:** Blocking. The self-hosted Big Shoulders files (public/fonts/big-shoulders-display-latin-800/900-normal.woff2, @font-face in src/styles/ticket.css) are the Fontsource 'latin' subset. A cmap check (fontkitten) shows they lack Ğ ğ İ Ş ş (U+011E/F, U+0130, U+015E/F); Ç ç Ö ö Ü ü ı Â Î Û are present. Almost every Turkish H1 contains İ ('İNDİR', 'İNDİRİCİ', 'VİDEO'), so it would print in Arial Narrow inside an otherwise Big Shoulders word. Fix: copy node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-ext-{800,900}-normal.woff2 (≈12.5 KB each) to public/fonts and add two @font-face rules with Fontsource's latin-ext unicode-range (U+0100-02BA, …). With unicode-range the extra file loads only on pages that use those characters. On /tr pages preload the 900 latin-ext file next to the latin one so the H1 does not swap.
- **uppercaseRules:** Display text is CSS-uppercased. Without lang='tr', 'indir' becomes 'INDIR' (wrong; must be 'İNDİR') and 'ı' handling breaks. BaseLayout.astro hard-codes <html lang='en'> (line 131): it must emit lang='tr' on Turkish pages. Any JS uppercasing must use toLocaleUpperCase('tr-TR'); slug code must not rely on toLowerCase() for 'İ' (JS gives 'i̇' with a combining dot). Use an explicit map: ç→c, ğ→g, ı→i, İ→i, ö→o, ş→s, ü→u.
- **brandNamesInCaps:** With lang='tr', CSS also turns 'Pinterest' into 'PİNTEREST' and 'iPhone' into 'İPHONE'. Turkish all-caps headlines often do this, but the brand caps read better as 'PINTEREST'. Wrap brand names in uppercased headings in <span lang='en'> (Pinterest, iPhone, PintDownload, Chrome) and keep Turkish suffixes outside the span: <span lang='en'>Pinterest</span>'ten.
- **diacriticClearance:** Display H1s print at line-height 0.88–0.9. Turkish caps carry marks above (İ dot, Ğ breve, Ö Ü dieresis) and below (Ç Ş cedilla). In two-line H1s ('PİNTEREST PROFİL / FOTOĞRAFI İNDİR'), cedillas on line 1 can touch dots on line 2, and any overflow:hidden wrapper can clip the dot on 'İ'. Use line-height ≥ 0.98 for :lang(tr) display headings and check the hero H1 at 375 px and in the 1024/1280/1440 seam layouts (the seam measures the H1 cap line against the ticket).
- **lengthExpansion:** Turkish H1s are mostly shorter than English (PINTEREST VIDEO DOWNLOADER, 26 chars, becomes PİNTEREST VİDEO İNDİR, 21), but agglutinated single words are long and cannot wrap: DÖNÜŞTÜRÜCÜ (11), GALERİYE, İNDİRİLİR. Longest planned H1s: 'Pinterest Profil Fotoğrafı İndir' (32) and 'Pinterest'ten Video Nasıl İndirilir?' (36). Do not set hyphens:auto for tr; let lines break at spaces. Labels in the 0.08em-tracked label style grow about 10–15% ('EMANET FİŞİ · HERKESE AÇIK LİNK', 31 chars, vs 'ADMIT ONE · PUBLIC LINK', 23); check the ticket header strip at 320 px.
- **stepArt:** public/images/step1–3.webp have English UI text baked in (rendered from src/assets/steps/*.svg with Big Shoulders). Turkish pages need Turkish renders via scripts/render_step_art.mjs, which embeds fonts from public/fonts, so add the latin-ext files first or the İ/Ş/Ğ glyphs will be missing in the images too.

## Notes and risks

- Scope: 15 of 19 pages have real Turkish demand. Skipped: carousel (no demand; folded into Pin and photo pages), story/Idea Pin (intent mismatch: 'pinterest story' means Instagram-story backgrounds), Chrome (no demand; 'pinterest uzantısı' means Pinterest's own Save button; product is a bookmarklet), SEO title generator (no demand, 'başlık' = headboard, generator is English-only).
- hreflang: use 'tr' (language only), <html lang='tr'>, og:locale tr_TR, URL prefix /tr (no trailing slash per normalizeCanonical). One Turkish set serves Turkey, Northern Cyprus and the Turkish-speaking diaspora: autocomplete with gl=de and gl=cy returns the same Turkish queries as gl=tr. 'tr-TR' would drop those searchers to x-default English. Every competitor checked (SavePin, KlickPin, PinGrab, PinLoad, ScreenApp, VidsSave) declares 'tr', and Pinterest's help center uses /tr/. Do not target Azerbaijan with this set (gl=az shows Azerbaijani forms 'indirmək', 'endirmə'; different language).
- Every /tr page needs a self-canonical plus reciprocal alternates (en ↔ tr, x-default → en). Skipped pages must NOT list a tr alternate. BaseLayout.astro currently emits only hreflang en + x-default and lang='en'.
- Do not target bare 'pinterest indir': the Turkey-region SERP is the Pinterest app on every store, and autocomplete adds apk/pc/windows/mac.
- APK demand is real ('pinterest video indirici apk', 'pinterest indir apk'). Answer it in FAQs (no app or APK needed, and why unofficial APKs are risky); do not build an APK page.
- Cannibalisation map: home = indirici (generic); video = video indir; 4K = 4k / hd / kaliteli video; MP4 = mp4 dönüştürücü; how-to = nasıl indirilir (hub); gallery = galeriye kaydetme + 'galeriye gelmiyor'; mobile = iphone / android / telefona; PC = pc / bilgisayar / program; photo = fotoğraf / resim / görsel / duvar kağıdı; board = pano + toplu; profile = profil indir + tüm pinleri; PP = profil fotoğrafı / pp.
- Turkish SERPs are dominated by machine-translated multilingual sites (KlickPin's broken grammar, PinLoad's missing diacritics, PinGrab's broken H1, SavePin's fake-looking reviews). Native, correctly accented copy that quotes Pinterest's real Turkish labels is the main differentiator. No ratings, reviews or user counts (none exist; PRODUCT.md).
- Honesty: (1) audio page title depends on real MP3 output (see shipCondition); (2) 4K page must say 4K only when the source is 4K; (3) state the ZIP limits without inventing numbers; (4) profile pictures are about 600×600 at most; (5) footer and FAQ: not affiliated with Pinterest Inc.; (6) credit creators and respect copyright, since searchers explicitly ask about reposting to Instagram.
- Ambiguities found in Turkish autocomplete that FAQs should resolve: 'pinterest pp' (profile-picture ideas = image pins), 'pinterest story' (story backgrounds), 'pinterest kaydet' (pin to board vs save to phone), 'pinterest laptop/bilgisayar/iphone' alone (wallpapers), 'pinterest başlık' (headboards), 'pin indirim' (discounts).
- Evidence limits: Google autocomplete only (no search volumes). Turkey-region SERPs via DuckDuckGo worked for 2 queries before rate-limiting; Bing returned a JS challenge; Pinterest's help center returned HTTP 406 to curl after the first page, so the remaining help pages were read through WebFetch summaries (labels quoted from those summaries, Kaydet flow verified from raw HTML). Before launch, re-verify labels on a Turkish-language phone (Share sheet label, video three-dot menu).
- Internal links on /tr pages must point to /tr pages; for skipped tools (carousel, story, Chrome, SEO), link to the TR page that absorbs the intent instead of the English page.
