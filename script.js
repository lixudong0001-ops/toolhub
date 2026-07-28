/**
 * script.js — ToolHub 超好用工具集
 * 两级筛选：行业（profession）→ 平台类型（all / plugin / website / app）
 * 完整 i18n 支持：10 种语言界面翻译
 */

// ============================================================
//  远程数据同步配置（部署到 GitHub Pages 后填写仓库地址）
//  留空则仅使用本地 data/ 目录
// ============================================================
const REMOTE_DATA_BASE = 'https://raw.githubusercontent.com/lixudong0001-ops/toolhub/main/data/';

// ============================================================
//  多语言翻译字典
// ============================================================
const TRANSLATIONS = {
  'zh-CN': {
    logo_sub:'超好用工具集', label_industry:'行业筛选', label_platform:'平台类型',
    search_placeholder:'搜索工具名称、功能或场景...', lang_search:'搜索语言...',
    sync_ready:'精选数据已就绪', sync_loading:'同步中...', sync_error:'同步失败',
    sync_time_default:'持续更新 · 严格筛选', sync_refresh_title:'同步最新数据',
    error_banner:'数据同步遇到问题，当前显示内置精选数据。',
    btn_detail:'查看详情', btn_install:'安装插件', btn_visit:'立即访问', btn_download:'下载应用',
    btn_upvote:'有用', btn_upvoted:'已点赞',
    empty_title:'未找到匹配的工具', empty_sub:'换个关键词或行业试试',
    no_data:'暂无数据', rating_suffix:' 评分',
    from_store:'来自商店', from_user:'来自用户',
    cat_all:'全部', cat_programmer:'程序员必备', cat_designer:'设计师必备',
    cat_writer:'写作创作者', cat_researcher:'科研学术', cat_marketer:'营销运营',
    cat_student:'学生党', cat_entrepreneur:'创业者', cat_office:'职场办公',
    type_all:'全部', type_plugin:'插件', type_website:'网站', type_app:'应用',
    badge_plugin:'插件', badge_website:'网站', badge_app:'应用',
    section_all_all:'精选工具大全', section_all_plugin:'精选插件',
    section_all_website:'精选网站', section_all_app:'精选应用',
    section_sub_all:'精选全行业最好用的工具，插件、网站、应用一网打尽，每一个都经过实测推荐',
    section_prof_title:'{name}工具合集',
    section_prof_sub:'为 {name} 精选的最佳工具集，覆盖插件、网站、桌面应用，开箱即用',
  },
  'zh-TW': {
    logo_sub:'超好用工具集', label_industry:'行業篩選', label_platform:'平台類型',
    search_placeholder:'搜尋工具名稱、功能或場景...', lang_search:'搜尋語言...',
    sync_ready:'精選資料已就緒', sync_loading:'同步中...', sync_error:'同步失敗',
    sync_time_default:'持續更新 · 嚴格篩選', sync_refresh_title:'同步最新資料',
    error_banner:'資料同步發生問題，目前顯示內建精選資料。',
    btn_detail:'查看詳情', btn_install:'安裝擴充套件', btn_visit:'立即訪問', btn_download:'下載應用',
    btn_upvote:'有用', btn_upvoted:'已按讚',
    empty_title:'找不到符合的工具', empty_sub:'換個關鍵字或行業試試',
    no_data:'暫無資料', rating_suffix:' 評分',
    from_store:'來自商店', from_user:'來自用戶',
    cat_all:'全部', cat_programmer:'程式設計師必備', cat_designer:'設計師必備',
    cat_writer:'寫作創作者', cat_researcher:'科研學術', cat_marketer:'行銷運營',
    cat_student:'學生', cat_entrepreneur:'創業者', cat_office:'職場辦公',
    type_all:'全部', type_plugin:'擴充套件', type_website:'網站', type_app:'應用',
    badge_plugin:'擴充套件', badge_website:'網站', badge_app:'應用',
    section_all_all:'精選工具大全', section_all_plugin:'精選擴充套件',
    section_all_website:'精選網站', section_all_app:'精選應用',
    section_sub_all:'精選全行業最好用的工具，擴充套件、網站、應用一網打盡，每一個都經過實測推薦',
    section_prof_title:'{name}工具合集',
    section_prof_sub:'為 {name} 精選的最佳工具集，覆蓋擴充套件、網站、桌面應用，開箱即用',
  },
  'en': {
    logo_sub:'Best Tool Collection', label_industry:'Industry', label_platform:'Platform',
    search_placeholder:'Search tools by name, feature or use case...', lang_search:'Search language...',
    sync_ready:'Data ready', sync_loading:'Syncing...', sync_error:'Sync failed',
    sync_time_default:'Always updated \u00b7 Carefully curated', sync_refresh_title:'Sync latest data',
    error_banner:'Data sync failed. Showing built-in curated data.',
    btn_detail:'Details', btn_install:'Install', btn_visit:'Visit', btn_download:'Download',
    btn_upvote:'Helpful', btn_upvoted:'Liked',
    empty_title:'No tools found', empty_sub:'Try a different keyword or industry',
    no_data:'No data', rating_suffix:' ratings',
    from_store:'From store', from_user:'From users',
    cat_all:'All', cat_programmer:'Programmers', cat_designer:'Designers',
    cat_writer:'Writers', cat_researcher:'Researchers', cat_marketer:'Marketers',
    cat_student:'Students', cat_entrepreneur:'Entrepreneurs', cat_office:'Office',
    type_all:'All', type_plugin:'Extensions', type_website:'Websites', type_app:'Apps',
    badge_plugin:'Extension', badge_website:'Website', badge_app:'App',
    section_all_all:'All Tools', section_all_plugin:'Browser Extensions',
    section_all_website:'Online Websites', section_all_app:'Desktop & Mobile Apps',
    section_sub_all:'Carefully curated best tools across all industries',
    section_prof_title:'{name} Toolkit',
    section_prof_sub:'The best tools curated for {name}, covering extensions, websites and apps',
  },
  'ja': {
    logo_sub:'\u53b3\u9078\u30c4\u30fc\u30eb\u30b3\u30ec\u30af\u30b7\u30e7\u30f3', label_industry:'\u696d\u7a2e\u30d5\u30a3\u30eb\u30bf\u30fc', label_platform:'\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0',
    search_placeholder:'\u30c4\u30fc\u30eb\u540d\u30fb\u6a5f\u80fd\u30fb\u30b7\u30fc\u30f3\u3067\u691c\u7d22...', lang_search:'\u8a00\u8a9e\u3092\u691c\u7d22...',
    sync_ready:'\u30c7\u30fc\u30bf\u6e96\u5099\u5b8c\u4e86', sync_loading:'\u540c\u671f\u4e2d...', sync_error:'\u540c\u671f\u5931\u6557',
    sync_time_default:'\u968f\u6642\u66f4\u65b0 \u00b7 \u53b3\u9078\u6e08\u307f', sync_refresh_title:'\u6700\u65b0\u30c7\u30fc\u30bf\u3092\u540c\u671f',
    error_banner:'\u30c7\u30fc\u30bf\u540c\u671f\u306b\u554f\u984c\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002\u5185\u8535\u30c7\u30fc\u30bf\u3092\u8868\u793a\u4e2d\u3002',
    btn_detail:'\u8a73\u7d30\u3092\u898b\u308b', btn_install:'\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb', btn_visit:'\u4eca\u3059\u3050\u958b\u304f', btn_download:'\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9',
    btn_upvote:'\u5f79\u306b\u7acb\u3064', btn_upvoted:'\u3044\u3044\u306d\u6e08\u307f',
    empty_title:'\u30c4\u30fc\u30eb\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093', empty_sub:'\u30ad\u30fc\u30ef\u30fc\u30c9\u3084\u696d\u7a2e\u3092\u5909\u3048\u3066\u307f\u3066\u304f\u3060\u3055\u3044',
    no_data:'\u30c7\u30fc\u30bf\u306a\u3057', rating_suffix:' \u4ef6\u306e\u8a55\u4fa1',
    from_store:'\u30b9\u30c8\u30a2\u304b\u3089', from_user:'\u30e6\u30fc\u30b6\u30fc\u304b\u3089',
    cat_all:'\u3059\u3079\u3066', cat_programmer:'\u30d7\u30ed\u30b0\u30e9\u30de\u30fc\u5fc5\u643a', cat_designer:'\u30c7\u30b6\u30a4\u30ca\u30fc\u5fc5\u643a',
    cat_writer:'\u30e9\u30a4\u30bf\u30fc\u5411\u3051', cat_researcher:'\u7814\u7a76\u30fb\u5b66\u8853', cat_marketer:'\u30de\u30fc\u30b1\u30c6\u30a3\u30f3\u30b0',
    cat_student:'\u5b66\u751f\u5411\u3051', cat_entrepreneur:'\u8d77\u696d\u5bb6\u5411\u3051', cat_office:'\u30aa\u30d5\u30a3\u30b9',
    type_all:'\u3059\u3079\u3066', type_plugin:'\u62e1\u5f35\u6a5f\u80fd', type_website:'\u30a6\u30a7\u30d6\u30b5\u30a4\u30c8', type_app:'\u30a2\u30d7\u30ea',
    badge_plugin:'\u62e1\u5f35\u6a5f\u80fd', badge_website:'\u30b5\u30a4\u30c8', badge_app:'\u30a2\u30d7\u30ea',
    section_all_all:'\u5168\u30c4\u30fc\u30eb\u4e00\u89a7', section_all_plugin:'\u30d6\u30e9\u30a6\u30b6\u62e1\u5f35\u6a5f\u80fd',
    section_all_website:'\u30aa\u30f3\u30e9\u30a4\u30f3\u30c4\u30fc\u30eb', section_all_app:'\u30c7\u30b9\u30af\u30c8\u30c3\u30d7\u30fb\u30e2\u30d0\u30a4\u30eb\u30a2\u30d7\u30ea',
    section_sub_all:'\u5168\u696d\u7a2e\u306e\u4e2d\u304b\u3089\u53b3\u9078\u3057\u305f\u6700\u5f37\u30c4\u30fc\u30eb',
    section_prof_title:'{name}\u5411\u3051\u30c4\u30fc\u30eb\u96c6',
    section_prof_sub:'{name}\u306e\u305f\u3081\u306b\u53b3\u9078\u3057\u305f\u30c4\u30fc\u30eb\u96c6',
  },
  'ko': {
    logo_sub:'\ucd5c\uace0 \ub3c4\uad6c \ucef4\ub809\uc158', label_industry:'\uc5c5\uc885 \ud544\ud130', label_platform:'\ud50c\ub7ab\ud3fc',
    search_placeholder:'\ub3c4\uad6c \uc774\ub984, \uae30\ub2a5 \ub610\ub294 \uc2dc\ub098\ub9ac\uc624 \uac80\uc0c9...', lang_search:'\uc5b8\uc5b4 \uac80\uc0c9...',
    sync_ready:'\ub370\uc774\ud130 \uc900\ube44 \uc644\ub8cc', sync_loading:'\ub3d9\uae30\ud654 \uc911...', sync_error:'\ub3d9\uae30\ud654 \uc2e4\ud328',
    sync_time_default:'\uc9c0\uc18d\uc801 \uc5c5\ub370\uc774\ud2b8 \u00b7 \uc5c4\uaca9 \uc120\ubcc4', sync_refresh_title:'\ucd5c\uc2e0 \ub370\uc774\ud130 \ub3d9\uae30\ud654',
    error_banner:'\ub370\uc774\ud130 \ub3d9\uae30\ud654\uc5d0 \ubb38\uc81c\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.',
    btn_detail:'\uc0c1\uc138 \ubcf4\uae30', btn_install:'\uc124\uce58', btn_visit:'\ubc29\ubb38', btn_download:'\ub2e4\uc6b4\ub85c\ub4dc',
    btn_upvote:'\ub3c4\uc6c0\ub428', btn_upvoted:'\uc88b\uc544\uc694 \uc644\ub8cc',
    empty_title:'\ub3c4\uad6c\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4', empty_sub:'\ub2e4\ub978 \ud0a4\uc6cc\ub4dc\ub098 \uc5c5\uc885\uc744 \uc2dc\ub3c4\ud574 \ubcf4\uc138\uc694',
    no_data:'\ub370\uc774\ud130 \uc5c6\uc74c', rating_suffix:' \uac1c \ud3c9\uac00',
    from_store:'\uc2a4\ud1a0\uc5b4\uc5d0\uc11c', from_user:'\uc0ac\uc6a9\uc790\uc5d0\uc11c',
    cat_all:'\uc804\uccb4', cat_programmer:'\ud504\ub85c\uadf8\ub798\uba38 \ud544\uc218', cat_designer:'\ub514\uc790\uc774\ub108 \ud544\uc218',
    cat_writer:'\uc791\uac00', cat_researcher:'\uc5f0\uad6c \ubc0f \ud559\uc220', cat_marketer:'\ub9c8\ucf00\ud305',
    cat_student:'\ud559\uc0dd\uc6a9', cat_entrepreneur:'\ucc3d\uc5c5\uac00\uc6a9', cat_office:'\uc0ac\ubb34\uc6a9',
    type_all:'\uc804\uccb4', type_plugin:'\ud655\uc7a5 \ud504\ub85c\uadf8\ub7a8', type_website:'\uc6f9\uc0ac\uc774\ud2b8', type_app:'\uc571',
    badge_plugin:'\ud655\uc7a5', badge_website:'\uc0ac\uc774\ud2b8', badge_app:'\uc571',
    section_all_all:'\uc804\uccb4 \ub3c4\uad6c', section_all_plugin:'\ube0c\ub77c\uc6b0\uc800 \ud655\uc7a5 \ud504\ub85c\uadf8\ub7a8',
    section_all_website:'\uc628\ub77c\uc778 \ub3c4\uad6c', section_all_app:'\ub370\uc2a4\ud06c\ud1b1 \u00b7 \ubaa8\ubc14\uc77c \uc571',
    section_sub_all:'\ubaa8\ub4e0 \uc5c5\uc885\uc5d0\uc11c \uc5c4\uc120\ud55c \ucd5c\uace0\uc758 \ub3c4\uad6c',
    section_prof_title:'{name} \ud544\uc218 \ub3c4\uad6c',
    section_prof_sub:'{name}\uc744 \uc704\ud574 \uc5c4\uc120\ud55c \ucd5c\uace0\uc758 \ub3c4\uad6c \ubaa8\uc74c',
  },
  'es': {
    logo_sub:'Colecci\u00f3n de herramientas', label_industry:'Industria', label_platform:'Plataforma',
    search_placeholder:'Buscar herramientas por nombre, funci\u00f3n o caso de uso...', lang_search:'Buscar idioma...',
    sync_ready:'Datos listos', sync_loading:'Sincronizando...', sync_error:'Error de sincronizaci\u00f3n',
    sync_time_default:'Actualizado \u00b7 Curado', sync_refresh_title:'Sincronizar datos',
    error_banner:'Error de sincronizaci\u00f3n. Mostrando datos integrados.',
    btn_detail:'Detalles', btn_install:'Instalar', btn_visit:'Visitar', btn_download:'Descargar',
    btn_upvote:'\u00datil', btn_upvoted:'Ya votado',
    empty_title:'No se encontraron herramientas', empty_sub:'Prueba otro t\u00e9rmino o industria',
    no_data:'Sin datos', rating_suffix:' valoraciones',
    from_store:'De la tienda', from_user:'De usuarios',
    cat_all:'Todo', cat_programmer:'Programadores', cat_designer:'Dise\u00f1adores',
    cat_writer:'Escritores', cat_researcher:'Investigaci\u00f3n', cat_marketer:'Marketing',
    cat_student:'Estudiantes', cat_entrepreneur:'Emprendedores', cat_office:'Oficina',
    type_all:'Todo', type_plugin:'Extensiones', type_website:'Sitios web', type_app:'Apps',
    badge_plugin:'Extensi\u00f3n', badge_website:'Sitio', badge_app:'App',
    section_all_all:'Todas las herramientas', section_all_plugin:'Extensiones del navegador',
    section_all_website:'Sitios web', section_all_app:'Apps de escritorio y m\u00f3vil',
    section_sub_all:'Las mejores herramientas seleccionadas de todas las industrias',
    section_prof_title:'Herramientas para {name}',
    section_prof_sub:'Las mejores herramientas seleccionadas para {name}',
  },
  'fr': {
    logo_sub:'Collection d\'outils', label_industry:'Secteur', label_platform:'Plateforme',
    search_placeholder:'Rechercher un outil...', lang_search:'Rechercher une langue...',
    sync_ready:'Donn\u00e9es pr\u00eates', sync_loading:'Synchronisation...', sync_error:'\u00c9chec',
    sync_time_default:'Mis \u00e0 jour \u00b7 S\u00e9lectionn\u00e9', sync_refresh_title:'Synchroniser',
    error_banner:'Erreur de synchronisation. Affichage des donn\u00e9es int\u00e9gr\u00e9es.',
    btn_detail:'D\u00e9tails', btn_install:'Installer', btn_visit:'Visiter', btn_download:'T\u00e9l\u00e9charger',
    btn_upvote:'Utile', btn_upvoted:'Vot\u00e9',
    empty_title:'Aucun outil trouv\u00e9', empty_sub:'Essayez un autre mot-cl\u00e9',
    no_data:'Aucune donn\u00e9e', rating_suffix:' avis',
    from_store:'Du magasin', from_user:'Des utilisateurs',
    cat_all:'Tous', cat_programmer:'D\u00e9veloppeurs', cat_designer:'Designers',
    cat_writer:'R\u00e9dacteurs', cat_researcher:'Recherche', cat_marketer:'Marketing',
    cat_student:'\u00c9tudiants', cat_entrepreneur:'Entrepreneurs', cat_office:'Bureau',
    type_all:'Tous', type_plugin:'Extensions', type_website:'Sites web', type_app:'Applications',
    badge_plugin:'Extension', badge_website:'Site', badge_app:'App',
    section_all_all:'Tous les outils', section_all_plugin:'Extensions navigateur',
    section_all_website:'Sites web', section_all_app:'Apps bureau & mobile',
    section_sub_all:'Les meilleurs outils s\u00e9lectionn\u00e9s dans toutes les industries',
    section_prof_title:'Outils pour {name}',
    section_prof_sub:'La meilleure s\u00e9lection d\'outils pour {name}',
  },
  'de': {
    logo_sub:'Tool-Sammlung', label_industry:'Branche', label_platform:'Plattform',
    search_placeholder:'Tool suchen...', lang_search:'Sprache suchen...',
    sync_ready:'Daten bereit', sync_loading:'Synchronisiert...', sync_error:'Fehlgeschlagen',
    sync_time_default:'Aktualisiert \u00b7 Kuratiert', sync_refresh_title:'Daten synchronisieren',
    error_banner:'Synchronisierungsfehler. Integrierte Daten werden angezeigt.',
    btn_detail:'Details', btn_install:'Installieren', btn_visit:'Besuchen', btn_download:'Herunterladen',
    btn_upvote:'Hilfreich', btn_upvoted:'Bewertet',
    empty_title:'Keine Tools gefunden', empty_sub:'Versuche einen anderen Begriff',
    no_data:'Keine Daten', rating_suffix:' Bewertungen',
    from_store:'Aus dem Store', from_user:'Von Nutzern',
    cat_all:'Alle', cat_programmer:'Entwickler', cat_designer:'Designer',
    cat_writer:'Autoren', cat_researcher:'Forschung', cat_marketer:'Marketing',
    cat_student:'Studenten', cat_entrepreneur:'Gr\u00fcnder', cat_office:'B\u00fcro',
    type_all:'Alle', type_plugin:'Erweiterungen', type_website:'Webseiten', type_app:'Apps',
    badge_plugin:'Erweiterung', badge_website:'Webseite', badge_app:'App',
    section_all_all:'Alle Tools', section_all_plugin:'Browser-Erweiterungen',
    section_all_website:'Webseiten', section_all_app:'Desktop- & Mobile-Apps',
    section_sub_all:'Die besten Tools aus allen Branchen',
    section_prof_title:'{name}-Tools', section_prof_sub:'Die besten Tools f\u00fcr {name}',
  },
  'pt': {
    logo_sub:'Cole\u00e7\u00e3o de ferramentas', label_industry:'Setor', label_platform:'Plataforma',
    search_placeholder:'Pesquisar...', lang_search:'Pesquisar idioma...',
    sync_ready:'Dados prontos', sync_loading:'Sincronizando...', sync_error:'Falha',
    sync_time_default:'Atualizado \u00b7 Curado', sync_refresh_title:'Sincronizar dados',
    error_banner:'Erro de sincroniza\u00e7\u00e3o. Exibindo dados integrados.',
    btn_detail:'Detalhes', btn_install:'Instalar', btn_visit:'Visitar', btn_download:'Baixar',
    btn_upvote:'\u00datil', btn_upvoted:'Curtido',
    empty_title:'Nenhuma ferramenta encontrada', empty_sub:'Tente outro termo',
    no_data:'Sem dados', rating_suffix:' avalia\u00e7\u00f5es',
    from_store:'Da loja', from_user:'De usu\u00e1rios',
    cat_all:'Todos', cat_programmer:'Programadores', cat_designer:'Designers',
    cat_writer:'Escritores', cat_researcher:'Pesquisa', cat_marketer:'Marketing',
    cat_student:'Estudantes', cat_entrepreneur:'Empreendedores', cat_office:'Escrit\u00f3rio',
    type_all:'Todos', type_plugin:'Extens\u00f5es', type_website:'Sites', type_app:'Apps',
    badge_plugin:'Extens\u00e3o', badge_website:'Site', badge_app:'App',
    section_all_all:'Todas as ferramentas', section_all_plugin:'Extens\u00f5es do navegador',
    section_all_website:'Sites', section_all_app:'Apps desktop e mobile',
    section_sub_all:'As melhores ferramentas selecionadas',
    section_prof_title:'Ferramentas para {name}',
    section_prof_sub:'As melhores ferramentas para {name}',
  },
  'ru': {
    logo_sub:'\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044f \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u043e\u0432', label_industry:'\u041e\u0442\u0440\u0430\u0441\u043b\u044c', label_platform:'\u041f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430',
    search_placeholder:'\u041f\u043e\u0438\u0441\u043a...', lang_search:'\u041f\u043e\u0438\u0441\u043a \u044f\u0437\u044b\u043a\u0430...',
    sync_ready:'\u0414\u0430\u043d\u043d\u044b\u0435 \u0433\u043e\u0442\u043e\u0432\u044b', sync_loading:'\u0421\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0430\u0446\u0438\u044f...', sync_error:'\u041e\u0448\u0438\u0431\u043a\u0430',
    sync_time_default:'\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f \u00b7 \u041e\u0442\u0431\u043e\u0440', sync_refresh_title:'\u0421\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c',
    error_banner:'\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0430\u0446\u0438\u0438.',
    btn_detail:'\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435', btn_install:'\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c', btn_visit:'\u041e\u0442\u043a\u0440\u044b\u0442\u044c', btn_download:'\u0421\u043a\u0430\u0447\u0430\u0442\u044c',
    btn_upvote:'\u041f\u043e\u043b\u0435\u0437\u043d\u043e', btn_upvoted:'\u041e\u0446\u0435\u043d\u0435\u043d\u043e',
    empty_title:'\u0418\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b', empty_sub:'\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0434\u0440\u0443\u0433\u043e\u0435 \u0441\u043b\u043e\u0432\u043e',
    no_data:'\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445', rating_suffix:' \u043e\u0446\u0435\u043d\u043e\u043a',
    from_store:'\u0418\u0437 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0430', from_user:'\u041e\u0442 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439',
    cat_all:'\u0412\u0441\u0435', cat_programmer:'\u0414\u043b\u044f \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0438\u0441\u0442\u043e\u0432', cat_designer:'\u0414\u043b\u044f \u0434\u0438\u0437\u0430\u0439\u043d\u0435\u0440\u043e\u0432',
    cat_writer:'\u0414\u043b\u044f \u043f\u0438\u0441\u0430\u0442\u0435\u043b\u0435\u0439', cat_researcher:'\u041d\u0430\u0443\u043a\u0430', cat_marketer:'\u041c\u0430\u0440\u043a\u0435\u0442\u0438\u043d\u0433',
    cat_student:'\u0414\u043b\u044f \u0441\u0442\u0443\u0434\u0435\u043d\u0442\u043e\u0432', cat_entrepreneur:'\u0414\u043b\u044f \u043f\u0440\u0435\u0434\u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0442\u0435\u043b\u0435\u0439', cat_office:'\u0414\u043b\u044f \u043e\u0444\u0438\u0441\u0430',
    type_all:'\u0412\u0441\u0435', type_plugin:'\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u044f', type_website:'\u0421\u0430\u0439\u0442\u044b', type_app:'\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f',
    badge_plugin:'\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u0435', badge_website:'\u0421\u0430\u0439\u0442', badge_app:'\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435',
    section_all_all:'\u0412\u0441\u0435 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b', section_all_plugin:'\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u044f',
    section_all_website:'\u041e\u043d\u043b\u0430\u0439\u043d-\u0441\u0435\u0440\u0432\u0438\u0441\u044b', section_all_app:'\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f',
    section_sub_all:'\u041b\u0443\u0447\u0448\u0438\u0435 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b',
    section_prof_title:'\u0418\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b \u0434\u043b\u044f {name}',
    section_prof_sub:'\u041b\u0443\u0447\u0448\u0438\u0435 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b \u0434\u043b\u044f {name}',
  },
  'ar': {
    logo_sub:'\u0645\u062c\u0645\u0648\u0639\u0629 \u0623\u062f\u0648\u0627\u062a', label_industry:'\u0642\u0637\u0627\u0639', label_platform:'\u0645\u0646\u0635\u0629',
    search_placeholder:'\u0628\u062d\u062b...', lang_search:'\u0628\u062d\u062b \u0639\u0646 \u0644\u063a\u0629...',
    sync_ready:'\u062c\u0627\u0647\u0632\u0629', sync_loading:'\u062c\u0627\u0631\u064d \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629...', sync_error:'\u0641\u0634\u0644',
    sync_time_default:'\u062a\u062d\u062f\u064a\u062b \u0645\u0633\u062a\u0645\u0631', sync_refresh_title:'\u0645\u0632\u0627\u0645\u0646\u0629',
    error_banner:'\u0641\u0634\u0644 \u0641\u064a \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629.',
    btn_detail:'\u062a\u0641\u0627\u0635\u064a\u0644', btn_install:'\u062a\u062b\u0628\u064a\u062a', btn_visit:'\u0632\u064a\u0627\u0631\u0629', btn_download:'\u062a\u062d\u0645\u064a\u0644',
    btn_upvote:'\u0645\u0641\u064a\u062f', btn_upvoted:'\u062a\u0645 \u0627\u0644\u062a\u0642\u064a\u064a\u0645',
    empty_title:'\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0623\u062f\u0648\u0627\u062a', empty_sub:'\u062c\u0631\u0628 \u0643\u0644\u0645\u0629 \u0623\u062e\u0631\u0649',
    no_data:'\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a', rating_suffix:' \u062a\u0642\u064a\u064a\u0645\u0627\u062a',
    from_store:'\u0645\u0646 \u0627\u0644\u0645\u062a\u062c\u0631', from_user:'\u0645\u0646 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646',
    cat_all:'\u0627\u0644\u0643\u0644', cat_programmer:'\u0644\u0644\u0645\u0628\u0631\u0645\u062c\u064a\u0646', cat_designer:'\u0644\u0644\u0645\u0635\u0645\u0645\u064a\u0646',
    cat_writer:'\u0644\u0644\u0643\u062a\u0651\u0627\u0628', cat_researcher:'\u0628\u062d\u062b \u0639\u0644\u0645\u064a', cat_marketer:'\u062a\u0633\u0648\u064a\u0642',
    cat_student:'\u0644\u0644\u0637\u0644\u0627\u0628', cat_entrepreneur:'\u0631\u0648\u0627\u062f \u0623\u0639\u0645\u0627\u0644', cat_office:'\u0645\u0643\u062a\u0628',
    type_all:'\u0627\u0644\u0643\u0644', type_plugin:'\u0625\u0636\u0627\u0641\u0627\u062a', type_website:'\u0645\u0648\u0627\u0642\u0639', type_app:'\u062a\u0637\u0628\u064a\u0642\u0627\u062a',
    badge_plugin:'\u0625\u0636\u0627\u0641\u0629', badge_website:'\u0645\u0648\u0642\u0639', badge_app:'\u062a\u0637\u0628\u064a\u0642',
    section_all_all:'\u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u062f\u0648\u0627\u062a', section_all_plugin:'\u0625\u0636\u0627\u0641\u0627\u062a',
    section_all_website:'\u0645\u0648\u0627\u0642\u0639', section_all_app:'\u062a\u0637\u0628\u064a\u0642\u0627\u062a',
    section_sub_all:'\u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u062f\u0648\u0627\u062a',
    section_prof_title:'\u0623\u062f\u0648\u0627\u062a {name}',
    section_prof_sub:'\u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u062f\u0648\u0627\u062a \u0644\u0640 {name}',
  },
  'hi': {
    logo_sub:'\u091f\u0942\u0932 \u0938\u0902\u0917\u094d\u0930\u0939', label_industry:'\u0909\u0926\u094d\u092f\u094b\u0917', label_platform:'\u092a\u094d\u0932\u0947\u091f\u092b\u093c\u0949\u0930\u094d\u092e',
    search_placeholder:'\u0916\u094b\u091c\u0947\u0902...', lang_search:'\u092d\u093e\u0937\u093e \u0916\u094b\u091c\u0947\u0902...',
    sync_ready:'\u0924\u0948\u092f\u093e\u0930', sync_loading:'\u0938\u093f\u0902\u0915 \u0939\u094b \u0930\u0939\u093e \u0939\u0948...', sync_error:'\u0935\u093f\u092b\u0932',
    sync_time_default:'\u0905\u092a\u0921\u0947\u091f \u00b7 \u091a\u092f\u0928\u093f\u0924', sync_refresh_title:'\u0938\u093f\u0902\u0915 \u0915\u0930\u0947\u0902',
    error_banner:'\u0938\u093f\u0902\u0915 \u092e\u0947\u0902 \u0938\u092e\u0938\u094d\u092f\u093e\u0964',
    btn_detail:'\u0935\u093f\u0935\u0930\u0923', btn_install:'\u0907\u0902\u0938\u094d\u091f\u0949\u0932', btn_visit:'\u0935\u093f\u091c\u093f\u091f', btn_download:'\u0921\u093e\u0909\u0928\u0932\u094b\u0921',
    btn_upvote:'\u0909\u092a\u092f\u094b\u0917\u0940', btn_upvoted:'\u092a\u0938\u0902\u0926 \u0915\u093f\u092f\u093e',
    empty_title:'\u0915\u094b\u0908 \u091f\u0942\u0932 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e', empty_sub:'\u0915\u094b\u0908 \u0914\u0930 \u0915\u0940\u0935\u0930\u094d\u0921 \u0906\u091c\u093c\u092e\u093e\u090f\u0902',
    no_data:'\u0915\u094b\u0908 \u0921\u0947\u091f\u093e \u0928\u0939\u0940\u0902', rating_suffix:' \u0930\u0947\u091f\u093f\u0902\u0917',
    from_store:'\u0938\u094d\u091f\u094b\u0930 \u0938\u0947', from_user:'\u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e\u0913\u0902 \u0938\u0947',
    cat_all:'\u0938\u092d\u0940', cat_programmer:'\u092a\u094d\u0930\u094b\u0917\u094d\u0930\u093e\u092e\u0930', cat_designer:'\u0921\u093f\u091c\u093c\u093e\u0907\u0928\u0930',
    cat_writer:'\u0932\u0947\u0916\u0915', cat_researcher:'\u0936\u094b\u0927', cat_marketer:'\u092e\u093e\u0930\u094d\u0915\u0947\u091f\u093f\u0902\u0917',
    cat_student:'\u091b\u093e\u0924\u094d\u0930', cat_entrepreneur:'\u0909\u0926\u094d\u092f\u092e\u0940', cat_office:'\u0915\u093e\u0930\u094d\u092f\u093e\u0932\u092f',
    type_all:'\u0938\u092d\u0940', type_plugin:'\u090f\u0915\u094d\u0938\u091f\u0947\u0902\u0936\u0928', type_website:'\u0935\u0947\u092c\u0938\u093e\u0907\u091f', type_app:'\u0910\u092a',
    badge_plugin:'\u090f\u0915\u094d\u0938\u091f\u0947\u0902\u0936\u0928', badge_website:'\u0935\u0947\u092c\u0938\u093e\u0907\u091f', badge_app:'\u0910\u092a',
    section_all_all:'\u0938\u092d\u0940 \u091f\u0942\u0932', section_all_plugin:'\u090f\u0915\u094d\u0938\u091f\u0947\u0902\u0936\u0928',
    section_all_website:'\u0935\u0947\u092c\u0938\u093e\u0907\u091f', section_all_app:'\u0910\u092a',
    section_sub_all:'\u0938\u092d\u0940 \u0909\u0926\u094d\u092f\u094b\u0917\u094b\u0902 \u0938\u0947 \u091a\u0941\u0928\u0947 \u0917\u090f \u0938\u0930\u094d\u0935\u0936\u094d\u0930\u0947\u0937\u094d\u0920 \u091f\u0942\u0932',
    section_prof_title:'{name} \u0915\u0947 \u0932\u093f\u090f \u091f\u0942\u0932',
    section_prof_sub:'{name} \u0915\u0947 \u0932\u093f\u090f \u0938\u0930\u094d\u0935\u0936\u094d\u0930\u0947\u0937\u094d\u0920 \u091f\u0942\u0932',
  },
};

