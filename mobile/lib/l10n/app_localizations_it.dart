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

  @override
  String get offlineBanner =>
      'Sei offline. Vengono mostrati solo i dati salvati sul dispositivo.';

  @override
  String get apptGuidesTitle => 'Guide alla prenotazione';

  @override
  String get apptNotBookedByExpa =>
      'EXPA non prenota per te: vieni indirizzato all\'ente ufficiale.';

  @override
  String get officeQuestura => 'Questura';

  @override
  String get officePrefettura => 'Prefettura';

  @override
  String get officeComune => 'Comune';

  @override
  String get officeAnagrafe => 'Anagrafe';

  @override
  String get officeAsl => 'ASL';

  @override
  String get officeInps => 'INPS';

  @override
  String get officeAgenziaEntrate => 'Agenzia delle Entrate';

  @override
  String get officePoste => 'Poste Italiane';

  @override
  String get officeMotorizzazione => 'Motorizzazione';

  @override
  String get officeUniversity => 'Università';

  @override
  String get officeOther => 'Altro ente';

  @override
  String get officePhone => 'Telefono';

  @override
  String get secAdmission => 'Requisiti di ammissione';

  @override
  String get secTips => 'Consigli';

  @override
  String get secCautions => 'Avvertenze';

  @override
  String get secNotes => 'Note';

  @override
  String get exploreGovernment => 'Servizi pubblici';

  @override
  String get explorePatente => 'Patente';

  @override
  String get exploreStudy => 'Studiare in Italia';

  @override
  String get exploreScan => 'Scansiona una lettera o un documento';

  @override
  String get exploreSaved => 'Salvati offline';

  @override
  String get govTitle => 'Servizi pubblici';

  @override
  String get govServices => 'Servizi';

  @override
  String get govOffices => 'Uffici';

  @override
  String get govEmpty =>
      'Nessun contenuto pubblicato per ora. I servizi vengono aggiunti dopo la verifica su fonti ufficiali.';

  @override
  String get govRelatedGuide => 'Guida collegata';

  @override
  String get studyTitle => 'Studiare in Italia';

  @override
  String get studyPrograms => 'Corsi';

  @override
  String get studyUniversities => 'Università';

  @override
  String get studyScholarships => 'Borse di studio';

  @override
  String get studyEmpty => 'Nessun contenuto pubblicato per ora.';

  @override
  String get studyTuition => 'Tasse universitarie';

  @override
  String get studyPerYear => 'all\'anno';

  @override
  String get studyDeadline => 'Scadenza della domanda';

  @override
  String get jobsSavedTitle => 'Lavori salvati';

  @override
  String get jobsSavedEmpty => 'Non hai ancora salvato nessun lavoro.';

  @override
  String get jobSave => 'Salva il lavoro';

  @override
  String get jobUnsave => 'Rimuovi dai salvati';

  @override
  String get lessonTip => 'Consiglio';

  @override
  String get askHistoryTitle => 'Conversazioni precedenti';

  @override
  String get askHistoryEmpty => 'Nessuna conversazione precedente.';

  @override
  String get askHistoryUntitled => 'Conversazione';

  @override
  String get askHistoryDelete => 'Elimina la conversazione';

  @override
  String get askHistoryDeleteBody =>
      'Questa conversazione verrà eliminata definitivamente.';

  @override
  String get askNewChat => 'Nuova conversazione';

  @override
  String get searchTitle => 'Cerca';

  @override
  String get searchMinChars => 'Scrivi almeno 2 caratteri e avvia la ricerca.';

  @override
  String get searchEmpty => 'Nessun risultato. Prova con altre parole.';

  @override
  String get savedTitle => 'Salvati';

  @override
  String get savedEmpty =>
      'Ancora nulla di salvato. Tocca il segnalibro in una guida o lezione.';

  @override
  String get savedHint =>
      'Queste copie sono sul tuo dispositivo e si aprono senza Internet. Controlla la data dell\'ultima verifica prima di affidarti ad esse.';

  @override
  String get savedAdd => 'Salva per l\'offline';

  @override
  String get savedRemove => 'Rimuovi dai salvati';

  @override
  String get savedAdded => 'Salvato sul dispositivo.';

  @override
  String get savedRemoved => 'Rimosso dai salvati.';

  @override
  String savedOfflineCopy(String date) {
    return 'Questa è la copia salvata il $date. Non è stato possibile aggiornarla ora.';
  }

  @override
  String get savedRefreshing => 'Copia salvata. Aggiornamento in corso…';

  @override
  String savedOn(String date) {
    return 'Salvato il $date';
  }

  @override
  String get savedStale =>
      'Questa copia potrebbe essere superata. Controlla il sito ufficiale.';

  @override
  String get patenteTitle => 'Patente';

  @override
  String get patenteDisclaimer =>
      'Contenuto didattico generale. Regole d\'esame e quiz ufficiali sono stabiliti dalle autorità italiane: verifica sempre la fonte ufficiale.';

  @override
  String get patenteEmpty =>
      'I contenuti Patente non sono ancora pubblicati. Pubblichiamo solo quiz di cui abbiamo i diritti. Appariranno qui appena disponibili.';

  @override
  String get patenteMockExam => 'Simulazione d\'esame';

  @override
  String patenteRules(String questions, String errors, String minutes) {
    return '$questions domande, massimo $errors errori, $minutes minuti.';
  }

  @override
  String get patenteStartExam => 'Inizia la simulazione';

  @override
  String get patenteProgress => 'I tuoi progressi';

  @override
  String patenteProgressLine(String taken, String passed) {
    return 'Simulazioni svolte: $taken, superate: $passed';
  }

  @override
  String patentePassRate(String rate) {
    return 'Percentuale di successo recente: $rate%';
  }

  @override
  String patenteWeakTopics(String topics) {
    return 'Argomenti da ripassare: $topics';
  }

  @override
  String get patentePracticeWeak => 'Esercitati sugli argomenti deboli';

  @override
  String get patenteTopics => 'Argomenti';

  @override
  String get patenteTopicsHint =>
      'Tocca un argomento per studiarlo o seleziona gli argomenti da esercitare.';

  @override
  String get patenteNoTopics => 'Nessun argomento pubblicato per ora.';

  @override
  String patenteQuestionCount(String n) {
    return '$n domande';
  }

  @override
  String get patentePractice => 'Esercitati sugli argomenti selezionati';

  @override
  String get patenteCategories => 'Categorie di patente';

  @override
  String get patenteTrue => 'Vero';

  @override
  String get patenteFalse => 'Falso';

  @override
  String get patenteSubmit => 'Termina e consegna';

  @override
  String patenteAnswered(String done, String total) {
    return 'Risposto a $done su $total';
  }

  @override
  String patenteMaxErrors(String n) {
    return 'Errori massimi consentiti: $n';
  }

  @override
  String patenteTimeLeft(String time) {
    return 'Tempo rimasto $time';
  }

  @override
  String get patenteTooEarly =>
      'L\'esame non può essere consegnato così presto. Rispondi alle domande e riprova.';

  @override
  String get patentePassed => 'Hai superato questa simulazione';

  @override
  String get patenteFailed => 'Non hai superato questa simulazione';

  @override
  String patenteResultLine(String correct, String errors, String max) {
    return 'Corrette: $correct, errori: $errors (massimo $max)';
  }

  @override
  String patentePracticeResult(String correct, String total) {
    return 'Corrette: $correct su $total';
  }

  @override
  String get patenteTimedOut =>
      'Il tempo è scaduto e le risposte sono state consegnate automaticamente.';

  @override
  String get patenteReview => 'Revisione';

  @override
  String get patenteNotAnswered => 'Non hai risposto a questa domanda';

  @override
  String patenteYourAnswer(String answer) {
    return 'La tua risposta: $answer';
  }

  @override
  String patenteCorrectAnswer(String answer) {
    return 'Risposta corretta: $answer';
  }

  @override
  String get patenteBack => 'Torna alla Patente';

  @override
  String get pushTitle => 'Notifiche push';

  @override
  String get pushSubtitle =>
      'Promemoria sulle scadenze dei documenti e su cose importanti.';

  @override
  String get pushRationaleTitle => 'Attivare le notifiche?';

  @override
  String get pushRationaleBody =>
      'Ti invieremo promemoria prima della scadenza dei documenti (come il permesso di soggiorno) e avvisi importanti. Nessuna pubblicità. Puoi disattivarle in qualsiasi momento. Dopo questo passaggio il dispositivo chiederà il permesso.';

  @override
  String get pushAllow => 'Continua';

  @override
  String get pushDenied =>
      'Il permesso per le notifiche è stato negato. Puoi attivarlo nelle impostazioni del dispositivo.';

  @override
  String get pushFailed =>
      'Impossibile attivare le notifiche ora. Riprova più tardi.';

  @override
  String get pushEnabledNote =>
      'Le notifiche sono attive su questo dispositivo.';

  @override
  String get logoutConfirmTitle => 'Uscire?';

  @override
  String get logoutConfirmBody =>
      'I dati salvati su questo dispositivo verranno rimossi e le notifiche si interromperanno.';

  @override
  String get deleteConfirmBody =>
      'L\'eliminazione dell\'account non può essere annullata. Sei sicuro?';

  @override
  String get exportShare => 'Condividi o salva una copia…';

  @override
  String get exportShareConfirmTitle => 'Condividi i tuoi dati personali';

  @override
  String get exportShareConfirmBody =>
      'Il file contiene i tuoi dati personali. Scegli solo una destinazione sicura (ad esempio la tua app di note o la tua email). EXPA non lo salva sul dispositivo.';

  @override
  String get nationalityInvalid =>
      'Inserisci un codice paese di 2 lettere (es. EG) oppure lascia vuoto.';

  @override
  String get resetTitle => 'Nuova password';

  @override
  String get resetButton => 'Salva la password';

  @override
  String get resetDone => 'Password modificata. Accedi con la nuova password.';

  @override
  String get resetInvalidLink =>
      'Il link di reimpostazione non è valido o è incompleto. Richiedine uno nuovo.';

  @override
  String get verifySuccess => 'Il tuo indirizzo email è stato verificato.';

  @override
  String get verifyInvalidLink =>
      'Il link di verifica non è valido o è scaduto. Richiedine uno nuovo dall\'app.';

  @override
  String get scannerTitle => 'Scansiona una lettera o un documento';

  @override
  String get scannerIntro =>
      'Fotografa una lettera (ad esempio del Comune, o una bolletta) oppure incolla il testo: ti spiegheremo il contenuto e le date importanti.';

  @override
  String get scannerPrivacy =>
      'Nulla viene inviato a EXPA finché non lo hai controllato e premi Invia. La spiegazione non è una consulenza legale.';

  @override
  String get scannerCameraWhy =>
      'La fotocamera viene usata solo quando tocchi scansiona, per fotografare il documento che scegli.';

  @override
  String get scannerUseCamera => 'Usa la fotocamera';

  @override
  String get scannerUseGallery => 'Scegli una foto';

  @override
  String get scannerPasteText => 'Incolla il testo';

  @override
  String get scannerNoCamera =>
      'La fotocamera non è disponibile su questo dispositivo. Puoi incollare il testo del documento.';

  @override
  String get scannerPermissionDenied =>
      'L\'accesso a fotocamera o foto non è stato consentito. Puoi consentirlo nelle impostazioni o incollare il testo.';

  @override
  String get scannerReviewTitle => 'Controlla prima di inviare';

  @override
  String get scannerPreview => 'Anteprima della foto acquisita';

  @override
  String get scannerNoOcr =>
      'Il riconoscimento del testo sul dispositivo non è disponibile in questa versione. Scrivi o incolla il testo qui sotto, oppure invia la foto.';

  @override
  String get scannerTextLabel => 'Testo del documento';

  @override
  String get scannerTextHint => 'Incolla qui il testo da spiegare';

  @override
  String get scannerSendsText =>
      'Solo questo testo verrà inviato ai server EXPA per essere spiegato.';

  @override
  String get scannerSendsImage =>
      'Questa foto verrà inviata ai server EXPA per essere spiegata.';

  @override
  String get scannerNothingToSend => 'Non c\'è ancora nulla da inviare.';

  @override
  String get scannerSend => 'Invia per la spiegazione';

  @override
  String get scannerDiscard => 'Scarta e ricomincia';

  @override
  String get scannerBackendUnavailable =>
      'Il servizio di spiegazione dei documenti non è ancora disponibile. Riprova più tardi.';

  @override
  String get scannerNoSummary => 'Non siamo riusciti a ricavare un riassunto.';

  @override
  String get scannerKeyDates => 'Date importanti';

  @override
  String get scannerCreateReminder => 'Aggiungi un documento e un promemoria';

  @override
  String get scannerActions => 'Azioni suggerite';

  @override
  String get scannerDefaultDisclaimer =>
      'Questa è una spiegazione automatica generale, non una consulenza legale o ufficiale. Verifica con il mittente della lettera.';

  @override
  String get scannerAnother => 'Spiega un altro documento';

  @override
  String get billingTitle => 'Piano e fatture';

  @override
  String get billingUnavailableTitle => 'I pagamenti non sono attivi';

  @override
  String get billingUnavailableBody =>
      'Il pagamento non è ancora disponibile, quindi non si può acquistare o cambiare piano nell\'app. Il tuo piano attuale continua a funzionare e non ti verrà addebitato nulla.';

  @override
  String get billingUnavailableShort =>
      'Il pagamento non è al momento disponibile.';

  @override
  String get billingCurrent => 'Il tuo piano attuale';

  @override
  String get billingPlans => 'Piani';

  @override
  String get billingNoPlans => 'Nessun piano è ancora stato pubblicato.';

  @override
  String get billingFree => 'Gratuito';

  @override
  String billingPerMonth(String amount) {
    return '$amount / mese';
  }

  @override
  String billingPerYear(String amount) {
    return '$amount / anno';
  }

  @override
  String get billingYourPlan => 'Il tuo piano';

  @override
  String get billingChoose => 'Scegli questo piano';

  @override
  String billingFeatAi(String n) {
    return '$n domande all\'assistente al giorno';
  }

  @override
  String get billingFeatReminders => 'Promemoria avanzati';

  @override
  String get billingFeatDocAi => 'Analisi dei documenti con IA';

  @override
  String billingFeatHuman(String n) {
    return '$n crediti di assistenza umana';
  }

  @override
  String get billingStatusActive => 'Attivo';

  @override
  String get billingStatusPastDue => 'Pagamento in ritardo';

  @override
  String get billingStatusCanceled => 'Annullato';

  @override
  String get billingStatusFree => 'Piano gratuito';

  @override
  String billingAccessUntil(String date) {
    return 'Accesso fino al $date';
  }

  @override
  String billingRenews(String date) {
    return 'Si rinnova il $date';
  }

  @override
  String get billingEnding => 'Termina a fine periodo';

  @override
  String get billingCancel => 'Annulla a fine periodo';

  @override
  String get billingCancelTitle => 'Annullare l\'abbonamento?';

  @override
  String get billingCancelBody =>
      'Mantieni le funzioni del piano fino alla fine del periodo pagato, poi non si rinnoverà.';

  @override
  String get billingCancelConfirm => 'Sì, annulla';

  @override
  String get billingCancelled => 'Annullamento impostato a fine periodo.';

  @override
  String get billingNothingToCancel =>
      'Non c\'è nessun abbonamento da annullare.';

  @override
  String get billingCheckoutFailed =>
      'Impossibile aprire la pagina di pagamento.';

  @override
  String get billingAlreadySubscribed => 'Hai già un abbonamento attivo.';

  @override
  String get billingPlanNotPurchasable => 'Questo piano non è acquistabile.';

  @override
  String get billingInvoices => 'Fatture';

  @override
  String get billingNoInvoices => 'Nessuna fattura per ora.';

  @override
  String get billingPricesNote =>
      'I prezzi possono cambiare e sono mostrati come li invia il server. Il pagamento avviene nel browser; l\'app non gestisce mai i dati della tua carta.';

  @override
  String get exploreCommunity => 'Community (domande e risposte)';

  @override
  String get communityTitle => 'Community EXPA';

  @override
  String get communityNoticeFallback =>
      'Le risposte della community vengono da utenti comuni e non sono informazioni ufficiali o verificate. Controlla le fonti ufficiali.';

  @override
  String get communityEmpty => 'Ancora nessuna domanda.';

  @override
  String get communityMineOnly => 'Solo le mie domande';

  @override
  String get communityAskOpen => 'Fai una domanda';

  @override
  String get communityQuestionTitle => 'Titolo della domanda';

  @override
  String get communityQuestionBody => 'Dettagli della domanda';

  @override
  String get communityTopic => 'Argomento';

  @override
  String get communityNoTopic => 'Nessun argomento';

  @override
  String get communityPost => 'Pubblica';

  @override
  String get communityPostedPending =>
      'Abbiamo ricevuto il tuo contributo: potrebbe attendere la moderazione prima di essere visibile agli altri.';

  @override
  String communityAnswers(String n) {
    return 'Risposte ($n)';
  }

  @override
  String get communityNoAnswers => 'Ancora nessuna risposta.';

  @override
  String get communityWriteAnswer => 'Scrivi una risposta';

  @override
  String get communityAccepted => 'Risposta accettata da chi ha chiesto';

  @override
  String get communityOfficialGuide => 'Guida ufficiale collegata';

  @override
  String get communityMine => 'Il mio contributo';

  @override
  String get communityPendingStatus => 'In attesa di moderazione';

  @override
  String get communityHiddenStatus => 'Nascosto dai moderatori';

  @override
  String get communityDelete => 'Elimina la mia domanda';

  @override
  String get communityDeleted => 'Domanda eliminata.';

  @override
  String communityComments(String n) {
    return 'Commenti ($n)';
  }

  @override
  String get exploreArticles => 'Articoli';

  @override
  String get exploreCities => 'Città';

  @override
  String get exploreServices => 'Fornitori di servizi';

  @override
  String get exploreLegal => 'Documenti legali';

  @override
  String get articlesTitle => 'Articoli';

  @override
  String get articlesEmpty => 'Non ci sono ancora articoli pubblicati.';

  @override
  String get articleEditorial => 'Articolo editoriale, non una fonte ufficiale';

  @override
  String get articleRelatedGuides => 'Guide correlate';

  @override
  String get articleRelatedArticles => 'Articoli correlati';

  @override
  String get articleTags => 'Tag';

  @override
  String get articleDefaultDisclaimer =>
      'Contenuto di orientamento generale, non consulenza legale o ufficiale. Verifica le fonti ufficiali.';

  @override
  String get citiesTitle => 'Città';

  @override
  String get citiesEmpty => 'Non ci sono ancora profili di città pubblicati.';

  @override
  String get cityOfficial => 'Informazioni ufficiali';

  @override
  String get cityGeneral => 'Indicazione generale';

  @override
  String get cityGuides => 'Guide per questa città';

  @override
  String get cityArticles => 'Articoli sulla città';

  @override
  String cityOffices(String n) {
    return 'Uffici pubblici elencati: $n';
  }

  @override
  String get cityOfficesOpen => 'Vedi gli uffici pubblici';

  @override
  String get providersTitle => 'Fornitori di servizi';

  @override
  String get providersEmpty => 'Nessun fornitore corrispondente.';

  @override
  String get providersVerifiedOnly => 'Solo verificati';

  @override
  String get providersThirdParty => 'Servizio di terze parti, non ufficiale';

  @override
  String get providersNoticeFallback =>
      'Questo fornitore è una terza parte indipendente, non un ente ufficiale né parte di EXPA. Verifica di persona prima di pagare o condividere i tuoi dati.';

  @override
  String providersRating(String avg, String count) {
    return 'Valutazione: $avg ($count)';
  }

  @override
  String get providersNoRatings => 'Nessuna valutazione';

  @override
  String get providersContact => 'Contatti pubblicati';

  @override
  String get providersWebsite => 'Sito web';

  @override
  String get providersRequestContact => 'Richiedi un contatto';

  @override
  String get leadTitle => 'Richiesta di contatto';

  @override
  String get leadIntro =>
      'È una richiesta di contatto, non una prenotazione né un accordo. Il fornitore riceve solo il tuo messaggio.';

  @override
  String get leadMessage => 'Il tuo messaggio';

  @override
  String get leadConsent =>
      'Acconsento a condividere i miei dati di contatto (nome ed e-mail) con questo fornitore perché possa rispondermi.';

  @override
  String get leadSend => 'Invia richiesta';

  @override
  String get leadSent =>
      'Richiesta inviata. Non è una prenotazione confermata: attendi la risposta del fornitore.';

  @override
  String get leadCooldown =>
      'Hai inviato da poco una richiesta a questo fornitore. Attendi 24 ore prima di inviarne un\'altra.';

  @override
  String get leadNeedConsent =>
      'Devi acconsentire alla condivisione dei contatti per inviare la richiesta.';

  @override
  String get leadMessageRequired => 'Scrivi un breve messaggio al fornitore.';

  @override
  String get accountTooNew =>
      'Il tuo account è troppo recente per questa azione. Riprova più tardi.';

  @override
  String get reviewsTitle => 'Recensioni';

  @override
  String get reviewsEmpty => 'Nessuna recensione approvata.';

  @override
  String get reviewWrite => 'Scrivi una recensione';

  @override
  String get reviewRating => 'Valutazione (da 1 a 5)';

  @override
  String get reviewBody => 'Il tuo commento (facoltativo)';

  @override
  String get reviewSend => 'Invia recensione';

  @override
  String get reviewPending =>
      'Recensione ricevuta: sarà moderata prima di comparire.';

  @override
  String get reviewExists => 'Hai già recensito questo fornitore.';

  @override
  String get reviewRatingRequired => 'Scegli una valutazione da 1 a 5.';

  @override
  String get reviewReport => 'Segnala';

  @override
  String get reviewReportReason => 'Motivo della segnalazione';

  @override
  String get reviewReportSend => 'Invia segnalazione';

  @override
  String get reviewReportSent =>
      'Grazie. La segnalazione è arrivata ai moderatori.';

  @override
  String get reviewAlreadyReported => 'Hai già segnalato questa recensione.';

  @override
  String get reasonSpam => 'Spam o pubblicità';

  @override
  String get reasonAbuse => 'Linguaggio offensivo';

  @override
  String get reasonMisleading => 'Fuorviante o falsa';

  @override
  String get reasonIllegal => 'Contenuto illegale';

  @override
  String get reasonPersonalData => 'Contiene dati personali';

  @override
  String get reasonOther => 'Altro';

  @override
  String get myRequestsTitle => 'Le mie richieste e recensioni';

  @override
  String get myRequestsLeads => 'Richieste di contatto';

  @override
  String get myRequestsReviews => 'Le mie recensioni';

  @override
  String get myRequestsEmpty => 'Nessuna richiesta di contatto.';

  @override
  String get myReviewsEmpty => 'Non hai scritto recensioni.';

  @override
  String get myReviewDelete => 'Elimina la mia recensione';

  @override
  String get myReviewDeleted => 'Recensione eliminata.';

  @override
  String get statusPending => 'In attesa';

  @override
  String get statusApproved => 'Approvato';

  @override
  String get statusRejected => 'Rifiutato';

  @override
  String get statusSeen => 'Visto dal fornitore';

  @override
  String get statusClosed => 'Chiuso';

  @override
  String get statusNew => 'Inviata';

  @override
  String get providerPortalNote =>
      'Il portale fornitori è disponibile solo sul sito web, non nell\'app.';

  @override
  String get exploreHousing => 'Verifica affitto';

  @override
  String get housingTitle => 'Verifica affitto';

  @override
  String get housingIntro =>
      'Incolla il testo dell\'annuncio o del contratto per evidenziare condizioni chiave, segnali di allarme e domande da fare.';

  @override
  String get housingConsentNeeded =>
      'La verifica richiede il tuo consenso all\'«analisi dell\'alloggio». Il testo non viene salvato.';

  @override
  String get housingConsentGranted =>
      'Consenso concesso. Tocca di nuovo «Verifica».';

  @override
  String get housingTextLabel => 'Testo dell\'annuncio o del contratto';

  @override
  String get housingTextHint => 'Incolla qui il testo (almeno 20 caratteri)';

  @override
  String get housingTextTooShort =>
      'Il testo è troppo corto. Incolla almeno 20 caratteri.';

  @override
  String get housingExtraTitle => 'Costi aggiuntivi che conosci (facoltativo)';

  @override
  String get housingRent => 'Affitto mensile';

  @override
  String get housingUtilities => 'Utenze (mensili)';

  @override
  String get housingCondo => 'Spese condominiali (mensili)';

  @override
  String get housingInternet => 'Internet (mensile)';

  @override
  String get housingExplain => 'Aggiungi una spiegazione con IA';

  @override
  String get housingSend => 'Verifica';

  @override
  String housingQuotaLeft(String n) {
    return 'Verifiche rimaste: $n';
  }

  @override
  String get housingQuotaReached =>
      'Hai raggiunto il limite di verifiche. Riprova più tardi o controlla il tuo piano.';

  @override
  String housingConfidence(String level) {
    return 'Affidabilità dell\'analisi: $level';
  }

  @override
  String get housingFacts => 'Cosa abbiamo trovato nel testo';

  @override
  String housingFactRent(String v) {
    return 'Affitto mensile: $v';
  }

  @override
  String housingFactDeposit(String v) {
    return 'Deposito cauzionale: $v';
  }

  @override
  String housingFactDepositMonths(String v) {
    return 'Deposito: $v mese/i';
  }

  @override
  String get housingFactUtilitiesIncluded => 'Utenze: incluse';

  @override
  String get housingFactUtilitiesExcluded => 'Utenze: escluse';

  @override
  String housingFactExpenses(String v) {
    return 'Spese mensili: $v';
  }

  @override
  String get housingRedFlags => 'Possibili segnali di allarme';

  @override
  String get housingNoRedFlags =>
      'Non abbiamo trovato segnali di allarme evidenti nel testo, il che non significa che il contratto sia a posto.';

  @override
  String get housingSevWarning => 'Attenzione';

  @override
  String get housingSevCaution => 'Cautela';

  @override
  String get housingSevInfo => 'Info';

  @override
  String get housingOneDeposit => 'Deposito cauzionale';

  @override
  String get housingOneAgencyFee => 'Commissione d\'agenzia';

  @override
  String get housingBasisGeneral => 'Indicazione generale';

  @override
  String get housingBasisSourced => 'Basato su una fonte';

  @override
  String get housingQuestions => 'Domande da fare al proprietario';

  @override
  String get housingCouldNotDetect => 'Cose che non siamo riusciti a rilevare';

  @override
  String get housingCost => 'Costo mensile stimato';

  @override
  String housingCostTotal(String v) {
    return 'Totale approssimativo: $v al mese';
  }

  @override
  String get housingCostUnknown =>
      'Non è possibile calcolare un totale affidabile con le informazioni disponibili.';

  @override
  String get housingCompRent => 'Affitto';

  @override
  String get housingCompUtilities => 'Utenze';

  @override
  String get housingCompCondo => 'Spese condominiali';

  @override
  String get housingCompInternet => 'Internet';

  @override
  String get housingSourceUser => 'inserito da te';

  @override
  String get housingSourceText => 'dal testo';

  @override
  String get housingAssumptions => 'Ipotesi alla base della stima';

  @override
  String get housingOneTime => 'Costi una tantum';

  @override
  String get housingNotes => 'Note';

  @override
  String get housingAiExplanation => 'Spiegazione IA';

  @override
  String get housingDisclaimerTitle => 'Avvertenza';

  @override
  String get housingFallbackDisclaimer =>
      'Indicazioni generali, non consulenza legale. Rivolgiti a un avvocato o a un ente qualificato prima di firmare.';

  @override
  String get housingAnother => 'Verifica un altro testo';

  @override
  String get legalTitle => 'Documenti legali';

  @override
  String get legalPrivacy => 'Informativa sulla privacy';

  @override
  String get legalTerms => 'Termini d\'uso';

  @override
  String get legalCookies => 'Cookie policy';

  @override
  String get legalNotPublished =>
      'Questo documento non è ancora stato pubblicato. Comparirà qui appena pubblicato ufficialmente.';

  @override
  String legalVersion(String v, String date) {
    return 'Versione $v, pubblicata il $date';
  }

  @override
  String legalVersionOnly(String v) {
    return 'Versione $v';
  }

  @override
  String get legalRead => 'Leggi';

  @override
  String get legalReadTerms => 'Leggi i termini d\'uso';

  @override
  String get legalReadPrivacy => 'Leggi l\'informativa sulla privacy';

  @override
  String get patenteWeakTitle => 'I miei argomenti deboli';

  @override
  String patenteWeakIntro(String threshold, String min) {
    return 'Argomenti in cui la tua precisione è sotto il $threshold% dopo almeno $min risposte.';
  }

  @override
  String get patenteWeakNone =>
      'Ancora nessun argomento debole. Rispondi a più domande per vedere l\'analisi.';

  @override
  String get patenteWeakList => 'Argomenti da ripassare';

  @override
  String get patenteUntouched => 'Argomenti non ancora provati';

  @override
  String patenteRecommended(String t) {
    return 'Argomento consigliato da cui iniziare: $t';
  }

  @override
  String patenteTopicAccuracy(String acc, String correct, String answered) {
    return 'Precisione $acc% ($correct su $answered)';
  }

  @override
  String get patentePracticeTopic => 'Esercitati su questo argomento';

  @override
  String get patentePracticeAllWeak =>
      'Esercitati su tutti gli argomenti deboli';

  @override
  String get patenteNoWeakToPractice =>
      'Non ci sono ancora argomenti deboli su cui esercitarsi.';

  @override
  String get patenteNotEnoughQuestions =>
      'Non ci sono ancora abbastanza domande per questa sessione.';

  @override
  String get patenteWeakOpen => 'Analisi degli argomenti deboli';

  @override
  String get patenteGlossaryOpen =>
      'Glossario della patente (italiano - arabo)';

  @override
  String get patenteGlossaryTitle => 'Glossario patente';

  @override
  String get patenteGlossaryEmpty => 'Non ci sono ancora termini pubblicati.';

  @override
  String get patenteCheck => 'Controlla la mia risposta';

  @override
  String get patenteCheckPick => 'Scegli prima vero o falso.';

  @override
  String get patenteFeedbackCorrect => 'Corretto';

  @override
  String patenteFeedbackWrong(String a) {
    return 'Non corretto. La risposta giusta: $a';
  }

  @override
  String get patenteExplanationIt => 'Spiegazione in italiano';

  @override
  String get patenteExplanationAr => 'Spiegazione in arabo';

  @override
  String get patenteExplanationEn => 'Spiegazione in inglese';

  @override
  String get practiceTitle => 'Pratica d\'italiano';

  @override
  String get practiceOpen => 'Pratica: vocabolario, esercizi, ripasso';

  @override
  String get practiceNotReviewed =>
      'Questo contenuto non è ancora stato rivisto da un insegnante. Può contenere errori.';

  @override
  String get practiceReviewed => 'Rivisto da un insegnante';

  @override
  String practiceReviewedOn(String date) {
    return 'Rivisto da un insegnante il $date';
  }

  @override
  String practiceDue(String n) {
    return 'Schede da ripassare ora: $n';
  }

  @override
  String practiceMastered(String n) {
    return 'Schede padroneggiate: $n';
  }

  @override
  String practiceLearning(String n) {
    return 'Schede in apprendimento: $n';
  }

  @override
  String practiceAccuracy(String n) {
    return 'Precisione: $n%';
  }

  @override
  String practiceAttempts(String n) {
    return 'Tentativi negli esercizi: $n';
  }

  @override
  String get practiceReviewCards => 'Ripasso schede (ripetizione dilazionata)';

  @override
  String get practiceVocabulary => 'Vocabolario';

  @override
  String get practiceExercises => 'Esercizi';

  @override
  String get practiceScenarios => 'Situazioni di vita reale';

  @override
  String get vocabEmpty => 'Non c\'è ancora vocabolario pubblicato.';

  @override
  String get exercisesEmpty => 'Non ci sono ancora esercizi pubblicati.';

  @override
  String get scenariosEmpty => 'Non ci sono ancora situazioni disponibili.';

  @override
  String scenarioCounts(String lessons, String vocab, String exercises) {
    return 'Lezioni: $lessons · Vocaboli: $vocab · Esercizi: $exercises';
  }

  @override
  String get scenarioLessons => 'Lezioni di questa situazione';

  @override
  String get vocabExample => 'Esempio';

  @override
  String vocabBox(String n) {
    return 'Livello di memoria: $n';
  }

  @override
  String get vocabAudioNote =>
      'Esiste una registrazione per questa parola, ma la riproduzione non è disponibile in questa versione dell\'app.';

  @override
  String get reviewTitle => 'Ripasso schede';

  @override
  String get reviewEmpty => 'Nessuna scheda da ripassare ora. Torna più tardi.';

  @override
  String get reviewShow => 'Mostra significato';

  @override
  String get reviewKnew => 'Lo sapevo';

  @override
  String get reviewNotYet => 'Non ancora';

  @override
  String get reviewNew => 'Parola nuova';

  @override
  String reviewProgress(String i, String n) {
    return 'Scheda $i di $n';
  }

  @override
  String reviewDone(String n) {
    return 'Ottimo! Hai finito il ripasso di oggi: $n schede.';
  }

  @override
  String get reviewSaveFailed =>
      'Non è stato possibile salvare la risposta. Riprova.';

  @override
  String get exTypeAll => 'Tutti i tipi';

  @override
  String get exTypeMultiple => 'Scelta multipla';

  @override
  String get exTypeListening => 'Ascolto';

  @override
  String get exTypeFill => 'Completa lo spazio';

  @override
  String get exTypeMatch => 'Abbina';

  @override
  String get exCheck => 'Controlla la risposta';

  @override
  String get exCorrect => 'Corretto';

  @override
  String get exWrong => 'Non corretto';

  @override
  String exCorrectAnswer(String a) {
    return 'Risposta corretta: $a';
  }

  @override
  String get exAnswerHint => 'Scrivi la parola mancante';

  @override
  String get exMatchChoose => 'Scegli';

  @override
  String get exMatchAll => 'Abbina tutti gli elementi prima di controllare.';

  @override
  String get exNoAudio =>
      'Non c\'è ancora una registrazione per questo esercizio. Leggi tu le opzioni.';

  @override
  String get exAudioUnsupported =>
      'La registrazione non può essere riprodotta in questa versione. Leggi tu le opzioni.';

  @override
  String get exTryAnother => 'Un altro esercizio';

  @override
  String get exChooseOne => 'Scegli prima una risposta.';

  @override
  String get exTypeFirst => 'Scrivi prima la tua risposta.';

  @override
  String get provTitle => 'Portale fornitore';

  @override
  String get provBecome => 'Diventa fornitore';

  @override
  String get provApplyTitle => 'Candidati come fornitore';

  @override
  String get provApplyIntro =>
      'Crea la tua scheda. Resta una bozza privata finché il team EXPA non la verifica e la pubblica.';

  @override
  String get provApplyNotice =>
      'La pubblicazione non è una raccomandazione né una garanzia di EXPA. Il badge verificato compare solo dopo la revisione dei documenti.';

  @override
  String get provApply => 'Invia candidatura';

  @override
  String get provExists => 'Hai già una scheda fornitore.';

  @override
  String get provRequiredFields => 'Nome, categoria e titolo sono obbligatori.';

  @override
  String get provDisplayName => 'Nome visualizzato';

  @override
  String get provCategory => 'Categoria';

  @override
  String get provHeadline => 'Titolo';

  @override
  String get provLanguageNote =>
      'Salvato nella lingua corrente dell\'app. Cambia lingua per aggiungere un\'altra traduzione.';

  @override
  String get provDescription => 'Descrizione';

  @override
  String get provContactEmail => 'E-mail di contatto';

  @override
  String get provContactPhone => 'Telefono di contatto';

  @override
  String get provWebsite => 'Sito web';

  @override
  String get provServesOnline => 'Servizio online';

  @override
  String get provTabProfile => 'Profilo';

  @override
  String get provTabVerification => 'Verifica';

  @override
  String get provTabLeads => 'Richieste';

  @override
  String get provTabReviews => 'Recensioni';

  @override
  String get provStatusDraft => 'Bozza';

  @override
  String get provStatusReview => 'In revisione';

  @override
  String get provStatusApproved => 'Approvato';

  @override
  String get provStatusPublished => 'Pubblicato';

  @override
  String get provStatusArchived => 'Archiviato';

  @override
  String get provVerified => 'Verificato';

  @override
  String get provVerifPending => 'Verifica in corso';

  @override
  String get provVerifRejected => 'Verifica rifiutata';

  @override
  String get provVerifExpired => 'Verifica scaduta';

  @override
  String get provVerifNone => 'Non verificato';

  @override
  String get provPendingChanges => 'Modifiche in attesa di approvazione';

  @override
  String get provPublishedEditNote =>
      'La scheda è pubblicata: le modifiche compaiono dopo l\'approvazione di un amministratore; la versione attuale resta invariata.';

  @override
  String get provProblems => 'Cosa manca prima dell\'invio';

  @override
  String get provListingIncomplete =>
      'La scheda non è ancora completa. Completala e riprova.';

  @override
  String get provSave => 'Salva modifiche';

  @override
  String get provSaved => 'Salvato.';

  @override
  String get provSavedPendingApproval =>
      'Le modifiche sono state inviate per approvazione.';

  @override
  String get provSubmit => 'Invia in revisione';

  @override
  String get provSubmitted => 'Inviato in revisione.';

  @override
  String get provServicesWebOnly =>
      'La modifica di servizi e aree è per ora disponibile solo sul sito web.';

  @override
  String get provVerifIntro =>
      'Carica documenti che dimostrano la tua attività. Solo il team EXPA li esamina; gli utenti non li vedono.';

  @override
  String get provEvidenceNote =>
      'I documenti sono archiviati cifrati e letti solo dal pannello di amministrazione. Carica solo il necessario.';

  @override
  String get provEvidenceTitle => 'Documenti di verifica';

  @override
  String get provEvidenceNone => 'Nessun documento caricato.';

  @override
  String get provEvidenceAdd => 'Aggiungi una foto dalla galleria';

  @override
  String get provEvidenceDelete => 'Elimina documento';

  @override
  String get provEvidenceUploaded => 'Documento caricato.';

  @override
  String get provEvidencePdfWeb =>
      'I PDF si caricano dal sito web. Massimo 5 file.';

  @override
  String get provVerifRequest => 'Richiedi la verifica';

  @override
  String get provVerifRequested => 'Verifica richiesta.';

  @override
  String get provLeadsPrivacy =>
      'I contatti qui sono stati forniti dall\'utente, con consenso, solo per questa richiesta. Usali solo per rispondere.';

  @override
  String get provLeadsEmpty => 'Nessuna richiesta per ora.';

  @override
  String get provLeadNew => 'Nuova';

  @override
  String get provLeadSeen => 'Vista';

  @override
  String get provLeadClosed => 'Chiusa';

  @override
  String get provLeadMarkSeen => 'Segna come vista';

  @override
  String get provLeadClose => 'Chiudi richiesta';

  @override
  String get provReviewsEmpty => 'Nessuna recensione approvata per ora.';

  @override
  String get provReply => 'Rispondi';

  @override
  String get provReplyEdit => 'Modifica risposta';

  @override
  String get provReplyTitle => 'Rispondi alla recensione';

  @override
  String get provReplyNote =>
      'La tua risposta compare dopo l\'approvazione di un amministratore.';

  @override
  String get provReplySend => 'Invia risposta';

  @override
  String get provReplySent => 'Risposta inviata in revisione.';

  @override
  String get provReplyPending => 'Risposta in attesa di approvazione';

  @override
  String get provReplyPublished => 'Risposta pubblicata';

  @override
  String get scannerOcrFallback =>
      'Il server non è riuscito a leggere il testo dalla foto. Incolla invece il testo della lettera.';

  @override
  String get scannerConsentNeeded =>
      'Spiegare i documenti richiede il tuo consenso all\'«analisi dei documenti». Il documento non viene salvato.';

  @override
  String get scannerConsentGranted =>
      'Consenso concesso. Tocca di nuovo «Invia per la spiegazione».';

  @override
  String get scannerQuotaReached =>
      'Hai raggiunto il limite di spiegazioni di documenti. Riprova più tardi o controlla il tuo piano.';

  @override
  String scannerQuotaLeft(String n) {
    return 'Spiegazioni rimaste: $n';
  }

  @override
  String get scannerFileTypeNotAllowed =>
      'Tipo di file non consentito. Usa una foto JPG o PNG o un PDF.';

  @override
  String get scannerFileTooLarge =>
      'L\'immagine è troppo grande. Scatta una foto più piccola o incolla il testo.';

  @override
  String get scannerPdfTooLong => 'Il PDF ha troppe pagine.';

  @override
  String get scannerFileRejected =>
      'Il file non è stato accettato. Prova un altro file o incolla il testo.';

  @override
  String get scannerUnavailableLater =>
      'Il controllo dei file non è al momento disponibile e non è stato salvato nulla. Riprova più tardi.';

  @override
  String get scannerDateNotClear => 'Data non chiara';

  @override
  String get scannerYearMissing => 'L\'anno non è indicato nel documento';

  @override
  String get scannerDatePast => 'Questa data è passata';

  @override
  String scannerConfidence(String level) {
    return 'Affidabilità: $level';
  }

  @override
  String get confLow => 'bassa';

  @override
  String get confMedium => 'media';

  @override
  String get confHigh => 'alta';

  @override
  String get scannerDegraded =>
      'L\'IA non ha potuto essere usata pienamente, quindi questa spiegazione è semplificata.';

  @override
  String get scannerCheckDates =>
      'Controlla sempre le date sul documento originale.';

  @override
  String get recoTitle => 'Consigliati per te';

  @override
  String get recoGuides => 'Guide';

  @override
  String get recoLessons => 'Lezioni';

  @override
  String get recoServices => 'Servizi';

  @override
  String get recoReminders => 'Promemoria';

  @override
  String get recoWhy => 'Perché';

  @override
  String get recoThirdParty => 'Servizio di terzi, non garantito da EXPA';

  @override
  String get recoPersonalized =>
      'Questi suggerimenti usano il tuo profilo e i tuoi obiettivi, con il tuo consenso.';

  @override
  String get recoNotPersonalized =>
      'Solo suggerimenti generali, perché la personalizzazione è disattivata. Attiva il consenso alla personalizzazione per suggerimenti migliori.';

  @override
  String get recoManageConsent => 'Gestisci i consensi';

  @override
  String get recoEmpty =>
      'Nessun suggerimento al momento. Completa il profilo o aggiungi i documenti.';

  @override
  String get netTitle => 'Stima dello stipendio netto';

  @override
  String get netIntro =>
      'Stima lo stipendio netto dal lordo annuo. È indicativa e non viene salvato nulla.';

  @override
  String get netGross => 'Retribuzione annua lorda (RAL)';

  @override
  String get netInvalid => 'Inserisci un numero valido tra 0 e 10.000.000.';

  @override
  String get netMonths => 'Mensilità all\'anno';

  @override
  String get netCalculate => 'Calcola';

  @override
  String get netUnavailableTitle => 'Stima non disponibile';

  @override
  String get netUnavailable =>
      'Non sono ancora state pubblicate tabelle fiscali verificate e EXPA non inventa cifre.';

  @override
  String get netMonthly => 'Netto mensile stimato';

  @override
  String get netAnnual => 'Netto annuo';

  @override
  String get netGrossLine => 'Lordo annuo';

  @override
  String get netContributions => 'Contributi';

  @override
  String get netDeduction => 'Detrazione fissa';

  @override
  String get netTaxable => 'Reddito imponibile';

  @override
  String get netIncomeTax => 'Imposta sul reddito';

  @override
  String netTable(String name, String year) {
    return 'Tabella usata: $name ($year)';
  }

  @override
  String get netDisclaimer =>
      'Stima solo orientativa, non una busta paga né una consulenza fiscale. Chiedi a un commercialista, CAF o Patronato.';

  @override
  String get travelTitle => 'Requisiti di viaggio';

  @override
  String get travelIntro =>
      'Cerca i requisiti verificati per viaggiare tra due paesi in base alla tua nazionalità.';

  @override
  String get travelPrivacy =>
      'Per la ricerca vengono inviati solo i due paesi; non sono salvati né letti dal tuo profilo.';

  @override
  String get travelNationality => 'Nazionalità (codice di 2 lettere)';

  @override
  String get travelDestination => 'Destinazione (codice di 2 lettere)';

  @override
  String get travelCodeHelp => 'Codice ISO come EG o IT';

  @override
  String get travelCodeInvalid => 'Inserisci due lettere latine.';

  @override
  String get travelSearch => 'Cerca';

  @override
  String get travelNoneTitle => 'Nessuna informazione verificata';

  @override
  String get travelNone =>
      'Non abbiamo informazioni verificate per questo caso. Non significa che il viaggio sia consentito: controlla la fonte ufficiale.';

  @override
  String get travelDisclaimer =>
      'Informazioni generali che possono cambiare. Controlla sempre la fonte ufficiale prima di viaggiare.';

  @override
  String get scannerRedactTitle => 'Il testo potrebbe contenere dati sensibili';

  @override
  String get scannerRedactBody =>
      'Abbiamo trovato qualcosa che sembra un IBAN, un codice fiscale, un\'e-mail o un numero lungo. Puoi cancellarlo nel campo prima di inviare; la spiegazione di solito non ne ha bisogno.';

  @override
  String get scannerRedactGeneral =>
      'Suggerimento: elimina numeri di conto e dati personali non necessari prima di inviare.';

  @override
  String get notificationsDelete => 'Elimina notifica';

  @override
  String get notificationsSettings => 'Impostazioni notifiche';

  @override
  String get patenteTeacherTitle => 'Insegnante di patente con IA';

  @override
  String get patenteTeacherIntro =>
      'Chiedi una spiegazione semplice di questo argomento. La risposta si basa su contenuti pubblicati, con le fonti.';

  @override
  String get patenteTeacherAsk => 'Spiegami questo argomento';

  @override
  String patenteTeacherPrompt(String title) {
    return 'Spiegami in modo semplice questo argomento della patente: $title';
  }

  @override
  String get patenteTeacherOffline =>
      'Sei offline: l\'insegnante richiede internet.';
}
