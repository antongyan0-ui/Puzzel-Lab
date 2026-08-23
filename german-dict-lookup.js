/**
 * German Dictionary Lookup (German → Chinese)
 * -------------------------------------------
 * A self-contained module that provides:
 *   1. A built-in mini-dictionary of 500+ common German words with Chinese translations
 *   2. An async lookup function (builtin → API → heuristic)
 *   3. A floating popup UI that matches the app's warm brown/orange design system
 *   4. A function to attach "查词" buttons to vocabulary items
 *
 * Design-system CSS variables used:
 *   --lc-color-surface, --lc-color-border, --lc-color-primary,
 *   --lc-color-text, --lc-color-text-secondary, --lc-color-text-tertiary,
 *   --lc-radius-md, --lc-shadow-float
 *
 * The popup CSS is injected once on first use so the file stays standalone.
 */

/* ===========================================================================
 * 0. Inline CSS for the dictionary popup
 * ========================================================================= */

var LC_DICT_POPUP_CSS = `
.lc-dict-popup {
    position: fixed;
    z-index: 10000;
    background: var(--lc-color-surface);
    border: 1px solid var(--lc-color-border);
    border-radius: var(--lc-radius-md);
    box-shadow: var(--lc-shadow-float);
    padding: 16px;
    min-width: 240px;
    max-width: 360px;
    font-size: 14px;
}
.lc-dict-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--lc-color-border);
}
.lc-dict-popup-word {
    font-weight: 700;
    font-size: 16px;
    color: var(--lc-color-primary);
}
.lc-dict-popup-translation {
    color: var(--lc-color-text);
    line-height: 1.5;
    margin: 8px 0;
}
.lc-dict-popup-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--lc-color-text-tertiary);
    font-size: 20px;
    padding: 0 4px;
    line-height: 1;
}
.lc-dict-popup-close:hover {
    color: var(--lc-color-primary);
}
.lc-dict-popup-source {
    font-size: 11px;
    color: var(--lc-color-text-tertiary);
    margin-top: 8px;
}
.lc-dict-popup-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--lc-color-text-secondary);
}
.lc-dict-popup-loading .lc-dict-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--lc-color-border);
    border-top-color: var(--lc-color-primary);
    border-radius: 50%;
    animation: lc-dict-spin 0.7s linear infinite;
    display: inline-block;
}
.lc-dict-popup-meta {
    font-size: 12px;
    color: var(--lc-color-text-secondary);
    margin-top: 4px;
    font-style: italic;
}
.lc-dict-popup-notfound {
    color: var(--lc-color-text-secondary);
    font-style: italic;
    margin: 8px 0;
}
.lc-dict-popup-actions {
    margin-top: 10px;
    display: flex;
    gap: 8px;
}
.lc-dict-popup-btn {
    background: var(--lc-color-primary);
    color: #fff;
    border: none;
    border-radius: var(--lc-radius-md);
    padding: 5px 12px;
    font-size: 12px;
    cursor: pointer;
}
.lc-dict-popup-btn:hover {
    opacity: 0.85;
}
.lc-dict-popup-btn-secondary {
    background: transparent;
    color: var(--lc-color-primary);
    border: 1px solid var(--lc-color-border);
}
.lc-dict-lookup-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: var(--lc-color-surface);
    border: 1px solid var(--lc-color-border);
    border-radius: var(--lc-radius-md);
    padding: 2px 8px;
    font-size: 12px;
    color: var(--lc-color-primary);
    cursor: pointer;
    margin-left: 6px;
    vertical-align: middle;
    transition: background 0.15s ease;
}
.lc-dict-lookup-btn:hover {
    background: var(--lc-color-primary);
    color: #fff;
}
@keyframes lc-dict-spin {
    to { transform: rotate(360deg); }
}
`;

/* Inject the CSS exactly once */
function _ensureDictPopupCSS() {
    if (document.getElementById('lc-dict-popup-style')) return;
    var style = document.createElement('style');
    style.id = 'lc-dict-popup-style';
    style.textContent = LC_DICT_POPUP_CSS;
    document.head.appendChild(style);
}

/* ===========================================================================
 * 1. Built-in mini-dictionary (500+ common German → Chinese entries)
 *    Keys are lowercased; multi-word phrases keep a single space.
 * ========================================================================= */

