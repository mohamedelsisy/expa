// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppL10nAr extends AppL10n {
  AppL10nAr([String locale = 'ar']) : super(locale);

  @override
  String get appName => 'إكسبا';

  @override
  String get appTagline => 'مساعدك في الحياة في إيطاليا';

  @override
  String get tabHome => 'الرئيسية';

  @override
  String get tabExplore => 'استكشف';

  @override
  String get tabAsk => 'اسأل EXPA';

  @override
  String get tabTasks => 'المهام';

  @override
  String get tabProfile => 'حسابي';

  @override
  String get retry => 'إعادة المحاولة';

  @override
  String get cancel => 'إلغاء';

  @override
  String get save => 'حفظ';

  @override
  String get close => 'إغلاق';

  @override
  String get loading => 'جارٍ التحميل…';

  @override
  String get errorGeneric => 'حدث خطأ ما. حاول مرة أخرى.';

  @override
  String get errorNetwork =>
      'لا يوجد اتصال بالإنترنت. تحقق من الشبكة وحاول مرة أخرى.';

  @override
  String get errorTimeout => 'استغرق الطلب وقتًا طويلًا. حاول مرة أخرى.';

  @override
  String get errorServer => 'الخدمة غير متاحة مؤقتًا. حاول لاحقًا.';

  @override
  String get errorForbidden => 'ليس لديك صلاحية لهذا الإجراء.';

  @override
  String get errorNotFound => 'لم نجد ما تبحث عنه.';

  @override
  String get errorRateLimited => 'طلبات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.';

  @override
  String get errorValidation => 'تحقق من البيانات المدخلة.';

  @override
  String get emptyList => 'لا توجد عناصر لعرضها.';

  @override
  String get loadMore => 'عرض المزيد';

  @override
  String get openOfficialSite => 'فتح الموقع الرسمي';

  @override
  String get linkUnsafe => 'تم حجب الرابط لأنه غير آمن.';

  @override
  String get linkOpenFailed => 'تعذّر فتح الرابط.';

  @override
  String get optional => 'اختياري';

  @override
  String get skip => 'تخطي';

  @override
  String get next => 'التالي';

  @override
  String get delete => 'حذف';

  @override
  String get saved => 'تم الحفظ.';

  @override
  String get sessionExpired => 'انتهت الجلسة. سجّل الدخول مرة أخرى.';

  @override
  String get consentRequired =>
      'هذا الإجراء يحتاج إلى موافقتك. يمكنك منحها من إعدادات الخصوصية.';

  @override
  String get grantConsent => 'منح الموافقة';

  @override
  String get loginTitle => 'تسجيل الدخول';

  @override
  String get loginSubtitle => 'مرحبًا بعودتك إلى إكسبا';

  @override
  String get email => 'البريد الإلكتروني';

  @override
  String get password => 'كلمة المرور';

  @override
  String get confirmPassword => 'تأكيد كلمة المرور';

  @override
  String get name => 'الاسم';

  @override
  String get loginButton => 'دخول';

  @override
  String get registerButton => 'إنشاء حساب';

  @override
  String get registerTitle => 'إنشاء حساب جديد';

  @override
  String get forgotLink => 'نسيت كلمة المرور؟';

  @override
  String get noAccount => 'ليس لديك حساب؟ أنشئ حسابًا';

  @override
  String get haveAccount => 'لديك حساب؟ سجّل الدخول';

  @override
  String get acceptTerms => 'أوافق على شروط الاستخدام';

  @override
  String get acceptPrivacy => 'اطلعت على سياسة الخصوصية وأوافق عليها';

  @override
  String get passwordHint => '10 أحرف على الأقل، مع أحرف وأرقام';

  @override
  String get invalidCredentials =>
      'البريد الإلكتروني أو كلمة المرور غير صحيحة.';

  @override
  String get fieldRequired => 'هذا الحقل مطلوب.';

  @override
  String get invalidEmail => 'أدخل بريدًا إلكترونيًا صحيحًا.';

  @override
  String get passwordsMismatch => 'كلمتا المرور غير متطابقتين.';

  @override
  String get passwordTooShort => 'كلمة المرور قصيرة جدًا.';

  @override
  String get mustAcceptBoth => 'يجب الموافقة على الشروط وسياسة الخصوصية.';

  @override
  String get forgotTitle => 'استعادة كلمة المرور';

  @override
  String get forgotBody =>
      'أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة إن كان الحساب موجودًا.';

  @override
  String get sendResetLink => 'إرسال الرابط';

  @override
  String get resetSent =>
      'إذا كان الحساب موجودًا فقد أرسلنا رابط الاستعادة إلى بريدك.';

  @override
  String get verifyTitle => 'تحقق من بريدك الإلكتروني';

  @override
  String get verifyBody =>
      'أرسلنا رابط التفعيل إلى بريدك. افتح الرابط ثم ارجع إلى التطبيق. بعض الميزات مثل اسأل EXPA تتطلب بريدًا مفعّلًا.';

  @override
  String get verifyBanner => 'بريدك الإلكتروني غير مفعّل بعد.';

  @override
  String get resendVerification => 'إعادة إرسال رابط التفعيل';

  @override
  String get verificationSent => 'تم إرسال رابط التفعيل.';

  @override
  String get verifiedCheck => 'لقد فعّلت بريدي';

  @override
  String get continueToApp => 'المتابعة إلى التطبيق';

  @override
  String get logout => 'تسجيل الخروج';

  @override
  String get accountSuspended => 'هذا الحساب موقوف.';

  @override
  String get language => 'اللغة';

  @override
  String get langAr => 'العربية';

  @override
  String get langEn => 'English';

  @override
  String get langIt => 'Italiano';

  @override
  String homeGreeting(String name) {
    return 'مرحبًا $name';
  }

  @override
  String get scoreTitle => 'درجة EXPA';

  @override
  String get scoreHow => 'كيف تُحسب؟';

  @override
  String get scoreUnavailable => 'لا توجد بيانات كافية لحساب الدرجة بعد.';

  @override
  String scoreSemantics(String percent) {
    return 'درجة EXPA $percent بالمئة';
  }

  @override
  String get nextActions => 'ماذا أفعل الآن؟';

  @override
  String get nextActionsEmpty => 'لا توجد إجراءات مقترحة الآن.';

  @override
  String get personalizationOff =>
      'التخصيص متوقف. فعّله من الخصوصية للحصول على اقتراحات تناسبك.';

  @override
  String get onboardingContinue => 'أكمل ملفك الشخصي';

  @override
  String get tasksTitle => 'مهام الاستقرار';

  @override
  String get taskMarkDone => 'تم';

  @override
  String get taskReopen => 'إعادة فتح';

  @override
  String get taskDismiss => 'لا ينطبق عليّ';

  @override
  String get taskDone => 'مكتملة';

  @override
  String get tasksDocuments => 'وثائقي';

  @override
  String get guidesTitle => 'الأدلة';

  @override
  String get searchHint => 'ابحث…';

  @override
  String get allCategories => 'الكل';

  @override
  String get sourceLabel => 'المصدر';

  @override
  String get sourceOfficial => 'رسمي';

  @override
  String get sourceInstitutional => 'مؤسسي';

  @override
  String get sourceVerifiedPartner => 'شريك موثّق';

  @override
  String get sourceThirdParty => 'طرف ثالث';

  @override
  String lastVerified(String date) {
    return 'آخر تحقق: $date';
  }

  @override
  String get neverVerified => 'لم يتم التحقق من المصدر بعد';

  @override
  String get freshFresh => 'محدّث';

  @override
  String get freshStale => 'قد يكون قديمًا';

  @override
  String get freshOutdated => 'قديم – تحقق من الموقع الرسمي';

  @override
  String get freshUnverified => 'غير موثّق';

  @override
  String get fallbackLocale => 'هذا المحتوى غير متوفر بلغتك، يُعرض بلغة أخرى.';

  @override
  String get secWhatIs => 'ما هو؟';

  @override
  String get secWhoNeeds => 'من يحتاجه؟';

  @override
  String get secDocuments => 'الوثائق المطلوبة';

  @override
  String get secSteps => 'الخطوات';

  @override
  String get secWhere => 'أين تقدّم؟';

  @override
  String get secBook => 'كيف تحجز؟';

  @override
  String get secCosts => 'التكاليف';

  @override
  String get secTime => 'مدة المعالجة';

  @override
  String get verifyOfficialNotice =>
      'معلومات عامة للإرشاد. تحقق دائمًا من المصدر الرسمي قبل أي قرار.';

  @override
  String get documentsTitle => 'وثائقي';

  @override
  String get addDocument => 'إضافة وثيقة';

  @override
  String get docType => 'نوع الوثيقة';

  @override
  String get docLabel => 'تسمية (اختياري)';

  @override
  String get issueDate => 'تاريخ الإصدار';

  @override
  String get expiryDate => 'تاريخ الانتهاء';

  @override
  String get notes => 'ملاحظات';

  @override
  String get remindersEnabled => 'تذكيري قبل الانتهاء';

  @override
  String get noExpiry => 'بدون تاريخ انتهاء';

  @override
  String daysRemaining(String n) {
    return 'متبقي $n يوم';
  }

  @override
  String expiredDaysAgo(String n) {
    return 'انتهت منذ $n يوم';
  }

  @override
  String get statusValid => 'سارية';

  @override
  String get statusExpiringSoon => 'تنتهي قريبًا';

  @override
  String get statusExpired => 'منتهية';

  @override
  String get statusNoExpiry => 'بلا انتهاء';

  @override
  String get pickDate => 'اختر التاريخ';

  @override
  String get clearDate => 'مسح';

  @override
  String get docsEmpty =>
      'لم تضف أي وثيقة بعد. أضف جواز السفر أو تصريح الإقامة لنذكّرك قبل انتهائهما.';

  @override
  String get deleteDocConfirm => 'حذف هذه الوثيقة؟';

  @override
  String get consentNeededDocs =>
      'لحفظ وثائقك نحتاج موافقتك على تخزين الوثائق.';

  @override
  String get docAttachmentsNote =>
      'المرفقات متاحة في الموقع. هذه النسخة تتتبع التواريخ فقط.';

  @override
  String get askTitle => 'اسأل EXPA';

  @override
  String get askHint => 'اكتب سؤالك بالعربية أو الإنجليزية أو الإيطالية';

  @override
  String get askSend => 'إرسال';

  @override
  String get askIntro =>
      'اسألني عن الإقامة والوثائق والخدمات الحكومية. أجيب اعتمادًا على مصادر موثّقة وأذكرها لك.';

  @override
  String askUsage(String n) {
    return 'المتبقي اليوم: $n';
  }

  @override
  String askResets(String date) {
    return 'يتجدد الحد في $date';
  }

  @override
  String get askLimitReached => 'وصلت إلى حدّ الأسئلة اليومي.';

  @override
  String get askVerifyEmail => 'فعّل بريدك الإلكتروني لاستخدام اسأل EXPA.';

  @override
  String get askFailed => 'تعذّرت المعالجة الآن. حاول مرة أخرى.';

  @override
  String get askDegraded =>
      'تعذّر استخدام الذكاء الاصطناعي الآن. هذه إجابة محدودة، تصفّح الأدلة للحصول على معلومات موثّقة.';

  @override
  String get askBrowseGuides => 'تصفّح الأدلة';

  @override
  String get askSourcesTitle => 'المصادر';

  @override
  String get askNoSources => 'لا توجد مصادر موثّقة لهذه الإجابة.';

  @override
  String get askNoticeTitle => 'تنبيه';

  @override
  String get askYou => 'أنت';

  @override
  String get askAssistant => 'EXPA';

  @override
  String get askSuggested => 'إجراءات مقترحة';

  @override
  String get askLabelOfficial => 'معلومات رسمية';

  @override
  String get askLabelGeneral => 'إرشاد عام';

  @override
  String get askLabelAi => 'شرح بالذكاء الاصطناعي';

  @override
  String get askLabelThird => 'خدمة أو مصدر من طرف ثالث';

  @override
  String get learnTitle => 'تعلّم الإيطالية';

  @override
  String get dailyTitle => 'إيطالية اليوم – 10 دقائق';

  @override
  String get dailyDone => 'تم اليوم';

  @override
  String minutes(String n) {
    return '$n دقيقة';
  }

  @override
  String streak(String n) {
    return 'سلسلة الأيام: $n';
  }

  @override
  String get lessonsTitle => 'الدروس';

  @override
  String get lessonStart => 'ابدأ الدرس';

  @override
  String get lessonComplete => 'أنهيت الدرس';

  @override
  String get lessonCompleted => 'مكتمل';

  @override
  String get lessonsEmpty => 'لا توجد دروس متاحة بعد.';

  @override
  String get jobsTitle => 'الوظائف';

  @override
  String matchScore(String n) {
    return 'نسبة التوافق: $n%';
  }

  @override
  String get matchUnknown => 'لا توجد بيانات كافية للمطابقة';

  @override
  String get matchReasons => 'لماذا هذه النتيجة؟';

  @override
  String get reasonMatch => 'متوافق';

  @override
  String get reasonPartial => 'متوافق جزئيًا';

  @override
  String get reasonMismatch => 'غير متوافق';

  @override
  String get reasonUnknown => 'غير معروف (لا يؤثر سلبًا)';

  @override
  String get applyOriginal => 'التقديم في الموقع الأصلي';

  @override
  String get applyNotice =>
      'EXPA لا يقدّم الطلب نيابةً عنك. ستنتقل إلى صفحة التقديم الأصلية.';

  @override
  String get visaStated => 'ذكر المصدر دعم التأشيرة';

  @override
  String get visaNotStated => 'لا يذكر المصدر دعم التأشيرة';

  @override
  String get jobsEmpty => 'لا توجد وظائف مطابقة الآن.';

  @override
  String jobSource(String name) {
    return 'المصدر: $name';
  }

  @override
  String get jobsSignInForMatch => 'سجّل الدخول وأكمل ملفك لرؤية نسبة التوافق.';

  @override
  String get notificationsTitle => 'الإشعارات';

  @override
  String get markAllRead => 'تعليم الكل كمقروء';

  @override
  String get notificationsEmpty => 'لا توجد إشعارات.';

  @override
  String get apptTitle => 'حجز المواعيد';

  @override
  String get apptNotice =>
      'EXPA لا يحجز نيابةً عنك. سنوجّهك إلى الجهة الرسمية لإتمام الحجز بنفسك.';

  @override
  String get apptOfficeType => 'نوع الجهة';

  @override
  String get apptCity => 'المدينة';

  @override
  String get apptSearch => 'عرض الجهات';

  @override
  String get apptGoOfficial => 'الانتقال إلى صفحة الحجز الرسمية';

  @override
  String get apptNoUrl =>
      'لا يوجد رابط حجز رسمي مسجّل. راجع الموقع الرسمي للجهة.';

  @override
  String get apptEmpty => 'لا توجد جهات مسجّلة لهذه المدينة.';

  @override
  String get exploreTitle => 'استكشف';

  @override
  String get exploreGuides => 'الأدلة والوثائق';

  @override
  String get exploreLearn => 'تعلّم الإيطالية';

  @override
  String get exploreJobs => 'الوظائف';

  @override
  String get exploreAppointments => 'حجز المواعيد';

  @override
  String get exploreMyDocs => 'وثائقي وتواريخ الانتهاء';

  @override
  String get exploreNotifications => 'الإشعارات';

  @override
  String get profileTitle => 'حسابي';

  @override
  String get profilePrivacy => 'الخصوصية والموافقات';

  @override
  String get profileOnboarding => 'ملفي الشخصي';

  @override
  String get pushNote => 'الإشعارات الفورية غير مفعّلة في هذه النسخة.';

  @override
  String get privacyTitle => 'الخصوصية';

  @override
  String get consentsTitle => 'موافقاتك';

  @override
  String get consentRequiredBadge => 'مطلوب';

  @override
  String get consentsHint => 'يمكنك تغيير الموافقات الاختيارية في أي وقت.';

  @override
  String get exportTitle => 'تصدير بياناتي';

  @override
  String get exportBody =>
      'اطلب نسخة من بياناتك الشخصية. الحد الأقصى 5 طلبات في الساعة.';

  @override
  String get exportRequest => 'طلب التصدير';

  @override
  String exportDone(String n) {
    return 'تم تجهيز بياناتك ($n أقسام). لم يتم حفظها على الجهاز.';
  }

  @override
  String get deleteAccountTitle => 'حذف الحساب';

  @override
  String get deleteAccountBody =>
      'الحذف نهائي. يتوقف الوصول فورًا ويكتمل مسح البيانات لاحقًا. أدخل كلمة المرور للتأكيد.';

  @override
  String get deleteAccountConfirm => 'طلب حذف الحساب';

  @override
  String get deleteRequested => 'تم تقديم طلب الحذف.';

  @override
  String get onboardingTitle => 'عن وضعك في إيطاليا';

  @override
  String get onboardingIntro =>
      'نجمع فقط ما يلزم للتخصيص. يمكنك تخطي الأسئلة الاختيارية.';

  @override
  String get fieldSegment => 'وضعك الحالي';

  @override
  String get fieldNationality => 'الجنسية (رمز من حرفين، مثل EG)';

  @override
  String get fieldCity => 'المدينة';

  @override
  String get fieldResidence => 'نوع الإقامة';

  @override
  String get fieldItalian => 'مستوى الإيطالية';

  @override
  String get fieldEnglish => 'مستوى الإنجليزية';

  @override
  String get fieldGoals => 'أهدافك';

  @override
  String get fieldAge => 'الفئة العمرية';

  @override
  String get notSelected => 'غير محدد';

  @override
  String get completeOnboarding => 'إنهاء';

  @override
  String get onboardingSegmentRequired => 'اختر وضعك الحالي لإنهاء الإعداد.';

  @override
  String get offlineBanner =>
      'لا يوجد اتصال بالإنترنت. تُعرض البيانات المحفوظة على جهازك فقط.';

  @override
  String get apptGuidesTitle => 'أدلة الحجز';

  @override
  String get apptNotBookedByExpa =>
      'إكسبا لا يحجز نيابةً عنك: ستُحوَّل إلى الجهة الرسمية.';

  @override
  String get officeQuestura => 'الشرطة (Questura)';

  @override
  String get officePrefettura => 'المحافظة (Prefettura)';

  @override
  String get officeComune => 'البلدية (Comune)';

  @override
  String get officeAnagrafe => 'السجل المدني (Anagrafe)';

  @override
  String get officeAsl => 'هيئة الصحة المحلية (ASL)';

  @override
  String get officeInps => 'التأمينات الاجتماعية (INPS)';

  @override
  String get officeAgenziaEntrate => 'وكالة الإيرادات (Agenzia delle Entrate)';

  @override
  String get officePoste => 'البريد الإيطالي (Poste Italiane)';

  @override
  String get officeMotorizzazione => 'إدارة المركبات (Motorizzazione)';

  @override
  String get officeUniversity => 'جامعة';

  @override
  String get officeOther => 'جهة أخرى';

  @override
  String get officePhone => 'الهاتف';

  @override
  String get secAdmission => 'شروط القبول';

  @override
  String get secTips => 'نصائح';

  @override
  String get secCautions => 'تنبيهات';

  @override
  String get secNotes => 'ملاحظات';

  @override
  String get exploreGovernment => 'الخدمات الحكومية';

  @override
  String get explorePatente => 'رخصة القيادة (Patente)';

  @override
  String get exploreStudy => 'الدراسة في إيطاليا';

  @override
  String get exploreScan => 'مسح خطاب أو مستند';

  @override
  String get exploreSaved => 'المحفوظات للعمل دون إنترنت';

  @override
  String get govTitle => 'الخدمات الحكومية';

  @override
  String get govServices => 'الخدمات';

  @override
  String get govOffices => 'المكاتب';

  @override
  String get govEmpty =>
      'لا يوجد محتوى منشور بعد. تتم إضافة الخدمات الحكومية بعد مراجعتها من مصادر رسمية.';

  @override
  String get govRelatedGuide => 'الدليل المرتبط';

  @override
  String get studyTitle => 'الدراسة في إيطاليا';

  @override
  String get studyPrograms => 'البرامج';

  @override
  String get studyUniversities => 'الجامعات';

  @override
  String get studyScholarships => 'المنح';

  @override
  String get studyEmpty => 'لا يوجد محتوى منشور بعد.';

  @override
  String get studyTuition => 'الرسوم الدراسية';

  @override
  String get studyPerYear => 'سنويًا';

  @override
  String get studyDeadline => 'آخر موعد للتقديم';

  @override
  String get jobsSavedTitle => 'الوظائف المحفوظة';

  @override
  String get jobsSavedEmpty => 'لم تحفظ أي وظيفة بعد.';

  @override
  String get jobSave => 'حفظ الوظيفة';

  @override
  String get jobUnsave => 'إزالة من المحفوظات';

  @override
  String get lessonTip => 'نصيحة';

  @override
  String get askHistoryTitle => 'المحادثات السابقة';

  @override
  String get askHistoryEmpty => 'لا توجد محادثات سابقة.';

  @override
  String get askHistoryUntitled => 'محادثة';

  @override
  String get askHistoryDelete => 'حذف المحادثة';

  @override
  String get askHistoryDeleteBody => 'سيتم حذف هذه المحادثة نهائيًا.';

  @override
  String get askNewChat => 'محادثة جديدة';

  @override
  String get searchTitle => 'البحث';

  @override
  String get searchMinChars => 'اكتب حرفين على الأقل ثم اضغط بحث.';

  @override
  String get searchEmpty => 'لا توجد نتائج. جرّب كلمات أخرى.';

  @override
  String get savedTitle => 'المحفوظات';

  @override
  String get savedEmpty =>
      'لم تحفظ أي دليل أو درس بعد. اضغط على علامة الحفظ داخل الدليل أو الدرس.';

  @override
  String get savedHint =>
      'هذه النسخ محفوظة على جهازك ويمكن فتحها دون إنترنت. تحقق من تاريخ آخر مراجعة قبل الاعتماد عليها.';

  @override
  String get savedAdd => 'احفظ للعمل دون إنترنت';

  @override
  String get savedRemove => 'إزالة من المحفوظات';

  @override
  String get savedAdded => 'تم الحفظ على جهازك.';

  @override
  String get savedRemoved => 'تمت الإزالة من المحفوظات.';

  @override
  String savedOfflineCopy(String date) {
    return 'هذه نسخة محفوظة بتاريخ $date. تعذّر تحديثها الآن.';
  }

  @override
  String get savedRefreshing => 'نسخة محفوظة. جارٍ التحديث…';

  @override
  String savedOn(String date) {
    return 'حُفظ في $date';
  }

  @override
  String get savedStale => 'قد تكون هذه النسخة قديمة. تأكد من الموقع الرسمي.';

  @override
  String get patenteTitle => 'رخصة القيادة (Patente)';

  @override
  String get patenteDisclaimer =>
      'محتوى تعليمي عام. قواعد الامتحان والأسئلة الرسمية تحددها الجهات الإيطالية، وتحقق دائمًا من المصدر الرسمي.';

  @override
  String get patenteEmpty =>
      'لم يُنشر محتوى الباتينتي بعد. لا ننشر أسئلة إلا إذا كانت لدينا حقوق استخدامها. سنُعلمك عند توفرها.';

  @override
  String get patenteMockExam => 'امتحان تجريبي';

  @override
  String patenteRules(String questions, String errors, String minutes) {
    return '$questions سؤالًا، أقصى عدد للأخطاء $errors، المدة $minutes دقيقة.';
  }

  @override
  String get patenteStartExam => 'ابدأ الامتحان التجريبي';

  @override
  String get patenteProgress => 'تقدمك';

  @override
  String patenteProgressLine(String taken, String passed) {
    return 'امتحانات أجريتها: $taken، ناجحة: $passed';
  }

  @override
  String patentePassRate(String rate) {
    return 'نسبة النجاح في آخر الامتحانات: $rate٪';
  }

  @override
  String patenteWeakTopics(String topics) {
    return 'مواضيع تحتاج إلى مراجعة: $topics';
  }

  @override
  String get patentePracticeWeak => 'تدرّب على المواضيع الضعيفة';

  @override
  String get patenteTopics => 'المواضيع';

  @override
  String get patenteTopicsHint =>
      'اضغط على موضوع للدراسة، أو حدّد مواضيع للتدرّب عليها.';

  @override
  String get patenteNoTopics => 'لا توجد مواضيع منشورة بعد.';

  @override
  String patenteQuestionCount(String n) {
    return '$n سؤالًا';
  }

  @override
  String get patentePractice => 'تدرّب على المواضيع المحددة';

  @override
  String get patenteCategories => 'فئات الرخصة';

  @override
  String get patenteTrue => 'صح (Vero)';

  @override
  String get patenteFalse => 'خطأ (Falso)';

  @override
  String get patenteSubmit => 'إنهاء وتسليم الإجابات';

  @override
  String patenteAnswered(String done, String total) {
    return 'أجبت عن $done من $total';
  }

  @override
  String patenteMaxErrors(String n) {
    return 'أقصى عدد للأخطاء المسموح: $n';
  }

  @override
  String patenteTimeLeft(String time) {
    return 'الوقت المتبقي $time';
  }

  @override
  String get patenteTooEarly =>
      'لا يمكن تسليم الامتحان بهذه السرعة. أجب عن الأسئلة أولًا ثم حاول مرة أخرى.';

  @override
  String get patentePassed => 'نجحت في هذا الامتحان التجريبي';

  @override
  String get patenteFailed => 'لم تنجح في هذا الامتحان التجريبي';

  @override
  String patenteResultLine(String correct, String errors, String max) {
    return 'إجابات صحيحة: $correct، أخطاء: $errors (الحد الأقصى $max)';
  }

  @override
  String patentePracticeResult(String correct, String total) {
    return 'إجابات صحيحة: $correct من $total';
  }

  @override
  String get patenteTimedOut => 'انتهى الوقت وتم تسليم الإجابات تلقائيًا.';

  @override
  String get patenteReview => 'مراجعة الأسئلة';

  @override
  String get patenteNotAnswered => 'لم تجب عن هذا السؤال';

  @override
  String patenteYourAnswer(String answer) {
    return 'إجابتك: $answer';
  }

  @override
  String patenteCorrectAnswer(String answer) {
    return 'الإجابة الصحيحة: $answer';
  }

  @override
  String get patenteBack => 'العودة إلى الباتينتي';

  @override
  String get pushTitle => 'الإشعارات الفورية';

  @override
  String get pushSubtitle => 'تذكيرات بمواعيد انتهاء وثائقك والأمور المهمة.';

  @override
  String get pushRationaleTitle => 'تفعيل الإشعارات؟';

  @override
  String get pushRationaleBody =>
      'سنرسل لك تذكيرات قبل انتهاء وثائقك (مثل تصريح الإقامة) وتنبيهات مهمة. لن نرسل إعلانات. يمكنك إيقافها في أي وقت. سيطلب منك النظام الإذن بعد هذه الخطوة.';

  @override
  String get pushAllow => 'متابعة';

  @override
  String get pushDenied =>
      'تم رفض إذن الإشعارات. يمكنك تفعيله من إعدادات الجهاز.';

  @override
  String get pushFailed => 'تعذّر تفعيل الإشعارات الآن. حاول مرة أخرى لاحقًا.';

  @override
  String get pushEnabledNote => 'تم تفعيل الإشعارات على هذا الجهاز.';

  @override
  String get logoutConfirmTitle => 'تسجيل الخروج؟';

  @override
  String get logoutConfirmBody =>
      'ستُحذف البيانات المحفوظة على هذا الجهاز وسيتوقف استلام الإشعارات.';

  @override
  String get deleteConfirmBody =>
      'حذف الحساب لا يمكن التراجع عنه. هل أنت متأكد؟';

  @override
  String get exportShare => 'مشاركة أو حفظ نسخة…';

  @override
  String get exportShareConfirmTitle => 'مشاركة بياناتك الشخصية';

  @override
  String get exportShareConfirmBody =>
      'الملف يحتوي على بياناتك الشخصية. اختر وجهة آمنة فقط (مثل تطبيق ملاحظات خاص بك أو بريدك). لا يحفظه إكسبا على الجهاز.';

  @override
  String get nationalityInvalid =>
      'أدخل رمز الدولة من حرفين (مثل EG) أو اتركه فارغًا.';

  @override
  String get resetTitle => 'كلمة مرور جديدة';

  @override
  String get resetButton => 'حفظ كلمة المرور';

  @override
  String get resetDone =>
      'تم تغيير كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.';

  @override
  String get resetInvalidLink =>
      'رابط إعادة التعيين غير صالح أو ناقص. اطلب رابطًا جديدًا.';

  @override
  String get verifySuccess => 'تم تأكيد بريدك الإلكتروني.';

  @override
  String get verifyInvalidLink =>
      'رابط التأكيد غير صالح أو منتهي. اطلب رابطًا جديدًا من داخل التطبيق.';

  @override
  String get scannerTitle => 'مسح خطاب أو مستند';

  @override
  String get scannerIntro =>
      'صوّر خطابًا (مثل خطاب من البلدية أو فاتورة) أو الصق نصه، وسنشرح لك محتواه وأهم تواريخه.';

  @override
  String get scannerPrivacy =>
      'لا يُرسل شيء إلى إكسبا قبل أن تراجعه بنفسك وتضغط «إرسال». الشرح ليس استشارة قانونية.';

  @override
  String get scannerCameraWhy =>
      'نستخدم الكاميرا فقط عندما تضغط على زر المسح، لتصوير المستند الذي تختاره.';

  @override
  String get scannerUseCamera => 'تصوير بالكاميرا';

  @override
  String get scannerUseGallery => 'اختيار صورة من الجهاز';

  @override
  String get scannerPasteText => 'لصق النص يدويًا';

  @override
  String get scannerNoCamera =>
      'الكاميرا غير متاحة على هذا الجهاز. يمكنك لصق نص المستند.';

  @override
  String get scannerPermissionDenied =>
      'لم يُسمح بالوصول إلى الكاميرا أو الصور. يمكنك السماح به من إعدادات الجهاز، أو لصق النص يدويًا.';

  @override
  String get scannerReviewTitle => 'راجع قبل الإرسال';

  @override
  String get scannerPreview => 'معاينة الصورة الملتقطة';

  @override
  String get scannerNoOcr =>
      'قراءة النص على الجهاز غير متاحة في هذه النسخة. اكتب أو الصق النص أدناه، أو أرسل الصورة نفسها.';

  @override
  String get scannerTextLabel => 'نص المستند';

  @override
  String get scannerTextHint => 'الصق هنا النص الذي تريد شرحه';

  @override
  String get scannerSendsText => 'سيُرسل هذا النص فقط إلى خوادم إكسبا لشرحه.';

  @override
  String get scannerSendsImage => 'ستُرسل هذه الصورة إلى خوادم إكسبا لشرحها.';

  @override
  String get scannerNothingToSend => 'لا يوجد شيء للإرسال بعد.';

  @override
  String get scannerSend => 'إرسال للشرح';

  @override
  String get scannerDiscard => 'تجاهل وبدء من جديد';

  @override
  String get scannerBackendUnavailable =>
      'خدمة شرح المستندات غير متاحة بعد. حاول لاحقًا.';

  @override
  String get scannerNoSummary => 'لم نتمكن من استخراج ملخص.';

  @override
  String get scannerKeyDates => 'تواريخ مهمة';

  @override
  String get scannerCreateReminder => 'إضافة وثيقة وتذكير';

  @override
  String get scannerActions => 'الخطوات المقترحة';

  @override
  String get scannerDefaultDisclaimer =>
      'هذا شرح آلي عام وليس استشارة قانونية أو رسمية. تأكد من الجهة المرسلة للخطاب.';

  @override
  String get scannerAnother => 'شرح مستند آخر';

  @override
  String get billingTitle => 'الاشتراك والفواتير';

  @override
  String get billingUnavailableTitle => 'المدفوعات غير مفعّلة';

  @override
  String get billingUnavailableBody =>
      'الدفع غير متاح حاليًا، لذلك لا يمكن شراء خطة أو ترقيتها من التطبيق. خطتك الحالية تعمل كما هي، ولن يُخصم منك أي مبلغ.';

  @override
  String get billingUnavailableShort => 'الدفع غير متاح حاليًا.';

  @override
  String get billingCurrent => 'خطتك الحالية';

  @override
  String get billingPlans => 'الخطط';

  @override
  String get billingNoPlans => 'لا توجد خطط منشورة بعد.';

  @override
  String get billingFree => 'مجاني';

  @override
  String billingPerMonth(String amount) {
    return '$amount / شهريًا';
  }

  @override
  String billingPerYear(String amount) {
    return '$amount / سنويًا';
  }

  @override
  String get billingYourPlan => 'خطتك';

  @override
  String get billingChoose => 'اختيار هذه الخطة';

  @override
  String billingFeatAi(String n) {
    return '$n أسئلة للمساعد يوميًا';
  }

  @override
  String get billingFeatReminders => 'تذكيرات متقدمة';

  @override
  String get billingFeatDocAi => 'تحليل المستندات بالذكاء الاصطناعي';

  @override
  String billingFeatHuman(String n) {
    return '$n رصيد مساعدة بشرية';
  }

  @override
  String get billingStatusActive => 'نشط';

  @override
  String get billingStatusPastDue => 'الدفع متأخر';

  @override
  String get billingStatusCanceled => 'ملغى';

  @override
  String get billingStatusFree => 'خطة مجانية';

  @override
  String billingAccessUntil(String date) {
    return 'يبقى الوصول حتى $date';
  }

  @override
  String billingRenews(String date) {
    return 'يتجدد في $date';
  }

  @override
  String get billingEnding => 'سينتهي في نهاية الفترة';

  @override
  String get billingCancel => 'إلغاء عند نهاية الفترة';

  @override
  String get billingCancelTitle => 'إلغاء الاشتراك؟';

  @override
  String get billingCancelBody =>
      'ستحتفظ بمزايا خطتك حتى نهاية الفترة المدفوعة، ثم لن يتجدد الاشتراك.';

  @override
  String get billingCancelConfirm => 'نعم، ألغِ';

  @override
  String get billingCancelled => 'تم الإلغاء عند نهاية الفترة.';

  @override
  String get billingNothingToCancel => 'لا يوجد اشتراك قابل للإلغاء.';

  @override
  String get billingCheckoutFailed => 'تعذّر فتح صفحة الدفع.';

  @override
  String get billingAlreadySubscribed => 'لديك اشتراك نشط بالفعل.';

  @override
  String get billingPlanNotPurchasable => 'هذه الخطة غير متاحة للشراء.';

  @override
  String get billingInvoices => 'الفواتير';

  @override
  String get billingNoInvoices => 'لا توجد فواتير بعد.';

  @override
  String get billingPricesNote =>
      'الأسعار قابلة للتعديل وتُعرض كما يرسلها الخادم. الدفع يتم في المتصفح ولا يمرّ ببيانات بطاقتك عبر التطبيق.';

  @override
  String get exploreCommunity => 'المجتمع (أسئلة وأجوبة)';

  @override
  String get communityTitle => 'مجتمع إكسبا';

  @override
  String get communityNoticeFallback =>
      'إجابات المجتمع من أعضاء عاديين وليست معلومات رسمية ولا موثّقة. تحقق من المصادر الرسمية.';

  @override
  String get communityEmpty => 'لا توجد أسئلة بعد.';

  @override
  String get communityMineOnly => 'أسئلتي فقط';

  @override
  String get communityAskOpen => 'اطرح سؤالًا';

  @override
  String get communityQuestionTitle => 'عنوان السؤال';

  @override
  String get communityQuestionBody => 'تفاصيل السؤال';

  @override
  String get communityTopic => 'الموضوع';

  @override
  String get communityNoTopic => 'بدون موضوع';

  @override
  String get communityPost => 'نشر';

  @override
  String get communityPostedPending =>
      'استلمنا مشاركتك وقد تنتظر المراجعة قبل ظهورها للآخرين.';

  @override
  String communityAnswers(String n) {
    return 'الأجوبة ($n)';
  }

  @override
  String get communityNoAnswers => 'لا توجد أجوبة بعد.';

  @override
  String get communityWriteAnswer => 'اكتب جوابًا';

  @override
  String get communityAccepted => 'الجواب المعتمد من صاحب السؤال';

  @override
  String get communityOfficialGuide => 'الدليل الرسمي المرتبط';

  @override
  String get communityMine => 'مشاركتي';

  @override
  String get communityPendingStatus => 'بانتظار المراجعة';

  @override
  String get communityHiddenStatus => 'مخفي من المشرفين';

  @override
  String get communityDelete => 'حذف سؤالي';

  @override
  String get communityDeleted => 'حُذف السؤال.';

  @override
  String communityComments(String n) {
    return 'التعليقات ($n)';
  }

  @override
  String get exploreArticles => 'المقالات';

  @override
  String get exploreCities => 'المدن';

  @override
  String get exploreServices => 'مزوّدو الخدمات';

  @override
  String get exploreLegal => 'الوثائق القانونية';

  @override
  String get articlesTitle => 'المقالات';

  @override
  String get articlesEmpty => 'لا توجد مقالات منشورة بعد.';

  @override
  String get articleEditorial => 'مقال تحريري — ليس مصدرًا رسميًا';

  @override
  String get articleRelatedGuides => 'أدلة ذات صلة';

  @override
  String get articleRelatedArticles => 'مقالات ذات صلة';

  @override
  String get articleTags => 'الوسوم';

  @override
  String get articleDefaultDisclaimer =>
      'محتوى عام للإرشاد وليس استشارة قانونية أو رسمية. تحقق من المصادر الرسمية.';

  @override
  String get citiesTitle => 'المدن';

  @override
  String get citiesEmpty => 'لا توجد ملفات مدن منشورة بعد.';

  @override
  String get cityOfficial => 'معلومات رسمية';

  @override
  String get cityGeneral => 'إرشاد عام';

  @override
  String get cityGuides => 'أدلة تنطبق على هذه المدينة';

  @override
  String get cityArticles => 'مقالات عن المدينة';

  @override
  String cityOffices(String n) {
    return 'عدد المكاتب الحكومية المسجّلة: $n';
  }

  @override
  String get cityOfficesOpen => 'عرض الجهات الحكومية';

  @override
  String get providersTitle => 'مزوّدو الخدمات';

  @override
  String get providersEmpty => 'لا يوجد مزوّدون مطابقون.';

  @override
  String get providersVerifiedOnly => 'الموثّقون فقط';

  @override
  String get providersThirdParty => 'خدمة طرف ثالث — غير رسمية';

  @override
  String get providersNoticeFallback =>
      'هذا المزوّد طرف ثالث مستقل وليس جهة رسمية ولا تابعًا لإكسبا. تحقق بنفسك قبل الدفع أو مشاركة بياناتك.';

  @override
  String providersRating(String avg, String count) {
    return 'التقييم: $avg ($count)';
  }

  @override
  String get providersNoRatings => 'لا تقييمات بعد';

  @override
  String get providersContact => 'بيانات التواصل المعلنة';

  @override
  String get providersWebsite => 'الموقع الإلكتروني';

  @override
  String get providersRequestContact => 'طلب تواصل';

  @override
  String get leadTitle => 'طلب تواصل مع المزوّد';

  @override
  String get leadIntro =>
      'هذا طلب تواصل وليس حجزًا ولا اتفاقًا. سيصل المزوّد رسالتك فقط.';

  @override
  String get leadMessage => 'رسالتك';

  @override
  String get leadConsent =>
      'أوافق على مشاركة بيانات التواصل الخاصة بي (الاسم والبريد) مع هذا المزوّد ليردّ عليّ.';

  @override
  String get leadSend => 'إرسال الطلب';

  @override
  String get leadSent => 'أُرسل طلبك. هذا ليس حجزًا مؤكدًا؛ ينتظر ردّ المزوّد.';

  @override
  String get leadCooldown =>
      'أرسلت طلبًا إلى هذا المزوّد مؤخرًا. انتظر 24 ساعة قبل طلب جديد.';

  @override
  String get leadNeedConsent =>
      'يجب الموافقة على مشاركة بيانات التواصل لإرسال الطلب.';

  @override
  String get leadMessageRequired => 'اكتب رسالة قصيرة للمزوّد.';

  @override
  String get accountTooNew => 'حسابك جديد جدًا لهذا الإجراء. حاول لاحقًا.';

  @override
  String get reviewsTitle => 'التقييمات';

  @override
  String get reviewsEmpty => 'لا توجد تقييمات معتمدة بعد.';

  @override
  String get reviewWrite => 'اكتب تقييمًا';

  @override
  String get reviewRating => 'التقييم (1 إلى 5)';

  @override
  String get reviewBody => 'تعليقك (اختياري)';

  @override
  String get reviewSend => 'إرسال التقييم';

  @override
  String get reviewPending =>
      'تم استلام تقييمك وهو بانتظار المراجعة قبل ظهوره.';

  @override
  String get reviewExists => 'لقد قيّمت هذا المزوّد من قبل.';

  @override
  String get reviewRatingRequired => 'اختر تقييمًا من 1 إلى 5.';

  @override
  String get reviewReport => 'إبلاغ';

  @override
  String get reviewReportReason => 'سبب البلاغ';

  @override
  String get reviewReportSend => 'إرسال البلاغ';

  @override
  String get reviewReportSent => 'شكرًا. وصل بلاغك إلى المشرفين.';

  @override
  String get reviewAlreadyReported => 'سبق أن أبلغت عن هذا التقييم.';

  @override
  String get reasonSpam => 'محتوى مزعج أو إعلاني';

  @override
  String get reasonAbuse => 'إساءة أو لغة مسيئة';

  @override
  String get reasonMisleading => 'تقييم مضلِّل أو مزيّف';

  @override
  String get reasonIllegal => 'محتوى غير قانوني';

  @override
  String get reasonPersonalData => 'يتضمن بيانات شخصية';

  @override
  String get reasonOther => 'سبب آخر';

  @override
  String get myRequestsTitle => 'طلباتي وتقييماتي';

  @override
  String get myRequestsLeads => 'طلبات التواصل';

  @override
  String get myRequestsReviews => 'تقييماتي';

  @override
  String get myRequestsEmpty => 'لا توجد طلبات تواصل بعد.';

  @override
  String get myReviewsEmpty => 'لم تكتب تقييمات بعد.';

  @override
  String get myReviewDelete => 'حذف تقييمي';

  @override
  String get myReviewDeleted => 'حُذف التقييم.';

  @override
  String get statusPending => 'بانتظار المراجعة';

  @override
  String get statusApproved => 'معتمد';

  @override
  String get statusRejected => 'مرفوض';

  @override
  String get statusSeen => 'اطّلع عليه المزوّد';

  @override
  String get statusClosed => 'مغلق';

  @override
  String get statusNew => 'تم الإرسال';

  @override
  String get providerPortalNote =>
      'بوابة المزوّدين متاحة على الموقع فقط وليس في التطبيق.';

  @override
  String get exploreHousing => 'فاحص عقد الإيجار';

  @override
  String get housingTitle => 'فاحص عقد الإيجار';

  @override
  String get housingIntro =>
      'الصق نص إعلان الإيجار أو العقد لنُبرز النقاط المهمة وعلامات التحذير والأسئلة التي يجب طرحها.';

  @override
  String get housingConsentNeeded =>
      'فحص الإيجار يحتاج موافقتك على «تحليل السكن». لا نحفظ النص.';

  @override
  String get housingConsentGranted => 'تم منح الموافقة. اضغط «افحص» مرة أخرى.';

  @override
  String get housingTextLabel => 'نص الإعلان أو العقد';

  @override
  String get housingTextHint => 'الصق النص هنا (20 حرفًا على الأقل)';

  @override
  String get housingTextTooShort => 'النص قصير جدًا. الصق 20 حرفًا على الأقل.';

  @override
  String get housingExtraTitle => 'تكاليف إضافية تعرفها (اختياري)';

  @override
  String get housingRent => 'الإيجار الشهري';

  @override
  String get housingUtilities => 'الخدمات (شهريًا)';

  @override
  String get housingCondo => 'رسوم العمارة (شهريًا)';

  @override
  String get housingInternet => 'الإنترنت (شهريًا)';

  @override
  String get housingExplain => 'أضف شرحًا بالذكاء الاصطناعي';

  @override
  String get housingSend => 'افحص';

  @override
  String housingQuotaLeft(String n) {
    return 'الفحوصات المتبقية: $n';
  }

  @override
  String get housingQuotaReached =>
      'وصلت إلى حدّ فحوصات السكن. حاول لاحقًا أو راجع خطتك.';

  @override
  String housingConfidence(String level) {
    return 'ثقة التحليل: $level';
  }

  @override
  String get housingFacts => 'ما وجدناه في النص';

  @override
  String housingFactRent(String v) {
    return 'الإيجار الشهري: $v';
  }

  @override
  String housingFactDeposit(String v) {
    return 'التأمين (الضمان): $v';
  }

  @override
  String housingFactDepositMonths(String v) {
    return 'التأمين: $v شهر/أشهر';
  }

  @override
  String get housingFactUtilitiesIncluded => 'الخدمات: مشمولة';

  @override
  String get housingFactUtilitiesExcluded => 'الخدمات: غير مشمولة';

  @override
  String housingFactExpenses(String v) {
    return 'مصاريف شهرية: $v';
  }

  @override
  String get housingRedFlags => 'علامات تحذير محتملة';

  @override
  String get housingNoRedFlags =>
      'لم نجد علامات تحذير واضحة في النص، وهذا لا يعني أن العقد سليم.';

  @override
  String get housingSevWarning => 'تحذير';

  @override
  String get housingSevCaution => 'تنبيه';

  @override
  String get housingSevInfo => 'معلومة';

  @override
  String get housingOneDeposit => 'التأمين (مرة واحدة)';

  @override
  String get housingOneAgencyFee => 'عمولة الوكالة';

  @override
  String get housingBasisGeneral => 'إرشاد عام';

  @override
  String get housingBasisSourced => 'مبني على مصدر';

  @override
  String get housingQuestions => 'أسئلة تطرحها على المؤجّر';

  @override
  String get housingCouldNotDetect => 'لم نستطع تحديد هذه البنود';

  @override
  String get housingCost => 'تقدير التكلفة الشهرية';

  @override
  String housingCostTotal(String v) {
    return 'الإجمالي التقريبي: $v شهريًا';
  }

  @override
  String get housingCostUnknown =>
      'لا يمكن حساب إجمالي موثوق من المعلومات المتاحة.';

  @override
  String get housingCompRent => 'الإيجار';

  @override
  String get housingCompUtilities => 'الخدمات';

  @override
  String get housingCompCondo => 'رسوم العمارة';

  @override
  String get housingCompInternet => 'الإنترنت';

  @override
  String get housingSourceUser => 'أدخلتَه أنت';

  @override
  String get housingSourceText => 'من النص';

  @override
  String get housingAssumptions => 'افتراضات التقدير';

  @override
  String get housingOneTime => 'تكاليف لمرة واحدة';

  @override
  String get housingNotes => 'ملاحظات';

  @override
  String get housingAiExplanation => 'شرح بالذكاء الاصطناعي';

  @override
  String get housingDisclaimerTitle => 'تنبيه';

  @override
  String get housingFallbackDisclaimer =>
      'هذه إرشادات عامة وليست استشارة قانونية. استشر محاميًا أو جهة مختصة قبل التوقيع.';

  @override
  String get housingAnother => 'فحص نص آخر';

  @override
  String get legalTitle => 'الوثائق القانونية';

  @override
  String get legalPrivacy => 'سياسة الخصوصية';

  @override
  String get legalTerms => 'شروط الاستخدام';

  @override
  String get legalCookies => 'سياسة ملفات تعريف الارتباط';

  @override
  String get legalNotPublished =>
      'لم يُنشر هذا المستند بعد. سنعرضه هنا فور نشره رسميًا.';

  @override
  String legalVersion(String v, String date) {
    return 'الإصدار $v — نُشر في $date';
  }

  @override
  String legalVersionOnly(String v) {
    return 'الإصدار $v';
  }

  @override
  String get legalRead => 'اقرأ';

  @override
  String get legalReadTerms => 'اقرأ شروط الاستخدام';

  @override
  String get legalReadPrivacy => 'اقرأ سياسة الخصوصية';

  @override
  String get patenteWeakTitle => 'مواضيعي الضعيفة';

  @override
  String patenteWeakIntro(String threshold, String min) {
    return 'المواضيع التي تقل دقتك فيها عن $threshold% بعد $min إجابات على الأقل.';
  }

  @override
  String get patenteWeakNone =>
      'لا توجد مواضيع ضعيفة حتى الآن. حلّ مزيدًا من الأسئلة ليظهر التحليل.';

  @override
  String get patenteWeakList => 'مواضيع تحتاج مراجعة';

  @override
  String get patenteUntouched => 'مواضيع لم تجرّبها بعد';

  @override
  String patenteRecommended(String t) {
    return 'موضوع مقترح للبدء: $t';
  }

  @override
  String patenteTopicAccuracy(String acc, String correct, String answered) {
    return 'الدقة $acc% ($correct من $answered)';
  }

  @override
  String get patentePracticeTopic => 'تدرّب على هذا الموضوع';

  @override
  String get patentePracticeAllWeak => 'تدرّب على كل المواضيع الضعيفة';

  @override
  String get patenteNoWeakToPractice =>
      'لا توجد مواضيع ضعيفة للتدرّب عليها بعد.';

  @override
  String get patenteNotEnoughQuestions =>
      'لا توجد أسئلة كافية لهذه الجلسة بعد.';

  @override
  String get patenteWeakOpen => 'تحليل المواضيع الضعيفة';

  @override
  String get patenteGlossaryOpen => 'قاموس مصطلحات الرخصة (إيطالي ← عربي)';

  @override
  String get patenteGlossaryTitle => 'قاموس الباتنتي';

  @override
  String get patenteGlossaryEmpty => 'لا توجد مصطلحات منشورة بعد.';

  @override
  String get patenteCheck => 'تحقق من إجابتي';

  @override
  String get patenteCheckPick => 'اختر صحيح أو خطأ أولًا.';

  @override
  String get patenteFeedbackCorrect => 'إجابة صحيحة';

  @override
  String patenteFeedbackWrong(String a) {
    return 'إجابة غير صحيحة. الجواب الصحيح: $a';
  }

  @override
  String get patenteExplanationIt => 'الشرح بالإيطالية';

  @override
  String get patenteExplanationAr => 'الشرح بالعربية';

  @override
  String get patenteExplanationEn => 'الشرح بالإنجليزية';

  @override
  String get practiceTitle => 'تدريب الإيطالية';

  @override
  String get practiceOpen => 'تدريب: مفردات وتمارين ومراجعة';

  @override
  String get practiceNotReviewed =>
      'هذا المحتوى لم يراجعه معلّم بعد. قد يحتوي على أخطاء.';

  @override
  String get practiceReviewed => 'راجعه معلّم';

  @override
  String practiceReviewedOn(String date) {
    return 'راجعه معلّم في $date';
  }

  @override
  String practiceDue(String n) {
    return 'بطاقات مستحقة الآن: $n';
  }

  @override
  String practiceMastered(String n) {
    return 'بطاقات متقنة: $n';
  }

  @override
  String practiceLearning(String n) {
    return 'بطاقات قيد التعلّم: $n';
  }

  @override
  String practiceAccuracy(String n) {
    return 'الدقة: $n%';
  }

  @override
  String practiceAttempts(String n) {
    return 'محاولات التمارين: $n';
  }

  @override
  String get practiceReviewCards => 'مراجعة البطاقات (تكرار متباعد)';

  @override
  String get practiceVocabulary => 'المفردات';

  @override
  String get practiceExercises => 'التمارين';

  @override
  String get practiceScenarios => 'مواقف من الحياة اليومية';

  @override
  String get vocabEmpty => 'لا توجد مفردات منشورة بعد.';

  @override
  String get exercisesEmpty => 'لا توجد تمارين منشورة بعد.';

  @override
  String get scenariosEmpty => 'لا توجد مواقف متاحة بعد.';

  @override
  String scenarioCounts(String lessons, String vocab, String exercises) {
    return 'دروس: $lessons · مفردات: $vocab · تمارين: $exercises';
  }

  @override
  String get scenarioLessons => 'دروس هذا الموقف';

  @override
  String get vocabExample => 'مثال';

  @override
  String vocabBox(String n) {
    return 'مستوى الحفظ: $n';
  }

  @override
  String get vocabAudioNote =>
      'يوجد تسجيل صوتي لهذه الكلمة، لكن التشغيل غير متاح في هذه النسخة من التطبيق.';

  @override
  String get reviewTitle => 'مراجعة البطاقات';

  @override
  String get reviewEmpty => 'لا توجد بطاقات للمراجعة الآن. عُد لاحقًا.';

  @override
  String get reviewShow => 'إظهار المعنى';

  @override
  String get reviewKnew => 'كنت أعرفها';

  @override
  String get reviewNotYet => 'ليس بعد';

  @override
  String get reviewNew => 'كلمة جديدة';

  @override
  String reviewProgress(String i, String n) {
    return 'بطاقة $i من $n';
  }

  @override
  String reviewDone(String n) {
    return 'أحسنت! أنهيت مراجعة اليوم: $n بطاقة.';
  }

  @override
  String get reviewSaveFailed => 'تعذّر حفظ إجابتك. حاول مرة أخرى.';

  @override
  String get exTypeAll => 'كل الأنواع';

  @override
  String get exTypeMultiple => 'اختيار من متعدد';

  @override
  String get exTypeListening => 'استماع';

  @override
  String get exTypeFill => 'املأ الفراغ';

  @override
  String get exTypeMatch => 'مطابقة';

  @override
  String get exCheck => 'تحقق من إجابتي';

  @override
  String get exCorrect => 'إجابة صحيحة';

  @override
  String get exWrong => 'إجابة غير صحيحة';

  @override
  String exCorrectAnswer(String a) {
    return 'الإجابة الصحيحة: $a';
  }

  @override
  String get exAnswerHint => 'اكتب الكلمة الناقصة';

  @override
  String get exMatchChoose => 'اختر';

  @override
  String get exMatchAll => 'طابق كل العناصر قبل التحقق.';

  @override
  String get exNoAudio =>
      'لا يوجد تسجيل صوتي لهذا التمرين بعد. اقرأ الخيارات بنفسك.';

  @override
  String get exAudioUnsupported =>
      'التسجيل الصوتي غير متاح للتشغيل في هذه النسخة. اقرأ الخيارات بنفسك.';

  @override
  String get exTryAnother => 'تمرين آخر';

  @override
  String get exChooseOne => 'اختر إجابة أولًا.';

  @override
  String get exTypeFirst => 'اكتب إجابتك أولًا.';

  @override
  String get provTitle => 'بوابة مزوّد الخدمة';

  @override
  String get provBecome => 'كن مزوّد خدمة';

  @override
  String get provApplyTitle => 'التقديم كمزوّد خدمة';

  @override
  String get provApplyIntro =>
      'أنشئ قائمة خدماتك. تبقى مسودة خاصة حتى يراجعها فريق EXPA وينشرها.';

  @override
  String get provApplyNotice =>
      'النشر لا يعني توصية أو ضمانًا من EXPA. تظهر شارة التوثيق فقط بعد مراجعة المستندات.';

  @override
  String get provApply => 'تقديم الطلب';

  @override
  String get provExists => 'لديك قائمة مزوّد بالفعل.';

  @override
  String get provRequiredFields => 'الاسم والفئة والعنوان الرئيسي مطلوبة.';

  @override
  String get provDisplayName => 'الاسم المعروض';

  @override
  String get provCategory => 'الفئة';

  @override
  String get provHeadline => 'العنوان الرئيسي';

  @override
  String get provLanguageNote =>
      'يُحفظ بلغة التطبيق الحالية. غيّر اللغة لإضافة ترجمة أخرى.';

  @override
  String get provDescription => 'الوصف';

  @override
  String get provContactEmail => 'بريد التواصل';

  @override
  String get provContactPhone => 'هاتف التواصل';

  @override
  String get provWebsite => 'الموقع الإلكتروني';

  @override
  String get provServesOnline => 'يقدّم الخدمة عن بُعد';

  @override
  String get provTabProfile => 'الملف';

  @override
  String get provTabVerification => 'التوثيق';

  @override
  String get provTabLeads => 'الطلبات';

  @override
  String get provTabReviews => 'التقييمات';

  @override
  String get provStatusDraft => 'مسودة';

  @override
  String get provStatusReview => 'قيد المراجعة';

  @override
  String get provStatusApproved => 'معتمد';

  @override
  String get provStatusPublished => 'منشور';

  @override
  String get provStatusArchived => 'مؤرشف';

  @override
  String get provVerified => 'موثّق';

  @override
  String get provVerifPending => 'التوثيق قيد المراجعة';

  @override
  String get provVerifRejected => 'التوثيق مرفوض';

  @override
  String get provVerifExpired => 'انتهى التوثيق';

  @override
  String get provVerifNone => 'غير موثّق';

  @override
  String get provPendingChanges => 'تعديلات بانتظار الموافقة';

  @override
  String get provPublishedEditNote =>
      'القائمة منشورة: تظهر تعديلاتك بعد موافقة المشرف، وتبقى النسخة الحالية كما هي.';

  @override
  String get provProblems => 'ما ينقص قبل التقديم';

  @override
  String get provListingIncomplete =>
      'القائمة غير مكتملة بعد. أكملها ثم أعد المحاولة.';

  @override
  String get provSave => 'حفظ التعديلات';

  @override
  String get provSaved => 'تم الحفظ.';

  @override
  String get provSavedPendingApproval => 'تم إرسال التعديلات للموافقة.';

  @override
  String get provSubmit => 'إرسال للمراجعة';

  @override
  String get provSubmitted => 'تم الإرسال للمراجعة.';

  @override
  String get provServicesWebOnly =>
      'تعديل الخدمات والمناطق متاح حاليًا على موقع الويب فقط.';

  @override
  String get provVerifIntro =>
      'ارفع مستندات تثبت نشاطك. يراجعها فريق EXPA فقط ولا تظهر للمستخدمين.';

  @override
  String get provEvidenceNote =>
      'تُخزَّن المستندات مشفّرة وتُقرأ عبر لوحة الإدارة فقط. ارفع الصور اللازمة فقط.';

  @override
  String get provEvidenceTitle => 'مستندات التوثيق';

  @override
  String get provEvidenceNone => 'لم ترفع أي مستند بعد.';

  @override
  String get provEvidenceAdd => 'إضافة صورة من المعرض';

  @override
  String get provEvidenceDelete => 'حذف المستند';

  @override
  String get provEvidenceUploaded => 'تم رفع المستند.';

  @override
  String get provEvidencePdfWeb =>
      'ملفات PDF تُرفع من موقع الويب. الحد الأقصى 5 ملفات.';

  @override
  String get provVerifRequest => 'طلب التوثيق';

  @override
  String get provVerifRequested => 'تم إرسال طلب التوثيق.';

  @override
  String get provLeadsPrivacy =>
      'بيانات التواصل هنا أعطاها المستخدم بموافقته لهذا الطلب فقط. استخدمها للرد عليه فقط.';

  @override
  String get provLeadsEmpty => 'لا توجد طلبات بعد.';

  @override
  String get provLeadNew => 'جديد';

  @override
  String get provLeadSeen => 'تمت رؤيته';

  @override
  String get provLeadClosed => 'مغلق';

  @override
  String get provLeadMarkSeen => 'تمييز كمقروء';

  @override
  String get provLeadClose => 'إغلاق الطلب';

  @override
  String get provReviewsEmpty => 'لا توجد تقييمات معتمدة بعد.';

  @override
  String get provReply => 'رد';

  @override
  String get provReplyEdit => 'تعديل الرد';

  @override
  String get provReplyTitle => 'الرد على التقييم';

  @override
  String get provReplyNote => 'يظهر ردّك بعد موافقة المشرف.';

  @override
  String get provReplySend => 'إرسال الرد';

  @override
  String get provReplySent => 'تم إرسال الرد للمراجعة.';

  @override
  String get provReplyPending => 'الرد بانتظار الموافقة';

  @override
  String get provReplyPublished => 'الرد منشور';

  @override
  String get scannerOcrFallback =>
      'تعذّر على الخادم قراءة النص من الصورة. الصق نص الخطاب هنا بدلًا من ذلك.';

  @override
  String get scannerConsentNeeded =>
      'شرح المستندات يحتاج موافقتك على «تحليل المستندات». لن يُحفظ المستند.';

  @override
  String get scannerConsentGranted =>
      'تم منح الموافقة. اضغط «إرسال للشرح» مرة أخرى.';

  @override
  String get scannerQuotaReached =>
      'وصلت إلى حدّك اليومي لشرح المستندات. حاول لاحقًا أو راجع خطتك.';

  @override
  String scannerQuotaLeft(String n) {
    return 'المحاولات المتبقية: $n';
  }

  @override
  String get scannerFileTypeNotAllowed =>
      'نوع الملف غير مسموح. استخدم صورة JPG أو PNG أو ملف PDF.';

  @override
  String get scannerFileTooLarge =>
      'الصورة كبيرة جدًا. التقط صورة أصغر أو الصق النص.';

  @override
  String get scannerPdfTooLong => 'ملف PDF يحتوي صفحات كثيرة جدًا.';

  @override
  String get scannerFileRejected =>
      'تعذّر قبول الملف. جرّب ملفًا آخر أو الصق النص.';

  @override
  String get scannerUnavailableLater =>
      'فحص الملفات غير متاح مؤقتًا ولم يُحفظ شيء. حاول لاحقًا.';

  @override
  String get scannerDateNotClear => 'التاريخ غير واضح';

  @override
  String get scannerYearMissing => 'السنة غير مذكورة في المستند';

  @override
  String get scannerDatePast => 'هذا التاريخ مضى';

  @override
  String scannerConfidence(String level) {
    return 'درجة الثقة: $level';
  }

  @override
  String get confLow => 'منخفضة';

  @override
  String get confMedium => 'متوسطة';

  @override
  String get confHigh => 'عالية';

  @override
  String get scannerDegraded =>
      'تعذّر استخدام الذكاء الاصطناعي بالكامل، لذلك هذا الشرح مبسّط.';

  @override
  String get scannerCheckDates => 'تحقق دائمًا من التواريخ في المستند الأصلي.';

  @override
  String get recoTitle => 'مقترحات لك';

  @override
  String get recoGuides => 'أدلة مقترحة';

  @override
  String get recoLessons => 'دروس مقترحة';

  @override
  String get recoServices => 'خدمات مقترحة';

  @override
  String get recoReminders => 'تذكيرات مقترحة';

  @override
  String get recoWhy => 'السبب';

  @override
  String get recoThirdParty => 'خدمة من طرف ثالث، لا تضمنها EXPA';

  @override
  String get recoPersonalized =>
      'هذه المقترحات مبنية على ملفك وأهدافك بموافقتك.';

  @override
  String get recoNotPersonalized =>
      'مقترحات عامة فقط، لأن التخصيص غير مفعّل. فعّل موافقة التخصيص للحصول على مقترحات أدق.';

  @override
  String get recoManageConsent => 'إدارة الموافقات';

  @override
  String get recoEmpty =>
      'لا توجد مقترحات الآن. أكمل ملفك الشخصي أو أضف مستنداتك.';

  @override
  String get netTitle => 'حاسبة الراتب الصافي';

  @override
  String get netIntro =>
      'قدّر الراتب الصافي من الإجمالي السنوي. الحساب تقريبي ولا يُحفظ شيء.';

  @override
  String get netGross => 'الراتب الإجمالي السنوي (RAL)';

  @override
  String get netInvalid => 'أدخل رقمًا صحيحًا بين 0 و 10,000,000.';

  @override
  String get netMonths => 'عدد الرواتب في السنة';

  @override
  String get netCalculate => 'احسب';

  @override
  String get netUnavailableTitle => 'التقدير غير متاح';

  @override
  String get netUnavailable =>
      'لم تُنشر بعد جداول ضرائب موثّقة، ولا تخمّن EXPA الأرقام.';

  @override
  String get netMonthly => 'الصافي الشهري التقريبي';

  @override
  String get netAnnual => 'الصافي السنوي';

  @override
  String get netGrossLine => 'الإجمالي السنوي';

  @override
  String get netContributions => 'الاشتراكات';

  @override
  String get netDeduction => 'خصم ثابت';

  @override
  String get netTaxable => 'الدخل الخاضع للضريبة';

  @override
  String get netIncomeTax => 'ضريبة الدخل';

  @override
  String netTable(String name, String year) {
    return 'الجدول المستخدم: $name ($year)';
  }

  @override
  String get netDisclaimer =>
      'تقدير للاسترشاد فقط وليس كشف راتب أو نصيحة ضريبية. اسأل commercialista أو CAF أو Patronato.';

  @override
  String get travelTitle => 'متطلبات السفر';

  @override
  String get travelIntro =>
      'اعرف المتطلبات الموثّقة للسفر بين بلدين حسب جنسيتك.';

  @override
  String get travelPrivacy =>
      'تُرسل البلدان فقط للبحث ولا تُحفظ ولا تُقرأ من ملفك.';

  @override
  String get travelNationality => 'الجنسية (رمز من حرفين)';

  @override
  String get travelDestination => 'وجهة السفر (رمز من حرفين)';

  @override
  String get travelCodeHelp => 'رمز ISO مثل EG أو IT';

  @override
  String get travelCodeInvalid => 'أدخل حرفين لاتينيين.';

  @override
  String get travelSearch => 'بحث';

  @override
  String get travelNoneTitle => 'لا توجد معلومات موثّقة';

  @override
  String get travelNone =>
      'ليست لدينا معلومات موثّقة لهذه الحالة. هذا لا يعني أن السفر مسموح، تحقق من المصدر الرسمي.';

  @override
  String get travelDisclaimer =>
      'معلومات عامة للاسترشاد وقد تتغير. تحقق دائمًا من المصدر الرسمي قبل السفر.';

  @override
  String get scannerRedactTitle => 'قد يحتوي النص على بيانات حساسة';

  @override
  String get scannerRedactBody =>
      'وجدنا ما يشبه رقم IBAN أو الرقم الضريبي أو بريدًا أو رقمًا طويلًا. يمكنك حذفه من الحقل قبل الإرسال؛ الشرح لا يحتاجه عادةً.';

  @override
  String get scannerRedactGeneral =>
      'نصيحة: احذف أرقام الحسابات والبيانات الشخصية غير اللازمة قبل الإرسال.';

  @override
  String get notificationsDelete => 'حذف الإشعار';

  @override
  String get notificationsSettings => 'إعدادات الإشعارات';

  @override
  String get patenteTeacherTitle => 'معلّم الباتنتي بالذكاء الاصطناعي';

  @override
  String get patenteTeacherIntro =>
      'اطلب شرحًا مبسّطًا لهذا الموضوع. الإجابة مبنية على محتوى منشور مع ذكر المصادر.';

  @override
  String get patenteTeacherAsk => 'اشرح لي هذا الموضوع';

  @override
  String patenteTeacherPrompt(String title) {
    return 'اشرح لي موضوع الباتنتي هذا بشكل مبسّط: $title';
  }

  @override
  String get patenteTeacherOffline =>
      'أنت غير متصل: المعلّم يحتاج إلى الإنترنت.';

  @override
  String get tfChallengeTitle => 'التحقق بخطوتين';

  @override
  String get tfChallengeSubtitle =>
      'أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة.';

  @override
  String get tfCodeLabel => 'رمز التحقق';

  @override
  String get tfCodeInvalid => 'أدخل رمزًا من 6 أرقام.';

  @override
  String get tfVerify => 'تحقق';

  @override
  String get tfUseRecovery => 'استخدام رمز استرداد';

  @override
  String get tfUseApp => 'استخدام رمز التطبيق';

  @override
  String get tfRecoveryLabel => 'رمز الاسترداد';

  @override
  String get tfRecoveryHint => 'بالشكل xxxxx-xxxxx، ويعمل مرة واحدة فقط.';

  @override
  String get tfBackToLogin => 'العودة إلى تسجيل الدخول';

  @override
  String get tfChallengeExpired =>
      'انتهت صلاحية خطوة التحقق. سجّل الدخول من جديد.';

  @override
  String get tfInvalidCode => 'الرمز غير صحيح أو سبق استخدامه. حاول مرة أخرى.';

  @override
  String get tfTooManyAttempts =>
      'محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.';

  @override
  String get tfSetupRequired =>
      'يتطلب حسابك تفعيل التحقق بخطوتين. افتح حسابي ثم الأمان لتفعيله.';

  @override
  String get tfSecurityTitle => 'الأمان';

  @override
  String get tfSecuritySubtitle => 'التحقق بخطوتين ورموز الاسترداد';

  @override
  String get tfStatusOn => 'التحقق بخطوتين مفعّل';

  @override
  String get tfStatusOff => 'التحقق بخطوتين غير مفعّل';

  @override
  String get tfIntro =>
      'يضيف رمزًا من تطبيق مصادقة عند تسجيل الدخول لحماية حسابك.';

  @override
  String tfRecoveryRemaining(String n) {
    return 'رموز الاسترداد المتبقية: $n';
  }

  @override
  String get tfRequiredNotice => 'هذا الحساب يتطلب التحقق بخطوتين.';

  @override
  String get tfEnable => 'تفعيل التحقق بخطوتين';

  @override
  String get tfSetupStep1 =>
      '1. أضف هذا المفتاح إلى تطبيق المصادقة (يمكنك مسح الرمز أو نسخ المفتاح).';

  @override
  String get tfSetupStep2 =>
      '2. أدخل الرمز المكوّن من 6 أرقام الذي يظهر في التطبيق.';

  @override
  String get tfQrLabel => 'رمز QR لإعداد تطبيق المصادقة';

  @override
  String get tfSecretLabel => 'مفتاح الإعداد';

  @override
  String get tfCopy => 'نسخ';

  @override
  String get tfCopySecret => 'نسخ المفتاح';

  @override
  String get tfCopyUri => 'نسخ رابط otpauth';

  @override
  String get tfCopied => 'تم النسخ.';

  @override
  String get tfConfirm => 'تأكيد وتفعيل';

  @override
  String get tfCancelSetup => 'إلغاء الإعداد';

  @override
  String get tfCodesTitle => 'رموز الاسترداد';

  @override
  String get tfCodesWarning =>
      'احفظ هذه الرموز الآن في مكان آمن. لن تظهر مرة أخرى، ويعمل كل رمز مرة واحدة فقط إذا فقدت هاتفك.';

  @override
  String get tfCopyCodes => 'نسخ كل الرموز';

  @override
  String get tfCodesSaved => 'حفظت الرموز';

  @override
  String get tfDisable => 'إيقاف التحقق بخطوتين';

  @override
  String get tfRegenerate => 'إنشاء رموز استرداد جديدة';

  @override
  String get tfRegenerateHint => 'الرموز الجديدة تلغي القديمة.';

  @override
  String get tfConfirmIdentity => 'تأكيد هويتك';

  @override
  String get tfPasswordWrong => 'كلمة المرور غير صحيحة.';

  @override
  String get tfDisabledDone => 'تم إيقاف التحقق بخطوتين.';

  @override
  String get tfAlreadyEnabled => 'التحقق بخطوتين مفعّل بالفعل.';

  @override
  String get tfLoadFailed => 'تعذّر تحميل حالة الأمان.';

  @override
  String get patenteExplainQuestion => 'اشرح لي هذا السؤال';

  @override
  String patenteQuestionPrompt(String statement) {
    return 'اشرح لي سؤال الباتنتي هذا بشكل مبسّط: $statement';
  }
}
