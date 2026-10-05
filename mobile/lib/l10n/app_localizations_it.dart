// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Italian (`it`).
class AppL10nIt extends AppL10n {
  AppL10nIt([String locale = 'it']) : super(locale);

  @override
  String get appName => 'EXPA';

  @override
  String get appTagline => 'Il tuo assistente per vivere in Italia';

  @override
  String get tabHome => 'Home';

  @override
  String get tabExplore => 'Esplora';

  @override
  String get tabAsk => 'Chiedi a EXPA';

  @override
  String get tabTasks => 'Attività';

  @override
  String get tabProfile => 'Profilo';

  @override
  String get retry => 'Riprova';

  @override
  String get cancel => 'Annulla';

  @override
  String get save => 'Salva';

  @override
  String get close => 'Chiudi';

  @override
  String get loading => 'Caricamento…';

  @override
  String get errorGeneric => 'Qualcosa è andato storto. Riprova.';

  @override
  String get errorNetwork =>
      'Nessuna connessione a Internet. Controlla la rete e riprova.';

  @override
  String get errorTimeout => 'La richiesta ha impiegato troppo tempo. Riprova.';

  @override
  String get errorServer =>
      'Servizio temporaneamente non disponibile. Riprova più tardi.';

  @override
  String get errorForbidden => 'Non hai i permessi per questa azione.';

  @override
  String get errorNotFound => 'Non abbiamo trovato ciò che cerchi.';

  @override
  String get errorRateLimited =>
      'Troppe richieste. Attendi un momento e riprova.';

  @override
  String get errorValidation => 'Controlla i dati inseriti.';

  @override
  String get emptyList => 'Niente da mostrare.';

  @override
  String get loadMore => 'Mostra altro';

  @override
  String get openOfficialSite => 'Apri il sito ufficiale';

  @override
  String get linkUnsafe => 'Link bloccato perché non sicuro.';

  @override
  String get linkOpenFailed => 'Impossibile aprire il link.';

  @override
  String get optional => 'Facoltativo';

  @override
  String get skip => 'Salta';

  @override
  String get next => 'Avanti';

  @override
  String get delete => 'Elimina';

  @override
  String get saved => 'Salvato.';

  @override
  String get sessionExpired => 'Sessione scaduta. Accedi di nuovo.';

  @override
  String get consentRequired =>
      'Questa azione richiede il tuo consenso. Puoi darlo nelle impostazioni sulla privacy.';

  @override
  String get grantConsent => 'Concedi il consenso';

  @override
  String get loginTitle => 'Accedi';

  @override
  String get loginSubtitle => 'Bentornato su EXPA';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get confirmPassword => 'Conferma password';

  @override
  String get name => 'Nome';

  @override
  String get loginButton => 'Accedi';

  @override
  String get registerButton => 'Crea account';

  @override
  String get registerTitle => 'Crea il tuo account';

  @override
  String get forgotLink => 'Password dimenticata?';

  @override
  String get noAccount => 'Non hai un account? Registrati';

  @override
  String get haveAccount => 'Hai già un account? Accedi';

  @override
  String get acceptTerms => 'Accetto i termini d\'uso';

  @override
  String get acceptPrivacy => 'Ho letto e accetto l\'informativa sulla privacy';

  @override
  String get passwordHint => 'Almeno 10 caratteri, con lettere e numeri';

  @override
  String get invalidCredentials => 'Email o password non corrette.';

  @override
  String get fieldRequired => 'Campo obbligatorio.';

  @override
  String get invalidEmail => 'Inserisci un indirizzo email valido.';

  @override
  String get passwordsMismatch => 'Le password non coincidono.';

  @override
  String get passwordTooShort => 'La password è troppo corta.';

  @override
  String get mustAcceptBoth =>
      'Devi accettare i termini e l\'informativa sulla privacy.';

  @override
  String get forgotTitle => 'Recupera la password';

  @override
  String get forgotBody =>
      'Inserisci la tua email: se l\'account esiste, riceverai un link di recupero.';

  @override
  String get sendResetLink => 'Invia il link';

  @override
  String get resetSent =>
      'Se l\'account esiste, ti abbiamo inviato un link di recupero.';

  @override
  String get verifyTitle => 'Controlla la tua email';

