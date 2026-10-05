import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';
import 'app_localizations_it.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppL10n
/// returned by `AppL10n.of(context)`.
///
/// Applications need to include `AppL10n.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppL10n.localizationsDelegates,
///   supportedLocales: AppL10n.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppL10n.supportedLocales
/// property.
abstract class AppL10n {
  AppL10n(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppL10n of(BuildContext context) {
    return Localizations.of<AppL10n>(context, AppL10n)!;
  }

  static const LocalizationsDelegate<AppL10n> delegate = _AppL10nDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
    Locale('it'),
  ];

  /// No description provided for @appName.
  ///
  /// In ar, this message translates to:
  /// **'إكسبا'**
  String get appName;

  /// No description provided for @appTagline.
  ///
  /// In ar, this message translates to:
  /// **'مساعدك في الحياة في إيطاليا'**
  String get appTagline;

  /// No description provided for @tabHome.
  ///
  /// In ar, this message translates to:
  /// **'الرئيسية'**
  String get tabHome;

  /// No description provided for @tabExplore.
  ///
  /// In ar, this message translates to:
  /// **'استكشف'**
  String get tabExplore;

  /// No description provided for @tabAsk.
  ///
  /// In ar, this message translates to:
  /// **'اسأل EXPA'**
  String get tabAsk;

  /// No description provided for @tabTasks.
  ///
  /// In ar, this message translates to:
  /// **'المهام'**
  String get tabTasks;

  /// No description provided for @tabProfile.
  ///
  /// In ar, this message translates to:
  /// **'حسابي'**
  String get tabProfile;

  /// No description provided for @retry.
  ///
  /// In ar, this message translates to:
  /// **'إعادة المحاولة'**
  String get retry;

  /// No description provided for @cancel.
  ///
  /// In ar, this message translates to:
  /// **'إلغاء'**
  String get cancel;

  /// No description provided for @save.
  ///
  /// In ar, this message translates to:
  /// **'حفظ'**
  String get save;

  /// No description provided for @close.
  ///
  /// In ar, this message translates to:
  /// **'إغلاق'**
  String get close;

  /// No description provided for @loading.
  ///
  /// In ar, this message translates to:
  /// **'جارٍ التحميل…'**
  String get loading;

  /// No description provided for @errorGeneric.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ ما. حاول مرة أخرى.'**
  String get errorGeneric;

  /// No description provided for @errorNetwork.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد اتصال بالإنترنت. تحقق من الشبكة وحاول مرة أخرى.'**
  String get errorNetwork;

  /// No description provided for @errorTimeout.
  ///
  /// In ar, this message translates to:
  /// **'استغرق الطلب وقتًا طويلًا. حاول مرة أخرى.'**
  String get errorTimeout;

  /// No description provided for @errorServer.
  ///
  /// In ar, this message translates to:
  /// **'الخدمة غير متاحة مؤقتًا. حاول لاحقًا.'**
  String get errorServer;

  /// No description provided for @errorForbidden.
  ///
  /// In ar, this message translates to:
  /// **'ليس لديك صلاحية لهذا الإجراء.'**
  String get errorForbidden;

  /// No description provided for @errorNotFound.
  ///
  /// In ar, this message translates to:
  /// **'لم نجد ما تبحث عنه.'**
  String get errorNotFound;

  /// No description provided for @errorRateLimited.
  ///
  /// In ar, this message translates to:
  /// **'طلبات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.'**
  String get errorRateLimited;

  /// No description provided for @errorValidation.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من البيانات المدخلة.'**
  String get errorValidation;

  /// No description provided for @emptyList.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد عناصر لعرضها.'**
  String get emptyList;

  /// No description provided for @loadMore.
  ///
  /// In ar, this message translates to:
  /// **'عرض المزيد'**
  String get loadMore;

  /// No description provided for @openOfficialSite.
  ///
  /// In ar, this message translates to:
  /// **'فتح الموقع الرسمي'**
  String get openOfficialSite;

  /// No description provided for @linkUnsafe.
  ///
  /// In ar, this message translates to:
  /// **'تم حجب الرابط لأنه غير آمن.'**
  String get linkUnsafe;

  /// No description provided for @linkOpenFailed.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر فتح الرابط.'**
  String get linkOpenFailed;

  /// No description provided for @optional.
  ///
  /// In ar, this message translates to:
  /// **'اختياري'**
  String get optional;

  /// No description provided for @skip.
  ///
  /// In ar, this message translates to:
  /// **'تخطي'**
  String get skip;

  /// No description provided for @next.
  ///
  /// In ar, this message translates to:
  /// **'التالي'**
  String get next;

  /// No description provided for @delete.
  ///
  /// In ar, this message translates to:
  /// **'حذف'**
  String get delete;

  /// No description provided for @saved.
  ///
  /// In ar, this message translates to:
  /// **'تم الحفظ.'**
  String get saved;

  /// No description provided for @sessionExpired.
  ///
  /// In ar, this message translates to:
  /// **'انتهت الجلسة. سجّل الدخول مرة أخرى.'**
  String get sessionExpired;

  /// No description provided for @consentRequired.
  ///
  /// In ar, this message translates to:
  /// **'هذا الإجراء يحتاج إلى موافقتك. يمكنك منحها من إعدادات الخصوصية.'**
  String get consentRequired;

  /// No description provided for @grantConsent.
  ///
  /// In ar, this message translates to:
  /// **'منح الموافقة'**
  String get grantConsent;

  /// No description provided for @loginTitle.
  ///
  /// In ar, this message translates to:
  /// **'تسجيل الدخول'**
  String get loginTitle;

  /// No description provided for @loginSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'مرحبًا بعودتك إلى إكسبا'**
  String get loginSubtitle;

  /// No description provided for @email.
  ///
  /// In ar, this message translates to:
  /// **'البريد الإلكتروني'**
  String get email;

  /// No description provided for @password.
  ///
  /// In ar, this message translates to:
  /// **'كلمة المرور'**
  String get password;

  /// No description provided for @confirmPassword.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد كلمة المرور'**
  String get confirmPassword;

  /// No description provided for @name.
  ///
  /// In ar, this message translates to:
  /// **'الاسم'**
  String get name;

  /// No description provided for @loginButton.
  ///
  /// In ar, this message translates to:
  /// **'دخول'**
  String get loginButton;

  /// No description provided for @registerButton.
  ///
  /// In ar, this message translates to:
  /// **'إنشاء حساب'**
  String get registerButton;

  /// No description provided for @registerTitle.
  ///
  /// In ar, this message translates to:
  /// **'إنشاء حساب جديد'**
  String get registerTitle;

  /// No description provided for @forgotLink.
  ///
  /// In ar, this message translates to:
  /// **'نسيت كلمة المرور؟'**
  String get forgotLink;

  /// No description provided for @noAccount.
  ///
  /// In ar, this message translates to:
  /// **'ليس لديك حساب؟ أنشئ حسابًا'**
  String get noAccount;

  /// No description provided for @haveAccount.
  ///
  /// In ar, this message translates to:
  /// **'لديك حساب؟ سجّل الدخول'**
  String get haveAccount;

  /// No description provided for @acceptTerms.
  ///
  /// In ar, this message translates to:
  /// **'أوافق على شروط الاستخدام'**
  String get acceptTerms;

  /// No description provided for @acceptPrivacy.
  ///
  /// In ar, this message translates to:
  /// **'اطلعت على سياسة الخصوصية وأوافق عليها'**
  String get acceptPrivacy;

  /// No description provided for @passwordHint.
  ///
  /// In ar, this message translates to:
  /// **'10 أحرف على الأقل، مع أحرف وأرقام'**
  String get passwordHint;

  /// No description provided for @invalidCredentials.
  ///
  /// In ar, this message translates to:
  /// **'البريد الإلكتروني أو كلمة المرور غير صحيحة.'**
  String get invalidCredentials;