var DE_ZH_DICT = {
    // ---- Articles / Determiners ----
    'der': '冠词/阳性',
    'die': '冠词/阴性/复数',
    'das': '冠词/中性',
    'den': '冠词/阳性(宾格)',
    'dem': '冠词/与格',
    'des': '冠词/属格',
    'ein': '一个(阳性)',
    'eine': '一个(阴性)',
    'einem': '一个(与格)',
    'einen': '一个(阳性宾格)',
    'eines': '一个(属格)',
    'kein': '没有(阳性)',
    'keine': '没有(阴性/复数)',
    'mein': '我的(阳性)',
    'meine': '我的(阴性/复数)',
    'dein': '你的(阳性)',
    'deine': '你的(阴性/复数)',
    'sein': '他的(阳性)',
    'seine': '他的(阴性/复数)',
    'ihr': '她的/你们的(阳性)',
    'ihre': '她的/你们的(阴性/复数)',
    'unser': '我们的(阳性)',
    'unsere': '我们的(阴性/复数)',
    'euer': '你们的(阳性)',
    'eure': '你们的(阴性/复数)',
    'dieser': '这个(阳性)',
    'diese': '这个(阴性/复数)',
    'dieses': '这个(中性)',
    'jener': '那个(阳性)',
    'jene': '那个(阴性/复数)',
    'welcher': '哪个(阳性)',
    'welche': '哪个(阴性/复数)',
    'jeder': '每个(阳性)',
    'jede': '每个(阴性)',
    'jedes': '每个(中性)',
    'alle': '所有',
    'manche': '一些',
    'viele': '许多',
    'wenige': '少数',
    'einige': '一些',
    'mehrere': '好几个',
    'solche': '这样的',

    // ---- Pronouns ----
    'ich': '我',
    'du': '你',
    'er': '他',
    'sie': '她/他们',
    'es': '它',
    'wir': '我们',
    'ihr': '你们',
    'mich': '我(宾格)',
    'dich': '你(宾格)',
    'sich': '自己',
    'uns': '我们(宾格/与格)',
    'euch': '你们(宾格/与格)',
    'mir': '我(与格)',
    'dir': '你(与格)',
    'ihm': '他(与格)',
    'ihr': '她(与格)',
    'ihnen': '他们(与格)/您(与格)',
    'man': '人们/一个人',
    'jemand': '某人',
    'niemand': '无人',
    'etwas': '某事/一些',
    'nichts': '没有什么',
    'alles': '一切',
    'wer': '谁',
    'was': '什么',
    'wo': '哪里',
    'wann': '何时',
    'warum': '为什么',
    'wieso': '为什么',
    'wie': '怎样',
    'wohin': '去哪里',
    'woher': '从哪里来',
    'welche': '哪些',
    'wessen': '谁的',

    // ---- Basic verbs ----
    'haben': '有',
    'bin': '是(我)',
    'bist': '是(你)',
    'ist': '是',
    'sind': '是(我们/他们)',
    'seid': '是(你们)',
    'war': '是(过去时)',
    'waren': '是(过去时复数)',
    'wird': '将成为',
    'werden': '成为',
    'wurde': '成为(过去时)',
    'machen': '做/制作',
    'gehen': '走/去',
    'kommt': '来(第三人称单数)',
    'kommen': '来',
    'sieht': '看(第三人称单数)',
    'sehen': '看',
    'sagt': '说(第三人称单数)',
    'sagen': '说',
    'sagt': '说',
    'fragen': '问',
    'gibt': '给(第三人称单数)',
    'geben': '给',
    'nimmt': '拿(第三人称单数)',
    'nehmen': '拿/取',
    'findet': '找到(第三人称单数)',
    'finden': '找到',
    'suchen': '寻找',
    'kaufen': '买',
    'brauchen': '需要',
    'weiß': '知道(第三人称单数)',
    'wissen': '知道',
    'denken': '想/思考',
    'glauben': '相信',
    'schlagen': '打/敲',
    'tragen': '穿/戴/扛',
    'fahren': '行驶/乘车',
    'liest': '读(第三人称单数)',
    'lesen': '读',
    'schreiben': '写',
    'spricht': '说(第三人称单数)',
    'sprechen': '说/讲',
    'trifft': '遇见(第三人称单数)',
    'treffen': '遇见',
    'isst': '吃(第三人称单数)',
    'essen': '吃',
    'trinkt': '喝(第三人称单数)',
    'trinken': '喝',
    'wohnt': '居住(第三人称单数)',
    'wohnen': '居住',
    'lebt': '生活(第三人称单数)',
    'leben': '生活',
    'lernen': '学习',
    'studieren': '学习/读大学',
    'arbeitet': '工作(第三人称单数)',
    'arbeiten': '工作',
    'antworten': '回答',
    'erzählen': '讲述',
    'beschreiben': '描述',
    'vergleichen': '比较',
    'diskutieren': '讨论',
    'präsentieren': '展示/介绍',
    'interessieren': '使...感兴趣',
    'möchte': '想要',
    'möchten': '想要(复数)',
    'würden': '会(虚拟式)',
    'sollten': '应该(虚拟式)',
    'könnten': '能够(虚拟式)',
    'müssten': '必须(虚拟式)',
    'müssen': '必须',
    'kann': '能/会',
    'kannst': '能/会(你)',
    'können': '能/会',
    'darf': '允许',
    'dürfen': '允许',
    'sollen': '应该',
    'wollen': '想/要',
    'mögen': '喜欢',
    'steht': '站(第三人称单数)',
    'stehen': '站/立',
    'liegt': '躺/位于(第三人称单数)',
    'liegen': '躺/位于',
    'sitzt': '坐(第三人称单数)',
    'sitzen': '坐',
    'legen': '放平',
    'stellen': '竖放',
    'hängen': '挂',
    'stecken': '插/放',
    'hält': '拿/停(第三人称单数)',
    'halten': '拿/停/保持',
    'fällt': '落下(第三人称单数)',
    'fallen': '落下',
    'läuft': '跑(第三人称单数)',
    'laufen': '跑/走',
    'springen': '跳',
    'fliegen': '飞',
    'schwimmen': '游泳',
    'klettern': '攀爬',
    'tanzen': '跳舞',
    'singen': '唱歌',
    'spielt': '玩(第三人称单数)',
    'spielen': '玩/演奏',
    'hört': '听(第三人称单数)',
    'hören': '听',
    'rufen': '喊',
    'weinen': '哭',
    'lachen': '笑',
    'schläft': '睡觉(第三人称单数)',
    'schlafen': '睡觉',
    'träumen': '做梦',
    'wecken': '叫醒',
    'aufstehen': '起床',
    'öffnen': '打开',
    'schließt': '关闭(第三人称单数)',
    'schließen': '关闭',
    'anfangen': '开始',
    'ankommen': '到达',
    'beginnen': '开始',
    'beenden': '结束',
    'aufhören': '停止',
    'versuchen': '尝试',
    'hilft': '帮助(第三人称单数)',
    'helfen': '帮助',
    'warten': '等待',
    'vergisst': '忘记(第三人称单数)',
    'vergessen': '忘记',
    'erinnern': '记起/提醒',
    'versteht': '理解(第三人称单数)',
    'verstehen': '理解',
    'erklärt': '解释(第三人称单数)',
    'erklären': '解释',
    'zeigt': '展示(第三人称单数)',
    'zeigen': '展示',
    'bedeutet': '意味着(第三人称单数)',
    'bedeuten': '意味着',
    'heißt': '名叫(第三人称单数)',
    'heißen': '名叫',
    'bekommen': '得到',
    'erhalten': '收到',
    'schicken': '寄送',
    'senden': '发送',
    'bringt': '带来(第三人称单数)',
    'bringen': '带来',
    'holen': '取来',
    'wechseln': '更换/兑换',
    'tauschen': '交换',
    'bezahlen': '付款',
    'kostet': '花费(第三人称单数)',
    'kosten': '花费/值',
    'sparen': '节省',
    'verliert': '失去(第三人称单数)',
    'verlieren': '失去/输',
    'gewinnt': '赢(第三人称单数)',
    'gewinnen': '赢',
    'planen': '计划',
    'vorbereiten': '准备',
    'organisieren': '组织',
    'besuchen': '拜访',
    'einladen': '邀请',
    'feiern': '庆祝',
    'gratulieren': '祝贺',
    'heiraten': '结婚',

    // ---- Nouns: People & Family ----
    'der mann': '男人',
    'die frau': '女人',
    'das kind': '孩子',
    'der mensch': '人',
    'die person': '人',
    'die leute': '人们',
    'der herr': '先生/男士',
    'die dame': '女士',
    'der junge': '男孩',
    'das mädchen': '女孩',
    'der student': '大学生(男)',
    'die studentin': '大学生(女)',
    'der schüler': '学生(中小学,男)',
    'die schülerin': '学生(中小学,女)',
    'der professor': '教授(男)',
    'die professorin': '教授(女)',
    'der lehrer': '老师(男)',
    'die lehrerin': '老师(女)',
    'der arzt': '医生(男)',
    'die ärztin': '医生(女)',
    'der kunde': '顾客(男)',
    'die kundin': '顾客(女)',
    'der kollege': '同事(男)',
    'die kollegin': '同事(女)',
    'der chef': '老板/上司',
    'der mitarbeiter': '员工',
    'der tourist': '游客(男)',
    'die touristin': '游客(女)',
    'der gast': '客人',
    'der nachbar': '邻居(男)',
    'die nachbarin': '邻居(女)',
    'der freund': '朋友(男)',
    'die freundin': '朋友(女)',
    'der gast': '客人',
    'die familie': '家庭',
    'der vater': '父亲',
    'die mutter': '母亲',
    'die eltern': '父母',
    'der sohn': '儿子',
    'die tochter': '女儿',
    'der bruder': '兄弟',
    'die schwester': '姐妹',
    'der onkel': '叔叔/舅舅',
    'die tante': '阿姨/姑姑',
    'der großvater': '祖父/外祖父',
    'die großmutter': '祖母/外祖母',
    'die großeltern': '祖父母',
    'der enkel': '孙子(男)',
    'die enkelin': '孙女(女)',
    'der cousin': '堂/表兄弟',
    'die cousine': '堂/表姐妹',
    'der partner': '伙伴/伴侣',
    'die partnerin': '女伴',

    // ---- Nouns: Time ----
    'der tag': '天/日子',
    'das jahr': '年',
    'die zeit': '时间',
    'der monat': '月份',
    'die woche': '周',
    'die stunde': '小时',
    'die minute': '分钟',
    'die sekunde': '秒',
    'der morgen': '早晨',
    'der vormittag': '上午',
    'der mittag': '中午',
    'der nachmittag': '下午',
    'der abend': '晚上',
    'die nacht': '夜晚',
    'der sonntag': '星期日',
    'der montag': '星期一',
    'der dienstag': '星期二',
    'der mittwoch': '星期三',
    'der donnerstag': '星期四',
    'der freitag': '星期五',
    'der samstag': '星期六',
    'der sonnabend': '星期六(北德)',
    'der frühling': '春天',
    'der sommer': '夏天',
    'der herbst': '秋天',
    'der winter': '冬天',
    'das wochenende': '周末',
    'der feiertag': '假日',
    'der geburtstag': '生日',
    'heute': '今天',
    'morgen': '明天',
    'gestern': '昨天',
    'übermorgen': '后天',
    'vorgestern': '前天',

    // ---- Nouns: Places & Buildings ----
    'die welt': '世界',
    'das land': '国家/土地',
    'die stadt': '城市',
    'das dorf': '村庄',
    'der ort': '地方/地点',
    'die gegend': '地区',
    'die region': '区域',
    'das haus': '房子',
    'die wohnung': '公寓/住所',
    'das zimmer': '房间',
    'der raum': '房间/空间',
    'die küche': '厨房',
    'das bad': '浴室',
    'das badezimmer': '浴室',
    'das schlafzimmer': '卧室',
    'das wohnzimmer': '客厅',
    'die treppe': '楼梯',
    'die decke': '天花板',
    'der boden': '地面/地板',
    'die wand': '墙',
    'die tür': '门',
    'das fenster': '窗户',
    'der garten': '花园',
    'der hof': '院子',
    'die straße': '街道',
    'der weg': '路/方式',
    'der platz': '广场/座位',
    'der park': '公园',
    'die brücke': '桥',
    'die schule': '学校',
    'die universität': '大学',
    'die hochschule': '高等院校',
    'die bibliothek': '图书馆',
    'die mensa': '大学食堂',
    'der bahnhof': '火车站',
    'die station': '车站',
    'der flughafen': '机场',
    'das krankenhaus': '医院',
    'die apotheke': '药房',
    'die post': '邮局',
    'die bank': '银行',
    'das rathaus': '市政厅',
    'die polizei': '警察',
    'die feuerwehr': '消防队',
    'die botschaft': '大使馆',
    'das amt': '局/办事处',
    'die behörde': '当局',
    'das museum': '博物馆',
    'das theater': '剧院',
    'die kirche': '教堂',
    'das restaurant': '餐厅',
    'das café': '咖啡馆',
    'das hotel': '酒店',
    'der laden': '商店',
    'das geschäft': '商店',
    'das einkaufszentrum': '购物中心',
    'der markt': '市场',
    'der supermarkt': '超市',
    'der baum': '树',
    'die blume': '花',
    'das gras': '草',
    'der berg': '山',
    'der see': '湖',
    'das meer': '海',
    'der fluss': '河流',
    'der strand': '海滩',
    'der wald': '森林',
    'das feld': '田地',

    // ---- Nouns: Education & Study ----
    'der kurs': '课程',
    'das seminar': '研讨课',
    'die vorlesung': '讲座',
    'die prüfung': '考试',
    'die klausur': '闭卷考试',
    'die note': '成绩/分数',
    'das zeugnis': '成绩单',
    'das studium': '学业/学习',
    'der studiengang': '专业',
    'der abschluss': '毕业/学位',
    'der bachelor': '学士',
    'der master': '硕士',
    'der doktor': '博士',
    'die vorlesung': '大课/讲座',
    'die übung': '练习',
    'die hausaufgabe': '家庭作业',
    'der kommilitone': '同学(男)',
    'die kommilitonin': '同学(女)',
    'das thema': '主题/题目',
    'die aufgabe': '任务/作业',
    'die frage': '问题',
    'die antwort': '回答',
    'das problem': '问题/难题',
    'die lösung': '解决方案',
    'das beispiel': '例子',
    'der grund': '原因',
    'der vorteil': '优点',
    'der nachteil': '缺点',
    'die meinung': '观点/意见',
    'die idee': '想法',
    'die information': '信息',
    'die daten': '数据',
    'die grafik': '图表',
    'die entwicklung': '发展',
    'die zahl': '数字',
    'das prozent': '百分比',
    'der preis': '价格',
    'das geld': '钱',
    'der euro': '欧元',
    'die wirtschaft': '经济',
    'die firma': '公司',
    'die gesellschaft': '社会',
    'die kultur': '文化',
    'die politik': '政治',
    'die geschichte': '历史/故事',
    'die technik': '技术',
    'die wissenschaft': '科学',
    'die umwelt': '环境',
    'die energie': '能源',
    'das wasser': '水',
    'die luft': '空气',

    // ---- Nouns: Transport & Travel ----
    'das auto': '汽车',
    'der bus': '公共汽车',
    'die bahn': '火车/铁路',
    'der zug': '火车',
    'die straßenbahn': '有轨电车',
    'die u-bahn': '地铁',
    'die s-bahn': '城铁',
    'das taxi': '出租车',
    'das fahrrad': '自行车',
    'das motorrad': '摩托车',
    'das flugzeug': '飞机',
    'das schiff': '船',
    'die reise': '旅行',
    'der urlaub': '假期',
    'der flug': '飞行/航班',
    'die fahrt': '行程/车程',
    'das ticket': '票',
    'die karte': '票/卡/地图',
    'der plan': '计划/时刻表',
    'der fahrplan': '时刻表',
    'der ausweis': '证件',
    'der pass': '护照',
    'der koffer': '行李箱',
    'die tasche': '包',

    // ---- Nouns: Household & Objects ----
    'der tisch': '桌子',
    'der stuhl': '椅子',
    'das bett': '床',
    'das sofa': '沙发',
    'der schrank': '柜子',
    'das regal': '架子',
    'die lampe': '灯',
    'das bild': '图片',
    'der spiegel': '镜子',
    'der schlüssel': '钥匙',
    'die uhr': '钟表',
    'das geschenk': '礼物',
    'die rechnung': '账单',
    'die quittung': '收据',
    'der stift': '笔',
    'der bleistift': '铅笔',
    'das papier': '纸',
    'das heft': '本子',
    'der ordner': '文件夹',
    'der rucksack': '背包',
    'der geldbeutel': '钱包',
    'die brille': '眼镜',
    'die schere': '剪刀',
    'das lineal': '尺子',
    'der radiergummi': '橡皮',
    'das wörterbuch': '词典',
    'das lexikon': '百科全书',
    'die zeitung': '报纸',
    'die zeitschrift': '杂志',
    'der artikel': '文章',
    'der text': '文本',
    'der absatz': '段落',
    'die überschrift': '标题',
    'die übersetzung': '翻译',
    'die grammatik': '语法',
    'der buchstabe': '字母',
    'das alphabet': '字母表',
    'das buch': '书',
    'das wort': '词',
    'der satz': '句子',
    'die seite': '页/边',
    'das telefon': '电话',
    'der computer': '电脑',
    'das internet': '互联网',
    'die musik': '音乐',
    'der film': '电影',
    'das spiel': '游戏',
    'der sport': '运动',
    'die gesundheit': '健康',
    'das essen': '食物/吃',
    'die lebensmittel': '食品',
    'das frühstück': '早餐',
    'das mittagessen': '午餐',
    'das abendessen': '晚餐',
    'der kaffee': '咖啡',
    'der tee': '茶',
    'der saft': '果汁',
    'das bier': '啤酒',
    'der wein': '葡萄酒',
    'das wasser': '水',
    'die milch': '牛奶',
    'das fleisch': '肉',
    'der fisch': '鱼',
    'die kartoffel': '土豆',
    'der reis': '米饭',
    'die nudel': '面条',
    'das gemüse': '蔬菜',
    'das obst': '水果',
    'der apfel': '苹果',
    'die banane': '香蕉',
    'die orange': '橙子',
    'die tomate': '西红柿',
    'der käse': '奶酪',
    'die butter': '黄油',
    'das ei': '鸡蛋',
    'der zucker': '糖',
    'das salz': '盐',
    'der pfeffer': '胡椒',
    'die suppe': '汤',
    'der kuchen': '蛋糕',
    'die schokolade': '巧克力',
    'das eis': '冰淇淋',
    'das brot': '面包',

    // ---- Nouns: Work & Society ----
    'die arbeit': '工作',
    'der job': '工作/职业',
    'der beruf': '职业',
    'das gehalt': '工资',
    'die freiheit': '自由',
    'die freizeit': '休闲时间',
    'das hobby': '爱好',
    'die sprache': '语言',
    'das deutsch': '德语',
    'der fehler': '错误',
    'deutschland': '德国',
    'europa': '欧洲',
    'die miete': '租金',
    'das volk': '民族/人民',
    'das ding': '东西',
    'die sache': '事物/事情',
    'die stelle': '地方/职位',
    'das gebäude': '建筑物',
    'der kalender': '日历',
    'die uhrzeit': '时间(钟点)',

    // ---- Nouns: Nature ----
    'die sonne': '太阳',
    'der mond': '月亮',
    'der stern': '星星',
    'der himmel': '天空',
    'die wolke': '云',
    'der regen': '雨',
    'der schnee': '雪',
    'der wind': '风',
    'das wetter': '天气',
    'die erde': '地球/土地',
    'die natur': '自然',
    'das tier': '动物',
    'der hund': '狗',
    'die katze': '猫',
    'der vogel': '鸟',
    'das pferd': '马',
    'die kuh': '牛',
    'das schwein': '猪',
    'das huhn': '鸡',
    'das schaf': '羊',
    'die maus': '老鼠',

    // ---- Adjectives ----
    'gut': '好',
    'schön': '美丽的',
    'neu': '新的',
    'alt': '旧的/老的',
    'groß': '大的',
    'klein': '小的',
    'viel': '多的',
    'wenig': '少的',
    'schnell': '快的',
    'langsam': '慢的',
    'einfach': '简单的',
    'schwer': '难的/重的',
    'wichtig': '重要的',
    'richtig': '正确的',
    'falsch': '错误的',
    'möglich': '可能的',
    'interessant': '有趣的',
    'toll': '极好的',
    'heiß': '热的',
    'kalt': '冷的',
    'warm': '温暖的',
    'trocken': '干燥的',
    'nass': '湿的',
    'sicher': '安全的/确定的',
    'bekannt': '著名的/熟悉的',
    'freundlich': '友好的',
    'höflich': '礼貌的',
    'pünktlich': '准时的',
    'teuer': '贵的',
    'billig': '便宜的',
    'reich': '富有的',
    'arm': '贫穷的',
    'gesund': '健康的',
    'krank': '生病的',
    'glücklich': '幸福的/高兴的',
    'traurig': '悲伤的',
    'müde': '疲倦的',
    'hungrig': '饥饿的',
    'durstig': '口渴的',
    'voll': '满的',
    'leer': '空的',
    'offen': '开着的',
    'geschlossen': '关闭的',
    'frei': '自由的/空闲的',
    'sauber': '干净的',
    'schmutzig': '脏的',
    'ruhig': '安静的',
    'laut': '大声的',
    'stark': '强壮的',
    'schwach': '弱的',
    'hoch': '高的',
    'tief': '深的/低的',
    'breit': '宽的',
    'dick': '厚的/胖的',
    'dünn': '薄的/瘦的',
    'süß': '甜的',
    'sauer': '酸的',
    'frisch': '新鲜的',
    'modern': '现代的',
    'traditionell': '传统的',
    'aktuell': '当前的',
    'zusätzlich': '额外的',
    'besonders': '特别的',
    'persönlich': '个人的',
    'gemeinsam': '共同的',
    'öffentlich': '公共的',
    'privat': '私人的',
    'formell': '正式的',
    'informell': '非正式的',
    'direkt': '直接的',
    'aktiv': '积极的/活跃的',
    'positiv': '正面的',
    'negativ': '负面的',
    'national': '国家的',
    'international': '国际的',
    'lokal': '本地的',
    'sozial': '社会的',
    'kulturell': '文化的',
    'historisch': '历史的',
    'politisch': '政治的',
    'wirtschaftlich': '经济的',
    'ökologisch': '生态的',
    'technisch': '技术的',
    'wissenschaftlich': '科学的',
    'lang': '长的',
    'kurz': '短的',
    'leicht': '轻的/容易的',
    'bunt': '彩色的',
    'gefährlich': '危险的',
    'fertig': '完成的',
    'lustig': '有趣的/好笑的',
    'ernst': '严肃的',
    'nett': '友好的/好的',
    'schlecht': '坏的',
    'super': '超级的',
    'prima': '很好的',
    'verrückt': '疯狂的',
    'klug': '聪明的',
    'dumm': '笨的',
    'faul': '懒惰的',
    'fleißig': '勤奋的',
    'unhöflich': '不礼貌的',
    'geduldig': '耐心的',
    'ungeduldig': '不耐烦的',
    'ehrlich': '诚实的',
    'unehrlich': '不诚实的',
    'böse': '坏的/恶的',
    'unfreundlich': '不友好的',
    'wunderschön': '极美的',
    'schrecklich': '可怕的/糟糕的',
    'bequem': '舒适的',
    'unbequem': '不舒服的',
    'teuer': '贵的',
    'ginstig': '便宜的',
    'gewöhnlich': '通常的',
    'außergewöhnlich': '非凡的',
    'ähnlich': '相似的',
    'gleich': '相同的',
    'verschieden': '不同的',
    'einzig': '唯一的',
    'nötig': '必要的',
    'überflüssig': '多余的',
    'genug': '足够的',
    'spät': '晚的',
    'früh': '早的',
    'neu': '新的',
    'alt': '旧的',
    'jung': '年轻的',
    'gefährlich': '危险的',
    'sicher': '安全的',

    // ---- Adverbs & function words ----
    'jetzt': '现在',
    'bald': '很快',
    'später': '以后',
    'immer': '总是',
    'nie': '从不',
    'niemals': '从不',
    'manchmal': '有时',
    'oft': '经常',
    'hier': '这里',
    'da': '那里/那儿',
    'dort': '那里',
    'oben': '上面',
    'unten': '下面',
    'links': '左边',
    'rechts': '右边',
    'zusammen': '一起',
    'allein': '独自',
    'auch': '也',
    'nur': '只/仅',
    'noch': '还',
    'schon': '已经',
    'trotzdem': '尽管如此',
    'deshalb': '因此',
    'deswegen': '因此',
    'vielleicht': '也许',
    'natürlich': '当然',
    'sogar': '甚至',
    'besonders': '特别地',
    'ungefähr': '大约',
    'fast': '几乎',
    'gern': '乐意地',
    'lieber': '更喜欢',
    'am liebsten': '最喜欢',
    'sofort': '立即',
    'endlich': '终于',
    'leider': '可惜',
    'übrigens': '顺便说一下',
    'hoffentlich': '但愿',
    'bestimmt': '肯定',
    'wirklich': '真的',
    'sehr': '非常',
    'ziemlich': '相当',
    'ganz': '完全/十分',
    'echt': '真的',
    'absolut': '绝对',
    'etwa': '大约',
    'ansonsten': '否则',
    'dagegen': '反对',
    'dabei': '在旁/同时',
    'dadurch': '通过此',
    'dafür': '为此',
    'dahinter': '在后面',
    'damit': '以便',
    'davon': '由此',
    'dazwischen': '在中间',
    'deswegen': '因此',
    'trotzdem': '尽管如此',
    'außerdem': '此外',
    'jedoch': '然而',
    'dennoch': '尽管如此',
    'vielmehr': '更确切地说',
    'zumindest': '至少',
    'vielleicht': '也许',
    'tatsächlich': '事实上',
    'eigentlich': '本来/其实',
    'nämlich': '即/因为',
    'wohl': '大概/或许',
    'eben': '正是/刚才',
    'halt': '就是(口语)',

    // ---- Prepositions ----
    'in': '在...里',
    'an': '在...旁',
    'auf': '在...上',
    'mit': '和/用',
    'von': '从',
    'zu': '到/向',
    'bei': '在...旁/在...家',
    'nach': '去/在...之后',
    'vor': '在...前',
    'über': '在...上方/关于',
    'unter': '在...下面',
    'durch': '通过',
    'für': '为了',
    'gegen': '反对/对着',
    'ohne': '没有',
    'um': '围绕/在',
    'aus': '从...出',
    'seit': '自从',
    'trotz': '尽管',
    'während': '在...期间',
    'wegen': '因为',
    'bis': '直到',
    'ab': '从...起',
    'gegenüber': '面对',
    'hinter': '在...后面',
    'neben': '在...旁边',
    'innerhalb': '在...之内',
    'außerhalb': '在...之外',
    'statt': '代替',
    'entlang': '沿着',
    'außer': '除了',
    'binnen': '在...之内',
    'inklusive': '包括',
    'exklusive': '不包括',

    // ---- Conjunctions ----
    'und': '和/与',
    'oder': '或',
    'aber': '但是',
    'sondern': '而是',
    'weil': '因为',
    'dass': 'that(连词)',
    'wenn': '如果/当',
    'als': '当...时/比',
    'ob': '是否',
    'obwohl': '尽管',
    'damit': '以便',
    'bevor': '在...之前',
    'nachdem': '在...之后',
    'bis': '直到',
    'sobald': '一...就',
    'solange': '只要',
    'falls': '如果',
    'sodass': '以至于',
    'jedoch': '然而',
    'jedoch': '但是',
    'entweder': '要么',
    'weder': '既不',
    'noch': '也不',
    'sowohl': '既',
    'einerseits': '一方面',
    'andererseits': '另一方面',
    'nämlich': '即/因为',
    'zwar': '虽然',
    'denn': '因为',
    'doch': '但是/还是',
    'allerdings': '不过',
    'hingegen': '相反',

    // ---- TestDaF-specific vocabulary ----
    'die vorbereitungszeit': '准备时间',
    'die sprechzeit': '说话时间',
    'die aufgabenstellung': '题目要求',
    'die situationsbeschreibung': '情境描述',
    'das schaubild': '图表',
    'das diagramm': '图表/图',
    'die quelle': '来源',
    'der prozentsatz': '百分比',
    'der vergleich': '比较',
    'die darstellung': '描述/展示',
    'das argument': '论据',
    'das fazit': '结论',
    'die begründung': '理由',
    'der standpunkt': '立场',
    // TestDaF nouns also without article (for lookup flexibility)
    'vorbereitungszeit': '准备时间',
    'sprechzeit': '说话时间',
    'aufgabenstellung': '题目要求',
    'situationsbeschreibung': '情境描述',
    'schaubild': '图表',
    'diagramm': '图表/图',
    'quelle': '来源',
    'prozentsatz': '百分比',
    'vergleich': '比较',
    'darstellung': '描述/展示',
    'argument': '论据',
    'fazit': '结论',
    'begründung': '理由',
    'standpunkt': '立场',
    'meinung': '观点/意见',
    'vorteil': '优点',
    'nachteil': '缺点',
    'überzeugen': '说服',
    'darstellen': '描述/展示',
    'abwägen': '权衡',
    'begründen': '说明理由',
    'zusammenfassen': '总结',
    'vorstellen': '介绍/想象',
    'argumentieren': '论证',
    'belegen': '证明/引用',
    'erwähnen': '提及',
    'hervorheben': '强调',
    'hervorgehen': '得出',
    'darüber': '关于那',
    'außerdem': '此外',
    'dennoch': '尽管如此',
    'jedoch': '然而',
    'einerseits': '一方面',
    'andererseits': '另一方面',
    'zum einen': '一方面',
    'zum anderen': '另一方面',
    'sowohl': '既',
    'als auch': '也/以及',
    'entweder': '要么',
    'oder': '或',
    'weder': '既不',
    'noch': '也不',
    'zunächst': '首先',
    'anschließend': '随后',
    'schließlich': '最后',
    'zuletzt': '最后',
    'zudem': '此外',
    'ferner': '此外',
    'fernerhin': '此外',
    'obendrein': '此外',
    'gleichfalls': '同样地',
    'ebenso': '同样',
    'daher': '因此',
    'somit': '因此',
    'folglich': '因此',
    'infolgedessen': '因此',
    'mithin': '因此',
    'mithin': '那么',
    'demnach': '因此',
    'demzufolge': '据此',
    'indessen': '然而',
    'inzwischen': '与此同时',
    'unterdessen': '与此同时',
    'gleichzeitig': '同时',
    'derzeit': '目前',
    'heutzutage': '如今',
    'künftig': '将来',
    'künftig': '将来',
    'zukünftig': '未来的',
    'bisher': '到目前为止',
    'seither': '从那时起',
    'vorher': '之前',
    'nachher': '之后',
    'zuvor': '此前',
    'danach': '此后',
    'später': '以后',
    'früher': '以前',
    'damals': '那时',
    'seitdem': '从那时起',
    'solange': '只要',
    'sowie': '以及/一旦',
    'sobald': '一...就',
    'sobaldd': '一...就',

    // ---- Additional common everyday words ----
    'der abschied': '告别',
    'der anfang': '开始',
    'das ende': '结束',
    'der erfolg': '成功',
    'die gefahr': '危险',
    'die hoffnung': '希望',
    'die liebe': '爱',
    'die angst': '恐惧',
    'die freude': '快乐',
    'der schmerz': '疼痛',
    'die ruhe': '安静',
    'die lust': '兴趣/兴致',
    'der mut': '勇气',
    'die geduld': '耐心',
    'die erfahrung': '经验',
    'das wissen': '知识',
    'die kenntnis': '认识/了解',
    'die fähigkeit': '能力',
    'die möglichkeit': '可能性',
    'die chance': '机会',
    'das ziel': '目标',
    'der plan': '计划',
    'der traum': '梦/梦想',
    'die wahrheit': '真相',
    'die lüge': '谎言',
    'der erfolg': '成功',
    'der misserfolg': '失败',
    'die pflicht': '义务',
    'die pflicht': '责任',
    'das recht': '权利',
    'das gesetz': '法律',
    'die regel': '规则',
    'die pflicht': '义务',
    'der rat': '建议',
    'der tipp': '提示',
    'der hinweis': '提示',
    'die nachricht': '消息',
    'die neuigkeit': '新闻',
    'die ankündigung': '通知',
    'diewarnung': '警告',
    'die warnung': '警告',
    'die bitte': '请求',
    'der wunsch': '愿望',
    'die ordnung': '秩序',
    'das system': '系统',
    'die methode': '方法',
    'das verfahren': '方法/程序',
    'der prozess': '过程',
    'der schritt': '步骤',
    'das ergebnis': '结果',
    'die folge': '后果',
    'die wirkung': '影响/效果',
    'der einfluss': '影响',
    'die ursache': '原因',
    'der anlass': '起因',
    'der grund': '原因',
    'der zweck': '目的',
    'der sinn': '意义',
    'der inhalt': '内容',
    'die form': '形式',
    'der stil': '风格',
    'die art': '方式/种类',
    'die weise': '方式',
    'das niveau': '水平',
    'das niveau': '水准',
    'die stufe': '等级/阶段',
    'die klasse': '班级/等级',
    'die gruppe': '组/群',
    'die menge': '数量',
    'das maß': '尺寸/程度',
    'der grad': '程度',
    'die stärke': '强度',
    'die schwäche': '弱点',
    'die qualität': '质量',
    'die quantität': '数量',
    'der wert': '价值',
    'der nutzen': '用途/利益',
    'der schaden': '损害',
    'das risiko': '风险',
    'die gefahr': '危险',
    'die sicherheit': '安全',
    'die unsicherheit': '不确定性',
    'der zweifel': '怀疑',
    'die gewissheit': '确信',
    'die überzeugung': '信念',
    'das vertrauen': '信任',
    'das misstrauen': '不信任',
    'die hoffnung': '希望',
    'die erwartung': '期望',
    'die befürchtung': '担忧',
    'die angst': '恐惧',
    'die sorge': '担忧',
    'die freude': '快乐',
    'der kummer': '忧愁',
    'die trauer': '悲伤',
    'die wut': '愤怒',
    'der ärger': '恼怒',
    'das glück': '幸福/幸运',
    'das pech': '倒霉',
    'das schicksal': '命运',
    'das gefühl': '感觉',
    'die empfindung': '感受',
    'der gedanke': '想法',
    'die meinung': '观点',
    'die ansicht': '看法',
    'die auffassung': '理解/看法',
    'der standpunkt': '立场',
    'die position': '立场/位置',
    'die einstellung': '态度',
    'die haltung': '态度/姿势',
    'das verhalten': '行为',
    'die handlung': '行动',
    'die tat': '行为/事迹',
    'der schritt': '步骤',
    'die maßnahme': '措施',
    'die entscheidung': '决定',
    'die wahl': '选择',
    'die auswahl': '选择/挑选',
    'die möglichkeit': '可能性',
    'die alternative': '替代方案',
    'der vorschlag': '建议',
    'der plan': '计划',
    'das projekt': '项目',
    'das vorhaben': '计划/打算',
    'das ziel': '目标',
    'der zweck': '目的',
    'die absicht': '意图',
    'der wille': '意志',
    'der mut': '勇气',
    'die geduld': '耐心',
    'die ausdauer': '毅力',
    'die energie': '精力/能源',
    'die kraft': '力量',
    'die stärke': '强度/长处',
    'die macht': '权力',
    'die gewalt': '暴力/权力',
    'das recht': '权利/法',
    'die pflicht': '义务',
    'die verantwortung': '责任',
    'die aufgabe': '任务',
    'die funktion': '功能',
    'die rolle': '角色',
    'der teil': '部分',
    'der anteil': '份额',
    'der beitrag': '贡献',
    'die leistung': '成绩/服务',
    'das ergebnis': '结果',
    'der erfolg': '成功',
    'der fortschritt': '进步',
    'die verbesserung': '改善',
    'die änderung': '变更',
    'die entwicklung': '发展',
    'das wachstum': '增长',
    'der zuwachs': '增加',
    'der rückgang': '下降',
    'der abfall': '下降/废物',
    'der anstieg': '上升',
    'die zunahme': '增加',
    'die abnahme': '减少',
    'der unterschied': '差异',
    'der gegensatz': '对立',
    'der kontrast': '对比',
    'der vergleich': '比较',
    'das verhältnis': '关系/比例',
    'die beziehung': '关系',
    'die verbindung': '联系',
    'der kontakt': '接触',
    'die kommunikation': '交流',
    'das gespräch': '谈话',
    'die diskussion': '讨论',
    'die debatte': '辩论',
    'das argument': '论据',
    'die begründung': '理由',
    'der beweis': '证据',
    'das zeichen': '标志/符号',
    'das signal': '信号',
    'die nachricht': '消息',
    'die information': '信息',
    'die auskunft': '信息/答复',
    'die mitteilung': '通知',
    'die ankündigung': '预告',
    'die erklärung': '解释',
    'die beschreibung': '描述',
    'die darstellung': '展示/描述',
    'die zusammenfassung': '总结',
    'die bewertung': '评价',
    'das urteil': '判断',
    'die entscheidung': '决定',
    'der schluss': '结论',
    'das fazit': '结论',
    'das ergebnis': '结果',
    'die folgerung': '推论',
    'die konsequenz': '后果',
    'die auswirkung': '影响',
    'die wirkung': '效果',
    'der effekt': '效果',
    'der einfluss': '影响',
    'die ursache': '原因',
    'der grund': '原因',
    'der anlass': '起因',
    'die bedingung': '条件',
    'die voraussetzung': '前提',
    'die anforderung': '要求',
    'der bedarf': '需求',
    'das bedürfnis': '需要',
    'der wunsch': '愿望',
    'die anfrage': '询问',
    'die frage': '问题',
    'die antwort': '回答',
    'die lösung': '解决方案',
    'das mittel': '手段/方法',
    'der weg': '途径/方式',
    'die art': '方式',
    'die methode': '方法',
    'das verfahren': '方法/程序',
    'das prinzip': '原则',
    'die regel': '规则',
    'das gesetz': '法律',
    'die vorschrift': '规定',
    'der standard': '标准',
    'das niveau': '水平',
    'die stufe': '等级',
    'die klasse': '等级/班级',
    'die kategorie': '类别',
    'die sorte': '种类',
    'die art': '种类',
    'die gruppe': '组',
    'die reihe': '排/系列',
    'die zahl': '数字',
    'die anzahl': '数量',
    'die menge': '量',
    'das maß': '程度/尺寸',
    'der grad': '度',
    'das prozent': '百分比',
    'der anteil': '比例/份额',
    'der quotient': '商/比率',
    'die rate': '比率',
    'das verhältnis': '比例',
    'der durchschnitt': '平均',
    'der wert': '值',
    'das ergebnis': '结果',
    'die summe': '总和',
    'das total': '总计',
    'das ganze': '整体',
    'der rest': '剩余',
    'der unterschied': '差别',
    'der abstand': '间距',
    'die entfernung': '距离',
    'die weite': '宽度/距离',
    'die länge': '长度',
    'die breite': '宽度',
    'die höhe': '高度',
    'die tiefe': '深度',
    'die dicke': '厚度',
    'das gewicht': '重量',
    'das volumen': '体积',
    'der inhalt': '内容/容量',
    'die größe': '大小',
    'das format': '格式/尺寸',
    'das maß': '度量',
    'die einheit': '单位',
    'das element': '元素',
    'der faktor': '因素',
    'der aspekt': '方面',
    'die seite': '方面/边',
    'der bereich': '领域/范围',
    'das feld': '领域/田地',
    'die branche': '行业',
    'der zweig': '分支',
    'die richtung': '方向',
    'der weg': '道路/途径',
    'die spur': '踪迹',
    'die linie': '线',
    'der punkt': '点',
    'die stelle': '位置',
    'der ort': '地点',
    'der platz': '广场/位置',
    'die position': '位置',
    'der standort': '所在地',
    'der raum': '空间/房间',
    'die fläche': '面积',
    'das gebiet': '地区/领域',
    'die zone': '区域',
    'der bezirk': '区',
    'der kreis': '圈/县',
    'das land': '国家/土地',
    'die region': '区域',
    'der kontinent': '大陆',
    'die welt': '世界',
    'das universum': '宇宙',
    'die erde': '地球',
    'der planet': '行星',
    'der mond': '月亮',
    'die sonne': '太阳',
    'der stern': '星星',
    'der himmel': '天空',
    'die wolke': '云',
    'das wetter': '天气',
    'der wind': '风',
    'der regen': '雨',
    'der schnee': '雪',
    'der sturm': '风暴',
    'das eis': '冰/冰淇淋',
    'das feuer': '火',
    'das wasser': '水',
    'die luft': '空气',
    'die erde': '泥土',
    'der stein': '石头',
    'das metall': '金属',
    'das holz': '木头',
    'das glas': '玻璃',
    'das papier': '纸',
    'der stoff': '布料/物质',
    'die natur': '自然',
    'die umwelt': '环境',
    'die landschaft': '风景',
    'das tier': '动物',
    'die pflanze': '植物',
    'der baum': '树',
    'die blume': '花',
    'das gras': '草',
    'das blatt': '叶子',
    'die wurzel': '根',
    'der stamm': '树干',
    'der ast': '树枝',
    'die frucht': '果实',
    'der sam': '种子',
    'der samen': '种子'
};