  @override
  String get verifyBody =>
      'Abbiamo inviato un link di verifica alla tua email. Aprilo e torna nell\'app. Alcune funzioni, come Chiedi a EXPA, richiedono un\'email verificata.';

  @override
  String get verifyBanner => 'La tua email non è ancora verificata.';

  @override
  String get resendVerification => 'Reinvia l\'email di verifica';

  @override
  String get verificationSent => 'Email di verifica inviata.';

  @override
  String get verifiedCheck => 'Ho verificato l\'email';

  @override
  String get continueToApp => 'Continua nell\'app';

  @override
  String get logout => 'Esci';

  @override
  String get accountSuspended => 'Questo account è sospeso.';

  @override
  String get language => 'Lingua';

  @override
  String get langAr => 'العربية';

  @override
  String get langEn => 'English';

  @override
  String get langIt => 'Italiano';

  @override
  String homeGreeting(String name) {
    return 'Ciao $name';
  }

  @override
  String get scoreTitle => 'Punteggio EXPA';

  @override
  String get scoreHow => 'Come viene calcolato?';

  @override
  String get scoreUnavailable =>
      'Non ci sono ancora dati sufficienti per calcolare il punteggio.';

  @override
  String scoreSemantics(String percent) {
    return 'Punteggio EXPA $percent per cento';
  }

  @override
  String get nextActions => 'Cosa devo fare adesso?';

  @override
  String get nextActionsEmpty => 'Nessuna azione suggerita al momento.';

  @override
  String get personalizationOff =>
      'La personalizzazione è disattivata. Attivala nella privacy per suggerimenti su misura.';

  @override
  String get onboardingContinue => 'Completa il tuo profilo';

  @override
  String get tasksTitle => 'Attività di inserimento';

  @override
  String get taskMarkDone => 'Fatto';

  @override
  String get taskReopen => 'Riapri';

  @override
  String get taskDismiss => 'Non mi riguarda';

  @override
  String get taskDone => 'Completata';

  @override
  String get tasksDocuments => 'I miei documenti';

  @override
  String get guidesTitle => 'Guide';

  @override
  String get searchHint => 'Cerca…';

  @override
  String get allCategories => 'Tutte';

  @override
  String get sourceLabel => 'Fonte';

  @override
  String get sourceOfficial => 'Ufficiale';

  @override
  String get sourceInstitutional => 'Istituzionale';

  @override
  String get sourceVerifiedPartner => 'Partner verificato';

  @override
  String get sourceThirdParty => 'Terze parti';

  @override
  String lastVerified(String date) {
    return 'Ultima verifica: $date';
  }

  @override
  String get neverVerified => 'Non ancora verificato';

  @override
  String get freshFresh => 'Aggiornato';

  @override
  String get freshStale => 'Potrebbe essere datato';

  @override
  String get freshOutdated => 'Obsoleto: controlla il sito ufficiale';

  @override
  String get freshUnverified => 'Non verificato';

  @override
  String get fallbackLocale =>
      'Questo contenuto non è disponibile nella tua lingua ed è mostrato in un\'altra.';

  @override
  String get secWhatIs => 'Che cos\'è?';

  @override
  String get secWhoNeeds => 'Chi ne ha bisogno?';

  @override
  String get secDocuments => 'Documenti richiesti';

  @override
  String get secSteps => 'Passaggi';

  @override
  String get secWhere => 'Dove presentare la domanda';

  @override
  String get secBook => 'Come prenotare';

  @override
  String get secCosts => 'Costi';

  @override
  String get secTime => 'Tempi di elaborazione';

  @override
  String get verifyOfficialNotice =>
      'Informazioni generali di orientamento. Verifica sempre la fonte ufficiale prima di decidere.';

  @override
  String get documentsTitle => 'I miei documenti';

  @override
  String get addDocument => 'Aggiungi documento';

  @override
  String get docType => 'Tipo di documento';

  @override
  String get docLabel => 'Etichetta (facoltativa)';

  @override
  String get issueDate => 'Data di rilascio';

  @override
  String get expiryDate => 'Data di scadenza';

  @override
  String get notes => 'Note';

  @override
  String get remindersEnabled => 'Ricordami prima della scadenza';

  @override
  String get noExpiry => 'Nessuna scadenza';