  /// No description provided for @fieldRequired.
  ///
  /// In ar, this message translates to:
  /// **'هذا الحقل مطلوب.'**
  String get fieldRequired;

  /// No description provided for @invalidEmail.
  ///
  /// In ar, this message translates to:
  /// **'أدخل بريدًا إلكترونيًا صحيحًا.'**
  String get invalidEmail;

  /// No description provided for @passwordsMismatch.
  ///
  /// In ar, this message translates to:
  /// **'كلمتا المرور غير متطابقتين.'**
  String get passwordsMismatch;

  /// No description provided for @passwordTooShort.
  ///
  /// In ar, this message translates to:
  /// **'كلمة المرور قصيرة جدًا.'**
  String get passwordTooShort;

  /// No description provided for @mustAcceptBoth.
  ///
  /// In ar, this message translates to:
  /// **'يجب الموافقة على الشروط وسياسة الخصوصية.'**
  String get mustAcceptBoth;

  /// No description provided for @forgotTitle.
  ///
  /// In ar, this message translates to:
  /// **'استعادة كلمة المرور'**
  String get forgotTitle;

  /// No description provided for @forgotBody.
  ///
  /// In ar, this message translates to:
  /// **'أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة إن كان الحساب موجودًا.'**
  String get forgotBody;

  /// No description provided for @sendResetLink.
  ///
  /// In ar, this message translates to:
  /// **'إرسال الرابط'**
  String get sendResetLink;

  /// No description provided for @resetSent.
  ///
  /// In ar, this message translates to:
  /// **'إذا كان الحساب موجودًا فقد أرسلنا رابط الاستعادة إلى بريدك.'**
  String get resetSent;

  /// No description provided for @verifyTitle.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من بريدك الإلكتروني'**
  String get verifyTitle;

  /// No description provided for @verifyBody.
  ///
  /// In ar, this message translates to:
  /// **'أرسلنا رابط التفعيل إلى بريدك. افتح الرابط ثم ارجع إلى التطبيق. بعض الميزات مثل اسأل EXPA تتطلب بريدًا مفعّلًا.'**
  String get verifyBody;

  /// No description provided for @verifyBanner.
  ///
  /// In ar, this message translates to:
  /// **'بريدك الإلكتروني غير مفعّل بعد.'**
  String get verifyBanner;

  /// No description provided for @resendVerification.
  ///
  /// In ar, this message translates to:
  /// **'إعادة إرسال رابط التفعيل'**
  String get resendVerification;

  /// No description provided for @verificationSent.
  ///
  /// In ar, this message translates to:
  /// **'تم إرسال رابط التفعيل.'**
  String get verificationSent;

  /// No description provided for @verifiedCheck.
  ///
  /// In ar, this message translates to:
  /// **'لقد فعّلت بريدي'**
  String get verifiedCheck;

  /// No description provided for @continueToApp.
  ///
  /// In ar, this message translates to:
  /// **'المتابعة إلى التطبيق'**
  String get continueToApp;

  /// No description provided for @logout.
  ///
  /// In ar, this message translates to:
  /// **'تسجيل الخروج'**
  String get logout;

  /// No description provided for @accountSuspended.
  ///
  /// In ar, this message translates to:
  /// **'هذا الحساب موقوف.'**
  String get accountSuspended;

  /// No description provided for @language.
  ///
  /// In ar, this message translates to:
  /// **'اللغة'**
  String get language;

  /// No description provided for @langAr.
  ///
  /// In ar, this message translates to:
  /// **'العربية'**
  String get langAr;

  /// No description provided for @langEn.
  ///
  /// In ar, this message translates to:
  /// **'English'**
  String get langEn;

  /// No description provided for @langIt.
  ///
  /// In ar, this message translates to:
  /// **'Italiano'**
  String get langIt;

  /// No description provided for @homeGreeting.
  ///
  /// In ar, this message translates to:
  /// **'مرحبًا {name}'**
  String homeGreeting(String name);

  /// No description provided for @scoreTitle.
  ///
  /// In ar, this message translates to:
  /// **'درجة EXPA'**
  String get scoreTitle;

  /// No description provided for @scoreHow.
  ///
  /// In ar, this message translates to:
  /// **'كيف تُحسب؟'**
  String get scoreHow;

  /// No description provided for @scoreUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد بيانات كافية لحساب الدرجة بعد.'**
  String get scoreUnavailable;

  /// No description provided for @scoreSemantics.
  ///
  /// In ar, this message translates to:
  /// **'درجة EXPA {percent} بالمئة'**
  String scoreSemantics(String percent);

  /// No description provided for @nextActions.
  ///
  /// In ar, this message translates to:
  /// **'ماذا أفعل الآن؟'**
  String get nextActions;

  /// No description provided for @nextActionsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد إجراءات مقترحة الآن.'**
  String get nextActionsEmpty;

  /// No description provided for @personalizationOff.
  ///
  /// In ar, this message translates to:
  /// **'التخصيص متوقف. فعّله من الخصوصية للحصول على اقتراحات تناسبك.'**
  String get personalizationOff;

  /// No description provided for @onboardingContinue.
  ///
  /// In ar, this message translates to:
  /// **'أكمل ملفك الشخصي'**
  String get onboardingContinue;

  /// No description provided for @tasksTitle.
  ///
  /// In ar, this message translates to:
  /// **'مهام الاستقرار'**
  String get tasksTitle;

  /// No description provided for @taskMarkDone.
  ///
  /// In ar, this message translates to:
  /// **'تم'**
  String get taskMarkDone;

  /// No description provided for @taskReopen.
  ///
  /// In ar, this message translates to:
  /// **'إعادة فتح'**
  String get taskReopen;

  /// No description provided for @taskDismiss.
  ///
  /// In ar, this message translates to:
  /// **'لا ينطبق عليّ'**
  String get taskDismiss;

  /// No description provided for @taskDone.
  ///
  /// In ar, this message translates to:
  /// **'مكتملة'**
  String get taskDone;

  /// No description provided for @tasksDocuments.
  ///
  /// In ar, this message translates to:
  /// **'وثائقي'**
  String get tasksDocuments;

  /// No description provided for @guidesTitle.
  ///
  /// In ar, this message translates to:
  /// **'الأدلة'**
  String get guidesTitle;

  /// No description provided for @searchHint.
  ///
  /// In ar, this message translates to:
  /// **'ابحث…'**
  String get searchHint;

  /// No description provided for @allCategories.
  ///
  /// In ar, this message translates to:
  /// **'الكل'**
  String get allCategories;

  /// No description provided for @sourceLabel.
  ///
  /// In ar, this message translates to:
  /// **'المصدر'**
  String get sourceLabel;

  /// No description provided for @sourceOfficial.
  ///
  /// In ar, this message translates to:
  /// **'رسمي'**
  String get sourceOfficial;

  /// No description provided for @sourceInstitutional.
  ///
  /// In ar, this message translates to:
  /// **'مؤسسي'**
  String get sourceInstitutional;

  /// No description provided for @sourceVerifiedPartner.
  ///
  /// In ar, this message translates to:
  /// **'شريك موثّق'**
  String get sourceVerifiedPartner;

  /// No description provided for @sourceThirdParty.
  ///
  /// In ar, this message translates to:
  /// **'طرف ثالث'**
  String get sourceThirdParty;

  /// No description provided for @lastVerified.
  ///
  /// In ar, this message translates to:
  /// **'آخر تحقق: {date}'**
  String lastVerified(String date);

  /// No description provided for @neverVerified.
  ///
  /// In ar, this message translates to:
  /// **'لم يتم التحقق من المصدر بعد'**
  String get neverVerified;

  /// No description provided for @freshFresh.
  ///
  /// In ar, this message translates to:
  /// **'محدّث'**
  String get freshFresh;