/* ===========================================================================
 * 2. Async lookup: builtin → API → heuristic
 * ========================================================================= */

/**
 * Look up a German word and return its Chinese translation.
 * Strategy:
 *   1. Check the built-in dictionary (case-insensitive).
 *   2. Try the free dictionary API (German definitions, not Chinese — used as fallback info).
 *   3. Heuristically strip common prefixes/suffixes and try again.
 *
 * @param {string} word - The German word to look up.
 * @returns {Promise<{word:string, translation:string, source:string,
 *           partOfSpeech?:string}|null>}
 */
async function lookupGermanWord(word) {
    if (!word || typeof word !== 'string') return null;

    var cleanWord = word.toLowerCase().trim();

    // 1. Built-in dictionary
    if (DE_ZH_DICT[cleanWord]) {
        return { word: word, translation: DE_ZH_DICT[cleanWord], source: 'builtin' };
    }

    // 2. Try the free dictionary API for German definitions
    var apiResult = await fetchGermanTranslation(word);
    if (apiResult) {
        return apiResult;
    }

    // 3. Heuristic: strip common prefixes/suffixes and re-check built-in dict
    var heuristicResult = heuristicLookup(cleanWord);
    if (heuristicResult) {
        return heuristicResult;
    }

    return null; // Not found
}