// 其余语言回退到 English
const LANG_FALLBACK = 'en';
['it','tr','pl','nl','vi','th','id','ms'].forEach(l => { TRANSLATIONS[l] = TRANSLATIONS['en']; });

/** 翻译函数，支持 {name} 插值 */
function t(key, vars) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS[LANG_FALLBACK];
  let s = dict[key] || TRANSLATIONS[LANG_FALLBACK][key] || key;
  if (vars) Object.keys(vars).forEach(k => { s = s.replace(`{${k}}`, vars[k]); });
  return s;
}

// ============================================================
//  行业分类配置（动态翻译）
// ============================================================
function getProfCats() {
  return [
    { id:'all',          nameKey:'cat_all',          icon:'fa-solid fa-bolt' },
    { id:'programmer',   nameKey:'cat_programmer',   icon:'fa-solid fa-code' },
    { id:'designer',     nameKey:'cat_designer',     icon:'fa-solid fa-palette' },
    { id:'writer',       nameKey:'cat_writer',       icon:'fa-solid fa-pen-nib' },
    { id:'researcher',   nameKey:'cat_researcher',   icon:'fa-solid fa-flask' },
    { id:'marketer',     nameKey:'cat_marketer',     icon:'fa-solid fa-bullhorn' },
    { id:'student',      nameKey:'cat_student',      icon:'fa-solid fa-graduation-cap' },
    { id:'entrepreneur', nameKey:'cat_entrepreneur', icon:'fa-solid fa-rocket' },
    { id:'office',       nameKey:'cat_office',       icon:'fa-solid fa-briefcase' },
  ].map(c => ({ ...c, name: t(c.nameKey) }));
}