  /// No description provided for @freshStale.
  ///
  /// In ar, this message translates to:
  /// **'قد يكون قديمًا'**
  String get freshStale;

  /// No description provided for @freshOutdated.
  ///
  /// In ar, this message translates to:
  /// **'قديم – تحقق من الموقع الرسمي'**
  String get freshOutdated;

  /// No description provided for @freshUnverified.
  ///
  /// In ar, this message translates to:
  /// **'غير موثّق'**
  String get freshUnverified;

  /// No description provided for @fallbackLocale.
  ///
  /// In ar, this message translates to:
  /// **'هذا المحتوى غير متوفر بلغتك، يُعرض بلغة أخرى.'**
  String get fallbackLocale;

  /// No description provided for @secWhatIs.
  ///
  /// In ar, this message translates to:
  /// **'ما هو؟'**
  String get secWhatIs;

  /// No description provided for @secWhoNeeds.
  ///
  /// In ar, this message translates to:
  /// **'من يحتاجه؟'**
  String get secWhoNeeds;

  /// No description provided for @secDocuments.
  ///
  /// In ar, this message translates to:
  /// **'الوثائق المطلوبة'**
  String get secDocuments;

  /// No description provided for @secSteps.
  ///
  /// In ar, this message translates to:
  /// **'الخطوات'**
  String get secSteps;

  /// No description provided for @secWhere.
  ///
  /// In ar, this message translates to:
  /// **'أين تقدّم؟'**
  String get secWhere;

  /// No description provided for @secBook.
  ///
  /// In ar, this message translates to:
  /// **'كيف تحجز؟'**
  String get secBook;

  /// No description provided for @secCosts.
  ///
  /// In ar, this message translates to:
  /// **'التكاليف'**
  String get secCosts;

  /// No description provided for @secTime.
  ///
  /// In ar, this message translates to:
  /// **'مدة المعالجة'**
  String get secTime;

  /// No description provided for @verifyOfficialNotice.
  ///
  /// In ar, this message translates to:
  /// **'معلومات عامة للإرشاد. تحقق دائمًا من المصدر الرسمي قبل أي قرار.'**
  String get verifyOfficialNotice;

  /// No description provided for @documentsTitle.
  ///
  /// In ar, this message translates to:
  /// **'وثائقي'**
  String get documentsTitle;

  /// No description provided for @addDocument.
  ///
  /// In ar, this message translates to:
  /// **'إضافة وثيقة'**
  String get addDocument;

  /// No description provided for @docType.
  ///
  /// In ar, this message translates to:
  /// **'نوع الوثيقة'**
  String get docType;

  /// No description provided for @docLabel.
  ///
  /// In ar, this message translates to:
  /// **'تسمية (اختياري)'**
  String get docLabel;

  /// No description provided for @issueDate.
  ///
  /// In ar, this message translates to:
  /// **'تاريخ الإصدار'**
  String get issueDate;

  /// No description provided for @expiryDate.
  ///
  /// In ar, this message translates to:
  /// **'تاريخ الانتهاء'**
  String get expiryDate;

  /// No description provided for @notes.
  ///
  /// In ar, this message translates to:
  /// **'ملاحظات'**
  String get notes;

  /// No description provided for @remindersEnabled.
  ///
  /// In ar, this message translates to:
  /// **'تذكيري قبل الانتهاء'**
  String get remindersEnabled;

  /// No description provided for @noExpiry.
  ///
  /// In ar, this message translates to:
  /// **'بدون تاريخ انتهاء'**
  String get noExpiry;

  /// No description provided for @daysRemaining.
  ///
  /// In ar, this message translates to:
  /// **'متبقي {n} يوم'**
  String daysRemaining(String n);

  /// No description provided for @expiredDaysAgo.
  ///
  /// In ar, this message translates to:
  /// **'انتهت منذ {n} يوم'**
  String expiredDaysAgo(String n);

  /// No description provided for @statusValid.
  ///
  /// In ar, this message translates to:
  /// **'سارية'**
  String get statusValid;

  /// No description provided for @statusExpiringSoon.
  ///
  /// In ar, this message translates to:
  /// **'تنتهي قريبًا'**
  String get statusExpiringSoon;

  /// No description provided for @statusExpired.
  ///
  /// In ar, this message translates to:
  /// **'منتهية'**
  String get statusExpired;

  /// No description provided for @statusNoExpiry.
  ///
  /// In ar, this message translates to:
  /// **'بلا انتهاء'**
  String get statusNoExpiry;

  /// No description provided for @pickDate.
  ///
  /// In ar, this message translates to:
  /// **'اختر التاريخ'**
  String get pickDate;

  /// No description provided for @clearDate.
  ///
  /// In ar, this message translates to:
  /// **'مسح'**
  String get clearDate;

  /// No description provided for @docsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لم تضف أي وثيقة بعد. أضف جواز السفر أو تصريح الإقامة لنذكّرك قبل انتهائهما.'**
  String get docsEmpty;

  /// No description provided for @deleteDocConfirm.
  ///
  /// In ar, this message translates to:
  /// **'حذف هذه الوثيقة؟'**
  String get deleteDocConfirm;

  /// No description provided for @consentNeededDocs.
  ///
  /// In ar, this message translates to:
  /// **'لحفظ وثائقك نحتاج موافقتك على تخزين الوثائق.'**
  String get consentNeededDocs;

  /// No description provided for @docAttachmentsNote.
  ///
  /// In ar, this message translates to:
  /// **'المرفقات متاحة في الموقع. هذه النسخة تتتبع التواريخ فقط.'**
  String get docAttachmentsNote;

  /// No description provided for @askTitle.
  ///
  /// In ar, this message translates to:
  /// **'اسأل EXPA'**
  String get askTitle;

  /// No description provided for @askHint.
  ///
  /// In ar, this message translates to:
  /// **'اكتب سؤالك بالعربية أو الإنجليزية أو الإيطالية'**
  String get askHint;

  /// No description provided for @askSend.
  ///
  /// In ar, this message translates to:
  /// **'إرسال'**
  String get askSend;

  /// No description provided for @askIntro.
  ///
  /// In ar, this message translates to:
  /// **'اسألني عن الإقامة والوثائق والخدمات الحكومية. أجيب اعتمادًا على مصادر موثّقة وأذكرها لك.'**
  String get askIntro;

  /// No description provided for @askUsage.
  ///
  /// In ar, this message translates to:
  /// **'المتبقي اليوم: {n}'**
  String askUsage(String n);

  /// No description provided for @askResets.
  ///
  /// In ar, this message translates to:
  /// **'يتجدد الحد في {date}'**
  String askResets(String date);

  /// No description provided for @askLimitReached.
  ///
  /// In ar, this message translates to:
  /// **'وصلت إلى حدّ الأسئلة اليومي.'**
  String get askLimitReached;

  /// No description provided for @askVerifyEmail.
  ///
  /// In ar, this message translates to:
  /// **'فعّل بريدك الإلكتروني لاستخدام اسأل EXPA.'**
  String get askVerifyEmail;

  /// No description provided for @askFailed.
  ///
  /// In ar, this message translates to:
  /// **'تعذّرت المعالجة الآن. حاول مرة أخرى.'**
  String get askFailed;

  /// No description provided for @askDegraded.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر استخدام الذكاء الاصطناعي الآن. هذه إجابة محدودة، تصفّح الأدلة للحصول على معلومات موثّقة.'**
  String get askDegraded;

  /// No description provided for @askBrowseGuides.
  ///
  /// In ar, this message translates to:
  /// **'تصفّح الأدلة'**
  String get askBrowseGuides;

  /// No description provided for @askSourcesTitle.
  ///
  /// In ar, this message translates to:
  /// **'المصادر'**
  String get askSourcesTitle;

  /// No description provided for @askNoSources.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد مصادر موثّقة لهذه الإجابة.'**
  String get askNoSources;