  @override
  String daysRemaining(String n) {
    return '$n giorni rimasti';
  }

  @override
  String expiredDaysAgo(String n) {
    return 'Scaduto da $n giorni';
  }

  @override
  String get statusValid => 'Valido';

  @override
  String get statusExpiringSoon => 'In scadenza';

  @override
  String get statusExpired => 'Scaduto';

  @override
  String get statusNoExpiry => 'Senza scadenza';

  @override
  String get pickDate => 'Scegli la data';

  @override
  String get clearDate => 'Cancella';

  @override
  String get docsEmpty =>
      'Non hai ancora aggiunto documenti. Aggiungi passaporto o permesso di soggiorno e ti avviseremo prima della scadenza.';

  @override
  String get deleteDocConfirm => 'Eliminare questo documento?';

  @override
  String get consentNeededDocs =>
      'Per salvare i documenti serve il tuo consenso alla conservazione.';

  @override
  String get docAttachmentsNote =>
      'Gli allegati sono disponibili sul sito. Questa versione gestisce solo le date.';

  @override
  String get askTitle => 'Chiedi a EXPA';

  @override
  String get askHint => 'Scrivi la tua domanda in arabo, inglese o italiano';

  @override
  String get askSend => 'Invia';

  @override
  String get askIntro =>
      'Chiedimi di permesso di soggiorno, documenti e servizi pubblici. Rispondo da fonti verificate e te le mostro.';

  @override
  String askUsage(String n) {
    return 'Rimaste oggi: $n';
  }

  @override
  String askResets(String date) {
    return 'Il limite si azzera il $date';
  }

  @override
  String get askLimitReached =>
      'Hai raggiunto il limite giornaliero di domande.';

  @override
  String get askVerifyEmail => 'Verifica la tua email per usare Chiedi a EXPA.';

  @override
  String get askFailed =>
      'Non sono riuscito a elaborare la richiesta. Riprova.';

  @override
  String get askDegraded =>
      'L\'IA non è disponibile ora. Questa è una risposta limitata: consulta le guide per informazioni verificate.';

  @override
  String get askBrowseGuides => 'Sfoglia le guide';

  @override
  String get askSourcesTitle => 'Fonti';

  @override
  String get askNoSources => 'Nessuna fonte verificata per questa risposta.';

  @override
  String get askNoticeTitle => 'Avviso';

  @override
  String get askYou => 'Tu';

  @override
  String get askAssistant => 'EXPA';

  @override
  String get askSuggested => 'Azioni suggerite';

  @override
  String get askLabelOfficial => 'Informazione ufficiale';

  @override
  String get askLabelGeneral => 'Orientamento generale';

  @override
  String get askLabelAi => 'Spiegazione dell\'IA';

  @override
  String get askLabelThird => 'Servizio o fonte di terzi';

  @override
  String get learnTitle => 'Impara l\'italiano';

  @override
  String get dailyTitle => 'Italiano in 10 minuti al giorno';

  @override
  String get dailyDone => 'Fatto oggi';

  @override
  String minutes(String n) {
    return '$n min';
  }

  @override
  String streak(String n) {
    return 'Giorni consecutivi: $n';
  }

  @override
  String get lessonsTitle => 'Lezioni';

  @override
  String get lessonStart => 'Inizia la lezione';

  @override
  String get lessonComplete => 'Segna come completata';

  @override
  String get lessonCompleted => 'Completata';

  @override
  String get lessonsEmpty => 'Nessuna lezione disponibile.';

  @override
  String get jobsTitle => 'Lavoro';

  @override
  String matchScore(String n) {
    return 'Compatibilità: $n%';
  }

  @override
  String get matchUnknown => 'Dati insufficienti per il confronto';

  @override
  String get matchReasons => 'Perché questo punteggio?';

  @override
  String get reasonMatch => 'Corrisponde';

  @override
  String get reasonPartial => 'Corrisponde in parte';

  @override
  String get reasonMismatch => 'Non corrisponde';

  @override
  String get reasonUnknown => 'Sconosciuto (non penalizza)';

  @override
  String get applyOriginal => 'Candidati sul sito originale';

  @override
  String get applyNotice =>
      'EXPA non invia candidature. Andrai alla pagina originale di candidatura.';

