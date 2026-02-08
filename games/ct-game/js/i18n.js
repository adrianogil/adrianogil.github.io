const translations = {
  en: {
    start: {
      eyebrow: "",
      title: "Start the Mission",
      description: "Guide the bot across the grid, build a program, and light up each beacon.",
      player: {
        label: "Player identity",
        none: "No player selected",
        identify: "Identify player",
        switch: "Switch player",
      },
      play: "Play",
      select: "Select level",
      modeHint: {
        default: "Choose how you want to play to see the levels.",
        progression: "Progression mode: complete levels to unlock more (unlocked through Level {level}).",
        free: "Free select: jump into any level without unlocking.",
      },
      actions: {
        analytics: "Learning Analytics",
        settings: "Settings",
        about: "About",
      },
      levelButton: "Level {level}",
    },
    playerOverlay: {
      eyebrow: "Player Identity",
      title: "Identify player",
      message: "Select an existing player or create a new profile.",
      nameLabel: "Player name",
      namePlaceholder: "e.g. Alex",
      continue: "Continue",
      close: "Close",
      empty: "No players yet. Create your first profile below.",
      createdAt: "Created {date}",
      select: "Select",
      selected: "Selected",
      delete: "Delete",
      deleteConfirm: "Delete {name}? This removes their sessions.",
      selectBeforeRun: "Select a player before running a program.",
      selectBeforeStart: "Select or create a player before starting a level.",
    },
    analytics: {
      title: "Learning Analytics",
      subtitle: "Track progress per player and level.",
      back: "Back",
      playerLabel: "Player",
      export: "Export JSON",
      clear: "Clear data for player",
      levelsTitle: "Levels",
      noPlayersOption: "No players",
      noPlayersPrompt: "Create a player to see analytics.",
      noSessionsCharts: "Add sessions to see charts.",
      summary: {
        totalSessions: "Total sessions",
        completionRate: "Completion rate",
        avgTime: "Avg time",
        avgAttempts: "Avg attempts",
      },
      levelHeader: {
        level: "Level",
        games: "Games",
        percent: "%",
        avgTime: "Avg time",
        avgAttempts: "Avg attempts",
      },
      noSessions: "No sessions yet for this player.",
      selectLevelPrompt: "Select a level once sessions are available.",
      noLevelData: "No level data yet. Complete a level to populate charts.",
      chart: {
        sessionsByLevel: "Sessions by level",
        completionRate: "Completion rate",
      },
      detail: {
        heading: "{level} details",
        planningRatio: "Planning ratio (edits per attempt): {ratio}",
        avgExecutionTime: "Avg execution time: {time}",
        avgEditingTime: "Avg editing time: {time}",
        topMistakes: "Top mistakes",
        failureReasons: "Failure reasons",
        recentSessions: "Recent sessions",
        noMistakes: "No mistakes logged yet.",
        noFailures: "No failures recorded.",
        noSessions: "No sessions yet.",
        sessionTitle: "Session {id}",
        editingTime: "Editing time: {time}",
        executionTime: "Execution time: {time}",
        successfulAttempt: "Successful attempt: {attempt}",
        noBlocks: "No blocks saved.",
        coverage: "Coverage: {unique} unique tiles, {revisits} revisits.",
        eventLog: "Event log ({count} events)",
        selectSession: "Select a session to see details.",
        sessionMeta: {
          attempts: "Attempts: {count}",
          totalTime: "Total time: {time}",
          completed: "Completed: {status}",
          yes: "Yes",
          no: "No",
        },
      },
      clearConfirm: "Clear analytics for {name}? This cannot be undone.",
    },
    controls: {
      reset: "Reset",
      mainMenu: "Main Menu",
      settings: "Settings",
      runProgram: "Run program",
    },
    program: {
      title: "Program",
      show: "Show",
      hide: "Hide",
    },
    toolbox: {
      hint: "Click or drag commands to build a program.",
    },
    completion: {
      title: "All beacons lit!",
      text: "You finished this level. Want to keep practicing here or pick another level?",
      nextLevel: "Next level (Level {level})",
      keepPracticing: "Keep practicing",
      chooseLevel: "Choose another level",
    },
    settings: {
      eyebrow: "Settings",
      title: "Customize your experience",
      ghostColor: "Ghost color",
      language: "Language",
      compactCommands: "Compact command view",
      close: "Close",
    },
    about: {
      eyebrow: "About",
      title: "GhostBot",
      descriptionPrimary: "A puzzle game inspired by Lightbot where you program a ghost to light beacons.",
      descriptionSecondary: "Built to explore learning analytics in computational thinking games.",
      detailsTitle: "Details",
      versionLabel: "Version",
      buildLabel: "Build",
      createdBy: "Created by",
      moreInfo: "More information, please take a look at our previous paper at",
      disclaimer: "This is a research prototype. Analytics are stored locally in your browser.",
      close: "Back",
    },
    blocks: {
      forward: "Forward",
      backward: "Backward",
      turnLeft: "Turn Left",
      turnRight: "Turn Right",
      jump: "Jump",
      light: "Light",
    },
  },
  "pt-br": {
    start: {
      eyebrow: "",
      title: "Inicie a missão",
      description: "Guie o robô pela grade, monte um programa e acenda cada farol.",
      player: {
        label: "Identidade do jogador",
        none: "Nenhum jogador selecionado",
        identify: "Identificar jogador",
        switch: "Trocar jogador",
      },
      play: "Jogar",
      select: "Selecionar nível",
      modeHint: {
        default: "Escolha como deseja jogar para ver os níveis.",
        progression: "Modo progressão: conclua níveis para desbloquear mais (desbloqueado até o nível {level}).",
        free: "Seleção livre: jogue qualquer nível sem desbloquear.",
      },
      actions: {
        analytics: "Análises de aprendizado",
        settings: "Configurações",
        about: "Sobre",
      },
      levelButton: "Nível {level}",
    },
    playerOverlay: {
      eyebrow: "Identidade do jogador",
      title: "Identificar jogador",
      message: "Selecione um jogador existente ou crie um novo perfil.",
      nameLabel: "Nome do jogador",
      namePlaceholder: "ex: Alex",
      continue: "Continuar",
      close: "Fechar",
      empty: "Ainda não há jogadores. Crie seu primeiro perfil abaixo.",
      createdAt: "Criado em {date}",
      select: "Selecionar",
      selected: "Selecionado",
      delete: "Excluir",
      deleteConfirm: "Excluir {name}? Isso remove as sessões.",
      selectBeforeRun: "Selecione um jogador antes de executar o programa.",
      selectBeforeStart: "Selecione ou crie um jogador antes de iniciar um nível.",
    },
    analytics: {
      title: "Análises de aprendizado",
      subtitle: "Acompanhe o progresso por jogador e nível.",
      back: "Voltar",
      playerLabel: "Jogador",
      export: "Exportar JSON",
      clear: "Limpar dados do jogador",
      levelsTitle: "Níveis",
      noPlayersOption: "Sem jogadores",
      noPlayersPrompt: "Crie um jogador para ver as análises.",
      noSessionsCharts: "Adicione sessões para ver os gráficos.",
      summary: {
        totalSessions: "Total de sessões",
        completionRate: "Taxa de conclusão",
        avgTime: "Tempo médio",
        avgAttempts: "Tentativas médias",
      },
      levelHeader: {
        level: "Nível",
        games: "Jogos",
        percent: "%",
        avgTime: "Tempo médio",
        avgAttempts: "Tentativas médias",
      },
      noSessions: "Ainda não há sessões para este jogador.",
      selectLevelPrompt: "Selecione um nível quando houver sessões.",
      noLevelData: "Ainda não há dados de nível. Conclua um nível para preencher os gráficos.",
      chart: {
        sessionsByLevel: "Sessões por nível",
        completionRate: "Taxa de conclusão",
      },
      detail: {
        heading: "Detalhes de {level}",
        planningRatio: "Relação de planejamento (edições por tentativa): {ratio}",
        avgExecutionTime: "Tempo médio de execução: {time}",
        avgEditingTime: "Tempo médio de edição: {time}",
        topMistakes: "Principais erros",
        failureReasons: "Motivos de falha",
        recentSessions: "Sessões recentes",
        noMistakes: "Nenhum erro registrado ainda.",
        noFailures: "Nenhuma falha registrada.",
        noSessions: "Ainda não há sessões.",
        sessionTitle: "Sessão {id}",
        editingTime: "Tempo de edição: {time}",
        executionTime: "Tempo de execução: {time}",
        successfulAttempt: "Tentativa bem-sucedida: {attempt}",
        noBlocks: "Nenhum bloco salvo.",
        coverage: "Cobertura: {unique} tiles únicos, {revisits} revisitas.",
        eventLog: "Registro de eventos ({count} eventos)",
        selectSession: "Selecione uma sessão para ver os detalhes.",
        sessionMeta: {
          attempts: "Tentativas: {count}",
          totalTime: "Tempo total: {time}",
          completed: "Concluído: {status}",
          yes: "Sim",
          no: "Não",
        },
      },
      clearConfirm: "Limpar análises de {name}? Isso não pode ser desfeito.",
    },
    controls: {
      reset: "Reiniciar",
      mainMenu: "Menu principal",
      settings: "Configurações",
      runProgram: "Executar programa",
    },
    program: {
      title: "Programa",
      show: "Mostrar",
      hide: "Ocultar",
    },
    toolbox: {
      hint: "Clique ou arraste comandos para montar um programa.",
    },
    completion: {
      title: "Todos os faróis acesos!",
      text: "Você concluiu este nível. Quer continuar praticando aqui ou escolher outro nível?",
      nextLevel: "Próximo nível (Nível {level})",
      keepPracticing: "Continuar praticando",
      chooseLevel: "Escolher outro nível",
    },
    settings: {
      eyebrow: "Configurações",
      title: "Personalize sua experiência",
      ghostColor: "Cor do fantasma",
      language: "Idioma",
      compactCommands: "Visual compacto de comandos",
      close: "Fechar",
    },
    about: {
      eyebrow: "Sobre",
      title: "GhostBot",
      descriptionPrimary: "Um jogo de puzzle inspirado no Lightbot em que você programa um fantasma para acender faróis.",
      descriptionSecondary: "Criado para explorar learning analytics em jogos de pensamento computacional.",
      detailsTitle: "Detalhes",
      versionLabel: "Versão",
      buildLabel: "Build",
      createdBy: "Criado por",
      moreInfo: "Mais informações, confira nosso artigo anterior em",
      disclaimer: "Este é um protótipo de pesquisa. As análises ficam armazenadas localmente no navegador.",
      close: "Voltar",
    },
    blocks: {
      forward: "Avançar",
      backward: "Voltar",
      turnLeft: "Virar à esquerda",
      turnRight: "Virar à direita",
      jump: "Pular",
      light: "Acender",
    },
  },
  fr: {
    start: {
      eyebrow: "",
      title: "Démarrer la mission",
      description: "Guide le robot sur la grille, crée un programme et allume chaque balise.",
      player: {
        label: "Identité du joueur",
        none: "Aucun joueur sélectionné",
        identify: "Identifier le joueur",
        switch: "Changer de joueur",
      },
      play: "Jouer",
      select: "Sélectionner un niveau",
      modeHint: {
        default: "Choisissez comment jouer pour voir les niveaux.",
        progression: "Mode progression : terminez des niveaux pour en débloquer d'autres (débloqué jusqu'au niveau {level}).",
        free: "Sélection libre : lancez n'importe quel niveau sans déverrouillage.",
      },
      actions: {
        analytics: "Analyses d'apprentissage",
        settings: "Paramètres",
        about: "À propos",
      },
      levelButton: "Niveau {level}",
    },
    playerOverlay: {
      eyebrow: "Identité du joueur",
      title: "Identifier le joueur",
      message: "Sélectionnez un joueur existant ou créez un nouveau profil.",
      nameLabel: "Nom du joueur",
      namePlaceholder: "ex : Alex",
      continue: "Continuer",
      close: "Fermer",
      empty: "Aucun joueur pour l'instant. Créez votre premier profil ci-dessous.",
      createdAt: "Créé le {date}",
      select: "Sélectionner",
      selected: "Sélectionné",
      delete: "Supprimer",
      deleteConfirm: "Supprimer {name} ? Cela supprime ses sessions.",
      selectBeforeRun: "Sélectionnez un joueur avant d'exécuter un programme.",
      selectBeforeStart: "Sélectionnez ou créez un joueur avant de démarrer un niveau.",
    },
    analytics: {
      title: "Analyses d'apprentissage",
      subtitle: "Suivez la progression par joueur et par niveau.",
      back: "Retour",
      playerLabel: "Joueur",
      export: "Exporter JSON",
      clear: "Effacer les données du joueur",
      levelsTitle: "Niveaux",
      noPlayersOption: "Aucun joueur",
      noPlayersPrompt: "Créez un joueur pour voir les analyses.",
      noSessionsCharts: "Ajoutez des sessions pour voir les graphiques.",
      summary: {
        totalSessions: "Total des sessions",
        completionRate: "Taux de réussite",
        avgTime: "Temps moyen",
        avgAttempts: "Tentatives moyennes",
      },
      levelHeader: {
        level: "Niveau",
        games: "Parties",
        percent: "%",
        avgTime: "Temps moyen",
        avgAttempts: "Tentatives moyennes",
      },
      noSessions: "Aucune session pour ce joueur.",
      selectLevelPrompt: "Sélectionnez un niveau lorsque des sessions sont disponibles.",
      noLevelData: "Aucune donnée de niveau pour l'instant. Terminez un niveau pour alimenter les graphiques.",
      chart: {
        sessionsByLevel: "Sessions par niveau",
        completionRate: "Taux de réussite",
      },
      detail: {
        heading: "Détails de {level}",
        planningRatio: "Ratio de planification (modifs par tentative) : {ratio}",
        avgExecutionTime: "Temps d'exécution moyen : {time}",
        avgEditingTime: "Temps d'édition moyen : {time}",
        topMistakes: "Principales erreurs",
        failureReasons: "Raisons d'échec",
        recentSessions: "Sessions récentes",
        noMistakes: "Aucune erreur enregistrée.",
        noFailures: "Aucun échec enregistré.",
        noSessions: "Aucune session pour l'instant.",
        sessionTitle: "Session {id}",
        editingTime: "Temps d'édition : {time}",
        executionTime: "Temps d'exécution : {time}",
        successfulAttempt: "Tentative réussie : {attempt}",
        noBlocks: "Aucun bloc enregistré.",
        coverage: "Couverture : {unique} cases uniques, {revisits} revisites.",
        eventLog: "Journal des événements ({count} événements)",
        selectSession: "Sélectionnez une session pour voir les détails.",
        sessionMeta: {
          attempts: "Tentatives : {count}",
          totalTime: "Temps total : {time}",
          completed: "Terminé : {status}",
          yes: "Oui",
          no: "Non",
        },
      },
      clearConfirm: "Effacer les analyses pour {name} ? Ceci est irréversible.",
    },
    controls: {
      reset: "Réinitialiser",
      mainMenu: "Menu principal",
      settings: "Paramètres",
      runProgram: "Exécuter le programme",
    },
    program: {
      title: "Programme",
      show: "Afficher",
      hide: "Masquer",
    },
    toolbox: {
      hint: "Cliquez ou faites glisser des commandes pour créer un programme.",
    },
    completion: {
      title: "Toutes les balises sont allumées !",
      text: "Vous avez terminé ce niveau. Voulez-vous continuer à vous entraîner ici ou choisir un autre niveau ?",
      nextLevel: "Niveau suivant (Niveau {level})",
      keepPracticing: "Continuer à s'entraîner",
      chooseLevel: "Choisir un autre niveau",
    },
    settings: {
      eyebrow: "Paramètres",
      title: "Personnalisez votre expérience",
      ghostColor: "Couleur du fantôme",
      language: "Langue",
      compactCommands: "Vue compacte des commandes",
      close: "Fermer",
    },
    about: {
      eyebrow: "À propos",
      title: "GhostBot",
      descriptionPrimary:
        "Un jeu de puzzle inspiré de Lightbot dans lequel vous programmez un fantôme pour allumer des balises.",
      descriptionSecondary:
        "Conçu pour explorer l'analytique de l'apprentissage dans les jeux de pensée computationnelle.",
      detailsTitle: "Détails",
      versionLabel: "Version",
      buildLabel: "Build",
      createdBy: "Créé par",
      moreInfo: "Pour plus d'informations, consultez notre article précédent à",
      disclaimer: "Ceci est un prototype de recherche. Les analyses sont stockées localement dans votre navigateur.",
      close: "Retour",
    },
    blocks: {
      forward: "Avancer",
      backward: "Reculer",
      turnLeft: "Tourner à gauche",
      turnRight: "Tourner à droite",
      jump: "Sauter",
      light: "Allumer",
    },
  },
  jp: {
    start: {
      eyebrow: "",
      title: "ミッション開始",
      description: "ロボットをグリッド上で導き、プログラムを作って各ビーコンを点灯させよう。",
      player: {
        label: "プレイヤー情報",
        none: "プレイヤーが選択されていません",
        identify: "プレイヤーを選択",
        switch: "プレイヤーを切り替え",
      },
      play: "プレイ",
      select: "レベル選択",
      modeHint: {
        default: "遊び方を選ぶとレベルが表示されます。",
        progression: "進行モード：レベルをクリアして解放（レベル{level}まで）。",
        free: "自由選択：解放なしで任意のレベルへ。",
      },
      actions: {
        analytics: "学習分析",
        settings: "設定",
        about: "概要",
      },
      levelButton: "レベル {level}",
    },
    playerOverlay: {
      eyebrow: "プレイヤー情報",
      title: "プレイヤーを選択",
      message: "既存のプレイヤーを選ぶか、新しいプロフィールを作成してください。",
      nameLabel: "プレイヤー名",
      namePlaceholder: "例: Alex",
      continue: "続行",
      close: "閉じる",
      empty: "プレイヤーがいません。下で新しいプロフィールを作成してください。",
      createdAt: "作成日 {date}",
      select: "選択",
      selected: "選択済み",
      delete: "削除",
      deleteConfirm: "{name} を削除しますか？セッションも削除されます。",
      selectBeforeRun: "プログラムを実行する前にプレイヤーを選択してください。",
      selectBeforeStart: "レベル開始前にプレイヤーを選択または作成してください。",
    },
    analytics: {
      title: "学習分析",
      subtitle: "プレイヤーとレベルごとの進捗を確認できます。",
      back: "戻る",
      playerLabel: "プレイヤー",
      export: "JSONをエクスポート",
      clear: "プレイヤーデータをクリア",
      levelsTitle: "レベル",
      noPlayersOption: "プレイヤーなし",
      noPlayersPrompt: "分析を見るにはプレイヤーを作成してください。",
      noSessionsCharts: "セッションを追加するとグラフが表示されます。",
      summary: {
        totalSessions: "セッション数",
        completionRate: "クリア率",
        avgTime: "平均時間",
        avgAttempts: "平均試行回数",
      },
      levelHeader: {
        level: "レベル",
        games: "回数",
        percent: "%",
        avgTime: "平均時間",
        avgAttempts: "平均試行回数",
      },
      noSessions: "このプレイヤーのセッションはまだありません。",
      selectLevelPrompt: "セッションがあるレベルを選択してください。",
      noLevelData: "レベルデータがありません。レベルをクリアしてグラフを作成してください。",
      chart: {
        sessionsByLevel: "レベル別セッション",
        completionRate: "クリア率",
      },
      detail: {
        heading: "{level} の詳細",
        planningRatio: "計画比率（試行あたりの編集）: {ratio}",
        avgExecutionTime: "平均実行時間: {time}",
        avgEditingTime: "平均編集時間: {time}",
        topMistakes: "よくあるミス",
        failureReasons: "失敗理由",
        recentSessions: "最近のセッション",
        noMistakes: "ミスはまだ記録されていません。",
        noFailures: "失敗は記録されていません。",
        noSessions: "セッションがありません。",
        sessionTitle: "セッション {id}",
        editingTime: "編集時間: {time}",
        executionTime: "実行時間: {time}",
        successfulAttempt: "成功した試行: {attempt}",
        noBlocks: "保存されたブロックはありません。",
        coverage: "カバレッジ: ユニーク{unique}タイル、再訪{revisits}回。",
        eventLog: "イベントログ（{count}件）",
        selectSession: "セッションを選択して詳細を確認してください。",
        sessionMeta: {
          attempts: "試行回数: {count}",
          totalTime: "合計時間: {time}",
          completed: "完了: {status}",
          yes: "はい",
          no: "いいえ",
        },
      },
      clearConfirm: "{name} の分析を削除しますか？元に戻せません。",
    },
    controls: {
      reset: "リセット",
      mainMenu: "メインメニュー",
      settings: "設定",
      runProgram: "プログラムを実行",
    },
    program: {
      title: "プログラム",
      show: "表示",
      hide: "非表示",
    },
    toolbox: {
      hint: "コマンドをクリックまたはドラッグしてプログラムを作成します。",
    },
    completion: {
      title: "すべてのビーコンを点灯！",
      text: "このレベルをクリアしました。ここで練習を続けますか、それとも別のレベルを選びますか？",
      nextLevel: "次のレベル（レベル {level}）",
      keepPracticing: "練習を続ける",
      chooseLevel: "別のレベルを選ぶ",
    },
    settings: {
      eyebrow: "設定",
      title: "体験をカスタマイズ",
      ghostColor: "ゴーストの色",
      language: "言語",
      compactCommands: "コマンドをコンパクト表示",
      close: "閉じる",
    },
    about: {
      eyebrow: "概要",
      title: "GhostBot",
      descriptionPrimary: "Lightbot に着想を得たパズルゲームで、ゴーストをプログラムしてビーコンを灯します。",
      descriptionSecondary: "コンピュテーショナルシンキングのゲームで学習分析を探究するために作られました。",
      detailsTitle: "詳細",
      versionLabel: "バージョン",
      buildLabel: "ビルド",
      createdBy: "制作者",
      moreInfo: "詳細は以前の論文をご覧ください",
      disclaimer: "これは研究用プロトタイプです。分析データはブラウザ内に保存されます。",
      close: "戻る",
    },
    blocks: {
      forward: "前進",
      backward: "後退",
      turnLeft: "左回転",
      turnRight: "右回転",
      jump: "ジャンプ",
      light: "点灯",
    },
  },
};