  /// No description provided for @askNoticeTitle.
  ///
  /// In ar, this message translates to:
  /// **'تنبيه'**
  String get askNoticeTitle;

  /// No description provided for @askYou.
  ///
  /// In ar, this message translates to:
  /// **'أنت'**
  String get askYou;

  /// No description provided for @askAssistant.
  ///
  /// In ar, this message translates to:
  /// **'EXPA'**
  String get askAssistant;

  /// No description provided for @askSuggested.
  ///
  /// In ar, this message translates to:
  /// **'إجراءات مقترحة'**
  String get askSuggested;

  /// No description provided for @askLabelOfficial.
  ///
  /// In ar, this message translates to:
  /// **'معلومات رسمية'**
  String get askLabelOfficial;

  /// No description provided for @askLabelGeneral.
  ///
  /// In ar, this message translates to:
  /// **'إرشاد عام'**
  String get askLabelGeneral;

  /// No description provided for @askLabelAi.
  ///
  /// In ar, this message translates to:
  /// **'شرح بالذكاء الاصطناعي'**
  String get askLabelAi;

  /// No description provided for @askLabelThird.
  ///
  /// In ar, this message translates to:
  /// **'خدمة أو مصدر من طرف ثالث'**
  String get askLabelThird;

  /// No description provided for @learnTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعلّم الإيطالية'**
  String get learnTitle;

  /// No description provided for @dailyTitle.
  ///
  /// In ar, this message translates to:
  /// **'إيطالية اليوم – 10 دقائق'**
  String get dailyTitle;

  /// No description provided for @dailyDone.
  ///
  /// In ar, this message translates to:
  /// **'تم اليوم'**
  String get dailyDone;

  /// No description provided for @minutes.
  ///
  /// In ar, this message translates to:
  /// **'{n} دقيقة'**
  String minutes(String n);

  /// No description provided for @streak.
  ///
  /// In ar, this message translates to:
  /// **'سلسلة الأيام: {n}'**
  String streak(String n);

  /// No description provided for @lessonsTitle.
  ///
  /// In ar, this message translates to:
  /// **'الدروس'**
  String get lessonsTitle;

  /// No description provided for @lessonStart.
  ///
  /// In ar, this message translates to:
  /// **'ابدأ الدرس'**
  String get lessonStart;

  /// No description provided for @lessonComplete.
  ///
  /// In ar, this message translates to:
  /// **'أنهيت الدرس'**
  String get lessonComplete;

  /// No description provided for @lessonCompleted.
  ///
  /// In ar, this message translates to:
  /// **'مكتمل'**
  String get lessonCompleted;

  /// No description provided for @lessonsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد دروس متاحة بعد.'**
  String get lessonsEmpty;

  /// No description provided for @jobsTitle.
  ///
  /// In ar, this message translates to:
  /// **'الوظائف'**
  String get jobsTitle;

  /// No description provided for @matchScore.
  ///
  /// In ar, this message translates to:
  /// **'نسبة التوافق: {n}%'**
  String matchScore(String n);

  /// No description provided for @matchUnknown.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد بيانات كافية للمطابقة'**
  String get matchUnknown;

  /// No description provided for @matchReasons.
  ///
  /// In ar, this message translates to:
  /// **'لماذا هذه النتيجة؟'**
  String get matchReasons;

  /// No description provided for @reasonMatch.
  ///
  /// In ar, this message translates to:
  /// **'متوافق'**
  String get reasonMatch;

  /// No description provided for @reasonPartial.
  ///
  /// In ar, this message translates to:
  /// **'متوافق جزئيًا'**
  String get reasonPartial;

  /// No description provided for @reasonMismatch.
  ///
  /// In ar, this message translates to:
  /// **'غير متوافق'**
  String get reasonMismatch;

  /// No description provided for @reasonUnknown.
  ///
  /// In ar, this message translates to:
  /// **'غير معروف (لا يؤثر سلبًا)'**
  String get reasonUnknown;

  /// No description provided for @applyOriginal.
  ///
  /// In ar, this message translates to:
  /// **'التقديم في الموقع الأصلي'**
  String get applyOriginal;

  /// No description provided for @applyNotice.
  ///
  /// In ar, this message translates to:
  /// **'EXPA لا يقدّم الطلب نيابةً عنك. ستنتقل إلى صفحة التقديم الأصلية.'**
  String get applyNotice;

  /// No description provided for @visaStated.
  ///
  /// In ar, this message translates to:
  /// **'ذكر المصدر دعم التأشيرة'**
  String get visaStated;

  /// No description provided for @visaNotStated.
  ///
  /// In ar, this message translates to:
  /// **'لا يذكر المصدر دعم التأشيرة'**
  String get visaNotStated;

  /// No description provided for @jobsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد وظائف مطابقة الآن.'**
  String get jobsEmpty;

  /// No description provided for @jobSource.
  ///
  /// In ar, this message translates to:
  /// **'المصدر: {name}'**
  String jobSource(String name);

  /// No description provided for @jobsSignInForMatch.
  ///
  /// In ar, this message translates to:
  /// **'سجّل الدخول وأكمل ملفك لرؤية نسبة التوافق.'**
  String get jobsSignInForMatch;

  /// No description provided for @notificationsTitle.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات'**
  String get notificationsTitle;

  /// No description provided for @markAllRead.
  ///
  /// In ar, this message translates to:
  /// **'تعليم الكل كمقروء'**
  String get markAllRead;

  /// No description provided for @notificationsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد إشعارات.'**
  String get notificationsEmpty;

  /// No description provided for @apptTitle.
  ///
  /// In ar, this message translates to:
  /// **'حجز المواعيد'**
  String get apptTitle;

  /// No description provided for @apptNotice.
  ///
  /// In ar, this message translates to:
  /// **'EXPA لا يحجز نيابةً عنك. سنوجّهك إلى الجهة الرسمية لإتمام الحجز بنفسك.'**
  String get apptNotice;

  /// No description provided for @apptOfficeType.
  ///
  /// In ar, this message translates to:
  /// **'نوع الجهة'**
  String get apptOfficeType;

  /// No description provided for @apptCity.
  ///
  /// In ar, this message translates to:
  /// **'المدينة'**
  String get apptCity;

  /// No description provided for @apptSearch.
  ///
  /// In ar, this message translates to:
  /// **'عرض الجهات'**
  String get apptSearch;

  /// No description provided for @apptGoOfficial.
  ///
  /// In ar, this message translates to:
  /// **'الانتقال إلى صفحة الحجز الرسمية'**
  String get apptGoOfficial;

  /// No description provided for @apptNoUrl.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد رابط حجز رسمي مسجّل. راجع الموقع الرسمي للجهة.'**
  String get apptNoUrl;

  /// No description provided for @apptEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد جهات مسجّلة لهذه المدينة.'**
  String get apptEmpty;

  /// No description provided for @exploreTitle.
  ///
  /// In ar, this message translates to:
  /// **'استكشف'**
  String get exploreTitle;

  /// No description provided for @exploreGuides.
  ///
  /// In ar, this message translates to:
  /// **'الأدلة والوثائق'**
  String get exploreGuides;

  /// No description provided for @exploreLearn.
  ///
  /// In ar, this message translates to:
  /// **'تعلّم الإيطالية'**
  String get exploreLearn;

  /// No description provided for @exploreJobs.
  ///
  /// In ar, this message translates to:
  /// **'الوظائف'**
  String get exploreJobs;

  /// No description provided for @exploreAppointments.
  ///
  /// In ar, this message translates to:
  /// **'حجز المواعيد'**
  String get exploreAppointments;

  /// No description provided for @exploreMyDocs.
  ///
  /// In ar, this message translates to:
  /// **'وثائقي وتواريخ الانتهاء'**
  String get exploreMyDocs;

  /// No description provided for @exploreNotifications.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات'**
  String get exploreNotifications;

