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
}