/**
 * Heuristic lookup: attempts to identify the base form of a German word
 * by removing common inflectional prefixes/suffixes and compound separators,
 * then checking the built-in dictionary again.
 */
function heuristicLookup(word) {
    if (!word) return null;

    // Try a series of transformations, first match wins
    var candidates = [];

    // Remove separable verb prefixes that appear when separated
    var separablePrefixes = ['ab', 'an', 'auf', 'aus', 'bei', 'ein', 'entgegen',
        'fort', 'her', 'hin', 'los', 'mit', 'nach', 'nieder', 'vor', 'weg',
        'zu', 'zurück', 'zusammen', 'durch', 'über', 'um', 'unter', 'wieder'];
    for (var i = 0; i < separablePrefixes.length; i++) {
        var p = separablePrefixes[i];
        if (word.indexOf(p) === 0 && word.length > p.length + 2) {
            // Try removing the prefix
            candidates.push(word.substring(p.length));
            // Try with the prefix attached (ge-form etc.)
            candidates.push('ge' + word.substring(p.length));
        }
    }

    // Remove common adjective endings
    var adjEndings = ['er', 'e', 'es', 'em', 'en', 'ere', 'erer', 'esten', 'este'];
    for (var j = 0; j < adjEndings.length; j++) {
        var e = adjEndings[j];
        if (word.length > e.length + 2 && word.lastIndexOf(e) === word.length - e.length) {
            candidates.push(word.substring(0, word.length - e.length));
        }
    }

    // Remove common verb endings (infinitive/participle suffixes)
    var verbSuffixes = ['en', 'n', 'st', 't', 'te', 'ten', 'test', 'tet',
        'et', 'est', 'e', 'ge', 'end', 'ung', 'heit', 'keit'];
    for (var k = 0; k < verbSuffixes.length; k++) {
        var s = verbSuffixes[k];
        if (word.length > s.length + 2 && word.lastIndexOf(s) === word.length - s.length) {
            candidates.push(word.substring(0, word.length - s.length));
            // Also try adding "en" to form an infinitive
            candidates.push(word.substring(0, word.length - s.length) + 'en');
        }
    }

    // Try compound splitting on hyphens/underscores
    if (word.indexOf('-') !== -1) {
        var parts = word.split(/[-_]/);
        for (var m = 0; m < parts.length; m++) {
            candidates.push(parts[m].toLowerCase());
        }
    }

    // Check each candidate against the dictionary
    for (var c = 0; c < candidates.length; c++) {
        var cand = candidates[c].toLowerCase().trim();
        if (DE_ZH_DICT[cand]) {
            return { word: word, translation: DE_ZH_DICT[cand], source: 'heuristic' };
        }
    }

    return null;
}