// 各行业子分类配置
const SUBCATS = {
  researcher: [
    { id:'lit',    label:'文献检索', keywords:['unpaywall','scholar','scite','connected papers','researchrabbit','sci-hub','scholarcy','semantic','文献','检索','论文检索','pubmed','web of science'] },
    { id:'read',   label:'阅读翻译', keywords:['沉浸式翻译','deepl','adobe acrobat','pdf','read aloud','dark reader','smart toc','hypothesis','chatpdf','notebooklm','kimi','液体文本','liquidtext','scispace'] },
    { id:'write',  label:'写作润色', keywords:['writefull','grammarly','overleaf','latex','paperpal','wordtune','chatgpt','claude','deepseek','写作','润色','投稿'] },
    { id:'mgmt',   label:'文献管理', keywords:['zotero','mendeley','endnote','jabref','refworks','citavi','文献管理'] },
    { id:'vis',    label:'绘图可视化', keywords:['biorender','figdraw','graphpad','prism','origin','matlab','matplotlib','ggplot','plotly','datawrapper','rawgraphs','flourish','inkscape','bioicons','napkin','tableau','vosviewer','citespace','绘图','可视化','图表','示意图'] },
    { id:'data',   label:'数据分析', keywords:['python','r语言','spss','stata','sas','julia','jupyter','pandas','numpy','scipy','统计','数据分析','机器学习'] },
    { id:'ai',     label:'AI 工具', keywords:['chatgpt','claude','gemini','deepseek','perplexity','kimi','notebooklm','豆包','ai','人工智能'] },
  ],
  programmer: [
    { id:'editor', label:'编辑器/IDE', keywords:['cursor','vscode','visual studio','vim','neovim','jetbrains','sublime','代码编辑'] },
    { id:'ai',     label:'AI 编程', keywords:['copilot','cursor','windsurf','tabnine','codeium','ai','人工智能','代码补全'] },
    { id:'devops', label:'DevOps', keywords:['docker','kubernetes','github','gitlab','ci/cd','vercel','netlify','supabase','部署','云服务'] },
    { id:'debug',  label:'调试测试', keywords:['postman','insomnia','thunder client','chrome devtools','调试','测试','api'] },
  ],
  designer: [
    { id:'ui',     label:'UI 设计', keywords:['figma','sketch','adobe xd','framer','原型','设计稿','ui','ux'] },
    { id:'img',    label:'图像处理', keywords:['photoshop','illustrator','canva','remove.bg','midjourney','stable diffusion','图像','抠图','生成'] },
    { id:'anim',   label:'动效视频', keywords:['after effects','premiere','runway','capcut','视频','动画','剪辑'] },
  ],
  student: [
    { id:'note',   label:'笔记学习', keywords:['notion','obsidian','anki','quizlet','flomo','roam','笔记','学习','记忆'] },
    { id:'read',   label:'阅读工具', keywords:['kindle','pocket','instapaper','hypothesis','read aloud','pdf','阅读'] },
    { id:'ai',     label:'AI 助学', keywords:['chatgpt','claude','perplexity','kimi','notebooklm','deepseek','ai'] },
  ],
  marketer: [
    { id:'seo',    label:'SEO 分析', keywords:['semrush','ahrefs','moz','google analytics','seo','关键词','流量'] },
    { id:'social', label:'社交媒体', keywords:['hootsuite','buffer','sprout','instagram','twitter','社交','发帖','内容'] },
    { id:'email',  label:'邮件营销', keywords:['mailchimp','convertkit','substack','邮件','newsletter','营销'] },
  ],
  entrepreneur: [
    { id:'product',label:'产品开发', keywords:['notion','linear','jira','figma','vercel','bolt','v0','产品','开发'] },
    { id:'biz',    label:'商业运营', keywords:['hubspot','stripe','airtable','zapier','clickup','crm','销售','运营'] },
    { id:'finance',label:'财务法务', keywords:['quickbooks','xero','财务','法务','合规'] },
  ],
  office: [
    { id:'collab', label:'团队协作', keywords:['slack','notion','飞书','zoom','discord','teams','协作','沟通'] },
    { id:'docs',   label:'文档处理', keywords:['word','excel','google docs','sheets','wps','文档','表格','ppt','演示'] },
    { id:'auto',   label:'自动化', keywords:['zapier','make','n8n','自动化','工作流','efficiency'] },
  ],
};