  /// No description provided for @profileTitle.
  ///
  /// In ar, this message translates to:
  /// **'حسابي'**
  String get profileTitle;

  /// No description provided for @profilePrivacy.
  ///
  /// In ar, this message translates to:
  /// **'الخصوصية والموافقات'**
  String get profilePrivacy;

  /// No description provided for @profileOnboarding.
  ///
  /// In ar, this message translates to:
  /// **'ملفي الشخصي'**
  String get profileOnboarding;

  /// No description provided for @pushNote.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات الفورية غير مفعّلة في هذه النسخة.'**
  String get pushNote;

  /// No description provided for @privacyTitle.
  ///
  /// In ar, this message translates to:
  /// **'الخصوصية'**
  String get privacyTitle;

  /// No description provided for @consentsTitle.
  ///
  /// In ar, this message translates to:
  /// **'موافقاتك'**
  String get consentsTitle;

  /// No description provided for @consentRequiredBadge.
  ///
  /// In ar, this message translates to:
  /// **'مطلوب'**
  String get consentRequiredBadge;

  /// No description provided for @consentsHint.
  ///
  /// In ar, this message translates to:
  /// **'يمكنك تغيير الموافقات الاختيارية في أي وقت.'**
  String get consentsHint;

  /// No description provided for @exportTitle.
  ///
  /// In ar, this message translates to:
  /// **'تصدير بياناتي'**
  String get exportTitle;

  /// No description provided for @exportBody.
  ///
  /// In ar, this message translates to:
  /// **'اطلب نسخة من بياناتك الشخصية. الحد الأقصى 5 طلبات في الساعة.'**
  String get exportBody;

  /// No description provided for @exportRequest.
  ///
  /// In ar, this message translates to:
  /// **'طلب التصدير'**
  String get exportRequest;

  /// No description provided for @exportDone.
  ///
  /// In ar, this message translates to:
  /// **'تم تجهيز بياناتك ({n} أقسام). لم يتم حفظها على الجهاز.'**
  String exportDone(String n);

  /// No description provided for @deleteAccountTitle.
  ///
  /// In ar, this message translates to:
  /// **'حذف الحساب'**
  String get deleteAccountTitle;

  /// No description provided for @deleteAccountBody.
  ///
  /// In ar, this message translates to:
  /// **'الحذف نهائي. يتوقف الوصول فورًا ويكتمل مسح البيانات لاحقًا. أدخل كلمة المرور للتأكيد.'**
  String get deleteAccountBody;

  /// No description provided for @deleteAccountConfirm.
  ///
  /// In ar, this message translates to:
  /// **'طلب حذف الحساب'**
  String get deleteAccountConfirm;

  /// No description provided for @deleteRequested.
  ///
  /// In ar, this message translates to:
  /// **'تم تقديم طلب الحذف.'**
  String get deleteRequested;

  /// No description provided for @onboardingTitle.
  ///
  /// In ar, this message translates to:
  /// **'عن وضعك في إيطاليا'**
  String get onboardingTitle;

  /// No description provided for @onboardingIntro.
  ///
  /// In ar, this message translates to:
  /// **'نجمع فقط ما يلزم للتخصيص. يمكنك تخطي الأسئلة الاختيارية.'**
  String get onboardingIntro;

  /// No description provided for @fieldSegment.
  ///
  /// In ar, this message translates to:
  /// **'وضعك الحالي'**
  String get fieldSegment;

  /// No description provided for @fieldNationality.
  ///
  /// In ar, this message translates to:
  /// **'الجنسية (رمز من حرفين، مثل EG)'**
  String get fieldNationality;

  /// No description provided for @fieldCity.
  ///
  /// In ar, this message translates to:
  /// **'المدينة'**
  String get fieldCity;

  /// No description provided for @fieldResidence.
  ///
  /// In ar, this message translates to:
  /// **'نوع الإقامة'**
  String get fieldResidence;

  /// No description provided for @fieldItalian.
  ///
  /// In ar, this message translates to:
  /// **'مستوى الإيطالية'**
  String get fieldItalian;

  /// No description provided for @fieldEnglish.
  ///
  /// In ar, this message translates to:
  /// **'مستوى الإنجليزية'**
  String get fieldEnglish;

  /// No description provided for @fieldGoals.
  ///
  /// In ar, this message translates to:
  /// **'أهدافك'**
  String get fieldGoals;

  /// No description provided for @fieldAge.
  ///
  /// In ar, this message translates to:
  /// **'الفئة العمرية'**
  String get fieldAge;

  /// No description provided for @notSelected.
  ///
  /// In ar, this message translates to:
  /// **'غير محدد'**
  String get notSelected;

  /// No description provided for @completeOnboarding.
  ///
  /// In ar, this message translates to:
  /// **'إنهاء'**
  String get completeOnboarding;

  /// No description provided for @onboardingSegmentRequired.
  ///
  /// In ar, this message translates to:
  /// **'اختر وضعك الحالي لإنهاء الإعداد.'**
  String get onboardingSegmentRequired;

  /// No description provided for @offlineBanner.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد اتصال بالإنترنت. تُعرض البيانات المحفوظة على جهازك فقط.'**
  String get offlineBanner;

  /// No description provided for @apptGuidesTitle.
  ///
  /// In ar, this message translates to:
  /// **'أدلة الحجز'**
  String get apptGuidesTitle;

  /// No description provided for @apptNotBookedByExpa.
  ///
  /// In ar, this message translates to:
  /// **'إكسبا لا يحجز نيابةً عنك: ستُحوَّل إلى الجهة الرسمية.'**
  String get apptNotBookedByExpa;

  /// No description provided for @officeQuestura.
  ///
  /// In ar, this message translates to:
  /// **'الشرطة (Questura)'**
  String get officeQuestura;

  /// No description provided for @officePrefettura.
  ///
  /// In ar, this message translates to:
  /// **'المحافظة (Prefettura)'**
  String get officePrefettura;

  /// No description provided for @officeComune.
  ///
  /// In ar, this message translates to:
  /// **'البلدية (Comune)'**
  String get officeComune;

  /// No description provided for @officeAnagrafe.
  ///
  /// In ar, this message translates to:
  /// **'السجل المدني (Anagrafe)'**
  String get officeAnagrafe;

  /// No description provided for @officeAsl.
  ///
  /// In ar, this message translates to:
  /// **'هيئة الصحة المحلية (ASL)'**
  String get officeAsl;

  /// No description provided for @officeInps.
  ///
  /// In ar, this message translates to:
  /// **'التأمينات الاجتماعية (INPS)'**
  String get officeInps;

  /// No description provided for @officeAgenziaEntrate.
  ///
  /// In ar, this message translates to:
  /// **'وكالة الإيرادات (Agenzia delle Entrate)'**
  String get officeAgenziaEntrate;

  /// No description provided for @officePoste.
  ///
  /// In ar, this message translates to:
  /// **'البريد الإيطالي (Poste Italiane)'**
  String get officePoste;

  /// No description provided for @officeMotorizzazione.
  ///
  /// In ar, this message translates to:
  /// **'إدارة المركبات (Motorizzazione)'**
  String get officeMotorizzazione;

  /// No description provided for @officeUniversity.
  ///
  /// In ar, this message translates to:
  /// **'جامعة'**
  String get officeUniversity;

  /// No description provided for @officeOther.
  ///
  /// In ar, this message translates to:
  /// **'جهة أخرى'**
  String get officeOther;

  /// No description provided for @officePhone.
  ///
  /// In ar, this message translates to:
  /// **'الهاتف'**
  String get officePhone;

  /// No description provided for @secAdmission.
  ///
  /// In ar, this message translates to:
  /// **'شروط القبول'**
  String get secAdmission;

  /// No description provided for @secTips.
  ///
  /// In ar, this message translates to:
  /// **'نصائح'**
  String get secTips;

  /// No description provided for @secCautions.
  ///
  /// In ar, this message translates to:
  /// **'تنبيهات'**
  String get secCautions;

