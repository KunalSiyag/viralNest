/**
 * Chrome strings, Arabic (Modern Standard Arabic for SA, EG, AE, MA, IQ;
 * second-person imperatives, Western digits). Same keys and {tokens} as en.ts.
 * Vocabulary from docs/i18n/research/ar.json glossary: بنترست (never بينترست),
 * منشور for a Pin, لوحة for a board, «مشاركة» › «نسخ الرابط», الاستديو /
 * المعرض / الصور, شريط الإشارات المرجعية for the bookmarklet (never إضافة).
 * URLs and code stay Latin; the templates isolate them with dir="ltr".
 */
import type { UiStrings } from './en';

export const UI: UiStrings = {
  skipToContent: 'انتقل إلى المحتوى',
  homeAria: 'الصفحة الرئيسية لموقع PintDownload',
  logoAlt: 'شعار PintDownload',
  header: {
    mainNavAria: 'القائمة الرئيسية',
    mobileNavAria: 'الأدوات',
    guides: 'الشروحات',
    themeToggle: 'التبديل بين الوضع الفاتح والداكن',
    menuOpen: 'فتح القائمة',
    menuClose: 'إغلاق القائمة',
  },
  languageMenu: {
    label: 'اللغة',
    buttonAria: 'اللغة: {current}',
    homeFallbackHint: 'الصفحة الرئيسية',
  },
  footer: {
    blurb: 'حمّل المنشورات والفيديوهات واللوحات العامة من بنترست مجانًا وبدون حساب، ولا نضيف أي علامة مائية.',
    tools: 'الأدوات',
    learn: 'الشروحات',
    company: 'عن الموقع',
    blog: 'المدونة',
    about: 'من نحن',
    contact: 'اتصل بنا',
    privacy: 'الخصوصية',
    terms: 'الشروط',
    englishMarker: '(بالإنجليزية)',
    copyright: '© {year} {brand} · {domain}',
    credit: 'انسب المحتوى إلى صاحبه عند إعادة نشره. PintDownload موقع مستقل وغير تابع لشركة Pinterest, Inc.',
  },
  matrix: {
    heading: 'كل أدوات PintDownload وشروحاته',
    devices: 'الجوال والكمبيوتر',
    formats: 'الصيغ والجودة',
    batch: 'اللوحات والمنشورات',
    guides: 'الشروحات',
  },
  howTo: {
    exampleLabel: 'مثال على رابط',
    stepPrefix: 'الخطوة {n}: ',
  },
  faq: {
    title: 'أسئلة شائعة',
  },
  related: {
    title: 'أدوات أخرى للتحميل من بنترست',
    intro: 'كل أداة تستقبل نوعًا واحدًا من الروابط. اختر الأداة التي تناسب رابطك لتصل إلى الملف من أول مرة.',
  },
  compare: {
    title: 'منشور أم لوحة أم حساب: أي أداة تختار؟',
    intro: 'استخدم الأداة التي تناسب نوع رابطك. ولصق نوع خاطئ من الروابط هو أشيع أسباب فشل التحميل.',
    feature: 'وجه المقارنة',
    pin: 'منشور',
    board: 'لوحة ZIP',
    profile: 'حساب ZIP',
    rows: {
      url: {
        feature: 'شكل الرابط',
        pin: 'pinterest.com/pin/1234…',
        board: 'pinterest.com/username/board-name/',
        profile: 'pinterest.com/username/',
      },
      what: {
        feature: 'ما تحصل عليه',
        pin: 'ملف واحد أو كل صور المنشور',
        board: 'منشورات كثيرة في ملف ZIP',
        profile: 'المنشورات الظاهرة في ملف ZIP',
      },
      best: {
        feature: 'يناسب',
        pin: 'حفظ فكرة واحدة أو فيديو واحد',
        board: 'لوحات الإلهام والمجموعات',
        profile: 'حفظ منشورات حساب كامل',
      },
      carousel: {
        feature: 'المنشور متعدد الصور',
        pin: 'نعم، كل الصور',
        board: 'غلاف كل منشور*',
        profile: 'غلاف كل منشور*',
      },
      private: {
        feature: 'المحتوى الخاص أو السري',
        pin: 'غير مدعوم',
        board: 'غير مدعوم',
        profile: 'غير مدعوم',
      },
    },
    footnoteBefore: '* لتحصل على كل صور منشور متعدد الصور داخل لوحة أو حساب، افتح ذلك المنشور في',
    footnoteLink: 'أداة التحميل من رابط بنترست',
    footnoteAfter: '.',
  },
  bookmarklet: {
    title: 'زر تحميل في شريط الإشارات المرجعية',
    body: 'احفظ فيديوهات بنترست وصوره ولوحاته وأنت تتصفح بنترست على الكمبيوتر. اضغط الزر في شريط الإشارات المرجعية وأنت على أي منشور، فيفتح PintDownload والرابط جاهز.',
    button: 'اسحبه إلى شريط الإشارات',
    dragAlert: 'اسحب هذا الزر إلى شريط الإشارات المرجعية في متصفحك لتثبيته.',
    dragTitle: 'اسحبني إلى شريط الإشارات المرجعية',
    notPinterest: 'افتح صفحة من بنترست أولًا.',
    chromeTitle: 'Chrome / Edge',
    chromeBodyHtml: 'اضغط `Ctrl+Shift+B` (أو `Cmd+Shift+B` على ماك) لإظهار شريط الإشارات المرجعية، ثم اسحب الزر إليه.',
    safariTitle: 'Safari',
    safariBody: 'اسحبه إلى «المفضلة». على الآيفون أو الآيباد: أضف أي صفحة إلى الإشارات المرجعية، ثم عدّل رابطها والصق كود الزر مكانه.',
    useTitle: 'طريقة الاستخدام',
    useBodyHtml: 'وأنت على منشور أو لوحة، اضغط إشارة **PintDownload** المرجعية، فيفتح الموقع والرابط ملصوق فيه.',
    imageAlt:
      'طريقة إضافة PintDownload إلى الإشارات المرجعية في Chrome: افتح القائمة، ثم الإشارات المرجعية، ثم اختر وضع إشارة مرجعية على علامة التبويب هذه واحفظها في شريط الإشارات',
  },
  ad: {
    label: 'إعلان',
  },
  notFound: {
    title: 'الصفحة غير موجودة — {brand}',
    description: 'هذه الصفحة غير موجودة على {domain}. ارجع إلى الصفحة الرئيسية أو جرّب إحدى أدوات التحميل من بنترست.',
    h1: 'المنشور ليس في اللوحة.',
    lede: 'ربما الرابط قديم أو فيه خطأ، أو حُذفت الصفحة. جرّب أداة التحميل، أو اقرأ أحد الشروحات، أو اختر أداة من الأسفل.',
    ticketLabel: 'تذكرة دخول · رابط عام',
    stamp: 'الصفحة غير موجودة',
    home: 'الصفحة الرئيسية',
    blog: 'اقرأ المدونة',
    contact: 'اتصل بنا',
    toolsAria: 'أدوات التحميل من بنترست',
    bug: 'هل تظن أنها مشكلة في الموقع؟',
    videoBlurb: 'احفظ منشورات الفيديو العامة',
    pinBlurb: 'صور وGIF ومنشورات متعددة الصور',
    boardBlurb: 'لوحات عامة كاملة في ملف ZIP',
    guideBlurb: 'خطوات للجوال والكمبيوتر',
    guideBadge: 'شرح',
  },
};