// 平台类型标签
function getTypeLabel(type) {
  const map = {
    plugin:  { label: t('badge_plugin'),  icon:'fa-brands fa-chrome',  btnText: t('btn_install'),  badgeClass:'badge-plugin' },
    website: { label: t('badge_website'), icon:'fa-solid fa-globe',    btnText: t('btn_visit'),    badgeClass:'badge-website' },
    app:     { label: t('badge_app'),     icon:'fa-solid fa-cube',     btnText: t('btn_download'), badgeClass:'badge-app' },
  };
  return map[type] || map.website;
}

// ============================================================
//  全局状态
// ============================================================
let currentLang      = localStorage.getItem('toolhub_lang') || 'zh-CN';
let activeProfession = 'all';
let activeType       = 'all';
let activeSubcat     = 'all';
let searchQuery      = '';
let likedIds         = new Set();

const store = { plugin:{items:[]}, website:{items:[]}, app:{items:[]} };

// ============================================================
//  初始化
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  loadLikedState();
  await seedReviews();
  await loadAllData();
  applyI18n();
  renderSidebar();
  renderAll();
  bindEvents();
  setupLangSelector();
});

// 首次加载评价种子（不覆盖已有用户数据）
async function seedReviews() {
  if (localStorage.getItem('toolhub_reviews_seeded')) return;
  try {
    const resp = await fetch('data/reviews_seed.json');
    if (!resp.ok) return;
    const seed = await resp.json();
    const existing = JSON.parse(localStorage.getItem('toolhub_reviews') || '{}');
    // 合并：种子作为底层，用户自己的数据不被覆盖
    for (const [id, data] of Object.entries(seed)) {
      if (!existing[id]) {
        existing[id] = data;
      } else {
        // 合并评论列表但不覆盖
        const existingIds = new Set((existing[id].reviews || []).map(r => r.id));
        for (const r of (data.reviews || [])) {
          if (!existingIds.has(r.id)) existing[id].reviews.push(r);
        }
      }
    }
    localStorage.setItem('toolhub_reviews', JSON.stringify(existing));
    localStorage.setItem('toolhub_reviews_seeded', '1');
  } catch (e) { console.warn('Seed reviews failed:', e); }
}