  /// No description provided for @secNotes.
  ///
  /// In ar, this message translates to:
  /// **'ملاحظات'**
  String get secNotes;

  /// No description provided for @exploreGovernment.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات الحكومية'**
  String get exploreGovernment;

  /// No description provided for @explorePatente.
  ///
  /// In ar, this message translates to:
  /// **'رخصة القيادة (Patente)'**
  String get explorePatente;

  /// No description provided for @exploreStudy.
  ///
  /// In ar, this message translates to:
  /// **'الدراسة في إيطاليا'**
  String get exploreStudy;

  /// No description provided for @exploreScan.
  ///
  /// In ar, this message translates to:
  /// **'مسح خطاب أو مستند'**
  String get exploreScan;

  /// No description provided for @exploreSaved.
  ///
  /// In ar, this message translates to:
  /// **'المحفوظات للعمل دون إنترنت'**
  String get exploreSaved;

  /// No description provided for @govTitle.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات الحكومية'**
  String get govTitle;

  /// No description provided for @govServices.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات'**
  String get govServices;

  /// No description provided for @govOffices.
  ///
  /// In ar, this message translates to:
  /// **'المكاتب'**
  String get govOffices;

  /// No description provided for @govEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد محتوى منشور بعد. تتم إضافة الخدمات الحكومية بعد مراجعتها من مصادر رسمية.'**
  String get govEmpty;

  /// No description provided for @govRelatedGuide.
  ///
  /// In ar, this message translates to:
  /// **'الدليل المرتبط'**
  String get govRelatedGuide;

  /// No description provided for @studyTitle.
  ///
  /// In ar, this message translates to:
  /// **'الدراسة في إيطاليا'**
  String get studyTitle;

  /// No description provided for @studyPrograms.
  ///
  /// In ar, this message translates to:
  /// **'البرامج'**
  String get studyPrograms;

  /// No description provided for @studyUniversities.
  ///
  /// In ar, this message translates to:
  /// **'الجامعات'**
  String get studyUniversities;

  /// No description provided for @studyScholarships.
  ///
  /// In ar, this message translates to:
  /// **'المنح'**
  String get studyScholarships;

  /// No description provided for @studyEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد محتوى منشور بعد.'**
  String get studyEmpty;

  /// No description provided for @studyTuition.
  ///
  /// In ar, this message translates to:
  /// **'الرسوم الدراسية'**
  String get studyTuition;

  /// No description provided for @studyPerYear.
  ///
  /// In ar, this message translates to:
  /// **'سنويًا'**
  String get studyPerYear;

  /// No description provided for @studyDeadline.
  ///
  /// In ar, this message translates to:
  /// **'آخر موعد للتقديم'**
  String get studyDeadline;

  /// No description provided for @jobsSavedTitle.
  ///
  /// In ar, this message translates to:
  /// **'الوظائف المحفوظة'**
  String get jobsSavedTitle;

  /// No description provided for @jobsSavedEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لم تحفظ أي وظيفة بعد.'**
  String get jobsSavedEmpty;

  /// No description provided for @jobSave.
  ///
  /// In ar, this message translates to:
  /// **'حفظ الوظيفة'**
  String get jobSave;

  /// No description provided for @jobUnsave.
  ///
  /// In ar, this message translates to:
  /// **'إزالة من المحفوظات'**
  String get jobUnsave;

  /// No description provided for @lessonTip.
  ///
  /// In ar, this message translates to:
  /// **'نصيحة'**
  String get lessonTip;

  /// No description provided for @askHistoryTitle.
  ///
  /// In ar, this message translates to:
  /// **'المحادثات السابقة'**
  String get askHistoryTitle;

  /// No description provided for @askHistoryEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد محادثات سابقة.'**
  String get askHistoryEmpty;

  /// No description provided for @askHistoryUntitled.
  ///
  /// In ar, this message translates to:
  /// **'محادثة'**
  String get askHistoryUntitled;

  /// No description provided for @askHistoryDelete.
  ///
  /// In ar, this message translates to:
  /// **'حذف المحادثة'**
  String get askHistoryDelete;

  /// No description provided for @askHistoryDeleteBody.
  ///
  /// In ar, this message translates to:
  /// **'سيتم حذف هذه المحادثة نهائيًا.'**
  String get askHistoryDeleteBody;

  /// No description provided for @askNewChat.
  ///
  /// In ar, this message translates to:
  /// **'محادثة جديدة'**
  String get askNewChat;

  /// No description provided for @searchTitle.
  ///
  /// In ar, this message translates to:
  /// **'البحث'**
  String get searchTitle;

  /// No description provided for @searchMinChars.
  ///
  /// In ar, this message translates to:
  /// **'اكتب حرفين على الأقل ثم اضغط بحث.'**
  String get searchMinChars;

  /// No description provided for @searchEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد نتائج. جرّب كلمات أخرى.'**
  String get searchEmpty;

  /// No description provided for @savedTitle.
  ///
  /// In ar, this message translates to:
  /// **'المحفوظات'**
  String get savedTitle;

  /// No description provided for @savedEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لم تحفظ أي دليل أو درس بعد. اضغط على علامة الحفظ داخل الدليل أو الدرس.'**
  String get savedEmpty;

  /// No description provided for @savedHint.
  ///
  /// In ar, this message translates to:
  /// **'هذه النسخ محفوظة على جهازك ويمكن فتحها دون إنترنت. تحقق من تاريخ آخر مراجعة قبل الاعتماد عليها.'**
  String get savedHint;

  /// No description provided for @savedAdd.
  ///
  /// In ar, this message translates to:
  /// **'احفظ للعمل دون إنترنت'**
  String get savedAdd;

  /// No description provided for @savedRemove.
  ///
  /// In ar, this message translates to:
  /// **'إزالة من المحفوظات'**
  String get savedRemove;

  /// No description provided for @savedAdded.
  ///
  /// In ar, this message translates to:
  /// **'تم الحفظ على جهازك.'**
  String get savedAdded;

  /// No description provided for @savedRemoved.
  ///
  /// In ar, this message translates to:
  /// **'تمت الإزالة من المحفوظات.'**
  String get savedRemoved;

  /// No description provided for @savedOfflineCopy.
  ///
  /// In ar, this message translates to:
  /// **'هذه نسخة محفوظة بتاريخ {date}. تعذّر تحديثها الآن.'**
  String savedOfflineCopy(String date);

  /// No description provided for @savedRefreshing.
  ///
  /// In ar, this message translates to:
  /// **'نسخة محفوظة. جارٍ التحديث…'**
  String get savedRefreshing;

  /// No description provided for @savedOn.
  ///
  /// In ar, this message translates to:
  /// **'حُفظ في {date}'**
  String savedOn(String date);

  /// No description provided for @savedStale.
  ///
  /// In ar, this message translates to:
  /// **'قد تكون هذه النسخة قديمة. تأكد من الموقع الرسمي.'**
  String get savedStale;

  /// No description provided for @patenteTitle.
  ///
  /// In ar, this message translates to:
  /// **'رخصة القيادة (Patente)'**
  String get patenteTitle;

  /// No description provided for @patenteDisclaimer.
  ///
  /// In ar, this message translates to:
  /// **'محتوى تعليمي عام. قواعد الامتحان والأسئلة الرسمية تحددها الجهات الإيطالية، وتحقق دائمًا من المصدر الرسمي.'**
  String get patenteDisclaimer;

  /// No description provided for @patenteEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لم يُنشر محتوى الباتينتي بعد. لا ننشر أسئلة إلا إذا كانت لدينا حقوق استخدامها. سنُعلمك عند توفرها.'**
  String get patenteEmpty;

  /// No description provided for @patenteMockExam.
  ///
  /// In ar, this message translates to:
  /// **'امتحان تجريبي'**
  String get patenteMockExam;