/* ===========================================================================
 * 3. Free API translation fetch
 * ========================================================================= */

/**
 * Look up a German word using free online APIs.
 *  1. https://api.dictionaryapi.dev/api/v1/entries/de/{word} — German definitions
 *  2. If the API call fails or returns nothing, fall back to the built-in dict.
 *  3. As a last resort, run the heuristic lookup.
 *
 * @param {string} word - The German word to translate.
 * @returns {Promise<{word:string, translation:string, source:string,
 *           partOfSpeech?:string}|null>}
 */
async function fetchGermanTranslation(word) {
    if (!word || typeof word !== 'string') return null;

    var cleanWord = word.toLowerCase().trim();

    // 1. Try the free dictionary API
    try {
        var resp = await fetch(
            'https://api.dictionaryapi.dev/api/v1/entries/de/' + encodeURIComponent(cleanWord)
        );
        if (resp.ok) {
            var data = await resp.json();
            // Extract the first definition
            if (data && data[0] && data[0].meanings && data[0].meanings[0]) {
                var meaning = data[0].meanings[0];
                var def = meaning.definitions && meaning.definitions[0];
                if (def && def.definition) {
                    var partOfSpeech = meaning.partOfSpeech || '';
                    return {
                        word: word,
                        translation: def.definition,
                        source: 'api',
                        partOfSpeech: partOfSpeech
                    };
                }
            }
        }
    } catch (e) {
        // Network or parse error — fall through to built-in dict
    }

    // 2. Check built-in dictionary
    if (DE_ZH_DICT[cleanWord]) {
        return { word: word, translation: DE_ZH_DICT[cleanWord], source: 'builtin' };
    }

    // 3. Heuristic last resort
    var heuristicResult = heuristicLookup(cleanWord);
    if (heuristicResult) {
        return heuristicResult;
    }

    return null;
}

