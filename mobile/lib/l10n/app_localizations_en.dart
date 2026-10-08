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

  @override
  String get offlineBanner =>
      'You are offline. Only data saved on your device is shown.';

  @override
  String get apptGuidesTitle => 'Booking guides';

  @override
  String get apptNotBookedByExpa =>
      'EXPA does not book for you: you are sent to the official body.';

  @override
  String get officeQuestura => 'Police headquarters (Questura)';

  @override
  String get officePrefettura => 'Prefecture (Prefettura)';

  @override
  String get officeComune => 'Municipality (Comune)';

  @override
  String get officeAnagrafe => 'Civil registry (Anagrafe)';

  @override
  String get officeAsl => 'Local health authority (ASL)';

  @override
  String get officeInps => 'Social security (INPS)';

  @override
  String get officeAgenziaEntrate => 'Revenue Agency (Agenzia delle Entrate)';

  @override
  String get officePoste => 'Italian Post (Poste Italiane)';

  @override
  String get officeMotorizzazione => 'Vehicle licensing (Motorizzazione)';

  @override
  String get officeUniversity => 'University';

  @override
  String get officeOther => 'Other body';

  @override
  String get officePhone => 'Phone';

  @override
  String get secAdmission => 'Admission requirements';

  @override
  String get secTips => 'Tips';

  @override
  String get secCautions => 'Cautions';

  @override
  String get secNotes => 'Notes';

  @override
  String get exploreGovernment => 'Government services';

  @override
  String get explorePatente => 'Driving licence (Patente)';

  @override
  String get exploreStudy => 'Study in Italy';

  @override
  String get exploreScan => 'Scan a letter or document';

  @override
  String get exploreSaved => 'Saved for offline';

  @override
  String get govTitle => 'Government services';

  @override
  String get govServices => 'Services';

  @override
  String get govOffices => 'Offices';

  @override
  String get govEmpty =>
      'Nothing is published yet. Government services are added after review against official sources.';

  @override
  String get govRelatedGuide => 'Related guide';

  @override
  String get studyTitle => 'Study in Italy';

  @override
  String get studyPrograms => 'Programs';

  @override
  String get studyUniversities => 'Universities';

  @override
  String get studyScholarships => 'Scholarships';

  @override
  String get studyEmpty => 'Nothing is published yet.';

  @override
  String get studyTuition => 'Tuition';

  @override
  String get studyPerYear => 'per year';

  @override
  String get studyDeadline => 'Application deadline';

  @override
  String get jobsSavedTitle => 'Saved jobs';

  @override
  String get jobsSavedEmpty => 'You have not saved any jobs yet.';

  @override
  String get jobSave => 'Save job';

  @override
  String get jobUnsave => 'Remove from saved';

  @override
  String get lessonTip => 'Tip';

  @override
  String get askHistoryTitle => 'Past conversations';

  @override
  String get askHistoryEmpty => 'No past conversations.';

  @override
  String get askHistoryUntitled => 'Conversation';

  @override
  String get askHistoryDelete => 'Delete conversation';

  @override
  String get askHistoryDeleteBody =>
      'This conversation will be permanently deleted.';

  @override
  String get askNewChat => 'New conversation';

  @override
  String get searchTitle => 'Search';

  @override
  String get searchMinChars => 'Type at least 2 characters, then search.';

  @override
  String get searchEmpty => 'No results. Try other words.';

  @override
  String get savedTitle => 'Saved';

  @override
  String get savedEmpty =>
      'Nothing saved yet. Tap the bookmark inside a guide or lesson.';

  @override
  String get savedHint =>
      'These copies are stored on your device and open without internet. Check the last-verified date before relying on them.';

  @override
  String get savedAdd => 'Save for offline';

  @override
  String get savedRemove => 'Remove from saved';

  @override
  String get savedAdded => 'Saved on your device.';

  @override
  String get savedRemoved => 'Removed from saved.';

  @override
  String savedOfflineCopy(String date) {
    return 'This is the copy saved on $date. It could not be refreshed now.';
  }

  @override
  String get savedRefreshing => 'Saved copy. Refreshing…';

  @override
  String savedOn(String date) {
    return 'Saved on $date';
  }

  @override
  String get savedStale =>
      'This copy may be out of date. Check the official website.';

  @override
  String get patenteTitle => 'Driving licence (Patente)';

  @override
  String get patenteDisclaimer =>
      'General learning content. Exam rules and official questions are set by the Italian authorities; always check the official source.';

  @override
  String get patenteEmpty =>
      'Patente content is not published yet. We only publish questions we have the rights to use. It will appear here once available.';

  @override
  String get patenteMockExam => 'Mock exam';

  @override
  String patenteRules(String questions, String errors, String minutes) {
    return '$questions questions, up to $errors errors, $minutes minutes.';
  }

  @override
  String get patenteStartExam => 'Start mock exam';

  @override
  String get patenteProgress => 'Your progress';

  @override
  String patenteProgressLine(String taken, String passed) {
    return 'Exams taken: $taken, passed: $passed';
  }

  @override
  String patentePassRate(String rate) {
    return 'Recent pass rate: $rate%';
  }

  @override
  String patenteWeakTopics(String topics) {
    return 'Topics to review: $topics';
  }

  @override
  String get patentePracticeWeak => 'Practise weak topics';

  @override
  String get patenteTopics => 'Topics';

  @override
  String get patenteTopicsHint =>
      'Tap a topic to study it, or tick topics to practise.';

  @override
  String get patenteNoTopics => 'No topics published yet.';

  @override
  String patenteQuestionCount(String n) {
    return '$n questions';
  }

  @override
  String get patentePractice => 'Practise selected topics';

  @override
  String get patenteCategories => 'Licence categories';

  @override
  String get patenteTrue => 'True (Vero)';

  @override
  String get patenteFalse => 'False (Falso)';

  @override
  String get patenteSubmit => 'Finish and submit';

  @override
  String patenteAnswered(String done, String total) {
    return 'Answered $done of $total';
  }

  @override
  String patenteMaxErrors(String n) {
    return 'Maximum errors allowed: $n';
  }

  @override
  String patenteTimeLeft(String time) {
    return 'Time left $time';
  }

  @override
  String get patenteTooEarly =>
      'The exam cannot be submitted this quickly. Answer the questions, then try again.';

  @override
  String get patentePassed => 'You passed this mock exam';

  @override
  String get patenteFailed => 'You did not pass this mock exam';

  @override
  String patenteResultLine(String correct, String errors, String max) {
    return 'Correct: $correct, errors: $errors (maximum $max)';
  }

  @override
  String patentePracticeResult(String correct, String total) {
    return 'Correct: $correct of $total';
  }

  @override
  String get patenteTimedOut =>
      'Time ran out and your answers were submitted automatically.';

  @override
  String get patenteReview => 'Review';

  @override
  String get patenteNotAnswered => 'You did not answer this question';

  @override
  String patenteYourAnswer(String answer) {
    return 'Your answer: $answer';
  }

  @override
  String patenteCorrectAnswer(String answer) {
    return 'Correct answer: $answer';
  }

  @override
  String get patenteBack => 'Back to Patente';

  @override
  String get pushTitle => 'Push notifications';

  @override
  String get pushSubtitle =>
      'Reminders about your document deadlines and important things.';

  @override
  String get pushRationaleTitle => 'Turn on notifications?';

  @override
  String get pushRationaleBody =>
      'We will send reminders before your documents (such as your residence permit) expire, and important alerts. No advertising. You can turn this off at any time. Your device will ask for permission after this step.';

  @override
  String get pushAllow => 'Continue';

  @override
  String get pushDenied =>
      'Notification permission was denied. You can enable it in your device settings.';

  @override
  String get pushFailed =>
      'Notifications could not be turned on right now. Please try again later.';

  @override
  String get pushEnabledNote => 'Notifications are on for this device.';

  @override
  String get logoutConfirmTitle => 'Sign out?';

  @override
  String get logoutConfirmBody =>
      'Data saved on this device will be removed and notifications will stop.';

  @override
  String get deleteConfirmBody =>
      'Deleting your account cannot be undone. Are you sure?';

  @override
  String get exportShare => 'Share or save a copy…';

  @override
  String get exportShareConfirmTitle => 'Share your personal data';

  @override
  String get exportShareConfirmBody =>
      'The file contains your personal data. Choose a safe destination only (such as your own notes app or your email). EXPA does not store it on the device.';

  @override
  String get nationalityInvalid =>
      'Enter a 2-letter country code (e.g. EG) or leave it empty.';

  @override
  String get resetTitle => 'Set a new password';

  @override
  String get resetButton => 'Save password';

  @override
  String get resetDone =>
      'Your password was changed. Sign in with the new password.';

  @override
  String get resetInvalidLink =>
      'The reset link is invalid or incomplete. Request a new one.';

  @override
  String get verifySuccess => 'Your email address is verified.';

  @override
  String get verifyInvalidLink =>
      'The verification link is invalid or expired. Request a new one from inside the app.';

  @override
  String get scannerTitle => 'Scan a letter or document';

  @override
  String get scannerIntro =>
      'Photograph a letter (for example from the Comune, or a bill) or paste its text, and we will explain it and its key dates.';

  @override
  String get scannerPrivacy =>
      'Nothing is sent to EXPA until you have reviewed it and tap Send. The explanation is not legal advice.';

  @override
  String get scannerCameraWhy =>
      'The camera is used only when you tap scan, to photograph the document you choose.';

  @override
  String get scannerUseCamera => 'Use the camera';

  @override
  String get scannerUseGallery => 'Choose a photo';

  @override
  String get scannerPasteText => 'Paste the text instead';

  @override
  String get scannerNoCamera =>
      'The camera is not available on this device. You can paste the document text.';

  @override
  String get scannerPermissionDenied =>
      'Access to the camera or photos was not allowed. You can allow it in device settings, or paste the text instead.';

  @override
  String get scannerReviewTitle => 'Review before sending';

  @override
  String get scannerPreview => 'Preview of the captured photo';

  @override
  String get scannerNoOcr =>
      'On-device text recognition is not available in this version. Type or paste the text below, or send the photo itself.';

  @override
  String get scannerTextLabel => 'Document text';

  @override
  String get scannerTextHint => 'Paste the text you want explained';

  @override
  String get scannerSendsText =>
      'Only this text will be sent to EXPA servers to be explained.';

  @override
  String get scannerSendsImage =>
      'This photo will be sent to EXPA servers to be explained.';

  @override
  String get scannerNothingToSend => 'There is nothing to send yet.';

  @override
  String get scannerSend => 'Send for explanation';

  @override
  String get scannerDiscard => 'Discard and start over';

  @override
  String get scannerBackendUnavailable =>
      'The document explanation service is not available yet. Please try again later.';

  @override
  String get scannerNoSummary => 'We could not extract a summary.';

  @override
  String get scannerKeyDates => 'Key dates';

  @override
  String get scannerCreateReminder => 'Add a document and reminder';

  @override
  String get scannerActions => 'Suggested actions';

  @override
  String get scannerDefaultDisclaimer =>
      'This is a general automated explanation, not legal or official advice. Check with the sender of the letter.';

  @override
  String get scannerAnother => 'Explain another document';

  @override
  String get billingTitle => 'Plan and invoices';

  @override
  String get billingUnavailableTitle => 'Payments are not enabled';

  @override
  String get billingUnavailableBody =>
      'Payment is not available yet, so a plan cannot be bought or upgraded in the app. Your current plan keeps working and you will not be charged.';

  @override
  String get billingUnavailableShort => 'Payment is not available right now.';

  @override
  String get billingCurrent => 'Your current plan';

  @override
  String get billingPlans => 'Plans';

  @override
  String get billingNoPlans => 'No plans have been published yet.';

  @override
  String get billingFree => 'Free';

  @override
  String billingPerMonth(String amount) {
    return '$amount / month';
  }

  @override
  String billingPerYear(String amount) {
    return '$amount / year';
  }

  @override
  String get billingYourPlan => 'Your plan';

  @override
  String get billingChoose => 'Choose this plan';

  @override
  String billingFeatAi(String n) {
    return '$n assistant questions per day';
  }

  @override
  String get billingFeatReminders => 'Advanced reminders';

  @override
  String get billingFeatDocAi => 'AI document analysis';

  @override
  String billingFeatHuman(String n) {
    return '$n human-assistance credits';
  }

  @override
  String get billingStatusActive => 'Active';

  @override
  String get billingStatusPastDue => 'Payment past due';

  @override
  String get billingStatusCanceled => 'Canceled';

  @override
  String get billingStatusFree => 'Free plan';

  @override
  String billingAccessUntil(String date) {
    return 'Access until $date';
  }

  @override
  String billingRenews(String date) {
    return 'Renews on $date';
  }

  @override
  String get billingEnding => 'Ends at period end';

  @override
  String get billingCancel => 'Cancel at period end';

  @override
  String get billingCancelTitle => 'Cancel subscription?';

  @override
  String get billingCancelBody =>
      'You keep your plan\'s features until the end of the paid period, then it will not renew.';

  @override
  String get billingCancelConfirm => 'Yes, cancel';

  @override
  String get billingCancelled => 'Cancellation set for the end of the period.';

  @override
  String get billingNothingToCancel => 'There is no subscription to cancel.';

  @override
  String get billingCheckoutFailed => 'The checkout page could not be opened.';

  @override
  String get billingAlreadySubscribed =>
      'You already have an active subscription.';

  @override
  String get billingPlanNotPurchasable => 'This plan cannot be purchased.';

  @override
  String get billingInvoices => 'Invoices';

  @override
  String get billingNoInvoices => 'No invoices yet.';

  @override
  String get billingPricesNote =>
      'Prices can change and are shown as the server sends them. Payment happens in the browser; the app never handles your card details.';

  @override
  String get exploreCommunity => 'Community Q&A';

  @override
  String get communityTitle => 'EXPA community';

  @override
  String get communityNoticeFallback =>
      'Community answers come from ordinary members and are not official or verified information. Check official sources.';

  @override
  String get communityEmpty => 'No questions yet.';

  @override
  String get communityMineOnly => 'My questions only';

  @override
  String get communityAskOpen => 'Ask a question';

  @override
  String get communityQuestionTitle => 'Question title';

  @override
  String get communityQuestionBody => 'Question details';

  @override
  String get communityTopic => 'Topic';

  @override
  String get communityNoTopic => 'No topic';

  @override
  String get communityPost => 'Post';

  @override
  String get communityPostedPending =>
      'We received your post; it may wait for moderation before others can see it.';

  @override
  String communityAnswers(String n) {
    return 'Answers ($n)';
  }

  @override
  String get communityNoAnswers => 'No answers yet.';

  @override
  String get communityWriteAnswer => 'Write an answer';

  @override
  String get communityAccepted => 'Answer accepted by the asker';

  @override
  String get communityOfficialGuide => 'Linked official guide';

  @override
  String get communityMine => 'My post';

  @override
  String get communityPendingStatus => 'Pending moderation';

  @override
  String get communityHiddenStatus => 'Hidden by moderators';

  @override
  String get communityDelete => 'Delete my question';

  @override
  String get communityDeleted => 'Question deleted.';

  @override
  String communityComments(String n) {
    return 'Comments ($n)';
  }

  @override
  String get exploreArticles => 'Articles';

  @override
  String get exploreCities => 'Cities';

  @override
  String get exploreServices => 'Service providers';

  @override
  String get exploreLegal => 'Legal documents';

  @override
  String get articlesTitle => 'Articles';

  @override
  String get articlesEmpty => 'No articles are published yet.';

  @override
  String get articleEditorial => 'Editorial article, not an official source';

  @override
  String get articleRelatedGuides => 'Related guides';

  @override
  String get articleRelatedArticles => 'Related articles';

  @override
  String get articleTags => 'Tags';

  @override
  String get articleDefaultDisclaimer =>
      'General guidance, not legal or official advice. Check official sources.';

  @override
  String get citiesTitle => 'Cities';

  @override
  String get citiesEmpty => 'No city profiles are published yet.';

  @override
  String get cityOfficial => 'Official information';

  @override
  String get cityGeneral => 'General guidance';

  @override
  String get cityGuides => 'Guides for this city';

  @override
  String get cityArticles => 'Articles about the city';

  @override
  String cityOffices(String n) {
    return 'Government offices listed: $n';
  }

  @override
  String get cityOfficesOpen => 'Browse government offices';

  @override
  String get providersTitle => 'Service providers';

  @override
  String get providersEmpty => 'No matching providers.';

  @override
  String get providersVerifiedOnly => 'Verified only';

  @override
  String get providersThirdParty => 'Third-party service, not official';

  @override
  String get providersNoticeFallback =>
      'This provider is an independent third party, not an official body and not part of EXPA. Check for yourself before paying or sharing your data.';

  @override
  String providersRating(String avg, String count) {
    return 'Rating: $avg ($count)';
  }

  @override
  String get providersNoRatings => 'No ratings yet';

  @override
  String get providersContact => 'Published contact details';

  @override
  String get providersWebsite => 'Website';

  @override
  String get providersRequestContact => 'Request contact';

  @override
  String get leadTitle => 'Contact request';

  @override
  String get leadIntro =>
      'This is a contact request, not a booking or an agreement. The provider only receives your message.';

  @override
  String get leadMessage => 'Your message';

  @override
  String get leadConsent =>
      'I agree to share my contact details (name and e-mail) with this provider so they can reply.';

  @override
  String get leadSend => 'Send request';

  @override
  String get leadSent =>
      'Your request was sent. It is not a confirmed booking; wait for the provider\'s reply.';

  @override
  String get leadCooldown =>
      'You sent this provider a request recently. Wait 24 hours before sending another.';

  @override
  String get leadNeedConsent =>
      'You must agree to share your contact details to send the request.';

  @override
  String get leadMessageRequired => 'Write a short message to the provider.';

  @override
  String get accountTooNew =>
      'Your account is too new for this action. Try again later.';

  @override
  String get reviewsTitle => 'Reviews';

  @override
  String get reviewsEmpty => 'No approved reviews yet.';

  @override
  String get reviewWrite => 'Write a review';

  @override
  String get reviewRating => 'Rating (1 to 5)';

  @override
  String get reviewBody => 'Your comment (optional)';

  @override
  String get reviewSend => 'Submit review';

  @override
  String get reviewPending =>
      'Your review was received and awaits moderation before it appears.';

  @override
  String get reviewExists => 'You have already reviewed this provider.';

  @override
  String get reviewRatingRequired => 'Choose a rating from 1 to 5.';

  @override
  String get reviewReport => 'Report';

  @override
  String get reviewReportReason => 'Reason for the report';

  @override
  String get reviewReportSend => 'Send report';

  @override
  String get reviewReportSent =>
      'Thank you. Your report reached the moderators.';

  @override
  String get reviewAlreadyReported => 'You already reported this review.';

  @override
  String get reasonSpam => 'Spam or advertising';

  @override
  String get reasonAbuse => 'Abusive language';

  @override
  String get reasonMisleading => 'Misleading or fake';

  @override
  String get reasonIllegal => 'Illegal content';

  @override
  String get reasonPersonalData => 'Contains personal data';

  @override
  String get reasonOther => 'Other';

  @override
  String get myRequestsTitle => 'My requests and reviews';

  @override
  String get myRequestsLeads => 'Contact requests';

  @override
  String get myRequestsReviews => 'My reviews';

  @override
  String get myRequestsEmpty => 'No contact requests yet.';

  @override
  String get myReviewsEmpty => 'You have not written any reviews.';

  @override
  String get myReviewDelete => 'Delete my review';

  @override
  String get myReviewDeleted => 'Review deleted.';

  @override
  String get statusPending => 'Pending';

  @override
  String get statusApproved => 'Approved';

  @override
  String get statusRejected => 'Rejected';

  @override
  String get statusSeen => 'Seen by the provider';

  @override
  String get statusClosed => 'Closed';

  @override
  String get statusNew => 'Sent';

  @override
  String get providerPortalNote =>
      'The provider portal is available on the website only, not in the app.';

  @override
  String get exploreHousing => 'Rental checker';

  @override
  String get housingTitle => 'Rental checker';

  @override
  String get housingIntro =>
      'Paste the rental listing or contract text to highlight key terms, red flags and questions to ask.';

  @override
  String get housingConsentNeeded =>
      'The rental check needs your consent to \"housing analysis\". The text is not saved.';

  @override
  String get housingConsentGranted => 'Consent granted. Tap \"Check\" again.';

  @override
  String get housingTextLabel => 'Listing or contract text';

  @override
  String get housingTextHint => 'Paste the text here (at least 20 characters)';

  @override
  String get housingTextTooShort =>
      'The text is too short. Paste at least 20 characters.';

  @override
  String get housingExtraTitle => 'Extra costs you know (optional)';

  @override
  String get housingRent => 'Monthly rent';

  @override
  String get housingUtilities => 'Utilities (monthly)';

  @override
  String get housingCondo => 'Condo fees (monthly)';

  @override
  String get housingInternet => 'Internet (monthly)';

  @override
  String get housingExplain => 'Add an AI explanation';

  @override
  String get housingSend => 'Check';

  @override
  String housingQuotaLeft(String n) {
    return 'Checks left: $n';
  }

  @override
  String get housingQuotaReached =>
      'You have reached your rental-check limit. Try again later or check your plan.';

  @override
  String housingConfidence(String level) {
    return 'Analysis confidence: $level';
  }

  @override
  String get housingFacts => 'What we found in the text';

  @override
  String housingFactRent(String v) {
    return 'Monthly rent: $v';
  }

  @override
  String housingFactDeposit(String v) {
    return 'Deposit: $v';
  }

  @override
  String housingFactDepositMonths(String v) {
    return 'Deposit: $v month(s)';
  }

  @override
  String get housingFactUtilitiesIncluded => 'Utilities: included';

  @override
  String get housingFactUtilitiesExcluded => 'Utilities: not included';

  @override
  String housingFactExpenses(String v) {
    return 'Monthly expenses: $v';
  }

  @override
  String get housingRedFlags => 'Possible red flags';

  @override
  String get housingNoRedFlags =>
      'We found no clear red flags in the text, which does not mean the contract is sound.';

  @override
  String get housingSevWarning => 'Warning';

  @override
  String get housingSevCaution => 'Caution';

  @override
  String get housingSevInfo => 'Info';

  @override
  String get housingOneDeposit => 'Deposit';

  @override
  String get housingOneAgencyFee => 'Agency fee';

  @override
  String get housingBasisGeneral => 'General guidance';

  @override
  String get housingBasisSourced => 'Based on a source';

  @override
  String get housingQuestions => 'Questions to ask the landlord';

  @override
  String get housingCouldNotDetect => 'Things we could not detect';

  @override
  String get housingCost => 'Estimated monthly cost';

  @override
  String housingCostTotal(String v) {
    return 'Approximate total: $v per month';
  }

  @override
  String get housingCostUnknown =>
      'A reliable total cannot be computed from the available information.';

  @override
  String get housingCompRent => 'Rent';

  @override
  String get housingCompUtilities => 'Utilities';

  @override
  String get housingCompCondo => 'Condo fees';

  @override
  String get housingCompInternet => 'Internet';

  @override
  String get housingSourceUser => 'you entered';

  @override
  String get housingSourceText => 'from the text';

  @override
  String get housingAssumptions => 'Assumptions behind the estimate';

  @override
  String get housingOneTime => 'One-time costs';

  @override
  String get housingNotes => 'Notes';

  @override
  String get housingAiExplanation => 'AI explanation';

  @override
  String get housingDisclaimerTitle => 'Disclaimer';

  @override
  String get housingFallbackDisclaimer =>
      'This is general guidance, not legal advice. Ask a lawyer or qualified body before signing.';

  @override
  String get housingAnother => 'Check another text';

  @override
  String get legalTitle => 'Legal documents';

  @override
  String get legalPrivacy => 'Privacy policy';

  @override
  String get legalTerms => 'Terms of use';

  @override
  String get legalCookies => 'Cookie policy';

  @override
  String get legalNotPublished =>
      'This document has not been published yet. It will appear here once it is officially published.';

  @override
  String legalVersion(String v, String date) {
    return 'Version $v, published $date';
  }

  @override
  String legalVersionOnly(String v) {
    return 'Version $v';
  }

  @override
  String get legalRead => 'Read';

  @override
  String get legalReadTerms => 'Read the terms of use';

  @override
  String get legalReadPrivacy => 'Read the privacy policy';

  @override
  String get patenteWeakTitle => 'My weak topics';

  @override
  String patenteWeakIntro(String threshold, String min) {
    return 'Topics where your accuracy is below $threshold% after at least $min answers.';
  }

  @override
  String get patenteWeakNone =>
      'No weak topics yet. Answer more questions so the analysis can appear.';

  @override
  String get patenteWeakList => 'Topics to review';

  @override
  String get patenteUntouched => 'Topics you have not tried yet';

  @override
  String patenteRecommended(String t) {
    return 'Suggested topic to start with: $t';
  }

  @override
  String patenteTopicAccuracy(String acc, String correct, String answered) {
    return 'Accuracy $acc% ($correct of $answered)';
  }

  @override
  String get patentePracticeTopic => 'Practise this topic';

  @override
  String get patentePracticeAllWeak => 'Practise all weak topics';

  @override
  String get patenteNoWeakToPractice =>
      'There are no weak topics to practise yet.';

  @override
  String get patenteNotEnoughQuestions =>
      'There are not enough questions for this session yet.';

  @override
  String get patenteWeakOpen => 'Weak-topic analysis';

  @override
  String get patenteGlossaryOpen => 'Driving glossary (Italian to Arabic)';

  @override
  String get patenteGlossaryTitle => 'Patente glossary';

  @override
  String get patenteGlossaryEmpty => 'No glossary terms are published yet.';

  @override
  String get patenteCheck => 'Check my answer';

  @override
  String get patenteCheckPick => 'Choose true or false first.';

  @override
  String get patenteFeedbackCorrect => 'Correct';

  @override
  String patenteFeedbackWrong(String a) {
    return 'Not correct. The right answer: $a';
  }

  @override
  String get patenteExplanationIt => 'Explanation in Italian';

  @override
  String get patenteExplanationAr => 'Explanation in Arabic';

  @override
  String get patenteExplanationEn => 'Explanation in English';

  @override
  String get practiceTitle => 'Italian practice';

  @override
  String get practiceOpen => 'Practice: vocabulary, exercises, review';

  @override
  String get practiceNotReviewed =>
      'This content has not been reviewed by a teacher yet. It may contain mistakes.';

  @override
  String get practiceReviewed => 'Reviewed by a teacher';

  @override
  String practiceReviewedOn(String date) {
    return 'Reviewed by a teacher on $date';
  }

  @override
  String practiceDue(String n) {
    return 'Cards due now: $n';
  }

  @override
  String practiceMastered(String n) {
    return 'Mastered cards: $n';
  }

  @override
  String practiceLearning(String n) {
    return 'Cards in learning: $n';
  }

  @override
  String practiceAccuracy(String n) {
    return 'Accuracy: $n%';
  }

  @override
  String practiceAttempts(String n) {
    return 'Exercise attempts: $n';
  }

  @override
  String get practiceReviewCards => 'Review cards (spaced repetition)';

  @override
  String get practiceVocabulary => 'Vocabulary';

  @override
  String get practiceExercises => 'Exercises';

  @override
  String get practiceScenarios => 'Real-life scenarios';

  @override
  String get vocabEmpty => 'No vocabulary is published yet.';

  @override
  String get exercisesEmpty => 'No exercises are published yet.';

  @override
  String get scenariosEmpty => 'No scenarios are available yet.';

  @override
  String scenarioCounts(String lessons, String vocab, String exercises) {
    return 'Lessons: $lessons · Vocabulary: $vocab · Exercises: $exercises';
  }

  @override
  String get scenarioLessons => 'Lessons for this scenario';

  @override
  String get vocabExample => 'Example';

  @override
  String vocabBox(String n) {
    return 'Memory box: $n';
  }

  @override
  String get vocabAudioNote =>
      'A recording exists for this word, but playback is not available in this app version.';

  @override
  String get reviewTitle => 'Card review';

  @override
  String get reviewEmpty => 'No cards to review right now. Come back later.';

  @override
  String get reviewShow => 'Show meaning';

  @override
  String get reviewKnew => 'I knew it';

  @override
  String get reviewNotYet => 'Not yet';

  @override
  String get reviewNew => 'New word';

  @override
  String reviewProgress(String i, String n) {
    return 'Card $i of $n';
  }

  @override
  String reviewDone(String n) {
    return 'Well done! You finished today\'s review: $n cards.';
  }

  @override
  String get reviewSaveFailed => 'Your answer could not be saved. Try again.';

  @override
  String get exTypeAll => 'All types';

  @override
  String get exTypeMultiple => 'Multiple choice';

  @override
  String get exTypeListening => 'Listening';

  @override
  String get exTypeFill => 'Fill in the blank';

  @override
  String get exTypeMatch => 'Match';

  @override
  String get exCheck => 'Check my answer';

  @override
  String get exCorrect => 'Correct';

  @override
  String get exWrong => 'Not correct';

  @override
  String exCorrectAnswer(String a) {
    return 'Correct answer: $a';
  }

  @override
  String get exAnswerHint => 'Type the missing word';

  @override
  String get exMatchChoose => 'Choose';

  @override
  String get exMatchAll => 'Match every item before checking.';

  @override
  String get exNoAudio =>
      'There is no recording for this exercise yet. Read the choices yourself.';

  @override
  String get exAudioUnsupported =>
      'The recording cannot be played in this app version. Read the choices yourself.';

  @override
  String get exTryAnother => 'Another exercise';

  @override
  String get exChooseOne => 'Choose an answer first.';

  @override
  String get exTypeFirst => 'Type your answer first.';

  @override
  String get provTitle => 'Provider portal';

  @override
  String get provBecome => 'Become a provider';

  @override
  String get provApplyTitle => 'Apply as a provider';

  @override
  String get provApplyIntro =>
      'Create your listing. It stays a private draft until the EXPA team reviews and publishes it.';

  @override
  String get provApplyNotice =>
      'Publication is not an endorsement or guarantee by EXPA. A verified badge appears only after documents are reviewed.';

  @override
  String get provApply => 'Apply';

  @override
  String get provExists => 'You already have a provider listing.';

  @override
  String get provRequiredFields => 'Name, category and headline are required.';

  @override
  String get provDisplayName => 'Display name';

  @override
  String get provCategory => 'Category';

  @override
  String get provHeadline => 'Headline';

  @override
  String get provLanguageNote =>
      'Saved in the current app language. Switch language to add another translation.';

  @override
  String get provDescription => 'Description';

  @override
  String get provContactEmail => 'Contact e-mail';

  @override
  String get provContactPhone => 'Contact phone';

  @override
  String get provWebsite => 'Website';

  @override
  String get provServesOnline => 'Serves online';

  @override
  String get provTabProfile => 'Profile';

  @override
  String get provTabVerification => 'Verification';

  @override
  String get provTabLeads => 'Requests';

  @override
  String get provTabReviews => 'Reviews';

  @override
  String get provStatusDraft => 'Draft';

  @override
  String get provStatusReview => 'In review';

  @override
  String get provStatusApproved => 'Approved';

  @override
  String get provStatusPublished => 'Published';

  @override
  String get provStatusArchived => 'Archived';

  @override
  String get provVerified => 'Verified';

  @override
  String get provVerifPending => 'Verification pending';

  @override
  String get provVerifRejected => 'Verification rejected';

  @override
  String get provVerifExpired => 'Verification expired';

  @override
  String get provVerifNone => 'Not verified';

  @override
  String get provPendingChanges => 'Changes awaiting approval';

  @override
  String get provPublishedEditNote =>
      'The listing is live: your edits appear after an admin approves them; the current version stays unchanged.';

  @override
  String get provProblems => 'Missing before submitting';

  @override
  String get provListingIncomplete =>
      'The listing is not complete yet. Complete it and try again.';

  @override
  String get provSave => 'Save changes';

  @override
  String get provSaved => 'Saved.';

  @override
  String get provSavedPendingApproval => 'Your changes were sent for approval.';

  @override
  String get provSubmit => 'Submit for review';

  @override
  String get provSubmitted => 'Submitted for review.';

  @override
  String get provServicesWebOnly =>
      'Editing services and areas is available on the website only for now.';

  @override
  String get provVerifIntro =>
      'Upload documents that prove your business. Only the EXPA team reviews them; users never see them.';

  @override
  String get provEvidenceNote =>
      'Documents are stored encrypted and read through the admin panel only. Upload only what is needed.';

  @override
  String get provEvidenceTitle => 'Verification documents';

  @override
  String get provEvidenceNone => 'No documents uploaded yet.';

  @override
  String get provEvidenceAdd => 'Add a photo from the gallery';

  @override
  String get provEvidenceDelete => 'Delete document';

  @override
  String get provEvidenceUploaded => 'Document uploaded.';

  @override
  String get provEvidencePdfWeb =>
      'PDF files are uploaded on the website. Maximum 5 files.';

  @override
  String get provVerifRequest => 'Request verification';

  @override
  String get provVerifRequested => 'Verification requested.';

  @override
  String get provLeadsPrivacy =>
      'The contact details here were given by the user, with consent, for this request only. Use them only to reply.';

  @override
  String get provLeadsEmpty => 'No requests yet.';

  @override
  String get provLeadNew => 'New';

  @override
  String get provLeadSeen => 'Seen';

  @override
  String get provLeadClosed => 'Closed';

  @override
  String get provLeadMarkSeen => 'Mark as seen';

  @override
  String get provLeadClose => 'Close request';

  @override
  String get provReviewsEmpty => 'No approved reviews yet.';

  @override
  String get provReply => 'Reply';

  @override
  String get provReplyEdit => 'Edit reply';

  @override
  String get provReplyTitle => 'Reply to review';

  @override
  String get provReplyNote => 'Your reply appears after an admin approves it.';

  @override
  String get provReplySend => 'Send reply';

  @override
  String get provReplySent => 'Reply sent for review.';

  @override
  String get provReplyPending => 'Reply awaiting approval';

  @override
  String get provReplyPublished => 'Reply published';

  @override
  String get scannerOcrFallback =>
      'The server could not read the text from the photo. Paste the letter\'s text here instead.';

  @override
  String get scannerConsentNeeded =>
      'Explaining documents needs your consent to \"document analysis\". The document is not stored.';

  @override
  String get scannerConsentGranted =>
      'Consent granted. Tap \"Send for explanation\" again.';

  @override
  String get scannerQuotaReached =>
      'You have reached your limit for document explanations. Try again later or check your plan.';

  @override
  String scannerQuotaLeft(String n) {
    return 'Explanations left: $n';
  }

  @override
  String get scannerFileTypeNotAllowed =>
      'This file type is not allowed. Use a JPG or PNG photo or a PDF.';

  @override
  String get scannerFileTooLarge =>
      'The image is too large. Take a smaller photo or paste the text.';

  @override
  String get scannerPdfTooLong => 'The PDF has too many pages.';

  @override
  String get scannerFileRejected =>
      'The file could not be accepted. Try another file or paste the text.';

  @override
  String get scannerUnavailableLater =>
      'File checking is temporarily unavailable and nothing was stored. Try again later.';

  @override
  String get scannerDateNotClear => 'Date not clear';

  @override
  String get scannerYearMissing => 'The year is not stated in the document';

  @override
  String get scannerDatePast => 'This date has passed';

  @override
  String scannerConfidence(String level) {
    return 'Confidence: $level';
  }

  @override
  String get confLow => 'low';

  @override
  String get confMedium => 'medium';

  @override
  String get confHigh => 'high';

  @override
  String get scannerDegraded =>
      'The AI could not be fully used, so this explanation is simplified.';

  @override
  String get scannerCheckDates =>
      'Always check the dates on the original document.';

  @override
  String get recoTitle => 'Recommended for you';

  @override
  String get recoGuides => 'Guides';

  @override
  String get recoLessons => 'Lessons';

  @override
  String get recoServices => 'Services';

  @override
  String get recoReminders => 'Reminders';

  @override
  String get recoWhy => 'Why';

  @override
  String get recoThirdParty => 'Third-party service, not guaranteed by EXPA';

  @override
  String get recoPersonalized =>
      'These suggestions use your profile and goals, with your consent.';

  @override
  String get recoNotPersonalized =>
      'General suggestions only, because personalization is off. Turn on the personalization consent for better suggestions.';

  @override
  String get recoManageConsent => 'Manage consents';

  @override
  String get recoEmpty =>
      'No suggestions right now. Complete your profile or add your documents.';

  @override
  String get netTitle => 'Net salary estimator';

  @override
  String get netIntro =>
      'Estimate net pay from the gross annual salary. It is approximate and nothing is stored.';

  @override
  String get netGross => 'Gross annual salary (RAL)';

  @override
  String get netInvalid => 'Enter a valid number between 0 and 10,000,000.';

  @override
  String get netMonths => 'Salaries per year';

  @override
  String get netCalculate => 'Calculate';

  @override
  String get netUnavailableTitle => 'Estimate not available';

  @override
  String get netUnavailable =>
      'No verified tax tables have been published yet, and EXPA does not guess figures.';

  @override
  String get netMonthly => 'Estimated monthly net';

  @override
  String get netAnnual => 'Annual net';

  @override
  String get netGrossLine => 'Annual gross';

  @override
  String get netContributions => 'Contributions';

  @override
  String get netDeduction => 'Flat deduction';

  @override
  String get netTaxable => 'Taxable income';

  @override
  String get netIncomeTax => 'Income tax';

  @override
  String netTable(String name, String year) {
    return 'Table used: $name ($year)';
  }

  @override
  String get netDisclaimer =>
      'An estimate for orientation only, not a payslip or tax advice. Ask a commercialista, CAF or Patronato.';

  @override
  String get travelTitle => 'Travel requirements';

  @override
  String get travelIntro =>
      'Look up the verified requirements for travelling between two countries for your nationality.';

  @override
  String get travelPrivacy =>
      'Only the two countries are sent for the lookup; they are not stored or read from your profile.';

  @override
  String get travelNationality => 'Nationality (2-letter code)';

  @override
  String get travelDestination => 'Destination (2-letter code)';

  @override
  String get travelCodeHelp => 'ISO code such as EG or IT';

  @override
  String get travelCodeInvalid => 'Enter two Latin letters.';

  @override
  String get travelSearch => 'Search';

  @override
  String get travelNoneTitle => 'No verified information';

  @override
  String get travelNone =>
      'We have no verified information for this case. This does not mean travel is allowed: check the official source.';

  @override
  String get travelDisclaimer =>
      'General information that may change. Always check the official source before travelling.';

  @override
  String get scannerRedactTitle => 'The text may contain sensitive data';

  @override
  String get scannerRedactBody =>
      'We found something that looks like an IBAN, tax code, e-mail or long number. You can delete it in the field before sending; the explanation usually does not need it.';

  @override
  String get scannerRedactGeneral =>
      'Tip: remove account numbers and unneeded personal data before sending.';

  @override
  String get notificationsDelete => 'Delete notification';

  @override
  String get notificationsSettings => 'Notification settings';

  @override
  String get patenteTeacherTitle => 'AI Patente teacher';

  @override
  String get patenteTeacherIntro =>
      'Ask for a simple explanation of this topic. The answer is grounded in published content, with sources.';

  @override
  String get patenteTeacherAsk => 'Explain this topic to me';

  @override
  String patenteTeacherPrompt(String title) {
    return 'Explain this driving-licence topic simply: $title';
  }

  @override
  String get patenteTeacherOffline =>
      'You are offline: the teacher needs internet.';

  @override
  String get tfChallengeTitle => 'Two-step verification';

  @override
  String get tfChallengeSubtitle =>
      'Enter the 6-digit code from your authenticator app.';

  @override
  String get tfCodeLabel => 'Verification code';

  @override
  String get tfCodeInvalid => 'Enter a 6-digit code.';

  @override
  String get tfVerify => 'Verify';

  @override
  String get tfUseRecovery => 'Use a recovery code';

  @override
  String get tfUseApp => 'Use the authenticator code';

  @override
  String get tfRecoveryLabel => 'Recovery code';

  @override
  String get tfRecoveryHint => 'Format xxxxx-xxxxx; it works only once.';

  @override
  String get tfBackToLogin => 'Back to sign in';

  @override
  String get tfChallengeExpired =>
      'This verification step has expired. Please sign in again.';

  @override
  String get tfInvalidCode =>
      'The code is incorrect or was already used. Try again.';

  @override
  String get tfTooManyAttempts =>
      'Too many attempts. Wait a while and try again.';

  @override
  String get tfSetupRequired =>
      'Your account must use two-step verification. Open Profile, then Security, to turn it on.';

  @override
  String get tfSecurityTitle => 'Security';

  @override
  String get tfSecuritySubtitle => 'Two-step verification and recovery codes';

  @override
  String get tfStatusOn => 'Two-step verification is on';

  @override
  String get tfStatusOff => 'Two-step verification is off';

  @override
  String get tfIntro =>
      'Adds a code from an authenticator app when you sign in, to protect your account.';

  @override
  String tfRecoveryRemaining(String n) {
    return 'Recovery codes left: $n';
  }

  @override
  String get tfRequiredNotice =>
      'This account is required to use two-step verification.';

  @override
  String get tfEnable => 'Turn on two-step verification';

  @override
  String get tfSetupStep1 =>
      '1. Add this key to your authenticator app (scan the code or copy the key).';

  @override
  String get tfSetupStep2 => '2. Enter the 6-digit code shown in the app.';

  @override
  String get tfQrLabel => 'QR code to set up your authenticator app';

  @override
  String get tfSecretLabel => 'Setup key';

  @override
  String get tfCopy => 'Copy';

  @override
  String get tfCopySecret => 'Copy key';

  @override
  String get tfCopyUri => 'Copy otpauth link';

  @override
  String get tfCopied => 'Copied.';

  @override
  String get tfConfirm => 'Confirm and turn on';

  @override
  String get tfCancelSetup => 'Cancel setup';

  @override
  String get tfCodesTitle => 'Recovery codes';

  @override
  String get tfCodesWarning =>
      'Save these codes now in a safe place. They will not be shown again, and each works only once if you lose your phone.';

  @override
  String get tfCopyCodes => 'Copy all codes';

  @override
  String get tfCodesSaved => 'I have saved them';

  @override
  String get tfDisable => 'Turn off two-step verification';

  @override
  String get tfRegenerate => 'Generate new recovery codes';

  @override
  String get tfRegenerateHint => 'New codes replace the old ones.';

  @override
  String get tfConfirmIdentity => 'Confirm it is you';

  @override
  String get tfPasswordWrong => 'The password is incorrect.';

  @override
  String get tfDisabledDone => 'Two-step verification is off.';

  @override
  String get tfAlreadyEnabled => 'Two-step verification is already on.';

  @override
  String get tfLoadFailed => 'Could not load the security status.';

  @override
  String get patenteExplainQuestion => 'Explain this question';

  @override
  String patenteQuestionPrompt(String statement) {
    return 'Explain this driving-licence question simply: $statement';
  }
}
