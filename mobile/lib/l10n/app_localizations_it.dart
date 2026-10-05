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
}