/* ===========================================================================
 * 4. Dictionary popup UI
 * ========================================================================= */

var _lcDictPopupEl = null; // singleton reference

/**
 * Show (or update) the dictionary popup at the given screen coordinates.
 * Looks up the word asynchronously and updates the popup content in place.
 *
 * @param {string} word  - The German word to display/translate.
 * @param {number} x     - Left position in pixels (clientX).
 * @param {number} y     - Top position in pixels (clientY).
 */
function showDictPopup(word, x, y) {
    _ensureDictPopupCSS();

    // Close any existing popup first
    hideDictPopup();

    // Create the popup element
    var popup = document.createElement('div');
    popup.className = 'lc-dict-popup';
    popup.innerHTML =
        '<div class="lc-dict-popup-header">' +
            '<span class="lc-dict-popup-word"></span>' +
            '<button class="lc-dict-popup-close" title="关闭">&times;</button>' +
        '</div>' +
        '<div class="lc-dict-popup-body">' +
            '<div class="lc-dict-popup-loading">' +
                '<span class="lc-dict-spinner"></span>' +
                '<span>正在查词…</span>' +
            '</div>' +
        '</div>';

    // Populate word
    popup.querySelector('.lc-dict-popup-word').textContent = word;

    // Position the popup, keeping it on-screen
    document.body.appendChild(popup);
    var rect = popup.getBoundingClientRect();
    var px = (typeof x === 'number') ? x : (window.innerWidth / 2 - 180);
    var py = (typeof y === 'number') ? y : 100;
    if (px + rect.width > window.innerWidth - 8) {
        px = window.innerWidth - rect.width - 8;
    }
    if (px < 8) px = 8;
    if (py + rect.height > window.innerHeight - 8) {
        py = window.innerHeight - rect.height - 8;
    }
    if (py < 8) py = 8;
    popup.style.left = px + 'px';
    popup.style.top = py + 'px';

    _lcDictPopupEl = popup;

    // Close button
    popup.querySelector('.lc-dict-popup-close').addEventListener('click', function () {
        hideDictPopup();
    });

    // Click outside to close
    setTimeout(function () {
        document.addEventListener('click', _lcDictPopupOutsideClick, true);
    }, 0);

    // Escape to close
    document.addEventListener('keydown', _lcDictPopupEscKey);

    // Async lookup
    _updateDictPopupContent(popup, word);
}