  /// No description provided for @patenteRules.
  ///
  /// In ar, this message translates to:
  /// **'{questions} سؤالًا، أقصى عدد للأخطاء {errors}، المدة {minutes} دقيقة.'**
  String patenteRules(String questions, String errors, String minutes);

  /// No description provided for @patenteStartExam.
  ///
  /// In ar, this message translates to:
  /// **'ابدأ الامتحان التجريبي'**
  String get patenteStartExam;

  /// No description provided for @patenteProgress.
  ///
  /// In ar, this message translates to:
  /// **'تقدمك'**
  String get patenteProgress;

  /// No description provided for @patenteProgressLine.
  ///
  /// In ar, this message translates to:
  /// **'امتحانات أجريتها: {taken}، ناجحة: {passed}'**
  String patenteProgressLine(String taken, String passed);

  /// No description provided for @patentePassRate.
  ///
  /// In ar, this message translates to:
  /// **'نسبة النجاح في آخر الامتحانات: {rate}٪'**
  String patentePassRate(String rate);

  /// No description provided for @patenteWeakTopics.
  ///
  /// In ar, this message translates to:
  /// **'مواضيع تحتاج إلى مراجعة: {topics}'**
  String patenteWeakTopics(String topics);

  /// No description provided for @patentePracticeWeak.
  ///
  /// In ar, this message translates to:
  /// **'تدرّب على المواضيع الضعيفة'**
  String get patentePracticeWeak;

  /// No description provided for @patenteTopics.
  ///
  /// In ar, this message translates to:
  /// **'المواضيع'**
  String get patenteTopics;

  /// No description provided for @patenteTopicsHint.
  ///
  /// In ar, this message translates to:
  /// **'اضغط على موضوع للدراسة، أو حدّد مواضيع للتدرّب عليها.'**
  String get patenteTopicsHint;

  /// No description provided for @patenteNoTopics.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد مواضيع منشورة بعد.'**
  String get patenteNoTopics;

  /// No description provided for @patenteQuestionCount.
  ///
  /// In ar, this message translates to:
  /// **'{n} سؤالًا'**
  String patenteQuestionCount(String n);

  /// No description provided for @patentePractice.
  ///
  /// In ar, this message translates to:
  /// **'تدرّب على المواضيع المحددة'**
  String get patentePractice;

  /// No description provided for @patenteCategories.
  ///
  /// In ar, this message translates to:
  /// **'فئات الرخصة'**
  String get patenteCategories;

  /// No description provided for @patenteTrue.
  ///
  /// In ar, this message translates to:
  /// **'صح (Vero)'**
  String get patenteTrue;

  /// No description provided for @patenteFalse.
  ///
  /// In ar, this message translates to:
  /// **'خطأ (Falso)'**
  String get patenteFalse;

  /// No description provided for @patenteSubmit.
  ///
  /// In ar, this message translates to:
  /// **'إنهاء وتسليم الإجابات'**
  String get patenteSubmit;

  /// No description provided for @patenteAnswered.
  ///
  /// In ar, this message translates to:
  /// **'أجبت عن {done} من {total}'**
  String patenteAnswered(String done, String total);

  /// No description provided for @patenteMaxErrors.
  ///
  /// In ar, this message translates to:
  /// **'أقصى عدد للأخطاء المسموح: {n}'**
  String patenteMaxErrors(String n);

  /// No description provided for @patenteTimeLeft.
  ///
  /// In ar, this message translates to:
  /// **'الوقت المتبقي {time}'**
  String patenteTimeLeft(String time);

  /// No description provided for @patenteTooEarly.
  ///
  /// In ar, this message translates to:
  /// **'لا يمكن تسليم الامتحان بهذه السرعة. أجب عن الأسئلة أولًا ثم حاول مرة أخرى.'**
  String get patenteTooEarly;

  /// No description provided for @patentePassed.
  ///
  /// In ar, this message translates to:
  /// **'نجحت في هذا الامتحان التجريبي'**
  String get patentePassed;

  /// No description provided for @patenteFailed.
  ///
  /// In ar, this message translates to:
  /// **'لم تنجح في هذا الامتحان التجريبي'**
  String get patenteFailed;

  /// No description provided for @patenteResultLine.
  ///
  /// In ar, this message translates to:
  /// **'إجابات صحيحة: {correct}، أخطاء: {errors} (الحد الأقصى {max})'**
  String patenteResultLine(String correct, String errors, String max);

  /// No description provided for @patentePracticeResult.
  ///
  /// In ar, this message translates to:
  /// **'إجابات صحيحة: {correct} من {total}'**
  String patentePracticeResult(String correct, String total);

  /// No description provided for @patenteTimedOut.
  ///
  /// In ar, this message translates to:
  /// **'انتهى الوقت وتم تسليم الإجابات تلقائيًا.'**
  String get patenteTimedOut;

  /// No description provided for @patenteReview.
  ///
  /// In ar, this message translates to:
  /// **'مراجعة الأسئلة'**
  String get patenteReview;

  /// No description provided for @patenteNotAnswered.
  ///
  /// In ar, this message translates to:
  /// **'لم تجب عن هذا السؤال'**
  String get patenteNotAnswered;

  /// No description provided for @patenteYourAnswer.
  ///
  /// In ar, this message translates to:
  /// **'إجابتك: {answer}'**
  String patenteYourAnswer(String answer);

  /// No description provided for @patenteCorrectAnswer.
  ///
  /// In ar, this message translates to:
  /// **'الإجابة الصحيحة: {answer}'**
  String patenteCorrectAnswer(String answer);

  /// No description provided for @patenteBack.
  ///
  /// In ar, this message translates to:
  /// **'العودة إلى الباتينتي'**
  String get patenteBack;

  /// No description provided for @pushTitle.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات الفورية'**
  String get pushTitle;

  /// No description provided for @pushSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'تذكيرات بمواعيد انتهاء وثائقك والأمور المهمة.'**
  String get pushSubtitle;

  /// No description provided for @pushRationaleTitle.
  ///
  /// In ar, this message translates to:
  /// **'تفعيل الإشعارات؟'**
  String get pushRationaleTitle;

  /// No description provided for @pushRationaleBody.
  ///
  /// In ar, this message translates to:
  /// **'سنرسل لك تذكيرات قبل انتهاء وثائقك (مثل تصريح الإقامة) وتنبيهات مهمة. لن نرسل إعلانات. يمكنك إيقافها في أي وقت. سيطلب منك النظام الإذن بعد هذه الخطوة.'**
  String get pushRationaleBody;

  /// No description provided for @pushAllow.
  ///
  /// In ar, this message translates to:
  /// **'متابعة'**
  String get pushAllow;

  /// No description provided for @pushDenied.
  ///
  /// In ar, this message translates to:
  /// **'تم رفض إذن الإشعارات. يمكنك تفعيله من إعدادات الجهاز.'**
  String get pushDenied;

  /// No description provided for @pushFailed.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تفعيل الإشعارات الآن. حاول مرة أخرى لاحقًا.'**
  String get pushFailed;

  /// No description provided for @pushEnabledNote.
  ///
  /// In ar, this message translates to:
  /// **'تم تفعيل الإشعارات على هذا الجهاز.'**
  String get pushEnabledNote;

  /// No description provided for @logoutConfirmTitle.
  ///
  /// In ar, this message translates to:
  /// **'تسجيل الخروج؟'**
  String get logoutConfirmTitle;

  /// No description provided for @logoutConfirmBody.
  ///
  /// In ar, this message translates to:
  /// **'ستُحذف البيانات المحفوظة على هذا الجهاز وسيتوقف استلام الإشعارات.'**
  String get logoutConfirmBody;

  /// No description provided for @deleteConfirmBody.
  ///
  /// In ar, this message translates to:
  /// **'حذف الحساب لا يمكن التراجع عنه. هل أنت متأكد؟'**
  String get deleteConfirmBody;