const languageNames = {
  en: "English",
  "pt-br": "Português (Brasil)",
  fr: "Français",
  jp: "日本語",
};

let currentLanguage = "pt-br";

function resolveLanguage(language) {
  if (!language) {
    return "pt-br";
  }
  const normalized = language.toLowerCase();
  if (translations[normalized]) {
    return normalized;
  }
  if (normalized.startsWith("pt")) {
    return "pt-br";
  }
  if (normalized.startsWith("fr")) {
    return "fr";
  }
  if (normalized.startsWith("ja") || normalized.startsWith("jp")) {
    return "jp";
  }
  if (normalized.startsWith("en")) {
    return "en";
  }
  return "pt-br";
}

function getNestedValue(source, key) {
  return key.split(".").reduce((value, part) => (value && typeof value === "object" ? value[part] : undefined), source);
}

export function t(key, variables = {}) {
  const resolvedLanguage = resolveLanguage(currentLanguage);
  const base = translations[resolvedLanguage] || translations.en;
  const fallback = translations.en;
  const template = getNestedValue(base, key) ?? getNestedValue(fallback, key) ?? key;
  if (typeof template !== "string") {
    return String(template);
  }
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    const value = variables[name];
    return value === undefined || value === null ? "" : String(value);
  });
}

function applyAttributeTranslations(root, attribute, setter) {
  root.querySelectorAll(`[data-i18n-${attribute}]`).forEach((element) => {
    const key = element.dataset[`i18n${attribute.charAt(0).toUpperCase()}${attribute.slice(1)}`];
    if (!key) {
      return;
    }
    setter(element, t(key));
  });
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (key) {
      element.textContent = t(key);
    }
  });

  applyAttributeTranslations(root, "placeholder", (element, value) => {
    element.placeholder = value;
  });
  applyAttributeTranslations(root, "ariaLabel", (element, value) => {
    element.setAttribute("aria-label", value);
  });
  applyAttributeTranslations(root, "alt", (element, value) => {
    element.setAttribute("alt", value);
  });
}

export function getCurrentLanguage() {
  return currentLanguage;
}

export function getSupportedLanguages() {
  return Object.keys(languageNames).map((code) => ({
    code,
    label: languageNames[code],
  }));
}

export function setLanguage(language) {
  const resolved = resolveLanguage(language);
  currentLanguage = resolved;
  document.documentElement.lang = resolved;
  applyTranslations();
  document.dispatchEvent(
    new CustomEvent("lightbot:language-change", {
      detail: { language: resolved },
    }),
  );
}