// ============================================================
//  数据加载
// ============================================================
async function loadLocalJson(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(resp.status);
    return await resp.json();
  } catch (e) {
    console.warn('Failed to load', url, e);
    return null;
  }
}

async function loadJsonWithFallback(filename) {
  if (REMOTE_DATA_BASE) {
    const remote = await loadLocalJson(REMOTE_DATA_BASE + filename);
    if (remote) return remote;
  }
  return loadLocalJson('data/' + filename);
}

function updateSyncStatus(state, detail) {
  const dot = document.getElementById('syncDot');
  const label = document.getElementById('syncLabel');
  const timeEl = document.getElementById('syncTime');
  if (dot) dot.className = 'sync-dot ' + (state || 'success');
  if (label) {
    label.textContent = state === 'loading' ? t('sync_loading')
      : state === 'error' ? t('sync_error')
      : t('sync_ready');
  }
  if (timeEl && detail) timeEl.textContent = detail;
}

// 将 "11.2万" / "3.1M" / "500" 等格式统一转为数字
function parseUserCount(str) {
  if (!str) return 0;
  const s = String(str).replace(/,/g, '').trim();
  const val = parseFloat(s);
  if (isNaN(val)) return 0;
  if (/万/.test(s)) return Math.round(val * 10000);
  if (/[Kk]/.test(s)) return Math.round(val * 1000);
  if (/[Mm]/.test(s)) return Math.round(val * 1000000);
  return Math.round(val);
}

