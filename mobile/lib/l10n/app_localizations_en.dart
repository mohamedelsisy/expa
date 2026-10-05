// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppL10nEn extends AppL10n {
  AppL10nEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'EXPA';

  @override
  String get appTagline => 'Your Life Assistant in Italy';

  @override
  String get tabHome => 'Home';

  @override
  String get tabExplore => 'Explore';

  @override
  String get tabAsk => 'Ask EXPA';

  @override
  String get tabTasks => 'Tasks';

  @override
  String get tabProfile => 'Profile';

  @override
  String get retry => 'Try again';

  @override
  String get cancel => 'Cancel';

  @override
  String get save => 'Save';

  @override
  String get close => 'Close';

  @override
  String get loading => 'Loading…';

  @override
  String get errorGeneric => 'Something went wrong. Please try again.';

  @override
  String get errorNetwork =>
      'No internet connection. Check your network and try again.';

  @override
  String get errorTimeout => 'The request took too long. Please try again.';

  @override
  String get errorServer =>
      'The service is temporarily unavailable. Try again later.';

  @override
  String get errorForbidden => 'You are not allowed to do this.';

  @override
  String get errorNotFound => 'We could not find what you are looking for.';

  @override
  String get errorRateLimited =>
      'Too many requests. Wait a moment and try again.';

  @override
  String get errorValidation => 'Please check the information you entered.';

  @override
  String get emptyList => 'Nothing to show yet.';

  @override
  String get loadMore => 'Load more';

  @override
  String get openOfficialSite => 'Open the official website';

  @override
  String get linkUnsafe => 'This link was blocked because it is not secure.';

  @override
  String get linkOpenFailed => 'The link could not be opened.';

  @override
  String get optional => 'Optional';

  @override
  String get skip => 'Skip';

  @override
  String get next => 'Next';

  @override
  String get delete => 'Delete';

  @override
  String get saved => 'Saved.';

  @override
  String get sessionExpired =>
      'Your session has expired. Please sign in again.';

  @override
  String get consentRequired =>
      'This action needs your consent. You can grant it in privacy settings.';

  @override
  String get grantConsent => 'Grant consent';

  @override
  String get loginTitle => 'Sign in';

  @override
  String get loginSubtitle => 'Welcome back to EXPA';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get confirmPassword => 'Confirm password';

  @override
  String get name => 'Name';

  @override
  String get loginButton => 'Sign in';

  @override
  String get registerButton => 'Create account';

  @override
  String get registerTitle => 'Create your account';

  @override
  String get forgotLink => 'Forgot your password?';

  @override
  String get noAccount => 'No account yet? Create one';

  @override
  String get haveAccount => 'Already have an account? Sign in';

  @override
  String get acceptTerms => 'I accept the terms of use';

  @override
  String get acceptPrivacy => 'I have read and accept the privacy policy';

  @override
  String get passwordHint => 'At least 10 characters, with letters and numbers';

  @override
  String get invalidCredentials => 'Incorrect email or password.';

  @override
  String get fieldRequired => 'This field is required.';

  @override
  String get invalidEmail => 'Enter a valid email address.';

  @override
  String get passwordsMismatch => 'The passwords do not match.';

  @override
  String get passwordTooShort => 'The password is too short.';

  @override
  String get mustAcceptBoth =>
      'You must accept the terms and the privacy policy.';

  @override
  String get forgotTitle => 'Reset your password';

  @override
  String get forgotBody =>
      'Enter your email and we will send a reset link if the account exists.';

  @override
  String get sendResetLink => 'Send reset link';

  @override
  String get resetSent =>
      'If the account exists, a reset link is on its way to your email.';

  @override
  String get verifyTitle => 'Check your email';

  @override
  String get verifyBody =>
      'We sent a verification link to your email. Open it, then come back to the app. Some features such as Ask EXPA need a verified email.';

  @override
  String get verifyBanner => 'Your email is not verified yet.';

  @override
  String get resendVerification => 'Resend verification email';

  @override
  String get verificationSent => 'Verification email sent.';

  @override
  String get verifiedCheck => 'I have verified my email';

  @override
  String get continueToApp => 'Continue to the app';

  @override
  String get logout => 'Sign out';

  @override
  String get accountSuspended => 'This account is suspended.';

  @override
  String get language => 'Language';

  @override
  String get langAr => 'العربية';

  @override
  String get langEn => 'English';

  @override
  String get langIt => 'Italiano';

  @override
  String homeGreeting(String name) {
    return 'Welcome $name';
  }

  @override
  String get scoreTitle => 'EXPA Score';

  @override
  String get scoreHow => 'How is it calculated?';

  @override
  String get scoreUnavailable =>
      'Not enough information to calculate your score yet.';

  @override
  String scoreSemantics(String percent) {
    return 'EXPA score $percent percent';
  }

  @override
  String get nextActions => 'What should I do next?';

  @override
  String get nextActionsEmpty => 'No suggested actions right now.';

  @override
  String get personalizationOff =>
      'Personalization is off. Turn it on in privacy settings for tailored suggestions.';

  @override
  String get onboardingContinue => 'Complete your profile';

  @override
  String get tasksTitle => 'Setup tasks';

  @override
  String get taskMarkDone => 'Mark done';

  @override
  String get taskReopen => 'Reopen';

  @override
  String get taskDismiss => 'Not for me';

  @override
  String get taskDone => 'Done';

  @override
  String get tasksDocuments => 'My documents';

  @override
  String get guidesTitle => 'Guides';

  @override
  String get searchHint => 'Search…';

  @override
  String get allCategories => 'All';

  @override
  String get sourceLabel => 'Source';

  @override
  String get sourceOfficial => 'Official';

  @override
  String get sourceInstitutional => 'Institutional';

  @override
  String get sourceVerifiedPartner => 'Verified partner';

  @override
  String get sourceThirdParty => 'Third party';

  @override
  String lastVerified(String date) {
    return 'Last verified: $date';
  }

  @override
  String get neverVerified => 'Not verified yet';

  @override
  String get freshFresh => 'Up to date';

  @override
  String get freshStale => 'May be outdated';

  @override
  String get freshOutdated => 'Outdated: check the official site';

  @override
  String get freshUnverified => 'Unverified';

  @override
  String get fallbackLocale =>
      'This content is not available in your language and is shown in another one.';

  @override
  String get secWhatIs => 'What is it?';

  @override
  String get secWhoNeeds => 'Who needs it?';

  @override
  String get secDocuments => 'Required documents';

  @override
  String get secSteps => 'Steps';

  @override
  String get secWhere => 'Where to apply';

  @override
  String get secBook => 'How to book';

  @override
  String get secCosts => 'Costs';

  @override
  String get secTime => 'Processing time';

  @override
  String get verifyOfficialNotice =>
      'General guidance. Always check the official source before deciding.';

  @override
  String get documentsTitle => 'My documents';

  @override
  String get addDocument => 'Add a document';

  @override
  String get docType => 'Document type';

  @override
  String get docLabel => 'Label (optional)';

  @override
  String get issueDate => 'Issue date';

  @override
  String get expiryDate => 'Expiry date';

  @override
  String get notes => 'Notes';

  @override
  String get remindersEnabled => 'Remind me before it expires';

  @override
  String get noExpiry => 'No expiry date';

  @override
  String daysRemaining(String n) {
    return '$n days left';
  }

  @override
  String expiredDaysAgo(String n) {
    return 'Expired $n days ago';
  }

  @override
  String get statusValid => 'Valid';

  @override
  String get statusExpiringSoon => 'Expiring soon';

  @override
  String get statusExpired => 'Expired';

  @override
  String get statusNoExpiry => 'No expiry';

  @override
  String get pickDate => 'Pick a date';

  @override
  String get clearDate => 'Clear';

  @override
  String get docsEmpty =>
      'You have not added any document yet. Add your passport or residence permit and we will remind you before they expire.';

  @override
  String get deleteDocConfirm => 'Delete this document?';

  @override
  String get consentNeededDocs =>
      'To save your documents we need your consent to store them.';

  @override
  String get docAttachmentsNote =>
      'Attachments are available on the website. This version tracks dates only.';

  @override
  String get askTitle => 'Ask EXPA';

  @override
  String get askHint => 'Type your question in Arabic, English or Italian';

  @override
  String get askSend => 'Send';

  @override
  String get askIntro =>
      'Ask me about residence, documents and government services. I answer from verified sources and show them to you.';

  @override
  String askUsage(String n) {
    return 'Remaining today: $n';
  }

  @override
  String askResets(String date) {
    return 'Limit resets on $date';
  }

  @override
  String get askLimitReached => 'You have reached today\'s question limit.';

  @override
  String get askVerifyEmail => 'Verify your email to use Ask EXPA.';

  @override
  String get askFailed =>
      'I couldn\'t process that right now. Please try again.';

  @override
  String get askDegraded =>
      'The AI is unavailable right now. This is a limited answer; browse the guides for verified information.';

  @override
  String get askBrowseGuides => 'Browse the guides';

  @override
  String get askSourcesTitle => 'Sources';

  @override
  String get askNoSources => 'There are no verified sources for this answer.';

  @override
  String get askNoticeTitle => 'Notice';

  @override
  String get askYou => 'You';

  @override
  String get askAssistant => 'EXPA';

  @override
  String get askSuggested => 'Suggested actions';

  @override
  String get askLabelOfficial => 'Official information';

  @override
  String get askLabelGeneral => 'General guidance';

  @override
  String get askLabelAi => 'AI explanation';

  @override
  String get askLabelThird => 'Third-party service or source';

  @override
  String get learnTitle => 'Learn Italian';

  @override
  String get dailyTitle => 'Daily 10-minute Italian';

  @override
  String get dailyDone => 'Done today';

  @override
  String minutes(String n) {
    return '$n min';
  }

  @override
  String streak(String n) {
    return 'Day streak: $n';
  }

  @override
  String get lessonsTitle => 'Lessons';

  @override
  String get lessonStart => 'Start lesson';

  @override
  String get lessonComplete => 'Mark as completed';

  @override
  String get lessonCompleted => 'Completed';

  @override
  String get lessonsEmpty => 'No lessons available yet.';

  @override
  String get jobsTitle => 'Jobs';

  @override
  String matchScore(String n) {
    return 'Match score: $n%';
  }

  @override
  String get matchUnknown => 'Not enough data to match';

  @override
  String get matchReasons => 'Why this score?';

  @override
  String get reasonMatch => 'Matches';

  @override
  String get reasonPartial => 'Partly matches';

  @override
  String get reasonMismatch => 'Does not match';

  @override
  String get reasonUnknown => 'Unknown (not counted against you)';

  @override
  String get applyOriginal => 'Apply on the original site';

  @override
  String get applyNotice =>
      'EXPA does not submit applications. You will go to the original application page.';

  @override
  String get visaStated => 'The source states visa sponsorship';

  @override
  String get visaNotStated => 'Visa sponsorship is not stated';

  @override
  String get jobsEmpty => 'No matching jobs right now.';

  @override
  String jobSource(String name) {
    return 'Source: $name';
  }

  @override
  String get jobsSignInForMatch =>
      'Sign in and complete your profile to see match scores.';

  @override
  String get notificationsTitle => 'Notifications';

  @override
  String get markAllRead => 'Mark all as read';

  @override
  String get notificationsEmpty => 'No notifications.';

  @override
  String get apptTitle => 'Appointments';

  @override
  String get apptNotice =>
      'EXPA does not book for you. We point you to the official body so you can complete the booking yourself.';

  @override
  String get apptOfficeType => 'Office type';

  @override
  String get apptCity => 'City';

  @override
  String get apptSearch => 'Show offices';

  @override
  String get apptGoOfficial => 'Go to the official booking page';

  @override
  String get apptNoUrl =>
      'No official booking link is on file. Check the office\'s official website.';

  @override
  String get apptEmpty => 'No offices on file for this city.';

  @override
  String get exploreTitle => 'Explore';

  @override
  String get exploreGuides => 'Guides & documents';

  @override
  String get exploreLearn => 'Learn Italian';

  @override
  String get exploreJobs => 'Jobs';

  @override
  String get exploreAppointments => 'Appointments';

  @override
  String get exploreMyDocs => 'My documents & expiry dates';

  @override
  String get exploreNotifications => 'Notifications';

  @override
  String get profileTitle => 'Profile';

  @override
  String get profilePrivacy => 'Privacy & consents';

  @override
  String get profileOnboarding => 'My profile details';

  @override
  String get pushNote => 'Push notifications are not enabled in this version.';

  @override
  String get privacyTitle => 'Privacy';

  @override
  String get consentsTitle => 'Your consents';

  @override
  String get consentRequiredBadge => 'Required';

  @override
  String get consentsHint => 'You can change optional consents at any time.';

  @override
  String get exportTitle => 'Export my data';

  @override
  String get exportBody =>
      'Request a copy of your personal data. Limit: 5 requests per hour.';

  @override
  String get exportRequest => 'Request export';

  @override
  String exportDone(String n) {
    return 'Your data is ready ($n sections). It was not saved on this device.';
  }

  @override
  String get deleteAccountTitle => 'Delete account';

  @override
  String get deleteAccountBody =>
      'Deletion is permanent. Access stops immediately and erasure completes later. Enter your password to confirm.';

  @override
  String get deleteAccountConfirm => 'Request account deletion';

  @override
  String get deleteRequested => 'Deletion requested.';

  @override
  String get onboardingTitle => 'About you in Italy';

  @override
  String get onboardingIntro =>
      'We only collect what personalization needs. You can skip optional questions.';

  @override
  String get fieldSegment => 'Current status';

  @override
  String get fieldNationality => 'Nationality (2-letter code, e.g. EG)';

  @override
  String get fieldCity => 'City';

  @override
  String get fieldResidence => 'Residence type';

  @override
  String get fieldItalian => 'Italian level';

  @override
  String get fieldEnglish => 'English level';

  @override
  String get fieldGoals => 'Your goals';

  @override
  String get fieldAge => 'Age range';

  @override
  String get notSelected => 'Not set';

  @override
  String get completeOnboarding => 'Finish';

  @override
  String get onboardingSegmentRequired =>
      'Choose your current status to finish.';
}