/**
 * Asynchronously look up the word and fill the popup body.
 */
async function _updateDictPopupContent(popup, word) {
    var body = popup.querySelector('.lc-dict-popup-body');
    if (!body) return;

    try {
        var result = await lookupGermanWord(word);
        if (!result) {
            body.innerHTML =
                '<div class="lc-dict-popup-translation">未找到翻译</div>' +
                '<div class="lc-dict-popup-source">source: not found</div>';
            return;
        }

        var translationHtml = '<div class="lc-dict-popup-translation">' +
            _escapeHtml(result.translation) + '</div>';

        var metaHtml = '';
        if (result.partOfSpeech) {
            metaHtml += '<div class="lc-dict-popup-meta">词性: ' +
                _escapeHtml(result.partOfSpeech) + '</div>';
        }

        var sourceLabel = {
            builtin: '内置词典',
            api: '在线 API',
            heuristic: '推断(词根)'
        }[result.source] || result.source;

        body.innerHTML = translationHtml + metaHtml +
            '<div class="lc-dict-popup-source">来源: ' + sourceLabel + '</div>';
    } catch (err) {
        body.innerHTML =
            '<div class="lc-dict-popup-translation">查询出错</div>' +
            '<div class="lc-dict-popup-source">' + _escapeHtml(String(err)) + '</div>';
    }
}

