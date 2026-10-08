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

  /// No description provided for @billingTitle.
  ///
  /// In ar, this message translates to:
  /// **'الاشتراك والفواتير'**
  String get billingTitle;

  /// No description provided for @billingUnavailableTitle.
  ///
  /// In ar, this message translates to:
  /// **'المدفوعات غير مفعّلة'**
  String get billingUnavailableTitle;

  /// No description provided for @billingUnavailableBody.
  ///
  /// In ar, this message translates to:
  /// **'الدفع غير متاح حاليًا، لذلك لا يمكن شراء خطة أو ترقيتها من التطبيق. خطتك الحالية تعمل كما هي، ولن يُخصم منك أي مبلغ.'**
  String get billingUnavailableBody;

  /// No description provided for @billingUnavailableShort.
  ///
  /// In ar, this message translates to:
  /// **'الدفع غير متاح حاليًا.'**
  String get billingUnavailableShort;

  /// No description provided for @billingCurrent.
  ///
  /// In ar, this message translates to:
  /// **'خطتك الحالية'**
  String get billingCurrent;

  /// No description provided for @billingPlans.
  ///
  /// In ar, this message translates to:
  /// **'الخطط'**
  String get billingPlans;

  /// No description provided for @billingNoPlans.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد خطط منشورة بعد.'**
  String get billingNoPlans;

  /// No description provided for @billingFree.
  ///
  /// In ar, this message translates to:
  /// **'مجاني'**
  String get billingFree;

  /// No description provided for @billingPerMonth.
  ///
  /// In ar, this message translates to:
  /// **'{amount} / شهريًا'**
  String billingPerMonth(String amount);

  /// No description provided for @billingPerYear.
  ///
  /// In ar, this message translates to:
  /// **'{amount} / سنويًا'**
  String billingPerYear(String amount);

  /// No description provided for @billingYourPlan.
  ///
  /// In ar, this message translates to:
  /// **'خطتك'**
  String get billingYourPlan;

  /// No description provided for @billingChoose.
  ///
  /// In ar, this message translates to:
  /// **'اختيار هذه الخطة'**
  String get billingChoose;

  /// No description provided for @billingFeatAi.
  ///
  /// In ar, this message translates to:
  /// **'{n} أسئلة للمساعد يوميًا'**
  String billingFeatAi(String n);

  /// No description provided for @billingFeatReminders.
  ///
  /// In ar, this message translates to:
  /// **'تذكيرات متقدمة'**
  String get billingFeatReminders;

  /// No description provided for @billingFeatDocAi.
  ///
  /// In ar, this message translates to:
  /// **'تحليل المستندات بالذكاء الاصطناعي'**
  String get billingFeatDocAi;

  /// No description provided for @billingFeatHuman.
  ///
  /// In ar, this message translates to:
  /// **'{n} رصيد مساعدة بشرية'**
  String billingFeatHuman(String n);

  /// No description provided for @billingStatusActive.
  ///
  /// In ar, this message translates to:
  /// **'نشط'**
  String get billingStatusActive;

  /// No description provided for @billingStatusPastDue.
  ///
  /// In ar, this message translates to:
  /// **'الدفع متأخر'**
  String get billingStatusPastDue;

  /// No description provided for @billingStatusCanceled.
  ///
  /// In ar, this message translates to:
  /// **'ملغى'**
  String get billingStatusCanceled;

  /// No description provided for @billingStatusFree.
  ///
  /// In ar, this message translates to:
  /// **'خطة مجانية'**
  String get billingStatusFree;

  /// No description provided for @billingAccessUntil.
  ///
  /// In ar, this message translates to:
  /// **'يبقى الوصول حتى {date}'**
  String billingAccessUntil(String date);

  /// No description provided for @billingRenews.
  ///
  /// In ar, this message translates to:
  /// **'يتجدد في {date}'**
  String billingRenews(String date);

  /// No description provided for @billingEnding.
  ///
  /// In ar, this message translates to:
  /// **'سينتهي في نهاية الفترة'**
  String get billingEnding;

  /// No description provided for @billingCancel.
  ///
  /// In ar, this message translates to:
  /// **'إلغاء عند نهاية الفترة'**
  String get billingCancel;

  /// No description provided for @billingCancelTitle.
  ///
  /// In ar, this message translates to:
  /// **'إلغاء الاشتراك؟'**
  String get billingCancelTitle;

  /// No description provided for @billingCancelBody.
  ///
  /// In ar, this message translates to:
  /// **'ستحتفظ بمزايا خطتك حتى نهاية الفترة المدفوعة، ثم لن يتجدد الاشتراك.'**
  String get billingCancelBody;

  /// No description provided for @billingCancelConfirm.
  ///
  /// In ar, this message translates to:
  /// **'نعم، ألغِ'**
  String get billingCancelConfirm;

  /// No description provided for @billingCancelled.
  ///
  /// In ar, this message translates to:
  /// **'تم الإلغاء عند نهاية الفترة.'**
  String get billingCancelled;

  /// No description provided for @billingNothingToCancel.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد اشتراك قابل للإلغاء.'**
  String get billingNothingToCancel;

  /// No description provided for @billingCheckoutFailed.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر فتح صفحة الدفع.'**
  String get billingCheckoutFailed;

  /// No description provided for @billingAlreadySubscribed.
  ///
  /// In ar, this message translates to:
  /// **'لديك اشتراك نشط بالفعل.'**
  String get billingAlreadySubscribed;

  /// No description provided for @billingPlanNotPurchasable.
  ///
  /// In ar, this message translates to:
  /// **'هذه الخطة غير متاحة للشراء.'**
  String get billingPlanNotPurchasable;

  /// No description provided for @billingInvoices.
  ///
  /// In ar, this message translates to:
  /// **'الفواتير'**
  String get billingInvoices;

  /// No description provided for @billingNoInvoices.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد فواتير بعد.'**
  String get billingNoInvoices;

  /// No description provided for @billingPricesNote.
  ///
  /// In ar, this message translates to:
  /// **'الأسعار قابلة للتعديل وتُعرض كما يرسلها الخادم. الدفع يتم في المتصفح ولا يمرّ ببيانات بطاقتك عبر التطبيق.'**
  String get billingPricesNote;

  /// No description provided for @exploreCommunity.
  ///
  /// In ar, this message translates to:
  /// **'المجتمع (أسئلة وأجوبة)'**
  String get exploreCommunity;

  /// No description provided for @communityTitle.
  ///
  /// In ar, this message translates to:
  /// **'مجتمع إكسبا'**
  String get communityTitle;

  /// No description provided for @communityNoticeFallback.
  ///
  /// In ar, this message translates to:
  /// **'إجابات المجتمع من أعضاء عاديين وليست معلومات رسمية ولا موثّقة. تحقق من المصادر الرسمية.'**
  String get communityNoticeFallback;

  /// No description provided for @communityEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد أسئلة بعد.'**
  String get communityEmpty;

  /// No description provided for @communityMineOnly.
  ///
  /// In ar, this message translates to:
  /// **'أسئلتي فقط'**
  String get communityMineOnly;

  /// No description provided for @communityAskOpen.
  ///
  /// In ar, this message translates to:
  /// **'اطرح سؤالًا'**
  String get communityAskOpen;

  /// No description provided for @communityQuestionTitle.
  ///
  /// In ar, this message translates to:
  /// **'عنوان السؤال'**
  String get communityQuestionTitle;

  /// No description provided for @communityQuestionBody.
  ///
  /// In ar, this message translates to:
  /// **'تفاصيل السؤال'**
  String get communityQuestionBody;

  /// No description provided for @communityTopic.
  ///
  /// In ar, this message translates to:
  /// **'الموضوع'**
  String get communityTopic;

  /// No description provided for @communityNoTopic.
  ///
  /// In ar, this message translates to:
  /// **'بدون موضوع'**
  String get communityNoTopic;

  /// No description provided for @communityPost.
  ///
  /// In ar, this message translates to:
  /// **'نشر'**
  String get communityPost;

  /// No description provided for @communityPostedPending.
  ///
  /// In ar, this message translates to:
  /// **'استلمنا مشاركتك وقد تنتظر المراجعة قبل ظهورها للآخرين.'**
  String get communityPostedPending;

  /// No description provided for @communityAnswers.
  ///
  /// In ar, this message translates to:
  /// **'الأجوبة ({n})'**
  String communityAnswers(String n);

  /// No description provided for @communityNoAnswers.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد أجوبة بعد.'**
  String get communityNoAnswers;

  /// No description provided for @communityWriteAnswer.
  ///
  /// In ar, this message translates to:
  /// **'اكتب جوابًا'**
  String get communityWriteAnswer;

  /// No description provided for @communityAccepted.
  ///
  /// In ar, this message translates to:
  /// **'الجواب المعتمد من صاحب السؤال'**
  String get communityAccepted;

  /// No description provided for @communityOfficialGuide.
  ///
  /// In ar, this message translates to:
  /// **'الدليل الرسمي المرتبط'**
  String get communityOfficialGuide;

  /// No description provided for @communityMine.
  ///
  /// In ar, this message translates to:
  /// **'مشاركتي'**
  String get communityMine;

  /// No description provided for @communityPendingStatus.
  ///
  /// In ar, this message translates to:
  /// **'بانتظار المراجعة'**
  String get communityPendingStatus;

  /// No description provided for @communityHiddenStatus.
  ///
  /// In ar, this message translates to:
  /// **'مخفي من المشرفين'**
  String get communityHiddenStatus;

  /// No description provided for @communityDelete.
  ///
  /// In ar, this message translates to:
  /// **'حذف سؤالي'**
  String get communityDelete;

  /// No description provided for @communityDeleted.
  ///
  /// In ar, this message translates to:
  /// **'حُذف السؤال.'**
  String get communityDeleted;

  /// No description provided for @communityComments.
  ///
  /// In ar, this message translates to:
  /// **'التعليقات ({n})'**
  String communityComments(String n);

  /// No description provided for @exploreArticles.
  ///
  /// In ar, this message translates to:
  /// **'المقالات'**
  String get exploreArticles;

  /// No description provided for @exploreCities.
  ///
  /// In ar, this message translates to:
  /// **'المدن'**
  String get exploreCities;

  /// No description provided for @exploreServices.
  ///
  /// In ar, this message translates to:
  /// **'مزوّدو الخدمات'**
  String get exploreServices;

  /// No description provided for @exploreLegal.
  ///
  /// In ar, this message translates to:
  /// **'الوثائق القانونية'**
  String get exploreLegal;

  /// No description provided for @articlesTitle.
  ///
  /// In ar, this message translates to:
  /// **'المقالات'**
  String get articlesTitle;

  /// No description provided for @articlesEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد مقالات منشورة بعد.'**
  String get articlesEmpty;

  /// No description provided for @articleEditorial.
  ///
  /// In ar, this message translates to:
  /// **'مقال تحريري — ليس مصدرًا رسميًا'**
  String get articleEditorial;

  /// No description provided for @articleRelatedGuides.
  ///
  /// In ar, this message translates to:
  /// **'أدلة ذات صلة'**
  String get articleRelatedGuides;

  /// No description provided for @articleRelatedArticles.
  ///
  /// In ar, this message translates to:
  /// **'مقالات ذات صلة'**
  String get articleRelatedArticles;

  /// No description provided for @articleTags.
  ///
  /// In ar, this message translates to:
  /// **'الوسوم'**
  String get articleTags;

  /// No description provided for @articleDefaultDisclaimer.
  ///
  /// In ar, this message translates to:
  /// **'محتوى عام للإرشاد وليس استشارة قانونية أو رسمية. تحقق من المصادر الرسمية.'**
  String get articleDefaultDisclaimer;

  /// No description provided for @citiesTitle.
  ///
  /// In ar, this message translates to:
  /// **'المدن'**
  String get citiesTitle;

  /// No description provided for @citiesEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد ملفات مدن منشورة بعد.'**
  String get citiesEmpty;

  /// No description provided for @cityOfficial.
  ///
  /// In ar, this message translates to:
  /// **'معلومات رسمية'**
  String get cityOfficial;

  /// No description provided for @cityGeneral.
  ///
  /// In ar, this message translates to:
  /// **'إرشاد عام'**
  String get cityGeneral;

  /// No description provided for @cityGuides.
  ///
  /// In ar, this message translates to:
  /// **'أدلة تنطبق على هذه المدينة'**
  String get cityGuides;

  /// No description provided for @cityArticles.
  ///
  /// In ar, this message translates to:
  /// **'مقالات عن المدينة'**
  String get cityArticles;

  /// No description provided for @cityOffices.
  ///
  /// In ar, this message translates to:
  /// **'عدد المكاتب الحكومية المسجّلة: {n}'**
  String cityOffices(String n);

  /// No description provided for @cityOfficesOpen.
  ///
  /// In ar, this message translates to:
  /// **'عرض الجهات الحكومية'**
  String get cityOfficesOpen;

  /// No description provided for @providersTitle.
  ///
  /// In ar, this message translates to:
  /// **'مزوّدو الخدمات'**
  String get providersTitle;

  /// No description provided for @providersEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد مزوّدون مطابقون.'**
  String get providersEmpty;

  /// No description provided for @providersVerifiedOnly.
  ///
  /// In ar, this message translates to:
  /// **'الموثّقون فقط'**
  String get providersVerifiedOnly;

  /// No description provided for @providersThirdParty.
  ///
  /// In ar, this message translates to:
  /// **'خدمة طرف ثالث — غير رسمية'**
  String get providersThirdParty;

  /// No description provided for @providersNoticeFallback.
  ///
  /// In ar, this message translates to:
  /// **'هذا المزوّد طرف ثالث مستقل وليس جهة رسمية ولا تابعًا لإكسبا. تحقق بنفسك قبل الدفع أو مشاركة بياناتك.'**
  String get providersNoticeFallback;

  /// No description provided for @providersRating.
  ///
  /// In ar, this message translates to:
  /// **'التقييم: {avg} ({count})'**
  String providersRating(String avg, String count);

  /// No description provided for @providersNoRatings.
  ///
  /// In ar, this message translates to:
  /// **'لا تقييمات بعد'**
  String get providersNoRatings;

  /// No description provided for @providersContact.
  ///
  /// In ar, this message translates to:
  /// **'بيانات التواصل المعلنة'**
  String get providersContact;

  /// No description provided for @providersWebsite.
  ///
  /// In ar, this message translates to:
  /// **'الموقع الإلكتروني'**
  String get providersWebsite;

  /// No description provided for @providersRequestContact.
  ///
  /// In ar, this message translates to:
  /// **'طلب تواصل'**
  String get providersRequestContact;

  /// No description provided for @leadTitle.
  ///
  /// In ar, this message translates to:
  /// **'طلب تواصل مع المزوّد'**
  String get leadTitle;

  /// No description provided for @leadIntro.
  ///
  /// In ar, this message translates to:
  /// **'هذا طلب تواصل وليس حجزًا ولا اتفاقًا. سيصل المزوّد رسالتك فقط.'**
  String get leadIntro;

  /// No description provided for @leadMessage.
  ///
  /// In ar, this message translates to:
  /// **'رسالتك'**
  String get leadMessage;

  /// No description provided for @leadConsent.
  ///
  /// In ar, this message translates to:
  /// **'أوافق على مشاركة بيانات التواصل الخاصة بي (الاسم والبريد) مع هذا المزوّد ليردّ عليّ.'**
  String get leadConsent;

  /// No description provided for @leadSend.
  ///
  /// In ar, this message translates to:
  /// **'إرسال الطلب'**
  String get leadSend;

  /// No description provided for @leadSent.
  ///
  /// In ar, this message translates to:
  /// **'أُرسل طلبك. هذا ليس حجزًا مؤكدًا؛ ينتظر ردّ المزوّد.'**
  String get leadSent;

  /// No description provided for @leadCooldown.
  ///
  /// In ar, this message translates to:
  /// **'أرسلت طلبًا إلى هذا المزوّد مؤخرًا. انتظر 24 ساعة قبل طلب جديد.'**
  String get leadCooldown;

  /// No description provided for @leadNeedConsent.
  ///
  /// In ar, this message translates to:
  /// **'يجب الموافقة على مشاركة بيانات التواصل لإرسال الطلب.'**
  String get leadNeedConsent;

  /// No description provided for @leadMessageRequired.
  ///
  /// In ar, this message translates to:
  /// **'اكتب رسالة قصيرة للمزوّد.'**
  String get leadMessageRequired;

  /// No description provided for @accountTooNew.
  ///
  /// In ar, this message translates to:
  /// **'حسابك جديد جدًا لهذا الإجراء. حاول لاحقًا.'**
  String get accountTooNew;

  /// No description provided for @reviewsTitle.
  ///
  /// In ar, this message translates to:
  /// **'التقييمات'**
  String get reviewsTitle;

  /// No description provided for @reviewsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد تقييمات معتمدة بعد.'**
  String get reviewsEmpty;

  /// No description provided for @reviewWrite.
  ///
  /// In ar, this message translates to:
  /// **'اكتب تقييمًا'**
  String get reviewWrite;

  /// No description provided for @reviewRating.
  ///
  /// In ar, this message translates to:
  /// **'التقييم (1 إلى 5)'**
  String get reviewRating;

  /// No description provided for @reviewBody.
  ///
  /// In ar, this message translates to:
  /// **'تعليقك (اختياري)'**
  String get reviewBody;

  /// No description provided for @reviewSend.
  ///
  /// In ar, this message translates to:
  /// **'إرسال التقييم'**
  String get reviewSend;

  /// No description provided for @reviewPending.
  ///
  /// In ar, this message translates to:
  /// **'تم استلام تقييمك وهو بانتظار المراجعة قبل ظهوره.'**
  String get reviewPending;

  /// No description provided for @reviewExists.
  ///
  /// In ar, this message translates to:
  /// **'لقد قيّمت هذا المزوّد من قبل.'**
  String get reviewExists;

  /// No description provided for @reviewRatingRequired.
  ///
  /// In ar, this message translates to:
  /// **'اختر تقييمًا من 1 إلى 5.'**
  String get reviewRatingRequired;

  /// No description provided for @reviewReport.
  ///
  /// In ar, this message translates to:
  /// **'إبلاغ'**
  String get reviewReport;

  /// No description provided for @reviewReportReason.
  ///
  /// In ar, this message translates to:
  /// **'سبب البلاغ'**
  String get reviewReportReason;

  /// No description provided for @reviewReportSend.
  ///
  /// In ar, this message translates to:
  /// **'إرسال البلاغ'**
  String get reviewReportSend;

  /// No description provided for @reviewReportSent.
  ///
  /// In ar, this message translates to:
  /// **'شكرًا. وصل بلاغك إلى المشرفين.'**
  String get reviewReportSent;

  /// No description provided for @reviewAlreadyReported.
  ///
  /// In ar, this message translates to:
  /// **'سبق أن أبلغت عن هذا التقييم.'**
  String get reviewAlreadyReported;

  /// No description provided for @reasonSpam.
  ///
  /// In ar, this message translates to:
  /// **'محتوى مزعج أو إعلاني'**
  String get reasonSpam;

  /// No description provided for @reasonAbuse.
  ///
  /// In ar, this message translates to:
  /// **'إساءة أو لغة مسيئة'**
  String get reasonAbuse;

  /// No description provided for @reasonMisleading.
  ///
  /// In ar, this message translates to:
  /// **'تقييم مضلِّل أو مزيّف'**
  String get reasonMisleading;

  /// No description provided for @reasonIllegal.
  ///
  /// In ar, this message translates to:
  /// **'محتوى غير قانوني'**
  String get reasonIllegal;

  /// No description provided for @reasonPersonalData.
  ///
  /// In ar, this message translates to:
  /// **'يتضمن بيانات شخصية'**
  String get reasonPersonalData;

  /// No description provided for @reasonOther.
  ///
  /// In ar, this message translates to:
  /// **'سبب آخر'**
  String get reasonOther;

  /// No description provided for @myRequestsTitle.
  ///
  /// In ar, this message translates to:
  /// **'طلباتي وتقييماتي'**
  String get myRequestsTitle;

  /// No description provided for @myRequestsLeads.
  ///
  /// In ar, this message translates to:
  /// **'طلبات التواصل'**
  String get myRequestsLeads;

  /// No description provided for @myRequestsReviews.
  ///
  /// In ar, this message translates to:
  /// **'تقييماتي'**
  String get myRequestsReviews;

  /// No description provided for @myRequestsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد طلبات تواصل بعد.'**
  String get myRequestsEmpty;

  /// No description provided for @myReviewsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لم تكتب تقييمات بعد.'**
  String get myReviewsEmpty;

  /// No description provided for @myReviewDelete.
  ///
  /// In ar, this message translates to:
  /// **'حذف تقييمي'**
  String get myReviewDelete;

  /// No description provided for @myReviewDeleted.
  ///
  /// In ar, this message translates to:
  /// **'حُذف التقييم.'**
  String get myReviewDeleted;

  /// No description provided for @statusPending.
  ///
  /// In ar, this message translates to:
  /// **'بانتظار المراجعة'**
  String get statusPending;

  /// No description provided for @statusApproved.
  ///
  /// In ar, this message translates to:
  /// **'معتمد'**
  String get statusApproved;

  /// No description provided for @statusRejected.
  ///
  /// In ar, this message translates to:
  /// **'مرفوض'**
  String get statusRejected;

  /// No description provided for @statusSeen.
  ///
  /// In ar, this message translates to:
  /// **'اطّلع عليه المزوّد'**
  String get statusSeen;

  /// No description provided for @statusClosed.
  ///
  /// In ar, this message translates to:
  /// **'مغلق'**
  String get statusClosed;

  /// No description provided for @statusNew.
  ///
  /// In ar, this message translates to:
  /// **'تم الإرسال'**
  String get statusNew;

  /// No description provided for @providerPortalNote.
  ///
  /// In ar, this message translates to:
  /// **'بوابة المزوّدين متاحة على الموقع فقط وليس في التطبيق.'**
  String get providerPortalNote;

  /// No description provided for @exploreHousing.
  ///
  /// In ar, this message translates to:
  /// **'فاحص عقد الإيجار'**
  String get exploreHousing;

  /// No description provided for @housingTitle.
  ///
  /// In ar, this message translates to:
  /// **'فاحص عقد الإيجار'**
  String get housingTitle;

  /// No description provided for @housingIntro.
  ///
  /// In ar, this message translates to:
  /// **'الصق نص إعلان الإيجار أو العقد لنُبرز النقاط المهمة وعلامات التحذير والأسئلة التي يجب طرحها.'**
  String get housingIntro;

  /// No description provided for @housingConsentNeeded.
  ///
  /// In ar, this message translates to:
  /// **'فحص الإيجار يحتاج موافقتك على «تحليل السكن». لا نحفظ النص.'**
  String get housingConsentNeeded;

  /// No description provided for @housingConsentGranted.
  ///
  /// In ar, this message translates to:
  /// **'تم منح الموافقة. اضغط «افحص» مرة أخرى.'**
  String get housingConsentGranted;

  /// No description provided for @housingTextLabel.
  ///
  /// In ar, this message translates to:
  /// **'نص الإعلان أو العقد'**
  String get housingTextLabel;

  /// No description provided for @housingTextHint.
  ///
  /// In ar, this message translates to:
  /// **'الصق النص هنا (20 حرفًا على الأقل)'**
  String get housingTextHint;

  /// No description provided for @housingTextTooShort.
  ///
  /// In ar, this message translates to:
  /// **'النص قصير جدًا. الصق 20 حرفًا على الأقل.'**
  String get housingTextTooShort;

  /// No description provided for @housingExtraTitle.
  ///
  /// In ar, this message translates to:
  /// **'تكاليف إضافية تعرفها (اختياري)'**
  String get housingExtraTitle;

  /// No description provided for @housingRent.
  ///
  /// In ar, this message translates to:
  /// **'الإيجار الشهري'**
  String get housingRent;

  /// No description provided for @housingUtilities.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات (شهريًا)'**
  String get housingUtilities;

  /// No description provided for @housingCondo.
  ///
  /// In ar, this message translates to:
  /// **'رسوم العمارة (شهريًا)'**
  String get housingCondo;

  /// No description provided for @housingInternet.
  ///
  /// In ar, this message translates to:
  /// **'الإنترنت (شهريًا)'**
  String get housingInternet;

  /// No description provided for @housingExplain.
  ///
  /// In ar, this message translates to:
  /// **'أضف شرحًا بالذكاء الاصطناعي'**
  String get housingExplain;

  /// No description provided for @housingSend.
  ///
  /// In ar, this message translates to:
  /// **'افحص'**
  String get housingSend;

  /// No description provided for @housingQuotaLeft.
  ///
  /// In ar, this message translates to:
  /// **'الفحوصات المتبقية: {n}'**
  String housingQuotaLeft(String n);

  /// No description provided for @housingQuotaReached.
  ///
  /// In ar, this message translates to:
  /// **'وصلت إلى حدّ فحوصات السكن. حاول لاحقًا أو راجع خطتك.'**
  String get housingQuotaReached;

  /// No description provided for @housingConfidence.
  ///
  /// In ar, this message translates to:
  /// **'ثقة التحليل: {level}'**
  String housingConfidence(String level);

  /// No description provided for @housingFacts.
  ///
  /// In ar, this message translates to:
  /// **'ما وجدناه في النص'**
  String get housingFacts;

  /// No description provided for @housingFactRent.
  ///
  /// In ar, this message translates to:
  /// **'الإيجار الشهري: {v}'**
  String housingFactRent(String v);

  /// No description provided for @housingFactDeposit.
  ///
  /// In ar, this message translates to:
  /// **'التأمين (الضمان): {v}'**
  String housingFactDeposit(String v);

  /// No description provided for @housingFactDepositMonths.
  ///
  /// In ar, this message translates to:
  /// **'التأمين: {v} شهر/أشهر'**
  String housingFactDepositMonths(String v);

  /// No description provided for @housingFactUtilitiesIncluded.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات: مشمولة'**
  String get housingFactUtilitiesIncluded;

  /// No description provided for @housingFactUtilitiesExcluded.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات: غير مشمولة'**
  String get housingFactUtilitiesExcluded;

  /// No description provided for @housingFactExpenses.
  ///
  /// In ar, this message translates to:
  /// **'مصاريف شهرية: {v}'**
  String housingFactExpenses(String v);

  /// No description provided for @housingRedFlags.
  ///
  /// In ar, this message translates to:
  /// **'علامات تحذير محتملة'**
  String get housingRedFlags;

  /// No description provided for @housingNoRedFlags.
  ///
  /// In ar, this message translates to:
  /// **'لم نجد علامات تحذير واضحة في النص، وهذا لا يعني أن العقد سليم.'**
  String get housingNoRedFlags;

  /// No description provided for @housingSevWarning.
  ///
  /// In ar, this message translates to:
  /// **'تحذير'**
  String get housingSevWarning;

  /// No description provided for @housingSevCaution.
  ///
  /// In ar, this message translates to:
  /// **'تنبيه'**
  String get housingSevCaution;

  /// No description provided for @housingSevInfo.
  ///
  /// In ar, this message translates to:
  /// **'معلومة'**
  String get housingSevInfo;

  /// No description provided for @housingOneDeposit.
  ///
  /// In ar, this message translates to:
  /// **'التأمين (مرة واحدة)'**
  String get housingOneDeposit;

  /// No description provided for @housingOneAgencyFee.
  ///
  /// In ar, this message translates to:
  /// **'عمولة الوكالة'**
  String get housingOneAgencyFee;

  /// No description provided for @housingBasisGeneral.
  ///
  /// In ar, this message translates to:
  /// **'إرشاد عام'**
  String get housingBasisGeneral;

  /// No description provided for @housingBasisSourced.
  ///
  /// In ar, this message translates to:
  /// **'مبني على مصدر'**
  String get housingBasisSourced;

  /// No description provided for @housingQuestions.
  ///
  /// In ar, this message translates to:
  /// **'أسئلة تطرحها على المؤجّر'**
  String get housingQuestions;

  /// No description provided for @housingCouldNotDetect.
  ///
  /// In ar, this message translates to:
  /// **'لم نستطع تحديد هذه البنود'**
  String get housingCouldNotDetect;

  /// No description provided for @housingCost.
  ///
  /// In ar, this message translates to:
  /// **'تقدير التكلفة الشهرية'**
  String get housingCost;

  /// No description provided for @housingCostTotal.
  ///
  /// In ar, this message translates to:
  /// **'الإجمالي التقريبي: {v} شهريًا'**
  String housingCostTotal(String v);

  /// No description provided for @housingCostUnknown.
  ///
  /// In ar, this message translates to:
  /// **'لا يمكن حساب إجمالي موثوق من المعلومات المتاحة.'**
  String get housingCostUnknown;

  /// No description provided for @housingCompRent.
  ///
  /// In ar, this message translates to:
  /// **'الإيجار'**
  String get housingCompRent;

  /// No description provided for @housingCompUtilities.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات'**
  String get housingCompUtilities;

  /// No description provided for @housingCompCondo.
  ///
  /// In ar, this message translates to:
  /// **'رسوم العمارة'**
  String get housingCompCondo;

  /// No description provided for @housingCompInternet.
  ///
  /// In ar, this message translates to:
  /// **'الإنترنت'**
  String get housingCompInternet;

  /// No description provided for @housingSourceUser.
  ///
  /// In ar, this message translates to:
  /// **'أدخلتَه أنت'**
  String get housingSourceUser;

  /// No description provided for @housingSourceText.
  ///
  /// In ar, this message translates to:
  /// **'من النص'**
  String get housingSourceText;

  /// No description provided for @housingAssumptions.
  ///
  /// In ar, this message translates to:
  /// **'افتراضات التقدير'**
  String get housingAssumptions;

  /// No description provided for @housingOneTime.
  ///
  /// In ar, this message translates to:
  /// **'تكاليف لمرة واحدة'**
  String get housingOneTime;

  /// No description provided for @housingNotes.
  ///
  /// In ar, this message translates to:
  /// **'ملاحظات'**
  String get housingNotes;

  /// No description provided for @housingAiExplanation.
  ///
  /// In ar, this message translates to:
  /// **'شرح بالذكاء الاصطناعي'**
  String get housingAiExplanation;

  /// No description provided for @housingDisclaimerTitle.
  ///
  /// In ar, this message translates to:
  /// **'تنبيه'**
  String get housingDisclaimerTitle;

  /// No description provided for @housingFallbackDisclaimer.
  ///
  /// In ar, this message translates to:
  /// **'هذه إرشادات عامة وليست استشارة قانونية. استشر محاميًا أو جهة مختصة قبل التوقيع.'**
  String get housingFallbackDisclaimer;

  /// No description provided for @housingAnother.
  ///
  /// In ar, this message translates to:
  /// **'فحص نص آخر'**
  String get housingAnother;

  /// No description provided for @legalTitle.
  ///
  /// In ar, this message translates to:
  /// **'الوثائق القانونية'**
  String get legalTitle;

  /// No description provided for @legalPrivacy.
  ///
  /// In ar, this message translates to:
  /// **'سياسة الخصوصية'**
  String get legalPrivacy;

  /// No description provided for @legalTerms.
  ///
  /// In ar, this message translates to:
  /// **'شروط الاستخدام'**
  String get legalTerms;

  /// No description provided for @legalCookies.
  ///
  /// In ar, this message translates to:
  /// **'سياسة ملفات تعريف الارتباط'**
  String get legalCookies;

  /// No description provided for @legalNotPublished.
  ///
  /// In ar, this message translates to:
  /// **'لم يُنشر هذا المستند بعد. سنعرضه هنا فور نشره رسميًا.'**
  String get legalNotPublished;

  /// No description provided for @legalVersion.
  ///
  /// In ar, this message translates to:
  /// **'الإصدار {v} — نُشر في {date}'**
  String legalVersion(String v, String date);

  /// No description provided for @legalVersionOnly.
  ///
  /// In ar, this message translates to:
  /// **'الإصدار {v}'**
  String legalVersionOnly(String v);

  /// No description provided for @legalRead.
  ///
  /// In ar, this message translates to:
  /// **'اقرأ'**
  String get legalRead;

  /// No description provided for @legalReadTerms.
  ///
  /// In ar, this message translates to:
  /// **'اقرأ شروط الاستخدام'**
  String get legalReadTerms;

  /// No description provided for @legalReadPrivacy.
  ///
  /// In ar, this message translates to:
  /// **'اقرأ سياسة الخصوصية'**
  String get legalReadPrivacy;

  /// No description provided for @patenteWeakTitle.
  ///
  /// In ar, this message translates to:
  /// **'مواضيعي الضعيفة'**
  String get patenteWeakTitle;

  /// No description provided for @patenteWeakIntro.
  ///
  /// In ar, this message translates to:
  /// **'المواضيع التي تقل دقتك فيها عن {threshold}% بعد {min} إجابات على الأقل.'**
  String patenteWeakIntro(String threshold, String min);

  /// No description provided for @patenteWeakNone.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد مواضيع ضعيفة حتى الآن. حلّ مزيدًا من الأسئلة ليظهر التحليل.'**
  String get patenteWeakNone;

  /// No description provided for @patenteWeakList.
  ///
  /// In ar, this message translates to:
  /// **'مواضيع تحتاج مراجعة'**
  String get patenteWeakList;

  /// No description provided for @patenteUntouched.
  ///
  /// In ar, this message translates to:
  /// **'مواضيع لم تجرّبها بعد'**
  String get patenteUntouched;

  /// No description provided for @patenteRecommended.
  ///
  /// In ar, this message translates to:
  /// **'موضوع مقترح للبدء: {t}'**
  String patenteRecommended(String t);

  /// No description provided for @patenteTopicAccuracy.
  ///
  /// In ar, this message translates to:
  /// **'الدقة {acc}% ({correct} من {answered})'**
  String patenteTopicAccuracy(String acc, String correct, String answered);

  /// No description provided for @patentePracticeTopic.
  ///
  /// In ar, this message translates to:
  /// **'تدرّب على هذا الموضوع'**
  String get patentePracticeTopic;

  /// No description provided for @patentePracticeAllWeak.
  ///
  /// In ar, this message translates to:
  /// **'تدرّب على كل المواضيع الضعيفة'**
  String get patentePracticeAllWeak;

  /// No description provided for @patenteNoWeakToPractice.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد مواضيع ضعيفة للتدرّب عليها بعد.'**
  String get patenteNoWeakToPractice;

  /// No description provided for @patenteNotEnoughQuestions.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد أسئلة كافية لهذه الجلسة بعد.'**
  String get patenteNotEnoughQuestions;

  /// No description provided for @patenteWeakOpen.
  ///
  /// In ar, this message translates to:
  /// **'تحليل المواضيع الضعيفة'**
  String get patenteWeakOpen;

  /// No description provided for @patenteGlossaryOpen.
  ///
  /// In ar, this message translates to:
  /// **'قاموس مصطلحات الرخصة (إيطالي ← عربي)'**
  String get patenteGlossaryOpen;

  /// No description provided for @patenteGlossaryTitle.
  ///
  /// In ar, this message translates to:
  /// **'قاموس الباتنتي'**
  String get patenteGlossaryTitle;

  /// No description provided for @patenteGlossaryEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد مصطلحات منشورة بعد.'**
  String get patenteGlossaryEmpty;

  /// No description provided for @patenteCheck.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من إجابتي'**
  String get patenteCheck;

  /// No description provided for @patenteCheckPick.
  ///
  /// In ar, this message translates to:
  /// **'اختر صحيح أو خطأ أولًا.'**
  String get patenteCheckPick;

  /// No description provided for @patenteFeedbackCorrect.
  ///
  /// In ar, this message translates to:
  /// **'إجابة صحيحة'**
  String get patenteFeedbackCorrect;

  /// No description provided for @patenteFeedbackWrong.
  ///
  /// In ar, this message translates to:
  /// **'إجابة غير صحيحة. الجواب الصحيح: {a}'**
  String patenteFeedbackWrong(String a);

  /// No description provided for @patenteExplanationIt.
  ///
  /// In ar, this message translates to:
  /// **'الشرح بالإيطالية'**
  String get patenteExplanationIt;

  /// No description provided for @patenteExplanationAr.
  ///
  /// In ar, this message translates to:
  /// **'الشرح بالعربية'**
  String get patenteExplanationAr;

  /// No description provided for @patenteExplanationEn.
  ///
  /// In ar, this message translates to:
  /// **'الشرح بالإنجليزية'**
  String get patenteExplanationEn;

  /// No description provided for @practiceTitle.
  ///
  /// In ar, this message translates to:
  /// **'تدريب الإيطالية'**
  String get practiceTitle;

  /// No description provided for @practiceOpen.
  ///
  /// In ar, this message translates to:
  /// **'تدريب: مفردات وتمارين ومراجعة'**
  String get practiceOpen;

  /// No description provided for @practiceNotReviewed.
  ///
  /// In ar, this message translates to:
  /// **'هذا المحتوى لم يراجعه معلّم بعد. قد يحتوي على أخطاء.'**
  String get practiceNotReviewed;

  /// No description provided for @practiceReviewed.
  ///
  /// In ar, this message translates to:
  /// **'راجعه معلّم'**
  String get practiceReviewed;

  /// No description provided for @practiceReviewedOn.
  ///
  /// In ar, this message translates to:
  /// **'راجعه معلّم في {date}'**
  String practiceReviewedOn(String date);

  /// No description provided for @practiceDue.
  ///
  /// In ar, this message translates to:
  /// **'بطاقات مستحقة الآن: {n}'**
  String practiceDue(String n);

  /// No description provided for @practiceMastered.
  ///
  /// In ar, this message translates to:
  /// **'بطاقات متقنة: {n}'**
  String practiceMastered(String n);

  /// No description provided for @practiceLearning.
  ///
  /// In ar, this message translates to:
  /// **'بطاقات قيد التعلّم: {n}'**
  String practiceLearning(String n);

  /// No description provided for @practiceAccuracy.
  ///
  /// In ar, this message translates to:
  /// **'الدقة: {n}%'**
  String practiceAccuracy(String n);

  /// No description provided for @practiceAttempts.
  ///
  /// In ar, this message translates to:
  /// **'محاولات التمارين: {n}'**
  String practiceAttempts(String n);

  /// No description provided for @practiceReviewCards.
  ///
  /// In ar, this message translates to:
  /// **'مراجعة البطاقات (تكرار متباعد)'**
  String get practiceReviewCards;

  /// No description provided for @practiceVocabulary.
  ///
  /// In ar, this message translates to:
  /// **'المفردات'**
  String get practiceVocabulary;

  /// No description provided for @practiceExercises.
  ///
  /// In ar, this message translates to:
  /// **'التمارين'**
  String get practiceExercises;

  /// No description provided for @practiceScenarios.
  ///
  /// In ar, this message translates to:
  /// **'مواقف من الحياة اليومية'**
  String get practiceScenarios;

  /// No description provided for @vocabEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد مفردات منشورة بعد.'**
  String get vocabEmpty;

  /// No description provided for @exercisesEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد تمارين منشورة بعد.'**
  String get exercisesEmpty;

  /// No description provided for @scenariosEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد مواقف متاحة بعد.'**
  String get scenariosEmpty;

  /// No description provided for @scenarioCounts.
  ///
  /// In ar, this message translates to:
  /// **'دروس: {lessons} · مفردات: {vocab} · تمارين: {exercises}'**
  String scenarioCounts(String lessons, String vocab, String exercises);

  /// No description provided for @scenarioLessons.
  ///
  /// In ar, this message translates to:
  /// **'دروس هذا الموقف'**
  String get scenarioLessons;

  /// No description provided for @vocabExample.
  ///
  /// In ar, this message translates to:
  /// **'مثال'**
  String get vocabExample;

  /// No description provided for @vocabBox.
  ///
  /// In ar, this message translates to:
  /// **'مستوى الحفظ: {n}'**
  String vocabBox(String n);

  /// No description provided for @vocabAudioNote.
  ///
  /// In ar, this message translates to:
  /// **'يوجد تسجيل صوتي لهذه الكلمة، لكن التشغيل غير متاح في هذه النسخة من التطبيق.'**
  String get vocabAudioNote;

  /// No description provided for @reviewTitle.
  ///
  /// In ar, this message translates to:
  /// **'مراجعة البطاقات'**
  String get reviewTitle;

  /// No description provided for @reviewEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد بطاقات للمراجعة الآن. عُد لاحقًا.'**
  String get reviewEmpty;

  /// No description provided for @reviewShow.
  ///
  /// In ar, this message translates to:
  /// **'إظهار المعنى'**
  String get reviewShow;

  /// No description provided for @reviewKnew.
  ///
  /// In ar, this message translates to:
  /// **'كنت أعرفها'**
  String get reviewKnew;

  /// No description provided for @reviewNotYet.
  ///
  /// In ar, this message translates to:
  /// **'ليس بعد'**
  String get reviewNotYet;

  /// No description provided for @reviewNew.
  ///
  /// In ar, this message translates to:
  /// **'كلمة جديدة'**
  String get reviewNew;

  /// No description provided for @reviewProgress.
  ///
  /// In ar, this message translates to:
  /// **'بطاقة {i} من {n}'**
  String reviewProgress(String i, String n);

  /// No description provided for @reviewDone.
  ///
  /// In ar, this message translates to:
  /// **'أحسنت! أنهيت مراجعة اليوم: {n} بطاقة.'**
  String reviewDone(String n);

  /// No description provided for @reviewSaveFailed.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر حفظ إجابتك. حاول مرة أخرى.'**
  String get reviewSaveFailed;

  /// No description provided for @exTypeAll.
  ///
  /// In ar, this message translates to:
  /// **'كل الأنواع'**
  String get exTypeAll;

  /// No description provided for @exTypeMultiple.
  ///
  /// In ar, this message translates to:
  /// **'اختيار من متعدد'**
  String get exTypeMultiple;

  /// No description provided for @exTypeListening.
  ///
  /// In ar, this message translates to:
  /// **'استماع'**
  String get exTypeListening;

  /// No description provided for @exTypeFill.
  ///
  /// In ar, this message translates to:
  /// **'املأ الفراغ'**
  String get exTypeFill;

  /// No description provided for @exTypeMatch.
  ///
  /// In ar, this message translates to:
  /// **'مطابقة'**
  String get exTypeMatch;

  /// No description provided for @exCheck.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من إجابتي'**
  String get exCheck;

  /// No description provided for @exCorrect.
  ///
  /// In ar, this message translates to:
  /// **'إجابة صحيحة'**
  String get exCorrect;

  /// No description provided for @exWrong.
  ///
  /// In ar, this message translates to:
  /// **'إجابة غير صحيحة'**
  String get exWrong;

  /// No description provided for @exCorrectAnswer.
  ///
  /// In ar, this message translates to:
  /// **'الإجابة الصحيحة: {a}'**
  String exCorrectAnswer(String a);

  /// No description provided for @exAnswerHint.
  ///
  /// In ar, this message translates to:
  /// **'اكتب الكلمة الناقصة'**
  String get exAnswerHint;

  /// No description provided for @exMatchChoose.
  ///
  /// In ar, this message translates to:
  /// **'اختر'**
  String get exMatchChoose;

  /// No description provided for @exMatchAll.
  ///
  /// In ar, this message translates to:
  /// **'طابق كل العناصر قبل التحقق.'**
  String get exMatchAll;

  /// No description provided for @exNoAudio.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد تسجيل صوتي لهذا التمرين بعد. اقرأ الخيارات بنفسك.'**
  String get exNoAudio;

  /// No description provided for @exAudioUnsupported.
  ///
  /// In ar, this message translates to:
  /// **'التسجيل الصوتي غير متاح للتشغيل في هذه النسخة. اقرأ الخيارات بنفسك.'**
  String get exAudioUnsupported;

  /// No description provided for @exTryAnother.
  ///
  /// In ar, this message translates to:
  /// **'تمرين آخر'**
  String get exTryAnother;

  /// No description provided for @exChooseOne.
  ///
  /// In ar, this message translates to:
  /// **'اختر إجابة أولًا.'**
  String get exChooseOne;

  /// No description provided for @exTypeFirst.
  ///
  /// In ar, this message translates to:
  /// **'اكتب إجابتك أولًا.'**
  String get exTypeFirst;

  /// No description provided for @provTitle.
  ///
  /// In ar, this message translates to:
  /// **'بوابة مزوّد الخدمة'**
  String get provTitle;

  /// No description provided for @provBecome.
  ///
  /// In ar, this message translates to:
  /// **'كن مزوّد خدمة'**
  String get provBecome;

  /// No description provided for @provApplyTitle.
  ///
  /// In ar, this message translates to:
  /// **'التقديم كمزوّد خدمة'**
  String get provApplyTitle;

  /// No description provided for @provApplyIntro.
  ///
  /// In ar, this message translates to:
  /// **'أنشئ قائمة خدماتك. تبقى مسودة خاصة حتى يراجعها فريق EXPA وينشرها.'**
  String get provApplyIntro;

  /// No description provided for @provApplyNotice.
  ///
  /// In ar, this message translates to:
  /// **'النشر لا يعني توصية أو ضمانًا من EXPA. تظهر شارة التوثيق فقط بعد مراجعة المستندات.'**
  String get provApplyNotice;

  /// No description provided for @provApply.
  ///
  /// In ar, this message translates to:
  /// **'تقديم الطلب'**
  String get provApply;

  /// No description provided for @provExists.
  ///
  /// In ar, this message translates to:
  /// **'لديك قائمة مزوّد بالفعل.'**
  String get provExists;

  /// No description provided for @provRequiredFields.
  ///
  /// In ar, this message translates to:
  /// **'الاسم والفئة والعنوان الرئيسي مطلوبة.'**
  String get provRequiredFields;

  /// No description provided for @provDisplayName.
  ///
  /// In ar, this message translates to:
  /// **'الاسم المعروض'**
  String get provDisplayName;

  /// No description provided for @provCategory.
  ///
  /// In ar, this message translates to:
  /// **'الفئة'**
  String get provCategory;

  /// No description provided for @provHeadline.
  ///
  /// In ar, this message translates to:
  /// **'العنوان الرئيسي'**
  String get provHeadline;

  /// No description provided for @provLanguageNote.
  ///
  /// In ar, this message translates to:
  /// **'يُحفظ بلغة التطبيق الحالية. غيّر اللغة لإضافة ترجمة أخرى.'**
  String get provLanguageNote;

  /// No description provided for @provDescription.
  ///
  /// In ar, this message translates to:
  /// **'الوصف'**
  String get provDescription;

  /// No description provided for @provContactEmail.
  ///
  /// In ar, this message translates to:
  /// **'بريد التواصل'**
  String get provContactEmail;

  /// No description provided for @provContactPhone.
  ///
  /// In ar, this message translates to:
  /// **'هاتف التواصل'**
  String get provContactPhone;

  /// No description provided for @provWebsite.
  ///
  /// In ar, this message translates to:
  /// **'الموقع الإلكتروني'**
  String get provWebsite;

  /// No description provided for @provServesOnline.
  ///
  /// In ar, this message translates to:
  /// **'يقدّم الخدمة عن بُعد'**
  String get provServesOnline;

  /// No description provided for @provTabProfile.
  ///
  /// In ar, this message translates to:
  /// **'الملف'**
  String get provTabProfile;

  /// No description provided for @provTabVerification.
  ///
  /// In ar, this message translates to:
  /// **'التوثيق'**
  String get provTabVerification;

  /// No description provided for @provTabLeads.
  ///
  /// In ar, this message translates to:
  /// **'الطلبات'**
  String get provTabLeads;

  /// No description provided for @provTabReviews.
  ///
  /// In ar, this message translates to:
  /// **'التقييمات'**
  String get provTabReviews;

  /// No description provided for @provStatusDraft.
  ///
  /// In ar, this message translates to:
  /// **'مسودة'**
  String get provStatusDraft;

  /// No description provided for @provStatusReview.
  ///
  /// In ar, this message translates to:
  /// **'قيد المراجعة'**
  String get provStatusReview;

  /// No description provided for @provStatusApproved.
  ///
  /// In ar, this message translates to:
  /// **'معتمد'**
  String get provStatusApproved;

  /// No description provided for @provStatusPublished.
  ///
  /// In ar, this message translates to:
  /// **'منشور'**
  String get provStatusPublished;

  /// No description provided for @provStatusArchived.
  ///
  /// In ar, this message translates to:
  /// **'مؤرشف'**
  String get provStatusArchived;

  /// No description provided for @provVerified.
  ///
  /// In ar, this message translates to:
  /// **'موثّق'**
  String get provVerified;

  /// No description provided for @provVerifPending.
  ///
  /// In ar, this message translates to:
  /// **'التوثيق قيد المراجعة'**
  String get provVerifPending;

  /// No description provided for @provVerifRejected.
  ///
  /// In ar, this message translates to:
  /// **'التوثيق مرفوض'**
  String get provVerifRejected;

  /// No description provided for @provVerifExpired.
  ///
  /// In ar, this message translates to:
  /// **'انتهى التوثيق'**
  String get provVerifExpired;

  /// No description provided for @provVerifNone.
  ///
  /// In ar, this message translates to:
  /// **'غير موثّق'**
  String get provVerifNone;

  /// No description provided for @provPendingChanges.
  ///
  /// In ar, this message translates to:
  /// **'تعديلات بانتظار الموافقة'**
  String get provPendingChanges;

  /// No description provided for @provPublishedEditNote.
  ///
  /// In ar, this message translates to:
  /// **'القائمة منشورة: تظهر تعديلاتك بعد موافقة المشرف، وتبقى النسخة الحالية كما هي.'**
  String get provPublishedEditNote;

  /// No description provided for @provProblems.
  ///
  /// In ar, this message translates to:
  /// **'ما ينقص قبل التقديم'**
  String get provProblems;

  /// No description provided for @provListingIncomplete.
  ///
  /// In ar, this message translates to:
  /// **'القائمة غير مكتملة بعد. أكملها ثم أعد المحاولة.'**
  String get provListingIncomplete;

  /// No description provided for @provSave.
  ///
  /// In ar, this message translates to:
  /// **'حفظ التعديلات'**
  String get provSave;

  /// No description provided for @provSaved.
  ///
  /// In ar, this message translates to:
  /// **'تم الحفظ.'**
  String get provSaved;

  /// No description provided for @provSavedPendingApproval.
  ///
  /// In ar, this message translates to:
  /// **'تم إرسال التعديلات للموافقة.'**
  String get provSavedPendingApproval;

  /// No description provided for @provSubmit.
  ///
  /// In ar, this message translates to:
  /// **'إرسال للمراجعة'**
  String get provSubmit;

  /// No description provided for @provSubmitted.
  ///
  /// In ar, this message translates to:
  /// **'تم الإرسال للمراجعة.'**
  String get provSubmitted;

  /// No description provided for @provServicesWebOnly.
  ///
  /// In ar, this message translates to:
  /// **'تعديل الخدمات والمناطق متاح حاليًا على موقع الويب فقط.'**
  String get provServicesWebOnly;

  /// No description provided for @provVerifIntro.
  ///
  /// In ar, this message translates to:
  /// **'ارفع مستندات تثبت نشاطك. يراجعها فريق EXPA فقط ولا تظهر للمستخدمين.'**
  String get provVerifIntro;

  /// No description provided for @provEvidenceNote.
  ///
  /// In ar, this message translates to:
  /// **'تُخزَّن المستندات مشفّرة وتُقرأ عبر لوحة الإدارة فقط. ارفع الصور اللازمة فقط.'**
  String get provEvidenceNote;

  /// No description provided for @provEvidenceTitle.
  ///
  /// In ar, this message translates to:
  /// **'مستندات التوثيق'**
  String get provEvidenceTitle;

  /// No description provided for @provEvidenceNone.
  ///
  /// In ar, this message translates to:
  /// **'لم ترفع أي مستند بعد.'**
  String get provEvidenceNone;

  /// No description provided for @provEvidenceAdd.
  ///
  /// In ar, this message translates to:
  /// **'إضافة صورة من المعرض'**
  String get provEvidenceAdd;

  /// No description provided for @provEvidenceDelete.
  ///
  /// In ar, this message translates to:
  /// **'حذف المستند'**
  String get provEvidenceDelete;

  /// No description provided for @provEvidenceUploaded.
  ///
  /// In ar, this message translates to:
  /// **'تم رفع المستند.'**
  String get provEvidenceUploaded;

  /// No description provided for @provEvidencePdfWeb.
  ///
  /// In ar, this message translates to:
  /// **'ملفات PDF تُرفع من موقع الويب. الحد الأقصى 5 ملفات.'**
  String get provEvidencePdfWeb;

  /// No description provided for @provVerifRequest.
  ///
  /// In ar, this message translates to:
  /// **'طلب التوثيق'**
  String get provVerifRequest;

  /// No description provided for @provVerifRequested.
  ///
  /// In ar, this message translates to:
  /// **'تم إرسال طلب التوثيق.'**
  String get provVerifRequested;

  /// No description provided for @provLeadsPrivacy.
  ///
  /// In ar, this message translates to:
  /// **'بيانات التواصل هنا أعطاها المستخدم بموافقته لهذا الطلب فقط. استخدمها للرد عليه فقط.'**
  String get provLeadsPrivacy;

  /// No description provided for @provLeadsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد طلبات بعد.'**
  String get provLeadsEmpty;

  /// No description provided for @provLeadNew.
  ///
  /// In ar, this message translates to:
  /// **'جديد'**
  String get provLeadNew;

  /// No description provided for @provLeadSeen.
  ///
  /// In ar, this message translates to:
  /// **'تمت رؤيته'**
  String get provLeadSeen;

  /// No description provided for @provLeadClosed.
  ///
  /// In ar, this message translates to:
  /// **'مغلق'**
  String get provLeadClosed;

  /// No description provided for @provLeadMarkSeen.
  ///
  /// In ar, this message translates to:
  /// **'تمييز كمقروء'**
  String get provLeadMarkSeen;

  /// No description provided for @provLeadClose.
  ///
  /// In ar, this message translates to:
  /// **'إغلاق الطلب'**
  String get provLeadClose;

  /// No description provided for @provReviewsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد تقييمات معتمدة بعد.'**
  String get provReviewsEmpty;

  /// No description provided for @provReply.
  ///
  /// In ar, this message translates to:
  /// **'رد'**
  String get provReply;

  /// No description provided for @provReplyEdit.
  ///
  /// In ar, this message translates to:
  /// **'تعديل الرد'**
  String get provReplyEdit;

  /// No description provided for @provReplyTitle.
  ///
  /// In ar, this message translates to:
  /// **'الرد على التقييم'**
  String get provReplyTitle;

  /// No description provided for @provReplyNote.
  ///
  /// In ar, this message translates to:
  /// **'يظهر ردّك بعد موافقة المشرف.'**
  String get provReplyNote;

  /// No description provided for @provReplySend.
  ///
  /// In ar, this message translates to:
  /// **'إرسال الرد'**
  String get provReplySend;

  /// No description provided for @provReplySent.
  ///
  /// In ar, this message translates to:
  /// **'تم إرسال الرد للمراجعة.'**
  String get provReplySent;

  /// No description provided for @provReplyPending.
  ///
  /// In ar, this message translates to:
  /// **'الرد بانتظار الموافقة'**
  String get provReplyPending;

  /// No description provided for @provReplyPublished.
  ///
  /// In ar, this message translates to:
  /// **'الرد منشور'**
  String get provReplyPublished;

  /// No description provided for @scannerOcrFallback.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر على الخادم قراءة النص من الصورة. الصق نص الخطاب هنا بدلًا من ذلك.'**
  String get scannerOcrFallback;

  /// No description provided for @scannerConsentNeeded.
  ///
  /// In ar, this message translates to:
  /// **'شرح المستندات يحتاج موافقتك على «تحليل المستندات». لن يُحفظ المستند.'**
  String get scannerConsentNeeded;

  /// No description provided for @scannerConsentGranted.
  ///
  /// In ar, this message translates to:
  /// **'تم منح الموافقة. اضغط «إرسال للشرح» مرة أخرى.'**
  String get scannerConsentGranted;

  /// No description provided for @scannerQuotaReached.
  ///
  /// In ar, this message translates to:
  /// **'وصلت إلى حدّك اليومي لشرح المستندات. حاول لاحقًا أو راجع خطتك.'**
  String get scannerQuotaReached;

  /// No description provided for @scannerQuotaLeft.
  ///
  /// In ar, this message translates to:
  /// **'المحاولات المتبقية: {n}'**
  String scannerQuotaLeft(String n);

  /// No description provided for @scannerFileTypeNotAllowed.
  ///
  /// In ar, this message translates to:
  /// **'نوع الملف غير مسموح. استخدم صورة JPG أو PNG أو ملف PDF.'**
  String get scannerFileTypeNotAllowed;

  /// No description provided for @scannerFileTooLarge.
  ///
  /// In ar, this message translates to:
  /// **'الصورة كبيرة جدًا. التقط صورة أصغر أو الصق النص.'**
  String get scannerFileTooLarge;

  /// No description provided for @scannerPdfTooLong.
  ///
  /// In ar, this message translates to:
  /// **'ملف PDF يحتوي صفحات كثيرة جدًا.'**
  String get scannerPdfTooLong;

  /// No description provided for @scannerFileRejected.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر قبول الملف. جرّب ملفًا آخر أو الصق النص.'**
  String get scannerFileRejected;

  /// No description provided for @scannerUnavailableLater.
  ///
  /// In ar, this message translates to:
  /// **'فحص الملفات غير متاح مؤقتًا ولم يُحفظ شيء. حاول لاحقًا.'**
  String get scannerUnavailableLater;

  /// No description provided for @scannerDateNotClear.
  ///
  /// In ar, this message translates to:
  /// **'التاريخ غير واضح'**
  String get scannerDateNotClear;

  /// No description provided for @scannerYearMissing.
  ///
  /// In ar, this message translates to:
  /// **'السنة غير مذكورة في المستند'**
  String get scannerYearMissing;

  /// No description provided for @scannerDatePast.
  ///
  /// In ar, this message translates to:
  /// **'هذا التاريخ مضى'**
  String get scannerDatePast;

  /// No description provided for @scannerConfidence.
  ///
  /// In ar, this message translates to:
  /// **'درجة الثقة: {level}'**
  String scannerConfidence(String level);

  /// No description provided for @confLow.
  ///
  /// In ar, this message translates to:
  /// **'منخفضة'**
  String get confLow;

  /// No description provided for @confMedium.
  ///
  /// In ar, this message translates to:
  /// **'متوسطة'**
  String get confMedium;

  /// No description provided for @confHigh.
  ///
  /// In ar, this message translates to:
  /// **'عالية'**
  String get confHigh;

  /// No description provided for @scannerDegraded.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر استخدام الذكاء الاصطناعي بالكامل، لذلك هذا الشرح مبسّط.'**
  String get scannerDegraded;

  /// No description provided for @scannerCheckDates.
  ///
  /// In ar, this message translates to:
  /// **'تحقق دائمًا من التواريخ في المستند الأصلي.'**
  String get scannerCheckDates;

  /// No description provided for @recoTitle.
  ///
  /// In ar, this message translates to:
  /// **'مقترحات لك'**
  String get recoTitle;

  /// No description provided for @recoGuides.
  ///
  /// In ar, this message translates to:
  /// **'أدلة مقترحة'**
  String get recoGuides;

  /// No description provided for @recoLessons.
  ///
  /// In ar, this message translates to:
  /// **'دروس مقترحة'**
  String get recoLessons;

  /// No description provided for @recoServices.
  ///
  /// In ar, this message translates to:
  /// **'خدمات مقترحة'**
  String get recoServices;

  /// No description provided for @recoReminders.
  ///
  /// In ar, this message translates to:
  /// **'تذكيرات مقترحة'**
  String get recoReminders;

  /// No description provided for @recoWhy.
  ///
  /// In ar, this message translates to:
  /// **'السبب'**
  String get recoWhy;

  /// No description provided for @recoThirdParty.
  ///
  /// In ar, this message translates to:
  /// **'خدمة من طرف ثالث، لا تضمنها EXPA'**
  String get recoThirdParty;

  /// No description provided for @recoPersonalized.
  ///
  /// In ar, this message translates to:
  /// **'هذه المقترحات مبنية على ملفك وأهدافك بموافقتك.'**
  String get recoPersonalized;

  /// No description provided for @recoNotPersonalized.
  ///
  /// In ar, this message translates to:
  /// **'مقترحات عامة فقط، لأن التخصيص غير مفعّل. فعّل موافقة التخصيص للحصول على مقترحات أدق.'**
  String get recoNotPersonalized;

  /// No description provided for @recoManageConsent.
  ///
  /// In ar, this message translates to:
  /// **'إدارة الموافقات'**
  String get recoManageConsent;

  /// No description provided for @recoEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد مقترحات الآن. أكمل ملفك الشخصي أو أضف مستنداتك.'**
  String get recoEmpty;

  /// No description provided for @netTitle.
  ///
  /// In ar, this message translates to:
  /// **'حاسبة الراتب الصافي'**
  String get netTitle;

  /// No description provided for @netIntro.
  ///
  /// In ar, this message translates to:
  /// **'قدّر الراتب الصافي من الإجمالي السنوي. الحساب تقريبي ولا يُحفظ شيء.'**
  String get netIntro;

  /// No description provided for @netGross.
  ///
  /// In ar, this message translates to:
  /// **'الراتب الإجمالي السنوي (RAL)'**
  String get netGross;

  /// No description provided for @netInvalid.
  ///
  /// In ar, this message translates to:
  /// **'أدخل رقمًا صحيحًا بين 0 و 10,000,000.'**
  String get netInvalid;

  /// No description provided for @netMonths.
  ///
  /// In ar, this message translates to:
  /// **'عدد الرواتب في السنة'**
  String get netMonths;

  /// No description provided for @netCalculate.
  ///
  /// In ar, this message translates to:
  /// **'احسب'**
  String get netCalculate;

  /// No description provided for @netUnavailableTitle.
  ///
  /// In ar, this message translates to:
  /// **'التقدير غير متاح'**
  String get netUnavailableTitle;

  /// No description provided for @netUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'لم تُنشر بعد جداول ضرائب موثّقة، ولا تخمّن EXPA الأرقام.'**
  String get netUnavailable;

  /// No description provided for @netMonthly.
  ///
  /// In ar, this message translates to:
  /// **'الصافي الشهري التقريبي'**
  String get netMonthly;

  /// No description provided for @netAnnual.
  ///
  /// In ar, this message translates to:
  /// **'الصافي السنوي'**
  String get netAnnual;

  /// No description provided for @netGrossLine.
  ///
  /// In ar, this message translates to:
  /// **'الإجمالي السنوي'**
  String get netGrossLine;

  /// No description provided for @netContributions.
  ///
  /// In ar, this message translates to:
  /// **'الاشتراكات'**
  String get netContributions;

  /// No description provided for @netDeduction.
  ///
  /// In ar, this message translates to:
  /// **'خصم ثابت'**
  String get netDeduction;

  /// No description provided for @netTaxable.
  ///
  /// In ar, this message translates to:
  /// **'الدخل الخاضع للضريبة'**
  String get netTaxable;

  /// No description provided for @netIncomeTax.
  ///
  /// In ar, this message translates to:
  /// **'ضريبة الدخل'**
  String get netIncomeTax;

  /// No description provided for @netTable.
  ///
  /// In ar, this message translates to:
  /// **'الجدول المستخدم: {name} ({year})'**
  String netTable(String name, String year);

  /// No description provided for @netDisclaimer.
  ///
  /// In ar, this message translates to:
  /// **'تقدير للاسترشاد فقط وليس كشف راتب أو نصيحة ضريبية. اسأل commercialista أو CAF أو Patronato.'**
  String get netDisclaimer;

  /// No description provided for @travelTitle.
  ///
  /// In ar, this message translates to:
  /// **'متطلبات السفر'**
  String get travelTitle;

  /// No description provided for @travelIntro.
  ///
  /// In ar, this message translates to:
  /// **'اعرف المتطلبات الموثّقة للسفر بين بلدين حسب جنسيتك.'**
  String get travelIntro;

  /// No description provided for @travelPrivacy.
  ///
  /// In ar, this message translates to:
  /// **'تُرسل البلدان فقط للبحث ولا تُحفظ ولا تُقرأ من ملفك.'**
  String get travelPrivacy;

  /// No description provided for @travelNationality.
  ///
  /// In ar, this message translates to:
  /// **'الجنسية (رمز من حرفين)'**
  String get travelNationality;

  /// No description provided for @travelDestination.
  ///
  /// In ar, this message translates to:
  /// **'وجهة السفر (رمز من حرفين)'**
  String get travelDestination;

  /// No description provided for @travelCodeHelp.
  ///
  /// In ar, this message translates to:
  /// **'رمز ISO مثل EG أو IT'**
  String get travelCodeHelp;

  /// No description provided for @travelCodeInvalid.
  ///
  /// In ar, this message translates to:
  /// **'أدخل حرفين لاتينيين.'**
  String get travelCodeInvalid;

  /// No description provided for @travelSearch.
  ///
  /// In ar, this message translates to:
  /// **'بحث'**
  String get travelSearch;

  /// No description provided for @travelNoneTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد معلومات موثّقة'**
  String get travelNoneTitle;

  /// No description provided for @travelNone.
  ///
  /// In ar, this message translates to:
  /// **'ليست لدينا معلومات موثّقة لهذه الحالة. هذا لا يعني أن السفر مسموح، تحقق من المصدر الرسمي.'**
  String get travelNone;

  /// No description provided for @travelDisclaimer.
  ///
  /// In ar, this message translates to:
  /// **'معلومات عامة للاسترشاد وقد تتغير. تحقق دائمًا من المصدر الرسمي قبل السفر.'**
  String get travelDisclaimer;

  /// No description provided for @scannerRedactTitle.
  ///
  /// In ar, this message translates to:
  /// **'قد يحتوي النص على بيانات حساسة'**
  String get scannerRedactTitle;

  /// No description provided for @scannerRedactBody.
  ///
  /// In ar, this message translates to:
  /// **'وجدنا ما يشبه رقم IBAN أو الرقم الضريبي أو بريدًا أو رقمًا طويلًا. يمكنك حذفه من الحقل قبل الإرسال؛ الشرح لا يحتاجه عادةً.'**
  String get scannerRedactBody;

  /// No description provided for @scannerRedactGeneral.
  ///
  /// In ar, this message translates to:
  /// **'نصيحة: احذف أرقام الحسابات والبيانات الشخصية غير اللازمة قبل الإرسال.'**
  String get scannerRedactGeneral;

  /// No description provided for @notificationsDelete.
  ///
  /// In ar, this message translates to:
  /// **'حذف الإشعار'**
  String get notificationsDelete;

  /// No description provided for @notificationsSettings.
  ///
  /// In ar, this message translates to:
  /// **'إعدادات الإشعارات'**
  String get notificationsSettings;

  /// No description provided for @patenteTeacherTitle.
  ///
  /// In ar, this message translates to:
  /// **'معلّم الباتنتي بالذكاء الاصطناعي'**
  String get patenteTeacherTitle;

  /// No description provided for @patenteTeacherIntro.
  ///
  /// In ar, this message translates to:
  /// **'اطلب شرحًا مبسّطًا لهذا الموضوع. الإجابة مبنية على محتوى منشور مع ذكر المصادر.'**
  String get patenteTeacherIntro;

  /// No description provided for @patenteTeacherAsk.
  ///
  /// In ar, this message translates to:
  /// **'اشرح لي هذا الموضوع'**
  String get patenteTeacherAsk;

  /// No description provided for @patenteTeacherPrompt.
  ///
  /// In ar, this message translates to:
  /// **'اشرح لي موضوع الباتنتي هذا بشكل مبسّط: {title}'**
  String patenteTeacherPrompt(String title);

  /// No description provided for @patenteTeacherOffline.
  ///
  /// In ar, this message translates to:
  /// **'أنت غير متصل: المعلّم يحتاج إلى الإنترنت.'**
  String get patenteTeacherOffline;

  /// No description provided for @tfChallengeTitle.
  ///
  /// In ar, this message translates to:
  /// **'التحقق بخطوتين'**
  String get tfChallengeTitle;

  /// No description provided for @tfChallengeSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة.'**
  String get tfChallengeSubtitle;

  /// No description provided for @tfCodeLabel.
  ///
  /// In ar, this message translates to:
  /// **'رمز التحقق'**
  String get tfCodeLabel;

  /// No description provided for @tfCodeInvalid.
  ///
  /// In ar, this message translates to:
  /// **'أدخل رمزًا من 6 أرقام.'**
  String get tfCodeInvalid;

  /// No description provided for @tfVerify.
  ///
  /// In ar, this message translates to:
  /// **'تحقق'**
  String get tfVerify;

  /// No description provided for @tfUseRecovery.
  ///
  /// In ar, this message translates to:
  /// **'استخدام رمز استرداد'**
  String get tfUseRecovery;

  /// No description provided for @tfUseApp.
  ///
  /// In ar, this message translates to:
  /// **'استخدام رمز التطبيق'**
  String get tfUseApp;

  /// No description provided for @tfRecoveryLabel.
  ///
  /// In ar, this message translates to:
  /// **'رمز الاسترداد'**
  String get tfRecoveryLabel;

  /// No description provided for @tfRecoveryHint.
  ///
  /// In ar, this message translates to:
  /// **'بالشكل xxxxx-xxxxx، ويعمل مرة واحدة فقط.'**
  String get tfRecoveryHint;

  /// No description provided for @tfBackToLogin.
  ///
  /// In ar, this message translates to:
  /// **'العودة إلى تسجيل الدخول'**
  String get tfBackToLogin;

  /// No description provided for @tfChallengeExpired.
  ///
  /// In ar, this message translates to:
  /// **'انتهت صلاحية خطوة التحقق. سجّل الدخول من جديد.'**
  String get tfChallengeExpired;

  /// No description provided for @tfInvalidCode.
  ///
  /// In ar, this message translates to:
  /// **'الرمز غير صحيح أو سبق استخدامه. حاول مرة أخرى.'**
  String get tfInvalidCode;

  /// No description provided for @tfTooManyAttempts.
  ///
  /// In ar, this message translates to:
  /// **'محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.'**
  String get tfTooManyAttempts;

  /// No description provided for @tfSetupRequired.
  ///
  /// In ar, this message translates to:
  /// **'يتطلب حسابك تفعيل التحقق بخطوتين. افتح حسابي ثم الأمان لتفعيله.'**
  String get tfSetupRequired;

  /// No description provided for @tfSecurityTitle.
  ///
  /// In ar, this message translates to:
  /// **'الأمان'**
  String get tfSecurityTitle;

  /// No description provided for @tfSecuritySubtitle.
  ///
  /// In ar, this message translates to:
  /// **'التحقق بخطوتين ورموز الاسترداد'**
  String get tfSecuritySubtitle;

  /// No description provided for @tfStatusOn.
  ///
  /// In ar, this message translates to:
  /// **'التحقق بخطوتين مفعّل'**
  String get tfStatusOn;

  /// No description provided for @tfStatusOff.
  ///
  /// In ar, this message translates to:
  /// **'التحقق بخطوتين غير مفعّل'**
  String get tfStatusOff;

  /// No description provided for @tfIntro.
  ///
  /// In ar, this message translates to:
  /// **'يضيف رمزًا من تطبيق مصادقة عند تسجيل الدخول لحماية حسابك.'**
  String get tfIntro;

  /// No description provided for @tfRecoveryRemaining.
  ///
  /// In ar, this message translates to:
  /// **'رموز الاسترداد المتبقية: {n}'**
  String tfRecoveryRemaining(String n);

  /// No description provided for @tfRequiredNotice.
  ///
  /// In ar, this message translates to:
  /// **'هذا الحساب يتطلب التحقق بخطوتين.'**
  String get tfRequiredNotice;

  /// No description provided for @tfEnable.
  ///
  /// In ar, this message translates to:
  /// **'تفعيل التحقق بخطوتين'**
  String get tfEnable;

  /// No description provided for @tfSetupStep1.
  ///
  /// In ar, this message translates to:
  /// **'1. أضف هذا المفتاح إلى تطبيق المصادقة (يمكنك مسح الرمز أو نسخ المفتاح).'**
  String get tfSetupStep1;

  /// No description provided for @tfSetupStep2.
  ///
  /// In ar, this message translates to:
  /// **'2. أدخل الرمز المكوّن من 6 أرقام الذي يظهر في التطبيق.'**
  String get tfSetupStep2;

  /// No description provided for @tfQrLabel.
  ///
  /// In ar, this message translates to:
  /// **'رمز QR لإعداد تطبيق المصادقة'**
  String get tfQrLabel;

  /// No description provided for @tfSecretLabel.
  ///
  /// In ar, this message translates to:
  /// **'مفتاح الإعداد'**
  String get tfSecretLabel;

  /// No description provided for @tfCopy.
  ///
  /// In ar, this message translates to:
  /// **'نسخ'**
  String get tfCopy;

  /// No description provided for @tfCopySecret.
  ///
  /// In ar, this message translates to:
  /// **'نسخ المفتاح'**
  String get tfCopySecret;

  /// No description provided for @tfCopyUri.
  ///
  /// In ar, this message translates to:
  /// **'نسخ رابط otpauth'**
  String get tfCopyUri;

  /// No description provided for @tfCopied.
  ///
  /// In ar, this message translates to:
  /// **'تم النسخ.'**
  String get tfCopied;

  /// No description provided for @tfConfirm.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد وتفعيل'**
  String get tfConfirm;

  /// No description provided for @tfCancelSetup.
  ///
  /// In ar, this message translates to:
  /// **'إلغاء الإعداد'**
  String get tfCancelSetup;

  /// No description provided for @tfCodesTitle.
  ///
  /// In ar, this message translates to:
  /// **'رموز الاسترداد'**
  String get tfCodesTitle;

  /// No description provided for @tfCodesWarning.
  ///
  /// In ar, this message translates to:
  /// **'احفظ هذه الرموز الآن في مكان آمن. لن تظهر مرة أخرى، ويعمل كل رمز مرة واحدة فقط إذا فقدت هاتفك.'**
  String get tfCodesWarning;

  /// No description provided for @tfCopyCodes.
  ///
  /// In ar, this message translates to:
  /// **'نسخ كل الرموز'**
  String get tfCopyCodes;

  /// No description provided for @tfCodesSaved.
  ///
  /// In ar, this message translates to:
  /// **'حفظت الرموز'**
  String get tfCodesSaved;

  /// No description provided for @tfDisable.
  ///
  /// In ar, this message translates to:
  /// **'إيقاف التحقق بخطوتين'**
  String get tfDisable;

  /// No description provided for @tfRegenerate.
  ///
  /// In ar, this message translates to:
  /// **'إنشاء رموز استرداد جديدة'**
  String get tfRegenerate;

  /// No description provided for @tfRegenerateHint.
  ///
  /// In ar, this message translates to:
  /// **'الرموز الجديدة تلغي القديمة.'**
  String get tfRegenerateHint;

  /// No description provided for @tfConfirmIdentity.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد هويتك'**
  String get tfConfirmIdentity;

  /// No description provided for @tfPasswordWrong.
  ///
  /// In ar, this message translates to:
  /// **'كلمة المرور غير صحيحة.'**
  String get tfPasswordWrong;

  /// No description provided for @tfDisabledDone.
  ///
  /// In ar, this message translates to:
  /// **'تم إيقاف التحقق بخطوتين.'**
  String get tfDisabledDone;

  /// No description provided for @tfAlreadyEnabled.
  ///
  /// In ar, this message translates to:
  /// **'التحقق بخطوتين مفعّل بالفعل.'**
  String get tfAlreadyEnabled;

  /// No description provided for @tfLoadFailed.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل حالة الأمان.'**
  String get tfLoadFailed;

  /// No description provided for @patenteExplainQuestion.
  ///
  /// In ar, this message translates to:
  /// **'اشرح لي هذا السؤال'**
  String get patenteExplainQuestion;

  /// No description provided for @patenteQuestionPrompt.
  ///
  /// In ar, this message translates to:
  /// **'اشرح لي سؤال الباتنتي هذا بشكل مبسّط: {statement}'**
  String patenteQuestionPrompt(String statement);
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