  @override
  String get visaStated => 'La fonte indica sponsorizzazione del visto';

  @override
  String get visaNotStated => 'Sponsorizzazione del visto non indicata';

  @override
  String get jobsEmpty => 'Nessun lavoro corrispondente al momento.';

  @override
  String jobSource(String name) {
    return 'Fonte: $name';
  }

  @override
  String get jobsSignInForMatch =>
      'Accedi e completa il profilo per vedere la compatibilità.';

  @override
  String get notificationsTitle => 'Notifiche';

  @override
  String get markAllRead => 'Segna tutto come letto';

  @override
  String get notificationsEmpty => 'Nessuna notifica.';

  @override
  String get apptTitle => 'Appuntamenti';

  @override
  String get apptNotice =>
      'EXPA non prenota per te. Ti indichiamo l\'ente ufficiale per completare la prenotazione.';

  @override
  String get apptOfficeType => 'Tipo di ufficio';

  @override
  String get apptCity => 'Città';

  @override
  String get apptSearch => 'Mostra uffici';

  @override
  String get apptGoOfficial => 'Vai alla pagina ufficiale di prenotazione';

  @override
  String get apptNoUrl =>
      'Nessun link ufficiale di prenotazione. Controlla il sito ufficiale dell\'ufficio.';

  @override
  String get apptEmpty => 'Nessun ufficio registrato per questa città.';

  @override
  String get exploreTitle => 'Esplora';

  @override
  String get exploreGuides => 'Guide e documenti';

  @override
  String get exploreLearn => 'Impara l\'italiano';

  @override
  String get exploreJobs => 'Lavoro';

  @override
  String get exploreAppointments => 'Appuntamenti';

  @override
  String get exploreMyDocs => 'I miei documenti e scadenze';

  @override
  String get exploreNotifications => 'Notifiche';

  @override
  String get profileTitle => 'Profilo';

  @override
  String get profilePrivacy => 'Privacy e consensi';

  @override
  String get profileOnboarding => 'I miei dati';

  @override
  String get pushNote =>
      'Le notifiche push non sono attive in questa versione.';

  @override
  String get privacyTitle => 'Privacy';

  @override
  String get consentsTitle => 'I tuoi consensi';

  @override
  String get consentRequiredBadge => 'Obbligatorio';

  @override
  String get consentsHint =>
      'Puoi modificare i consensi facoltativi in qualsiasi momento.';

  @override
  String get exportTitle => 'Esporta i miei dati';

  @override
  String get exportBody =>
      'Richiedi una copia dei tuoi dati personali. Limite: 5 richieste all\'ora.';

  @override
  String get exportRequest => 'Richiedi l\'esportazione';

  @override
  String exportDone(String n) {
    return 'I tuoi dati sono pronti ($n sezioni). Non sono stati salvati sul dispositivo.';
  }

  @override
  String get deleteAccountTitle => 'Elimina account';

  @override
  String get deleteAccountBody =>
      'L\'eliminazione è definitiva. L\'accesso si interrompe subito e la cancellazione si completa dopo. Inserisci la password per confermare.';

  @override
  String get deleteAccountConfirm => 'Richiedi eliminazione account';

  @override
  String get deleteRequested => 'Richiesta di eliminazione inviata.';

  @override
  String get onboardingTitle => 'La tua situazione in Italia';

  @override
  String get onboardingIntro =>
      'Raccogliamo solo ciò che serve alla personalizzazione. Puoi saltare le domande facoltative.';

  @override
  String get fieldSegment => 'Situazione attuale';

  @override
  String get fieldNationality => 'Nazionalità (codice a 2 lettere, es. EG)';

  @override
  String get fieldCity => 'Città';

  @override
  String get fieldResidence => 'Tipo di soggiorno';

  @override
  String get fieldItalian => 'Livello di italiano';

  @override
  String get fieldEnglish => 'Livello di inglese';

  @override
  String get fieldGoals => 'I tuoi obiettivi';

  @override
  String get fieldAge => 'Fascia d\'età';

  @override
  String get notSelected => 'Non impostato';

  @override
  String get completeOnboarding => 'Fine';

  @override
  String get onboardingSegmentRequired =>
      'Scegli la tua situazione per terminare.';
}
