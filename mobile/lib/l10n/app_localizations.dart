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