/* ----- Popup helpers ----- */

function hideDictPopup() {
    if (_lcDictPopupEl && _lcDictPopupEl.parentNode) {
        _lcDictPopupEl.parentNode.removeChild(_lcDictPopupEl);
    }
    _lcDictPopupEl = null;
    document.removeEventListener('click', _lcDictPopupOutsideClick, true);
    document.removeEventListener('keydown', _lcDictPopupEscKey);
}

function _lcDictPopupOutsideClick(e) {
    if (_lcDictPopupEl && !_lcDictPopupEl.contains(e.target)) {
        // Don't close if the click originated from a lookup button
        if (e.target && e.target.classList && e.target.classList.contains('lc-dict-lookup-btn')) {
            return;
        }
        hideDictPopup();
    }
}

function _lcDictPopupEscKey(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
        hideDictPopup();
    }
}

function _escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ===========================================================================
 * 5. Attach "查词" buttons to vocabulary items
 * ========================================================================= */

/**
 * Add a "查词" (lookup) button next to each vocabulary word found on the page.
 *
 * By default this looks for elements with the class `.lc-vocab-word` or
 * `[data-vocab]` and appends a small lookup button after each one. The
 * button shows the dictionary popup when clicked.
 *
 * @param {Object} [opts] - Optional configuration.
 * @param {string} [opts.selector='.lc-vocab-word, [data-vocab]'] - CSS selector for vocab elements.
 * @param {string} [opts.wordAttr] - Attribute to read the word from (defaults to textContent).
 */
function addDictLookupToVocab(opts) {
    _ensureDictPopupCSS();

    opts = opts || {};
    var selector = opts.selector || '.lc-vocab-word, [data-vocab]';
    var wordAttr = opts.wordAttr || null;

    var vocabEls = document.querySelectorAll(selector);
    for (var i = 0; i < vocabEls.length; i++) {
        (function (el) {
            // Avoid adding duplicate buttons
            if (el.querySelector('.lc-dict-lookup-btn') || el.nextElementSibling && el.nextElementSibling.classList && el.nextElementSibling.classList.contains('lc-dict-lookup-btn')) {
                return;
            }

            var word = wordAttr ? el.getAttribute(wordAttr) : el.textContent;
            word = (word || '').trim();
            if (!word) return;

            var btn = document.createElement('button');
            btn.className = 'lc-dict-lookup-btn';
            btn.type = 'button';
            btn.textContent = '查词';
            btn.title = '查找 "' + word + '" 的翻译';

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var rect = btn.getBoundingClientRect();
                showDictPopup(word, rect.left, rect.bottom + 6);
            });

            // Insert right after the vocab element
            if (el.parentNode) {
                el.parentNode.insertBefore(btn, el.nextSibling);
            }
        })(vocabEls[i]);
    }
}

/**
 * Convenience: re-scan the DOM for new vocabulary items and add buttons.
 * Safe to call multiple times (skips items that already have a button).
 */
function refreshDictLookupButtons() {
    addDictLookupToVocab();
}

/* ===========================================================================
 * Exports (browser global + module/AMD compatible)
 * ========================================================================= */

if (typeof window !== 'undefined') {
    window.DE_ZH_DICT = DE_ZH_DICT;
    window.lookupGermanWord = lookupGermanWord;
    window.fetchGermanTranslation = fetchGermanTranslation;
    window.showDictPopup = showDictPopup;
    window.hideDictPopup = hideDictPopup;
    window.addDictLookupToVocab = addDictLookupToVocab;
    window.refreshDictLookupButtons = refreshDictLookupButtons;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DE_ZH_DICT: DE_ZH_DICT,
        lookupGermanWord: lookupGermanWord,
        fetchGermanTranslation: fetchGermanTranslation,
        showDictPopup: showDictPopup,
        hideDictPopup: hideDictPopup,
        addDictLookupToVocab: addDictLookupToVocab,
        refreshDictLookupButtons: refreshDictLookupButtons,
        heuristicLookup: heuristicLookup
    };
}