  /// No description provided for @exportShare.
  ///
  /// In ar, this message translates to:
  /// **'مشاركة أو حفظ نسخة…'**
  String get exportShare;

  /// No description provided for @exportShareConfirmTitle.
  ///
  /// In ar, this message translates to:
  /// **'مشاركة بياناتك الشخصية'**
  String get exportShareConfirmTitle;

  /// No description provided for @exportShareConfirmBody.
  ///
  /// In ar, this message translates to:
  /// **'الملف يحتوي على بياناتك الشخصية. اختر وجهة آمنة فقط (مثل تطبيق ملاحظات خاص بك أو بريدك). لا يحفظه إكسبا على الجهاز.'**
  String get exportShareConfirmBody;

  /// No description provided for @nationalityInvalid.
  ///
  /// In ar, this message translates to:
  /// **'أدخل رمز الدولة من حرفين (مثل EG) أو اتركه فارغًا.'**
  String get nationalityInvalid;

  /// No description provided for @resetTitle.
  ///
  /// In ar, this message translates to:
  /// **'كلمة مرور جديدة'**
  String get resetTitle;

  /// No description provided for @resetButton.
  ///
  /// In ar, this message translates to:
  /// **'حفظ كلمة المرور'**
  String get resetButton;

  /// No description provided for @resetDone.
  ///
  /// In ar, this message translates to:
  /// **'تم تغيير كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.'**
  String get resetDone;

  /// No description provided for @resetInvalidLink.
  ///
  /// In ar, this message translates to:
  /// **'رابط إعادة التعيين غير صالح أو ناقص. اطلب رابطًا جديدًا.'**
  String get resetInvalidLink;

  /// No description provided for @verifySuccess.
  ///
  /// In ar, this message translates to:
  /// **'تم تأكيد بريدك الإلكتروني.'**
  String get verifySuccess;

  /// No description provided for @verifyInvalidLink.
  ///
  /// In ar, this message translates to:
  /// **'رابط التأكيد غير صالح أو منتهي. اطلب رابطًا جديدًا من داخل التطبيق.'**
  String get verifyInvalidLink;

  /// No description provided for @scannerTitle.
  ///
  /// In ar, this message translates to:
  /// **'مسح خطاب أو مستند'**
  String get scannerTitle;

  /// No description provided for @scannerIntro.
  ///
  /// In ar, this message translates to:
  /// **'صوّر خطابًا (مثل خطاب من البلدية أو فاتورة) أو الصق نصه، وسنشرح لك محتواه وأهم تواريخه.'**
  String get scannerIntro;

  /// No description provided for @scannerPrivacy.
  ///
  /// In ar, this message translates to:
  /// **'لا يُرسل شيء إلى إكسبا قبل أن تراجعه بنفسك وتضغط «إرسال». الشرح ليس استشارة قانونية.'**
  String get scannerPrivacy;

  /// No description provided for @scannerCameraWhy.
  ///
  /// In ar, this message translates to:
  /// **'نستخدم الكاميرا فقط عندما تضغط على زر المسح، لتصوير المستند الذي تختاره.'**
  String get scannerCameraWhy;

  /// No description provided for @scannerUseCamera.
  ///
  /// In ar, this message translates to:
  /// **'تصوير بالكاميرا'**
  String get scannerUseCamera;

  /// No description provided for @scannerUseGallery.
  ///
  /// In ar, this message translates to:
  /// **'اختيار صورة من الجهاز'**
  String get scannerUseGallery;

  /// No description provided for @scannerPasteText.
  ///
  /// In ar, this message translates to:
  /// **'لصق النص يدويًا'**
  String get scannerPasteText;

  /// No description provided for @scannerNoCamera.
  ///
  /// In ar, this message translates to:
  /// **'الكاميرا غير متاحة على هذا الجهاز. يمكنك لصق نص المستند.'**
  String get scannerNoCamera;

  /// No description provided for @scannerPermissionDenied.
  ///
  /// In ar, this message translates to:
  /// **'لم يُسمح بالوصول إلى الكاميرا أو الصور. يمكنك السماح به من إعدادات الجهاز، أو لصق النص يدويًا.'**
  String get scannerPermissionDenied;

  /// No description provided for @scannerReviewTitle.
  ///
  /// In ar, this message translates to:
  /// **'راجع قبل الإرسال'**
  String get scannerReviewTitle;

  /// No description provided for @scannerPreview.
  ///
  /// In ar, this message translates to:
  /// **'معاينة الصورة الملتقطة'**
  String get scannerPreview;

  /// No description provided for @scannerNoOcr.
  ///
  /// In ar, this message translates to:
  /// **'قراءة النص على الجهاز غير متاحة في هذه النسخة. اكتب أو الصق النص أدناه، أو أرسل الصورة نفسها.'**
  String get scannerNoOcr;

  /// No description provided for @scannerTextLabel.
  ///
  /// In ar, this message translates to:
  /// **'نص المستند'**
  String get scannerTextLabel;

  /// No description provided for @scannerTextHint.
  ///
  /// In ar, this message translates to:
  /// **'الصق هنا النص الذي تريد شرحه'**
  String get scannerTextHint;

  /// No description provided for @scannerSendsText.
  ///
  /// In ar, this message translates to:
  /// **'سيُرسل هذا النص فقط إلى خوادم إكسبا لشرحه.'**
  String get scannerSendsText;

  /// No description provided for @scannerSendsImage.
  ///
  /// In ar, this message translates to:
  /// **'ستُرسل هذه الصورة إلى خوادم إكسبا لشرحها.'**
  String get scannerSendsImage;

  /// No description provided for @scannerNothingToSend.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد شيء للإرسال بعد.'**
  String get scannerNothingToSend;

  /// No description provided for @scannerSend.
  ///
  /// In ar, this message translates to:
  /// **'إرسال للشرح'**
  String get scannerSend;

  /// No description provided for @scannerDiscard.
  ///
  /// In ar, this message translates to:
  /// **'تجاهل وبدء من جديد'**
  String get scannerDiscard;

  /// No description provided for @scannerBackendUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'خدمة شرح المستندات غير متاحة بعد. حاول لاحقًا.'**
  String get scannerBackendUnavailable;

  /// No description provided for @scannerNoSummary.
  ///
  /// In ar, this message translates to:
  /// **'لم نتمكن من استخراج ملخص.'**
  String get scannerNoSummary;

  /// No description provided for @scannerKeyDates.
  ///
  /// In ar, this message translates to:
  /// **'تواريخ مهمة'**
  String get scannerKeyDates;

  /// No description provided for @scannerCreateReminder.
  ///
  /// In ar, this message translates to:
  /// **'إضافة وثيقة وتذكير'**
  String get scannerCreateReminder;

  /// No description provided for @scannerActions.
  ///
  /// In ar, this message translates to:
  /// **'الخطوات المقترحة'**
  String get scannerActions;

  /// No description provided for @scannerDefaultDisclaimer.
  ///
  /// In ar, this message translates to:
  /// **'هذا شرح آلي عام وليس استشارة قانونية أو رسمية. تأكد من الجهة المرسلة للخطاب.'**
  String get scannerDefaultDisclaimer;

  /// No description provided for @scannerAnother.
  ///
  /// In ar, this message translates to:
  /// **'شرح مستند آخر'**
  String get scannerAnother;
}

class _AppL10nDelegate extends LocalizationsDelegate<AppL10n> {
  const _AppL10nDelegate();

  @override
  Future<AppL10n> load(Locale locale) {
    return SynchronousFuture<AppL10n>(lookupAppL10n(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en', 'it'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppL10nDelegate old) => false;
}

AppL10n lookupAppL10n(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppL10nAr();
    case 'en':
      return AppL10nEn();
    case 'it':
      return AppL10nIt();
  }

  throw FlutterError(
    'AppL10n.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