// 判断是否为纯移动端工具（iOS/Android only，无桌面端）
function isMobileOnly(raw) {
  const p = (raw.platform || '').toLowerCase();
  if (!p) return false;
  const hasMobile  = p.includes('ios') || p.includes('android');
  const hasDesktop = p.includes('windows') || p.includes('mac') || p.includes('linux');
  return hasMobile && !hasDesktop;
}

function normalizeItem(raw, type) {
  const ratingCountStr = raw.ratingCount || raw.fallback_rating_count || raw.users || '';
  return {
    id:             raw.id || '',
    name:           raw.name || '',
    description:    raw.desc || raw.fallback_desc || '',
    icon:           raw.icon || raw.fallback_icon || '',
    rating:         raw.rating || raw.fallback_rating || '',
    ratingCount:    ratingCountStr,
    ratingCountNum: parseUserCount(ratingCountStr),   // 数值，用于排序
    users:          raw.users || raw.fallback_users || '',
    review:         raw.review || raw.fallback_review || raw.topReview || '',
    url:            raw.url || raw.store_url || '',
    store_url:      raw.store_url || raw.url || '',
    category:       Array.isArray(raw.category) ? raw.category : (raw.category ? [raw.category] : []),
    type:           raw.type || type,
    platform:       raw.platform || '',
  };
}

async function loadAllData() {
  updateSyncStatus('loading');

  const [toolsData, websitesData, manifest] = await Promise.all([
    loadJsonWithFallback('ai-tools.json'),
    loadJsonWithFallback('ai-websites.json'),
    loadJsonWithFallback('manifest.json'),
  ]);

  store.plugin.items = [];
  store.website.items = [];
  store.app.items = [];

  // ai-tools.json: { extensions: [...] } — all are plugins
  if (toolsData && toolsData.extensions) {
    store.plugin.items = toolsData.extensions.map(e => normalizeItem(e, 'plugin'));
  }

  // ai-websites.json: { websites: [...], apps: [...] }
  if (websitesData) {
    if (websitesData.websites) {
      store.website.items = websitesData.websites.map(e => normalizeItem(e, 'website'));
    }
    if (websitesData.apps) {
      store.app.items = websitesData.apps
        .filter(e => !isMobileOnly(e))   // 过滤纯移动端工具
        .map(e => normalizeItem(e, 'app'));
    }
  }

  const total = store.plugin.items.length + store.website.items.length + store.app.items.length;
  let syncDetail = t('sync_time_default');

  if (manifest && manifest.updated_at) {
    const d = new Date(manifest.updated_at);
    const dateStr = isNaN(d) ? manifest.version : d.toLocaleDateString(currentLang);
    const added = manifest.last_run?.plugins_added;
    syncDetail = added > 0
      ? `${dateStr} · 新增 ${added} 个工具`
      : `${dateStr} · ${manifest.counts?.total || total} 个工具`;
  }

  if (total > 0) {
    updateSyncStatus('success', syncDetail);
  } else {
    updateSyncStatus('error', syncDetail);
  }
}

// ============================================================
//  渲染
// ============================================================
function getAllItems() {
  let items = [];
  if (activeType === 'all') {
    items = [...store.plugin.items, ...store.website.items, ...store.app.items];
  } else {
    items = store[activeType] ? store[activeType].items : [];
  }
  return items;
}

function filterItems(items) {
  return items.filter(item => {
    // 行业筛选
    if (activeProfession !== 'all') {
      if (!item.category.includes(activeProfession)) return false;
    }
    // 子分类筛选
    if (activeSubcat !== 'all' && SUBCATS[activeProfession]) {
      const sub = SUBCATS[activeProfession].find(s => s.id === activeSubcat);
      if (sub) {
        const nameDesc = (item.name + ' ' + item.description).toLowerCase();
        if (!sub.keywords.some(kw => nameDesc.includes(kw.toLowerCase()))) return false;
      }
    }
    // 搜索
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const text = (item.name + ' ' + item.description).toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
}

// 按用户数量降序排序（数量相同则按评分降序）
function sortByUsers(items) {
  return [...items].sort((a, b) => {
    const diff = (b.ratingCountNum || 0) - (a.ratingCountNum || 0);
    if (diff !== 0) return diff;
    return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
  });
}

function renderAll() {
  const items = getAllItems();
  const filtered = filterItems(items);
  const sorted = sortByUsers(filtered);   // ← 按用户数量排序

  // 更新标题区域
  updateSectionHead();

  const grid = document.getElementById('toolsGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;

  if (sorted.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    return;
  }

  if (empty) empty.style.display = 'none';
  grid.innerHTML = sorted.map(item => buildCard(item)).join('');
}

function updateSectionHead() {
  const badge = document.getElementById('sectionBadge');
  const title = document.getElementById('sectionTitle');
  const sub   = document.getElementById('sectionSub');

  if (activeProfession === 'all') {
    const typeKey = activeType === 'all' ? 'section_all_all'
                  : activeType === 'plugin' ? 'section_all_plugin'
                  : activeType === 'website' ? 'section_all_website'
                  : 'section_all_app';
    if (badge) badge.textContent = t(typeKey);
    if (title) title.textContent = t('section_all_all');
    if (sub)   sub.textContent = t('section_sub_all');
  } else {
    const cats = getProfCats();
    const cat = cats.find(c => c.id === activeProfession);
    const name = cat ? cat.name : activeProfession;
    if (badge) badge.textContent = t('section_prof_title', { name });
    if (title) title.textContent = t('section_prof_title', { name });
    if (sub)   sub.textContent = t('section_prof_sub', { name });
  }
}

function buildCard(item) {
  const tl = getTypeLabel(item.type);
  const isLiked = likedIds.has(item.id);
  const reviews = getReviews(item.id);
  const topReview = reviews.length > 0 ? reviews[0] : null;

  // 图标 HTML
  const iconHtml = item.icon
    ? `<img class="card-icon" src="${esc(item.icon)}" alt="${esc(item.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';

  // 评价块（只显示第一条）
  const reviewBlock = topReview
    ? `<blockquote class="card-quote">"${esc(topReview.text)}"</blockquote>
       <div class="card-review-footer">
         <span class="review-author">— ${esc(topReview.author || t('from_user'))}</span>
         <span class="review-stars">${'★'.repeat(topReview.rating || 5)}</span>
       </div>`
    : `<blockquote class="card-quote card-quote--empty">${t('no_data')}</blockquote>`;

  return `
    <div class="tool-card" data-id="${esc(item.id)}" data-type="${esc(item.type)}">
      <div class="card-top">
        <div class="card-icon-wrap">
          ${iconHtml}
          <div class="card-icon-fb" style="${item.icon ? 'display:none' : ''}">🤖</div>
        </div>
        <div class="card-info">
          <div class="card-name">${esc(item.name)}</div>
          <div class="card-meta-row">
            <span class="type-pill type-pill--${esc(item.type)}">${tl.label}</span>
            ${item.rating ? `<span class="meta-rating"><span class="star-icon">★</span>${esc(item.rating)}</span>` : ''}
            ${item.ratingCount ? `<span class="meta-count"><span class="user-icon">👤</span>${esc(item.ratingCount)}</span>` : ''}
          </div>
        </div>
      </div>
      <p class="card-desc">${esc(item.description)}</p>
      <div class="card-review-block">
        ${reviewBlock}
      </div>
      <div class="card-actions">
        <a class="btn-main" href="${esc(item.url || item.store_url)}" target="_blank">${tl.btnText}</a>
      </div>
      <button class="btn-heart ${isLiked ? 'is-liked' : ''}" data-id="${esc(item.id)}" title="${isLiked ? t('btn_upvoted') : t('btn_upvote')}">
        ${isLiked ? '♥' : '♡'}
      </button>
    </div>`;
}
// ============================================================
//  评价系统
// ============================================================
function getReviews(toolId) {
  try {
    const all = JSON.parse(localStorage.getItem('toolhub_reviews') || '{}');
    const data = all[toolId];
    if (!data || !data.reviews) return [];
    return data.reviews.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } catch (e) { return []; }
}

function saveReview(toolId, review) {
  const all = JSON.parse(localStorage.getItem('toolhub_reviews') || '{}');
  if (!all[toolId]) all[toolId] = { reviews: [] };
  all[toolId].reviews.push(review);
  localStorage.setItem('toolhub_reviews', JSON.stringify(all));
}

function deleteReview(toolId, reviewId) {
  const all = JSON.parse(localStorage.getItem('toolhub_reviews') || '{}');
  if (all[toolId] && all[toolId].reviews) {
    all[toolId].reviews = all[toolId].reviews.filter(r => r.id !== reviewId);
    localStorage.setItem('toolhub_reviews', JSON.stringify(all));
  }
}

// ============================================================
//  侧边栏渲染
// ============================================================
function renderSidebar() {
  const nav = document.getElementById('profList');
  if (!nav) return;
  const cats = getProfCats();
  nav.innerHTML = '';

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat.id === activeProfession ? ' active' : '');
    btn.dataset.prof = cat.id;
    btn.innerHTML = `<i class="${cat.icon}"></i><span>${cat.name}</span>`;

    // 子菜单（仅当激活行业展开）
    if (cat.id !== 'all' && SUBCATS[cat.id] && cat.id === activeProfession) {
      const subWrap = document.createElement('div');
      subWrap.className = 'subcat-list';
      // "全部"子项
      const allBtn = document.createElement('button');
      allBtn.className = 'subcat-btn' + (activeSubcat === 'all' ? ' active' : '');
      allBtn.dataset.sub = 'all';
      allBtn.textContent = t('cat_all');
      subWrap.appendChild(allBtn);

      SUBCATS[cat.id].forEach(sub => {
        const sBtn = document.createElement('button');
        sBtn.className = 'subcat-btn' + (activeSubcat === sub.id ? ' active' : '');
        sBtn.dataset.sub = sub.id;
        sBtn.textContent = sub.label;
        subWrap.appendChild(sBtn);
      });

      nav.appendChild(btn);
      nav.appendChild(subWrap);
    } else {
      nav.appendChild(btn);
    }
  });
}

// ============================================================
//  事件绑定
// ============================================================
function bindEvents() {
  // 行业筛选
  const profList = document.getElementById('profList');
  if (profList) {
    profList.addEventListener('click', (e) => {
      // 子分类点击
      const subBtn = e.target.closest('.subcat-btn');
      if (subBtn) {
        e.stopPropagation();
        activeSubcat = subBtn.dataset.sub;
        renderSidebar();
        renderAll();
        return;
      }
      // 行业按钮
      const catBtn = e.target.closest('.cat-btn');
      if (!catBtn) return;
      const prof = catBtn.dataset.prof;
      if (prof === activeProfession && prof !== 'all') {
        // 再次点击已激活行业 → 收起子菜单，回到 all
        activeProfession = 'all';
        activeSubcat = 'all';
      } else {
        activeProfession = prof;
        activeSubcat = 'all';
      }
      renderSidebar();
      renderAll();
    });
  }

  // 平台类型切换
  const typeSwitcher = document.getElementById('typeSwitcher');
  if (typeSwitcher) {
    typeSwitcher.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = e.target.closest('.type-tab');
      if (!tab) return;
      document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeType = tab.dataset.type;
      renderAll();
    });
  }

  // 搜索
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim();
      if (searchClear) searchClear.style.display = searchQuery ? 'block' : 'none';
      renderAll();
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClear.style.display = 'none';
      searchInput.focus();
      renderAll();
    });
  }

  // 卡片操作：统一委托
  const grid = document.getElementById('toolsGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      // 心形点赞按钮
      const heartBtn = e.target.closest('.btn-heart');
      if (heartBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = heartBtn.dataset.id;
        if (likedIds.has(id)) {
          likedIds.delete(id);
          heartBtn.classList.remove('is-liked');
          heartBtn.textContent = '♡';
          heartBtn.title = t('btn_upvote');
        } else {
          likedIds.add(id);
          heartBtn.classList.add('is-liked');
          heartBtn.textContent = '♥';
          heartBtn.title = t('btn_upvoted');
          heartBtn.animate([
            { transform: 'scale(0.8)' },
            { transform: 'scale(1.25)' },
            { transform: 'scale(1)' },
          ], { duration: 350, easing: 'ease-out' });
        }
        saveLikedState();
        return;
      }

      // 查看详情按钮
      const detailBtn = e.target.closest('.btn-detail');
      if (detailBtn) {
        const id = detailBtn.dataset.id;
        const allItems = [...store.plugin.items, ...store.website.items, ...store.app.items];
        const item = allItems.find(x => x.id === id);
        if (item) openDetailPanel(item);
        return;
      }

      // 展开评价（卡片内）
      const expandBtn = e.target.closest('.more-reviews-btn');
      if (expandBtn) {
        const id = expandBtn.dataset.id;
        const container = document.getElementById('reviews-' + id);
        if (!container) return;
        const opening = container.style.display === 'none';
        container.style.display = opening ? 'block' : 'none';
        const arrow = expandBtn.querySelector('.more-arrow');
        if (arrow) arrow.textContent = opening ? '∨' : '›';
        if (opening && container.innerHTML === '') {
          const reviews = getReviews(id);
          container.innerHTML = reviews.slice(1).map(r => `
            <div class="review-item">
              <div class="review-meta">
                <span>${esc(r.author || t('from_user'))}</span>
                <span>${'★'.repeat(r.rating || 5)}</span>
              </div>
              <div class="review-text">${esc(r.text)}</div>
            </div>
          `).join('');
        }
        return;
      }
    });
  }

  // 详情面板关闭
  const detailOverlay = document.getElementById('detailOverlay');
  const detailClose   = document.getElementById('detailClose');
  if (detailOverlay) detailOverlay.addEventListener('click', closeDetailPanel);
  if (detailClose)   detailClose.addEventListener('click', closeDetailPanel);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetailPanel(); });

  // 刷新按钮
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.classList.add('loading');
      updateSyncStatus('loading');
      await loadAllData();
      renderAll();
      refreshBtn.classList.remove('loading');
    });
  }
}

// ============================================================
//  i18n 应用
// ============================================================
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder || el.getAttribute('data-i18n-placeholder'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle || el.getAttribute('data-i18n-title'));
  });
}

// ============================================================
//  语言选择器
// ============================================================
function setupLangSelector() {
  const btn = document.getElementById('langBtn');
  const dropdown = document.getElementById('langDropdown');
  const langList = document.getElementById('langList');
  const langSearch = document.getElementById('langSearch');

  if (!btn || !dropdown) return;

  // 恢复选中状态
  const items = langList ? langList.querySelectorAll('.lang-item') : [];
  items.forEach(item => {
    item.classList.toggle('active', item.dataset.lang === currentLang);
    if (item.dataset.lang === currentLang) {
      const cur = document.getElementById('langCurrent');
      if (cur) cur.textContent = item.dataset.label || item.querySelector('.lang-name').textContent;
    }
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  if (langList) {
    langList.addEventListener('click', (e) => {
      const item = e.target.closest('.lang-item');
      if (!item) return;
      currentLang = item.dataset.lang;
      localStorage.setItem('toolhub_lang', currentLang);
      items.forEach(i => i.classList.toggle('active', i.dataset.lang === currentLang));
      const cur = document.getElementById('langCurrent');
      if (cur) cur.textContent = item.dataset.label || item.querySelector('.lang-name').textContent;
      dropdown.classList.remove('show');
      // 重新渲染
      applyI18n();
      renderSidebar();
      renderAll();
    });
  }

  if (langSearch) {
    langSearch.addEventListener('input', () => {
      const q = langSearch.value.toLowerCase();
      items.forEach(item => {
        const name = (item.querySelector('.lang-name')?.textContent || '').toLowerCase();
        item.style.display = name.includes(q) || !q ? '' : 'none';
      });
    });
  }

  document.addEventListener('click', () => {
    dropdown.classList.remove('show');
  });
}

// ============================================================
//  点赞持久化
// ============================================================
function loadLikedState() {
  try {
    const saved = JSON.parse(localStorage.getItem('toolhub_liked') || '[]');
    likedIds = new Set(saved);
  } catch (e) { likedIds = new Set(); }
}

function saveLikedState() {
  localStorage.setItem('toolhub_liked', JSON.stringify([...likedIds]));
}

// ============================================================
//  工具函数
// ============================================================
function openUrl(url) {
  if (!url) return;
  if (typeof chrome !== 'undefined' && chrome.tabs) chrome.tabs.create({ url });
  else window.open(url, '_blank');
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ============================================================
//  详情面板
// ============================================================
function openDetailPanel(item) {
  const panel   = document.getElementById('detailPanel');
  const overlay = document.getElementById('detailOverlay');
  const body    = document.getElementById('detailPanelBody');
  if (!panel || !body) return;

  const tl = getTypeLabel(item.type);
  const isLiked = likedIds.has(item.id);
  const reviews = getReviews(item.id);

  const iconHtml = item.icon
    ? `<img class="dp-icon" src="${esc(item.icon)}" alt="${esc(item.name)}"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';

  const starsStr = reviews.length > 0
    ? `${(reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)}`
    : (item.rating || '');

  const reviewsHtml = reviews.length > 0
    ? reviews.map(r => `
        <div class="dp-review-item">
          <div class="dp-review-header">
            <span class="dp-review-author">${esc(r.author || t('from_user'))}</span>
            <span class="dp-review-stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</span>
          </div>
          <p class="dp-review-text">${esc(r.text)}</p>
        </div>`).join('')
    : `<p class="dp-no-review">${t('no_data')}</p>`;

  body.innerHTML = `
    <div class="dp-hero">
      <div class="dp-icon-wrap">
        ${iconHtml}
        <div class="dp-icon-fb" style="${item.icon ? 'display:none' : ''}">🤖</div>
      </div>
      <div class="dp-hero-info">
        <h2 class="dp-name">${esc(item.name)}</h2>
        <div class="dp-meta-row">
          <span class="type-pill type-pill--${esc(item.type)}">${tl.label}</span>
          ${starsStr ? `<span class="dp-rating"><span class="star-icon">★</span>${starsStr}</span>` : ''}
          ${item.ratingCount ? `<span class="dp-count"><span class="user-icon">👤</span>${esc(item.ratingCount)}</span>` : ''}
        </div>
      </div>
    </div>

    <p class="dp-desc">${esc(item.description)}</p>

    <div class="dp-actions">
      <a class="btn-main" href="${esc(item.url || item.store_url)}" target="_blank">${tl.btnText}</a>
      <button class="btn-heart dp-heart ${isLiked ? 'is-liked' : ''}"
              data-id="${esc(item.id)}"
              title="${isLiked ? t('btn_upvoted') : t('btn_upvote')}">
        ${isLiked ? '♥' : '♡'} ${isLiked ? t('btn_upvoted') : t('btn_upvote')}
      </button>
    </div>

    <div class="dp-section-label">用户评价 (${reviews.length})</div>
    <div class="dp-reviews">
      ${reviewsHtml}
    </div>
  `;

  // 详情面板内的点赞也要绑定
  body.querySelector('.dp-heart')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    if (likedIds.has(id)) {
      likedIds.delete(id);
      btn.classList.remove('is-liked');
      btn.innerHTML = '♡ ' + t('btn_upvote');
      // 同步更新卡片上的心形
      const cardHeart = document.querySelector(`.btn-heart[data-id="${id}"]`);
      if (cardHeart) { cardHeart.classList.remove('is-liked'); cardHeart.textContent = '♡'; }
    } else {
      likedIds.add(id);
      btn.classList.add('is-liked');
      btn.innerHTML = '♥ ' + t('btn_upvoted');
      btn.animate([{transform:'scale(0.8)'},{transform:'scale(1.2)'},{transform:'scale(1)'}], {duration:300});
      const cardHeart = document.querySelector(`.btn-heart[data-id="${id}"]`);
      if (cardHeart) { cardHeart.classList.add('is-liked'); cardHeart.textContent = '♥'; }
    }
    saveLikedState();
  });

  panel.classList.add('open');
  if (overlay) overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeDetailPanel() {
  const panel   = document.getElementById('detailPanel');
  const overlay = document.getElementById('detailOverlay');
  if (panel)   panel.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}
