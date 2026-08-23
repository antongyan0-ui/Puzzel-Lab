const fs = require('fs');

const indexPath = '/workspace/listening-cloze-trainer/index.html';
const testdafPath = '/workspace/testdaf-bank.js';
const spellcheckPath = '/workspace/german-spellcheck.js';
const dictLookupPath = '/workspace/german-dict-lookup.js';

let html = fs.readFileSync(indexPath, 'utf8');
const testdaf = fs.readFileSync(testdafPath, 'utf8');
const spellcheck = fs.readFileSync(spellcheckPath, 'utf8');
const dictLookup = fs.readFileSync(dictLookupPath, 'utf8');

// ============================================================
// 1. Insert TestDaF bank data after the ORAL_BANK (find the end of ORAL_BANK section)
// Find: const ORAL_BANK = { and then find the matching closing };
// ============================================================
const oralBankStart = html.indexOf('const ORAL_BANK = {');
if (oralBankStart === -1) { console.error('ORAL_BANK not found'); process.exit(1); }

// Find the end of ORAL_BANK - it ends with a closing brace followed by semicolons/newline
let braceCount = 0;
let oralBankEnd = -1;
for (let i = oralBankStart; i < html.length; i++) {
    if (html[i] === '{') braceCount++;
    if (html[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
            oralBankEnd = i + 1;
            break;
        }
    }
}
// Find the semicolon after the closing brace
while (oralBankEnd < html.length && html[oralBankEnd] !== ';') oralBankEnd++;
oralBankEnd++;

// Insert TestDaF bank after ORAL_BANK
html = html.slice(0, oralBankEnd) + '\n\n' + testdaf + '\n' + html.slice(oralBankEnd);
console.log('1. TestDaF bank inserted at position', oralBankEnd);

// ============================================================
// 2. Insert German spell check code before the spellCheckText function
// ============================================================
const spellCheckTextPos = html.indexOf('function spellCheckText(text) {');
if (spellCheckTextPos === -1) { console.error('spellCheckText not found'); process.exit(1); }

// Insert the German spell check code before spellCheckText
html = html.slice(0, spellCheckTextPos) + spellcheck + '\n' + html.slice(spellCheckTextPos);
console.log('2. German spell check inserted at position', spellCheckTextPos);

// ============================================================
// 3. Modify spellCheckText to use German spell check for German
// ============================================================
const oldSpellCheck = `function spellCheckText(text) {
    var lang = State.lang || 'en';
    if (lang === 'ja') return text; // Japanese doesn't use spaces between words
    
    var dict = lang === 'de' ? null : getEnDict(); // Use English dict for en/fr, skip for de (compound words are valid)
    if (!dict) return text; // German has legitimate compound words — don't split`;

const newSpellCheck = `function spellCheckText(text) {
    var lang = State.lang || 'en';
    if (lang === 'ja') return text; // Japanese doesn't use spaces between words
    
    if (lang === 'de') {
        // German: use German spell check with function-word-aware splitting
        return spellCheckGermanText(text);
    }
    
    var dict = getEnDict(); // Use English dict for en/fr
    if (!dict) return text;`;

if (html.includes(oldSpellCheck)) {
    html = html.replace(oldSpellCheck, newSpellCheck);
    console.log('3. spellCheckText modified for German support');
} else {
    console.error('3. spellCheckText old code not found - trying alternate match');
    // Try a more flexible match
    const altOld = `var dict = lang === 'de' ? null : getEnDict(); // Use English dict for en/fr, skip for de (compound words are valid)\n    if (!dict) return text; // German has legitimate compound words — don't split`;
    const altNew = `if (lang === 'de') { return spellCheckGermanText(text); }\n    var dict = getEnDict();\n    if (!dict) return text;`;
    if (html.includes(altOld)) {
        html = html.replace(altOld, altNew);
        console.log('3. spellCheckText modified (alternate match)');
    } else {
        console.error('3. FAILED to modify spellCheckText');
    }
}

// ============================================================
// 4. Insert German dictionary lookup code before the vocabulary rendering
// Find a good insertion point - after the ORAL_BANK area
// ============================================================
const vocabInsertPoint = html.indexOf('function renderVocabulary()');
if (vocabInsertPoint !== -1) {
    html = html.slice(0, vocabInsertPoint) + dictLookup + '\n' + html.slice(vocabInsertPoint);
    console.log('4. German dictionary lookup inserted at position', vocabInsertPoint);
} else {
    console.error('4. renderVocabulary not found');
}

// ============================================================
// 5. Modify the oral training section for TestDaF support
// Add TestDaF mode to the oral training view
// ============================================================

// 5a. Add TestDaF state to the oral state
const oralStateOld = 'oral: { started: false, topic: null, part: 2, qIndex: 0, messages: [], aiConfig: {} }';
const oralStateNew = 'oral: { started: false, topic: null, part: 2, qIndex: 0, messages: [], aiConfig: {}, testdafMode: false, testdafNum: 1, testdafTask: 1 }';
if (html.includes(oralStateOld)) {
    html = html.replace(oralStateOld, oralStateNew);
    console.log('5a. Oral state updated for TestDaF');
} else {
    // Try alternate format
    const altState = 'oral:';
    console.log('5a. Oral state old code not found - will try later');
}

// 5b. Modify the oral training subtitle for German to mention TestDaF
const oralSubtitleDe = `oralSubtitle: '语料按主题分类，每篇语料可生成德福口语题目，模拟考官与用户交谈。支持文字输入与语音输入，考官回复自动朗读。'`;
const oralSubtitleDeNew = `oralSubtitle: '德福口语模拟训练：10套模拟题(Modelltest 1-10)，每套7道题(Aufgabe 1-7)，AI考官模拟真实考试场景。支持文字输入与语音输入，考官回复自动朗读。'`;
if (html.includes(oralSubtitleDe)) {
    html = html.replace(oralSubtitleDe, oralSubtitleDeNew);
    console.log('5b. German oral subtitle updated');
}

// 5c. Add TestDaF mode UI in the oral section
// Find the part-cards div and add TestDaF controls before it
const partCardsDiv = '<div class="lc-part-cards" id="part-cards">';
if (html.includes(partCardsDiv)) {
    const testdafUI = `<div class="lc-testdaf-bar" id="testdaf-bar" style="display:none;">
                <div class="lc-testdaf-selector">
                    <label style="font-size:13px;color:var(--lc-color-text-secondary);">模拟题：</label>
                    <select id="testdaf-select" class="lc-input" style="width:auto;padding:4px 8px;">
                        <option value="1">Modelltest 1</option><option value="2">Modelltest 2</option>
                        <option value="3">Modelltest 3</option><option value="4">Modelltest 4</option>
                        <option value="5">Modelltest 5</option><option value="6">Modelltest 6</option>
                        <option value="7">Modelltest 7</option><option value="8">Modelltest 8</option>
                        <option value="9">Modelltest 9</option><option value="10">Modelltest 10</option>
                    </select>
                    <div class="lc-testdaf-tasks" id="testdaf-tasks" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px;"></div>
                </div>
            </div>`;
    html = html.replace(partCardsDiv, testdafUI + partCardsDiv);
    console.log('5c. TestDaF UI added to oral section');
}

// 5d. Add CSS for TestDaF bar
const styleInsert = '<style id="theme-vars">';
const testdafCSS = `<style>
.lc-testdaf-bar { background: var(--lc-color-surface-2); border: 1px solid var(--lc-color-border); border-radius: var(--lc-radius-lg); padding: 12px 16px; margin-bottom: 12px; }
.lc-testdaf-selector { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lc-testdaf-task-btn { padding: 4px 10px; border: 1px solid var(--lc-color-border); border-radius: var(--lc-radius-full); background: var(--lc-color-surface); cursor: pointer; font-size: 12px; color: var(--lc-color-text-secondary); transition: all 0.15s; font-family: inherit; }
.lc-testdaf-task-btn:hover { border-color: var(--lc-color-border-strong); background: var(--lc-color-primary-soft); color: var(--lc-color-primary); }
.lc-testdaf-task-btn.active { background: var(--lc-color-primary); color: var(--lc-color-text-inverse); border-color: var(--lc-color-primary); font-weight: 600; }
.lc-testdaf-info { background: var(--lc-color-primary-soft); border-radius: var(--lc-radius-md); padding: 12px; margin: 8px 0; font-size: 13px; line-height: 1.6; color: var(--lc-color-text); }
.lc-testdaf-timer { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: var(--lc-radius-full); background: var(--lc-state-warning-bg); color: var(--lc-state-warning); font-size: 12px; font-weight: 600; }
.lc-dict-popup { position: fixed; z-index: 10000; background: var(--lc-color-surface); border: 1px solid var(--lc-color-border); border-radius: var(--lc-radius-md); box-shadow: var(--lc-shadow-float); padding: 16px; min-width: 240px; max-width: 360px; font-size: 14px; }
.lc-dict-popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--lc-color-border); }
.lc-dict-popup-word { font-weight: 700; font-size: 16px; color: var(--lc-color-primary); }
.lc-dict-popup-translation { color: var(--lc-color-text); line-height: 1.5; margin: 8px 0; }
.lc-dict-popup-close { background: none; border: none; cursor: pointer; color: var(--lc-color-text-tertiary); font-size: 20px; padding: 0 4px; }
.lc-dict-popup-source { font-size: 11px; color: var(--lc-color-text-tertiary); margin-top: 8px; }
.lc-dict-popup-loading { display: flex; align-items: center; gap: 8px; color: var(--lc-color-text-secondary); }
.lc-vocab-dict-btn { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border: 1px solid var(--lc-color-border); border-radius: var(--lc-radius-full); background: var(--lc-color-surface-2); cursor: pointer; font-size: 11px; color: var(--lc-color-text-secondary); transition: all 0.15s; font-family: inherit; margin-left: 6px; }
.lc-vocab-dict-btn:hover { border-color: var(--lc-color-border-strong); background: var(--lc-color-primary-soft); color: var(--lc-color-primary); }
</style>`;
html = html.replace(styleInsert, testdafCSS + styleInsert);
console.log('5d. TestDaF CSS added');

// 5e. Modify renderOralParts to show TestDaF mode for German
const renderOralPartsOld = `function renderOralParts() {
    var container = document.getElementById('part-cards');
    if (!container) return;
    var config = getCurrentLangConfig();
    container.innerHTML = '';
    config.oralParts.forEach(function(p, idx) {`;

const renderOralPartsNew = `function renderOralParts() {
    var container = document.getElementById('part-cards');
    if (!container) return;
    var config = getCurrentLangConfig();
    var testdafBar = document.getElementById('testdaf-bar');
    if (State.lang === 'de') {
        // Show TestDaF mode for German
        if (testdafBar) testdafBar.style.display = 'block';
        container.innerHTML = '';
        TESTDAF_TASK_TYPES.forEach(function(p) {
            var div = document.createElement('div');
            div.className = 'lc-part-card' + (p.num === State.oral.testdafTask ? ' active' : '');
            div.dataset.part = p.num;
            var icons = ['phone', 'message-circle', 'bar-chart-3', 'scale', 'lightbulb', 'presentation', 'vote'];
            div.innerHTML = '<i data-lucide="' + (icons[p.num-1] || 'circle') + '"></i><h4>' + p.type + '</h4><p>' + p.desc + '</p>';
            container.appendChild(div);
        });
        refreshIcons();
        renderTestDaFTasks();
        return;
    }
    if (testdafBar) testdafBar.style.display = 'none';
    container.innerHTML = '';
    config.oralParts.forEach(function(p, idx) {`;

if (html.includes(renderOralPartsOld)) {
    html = html.replace(renderOralPartsOld, renderOralPartsNew);
    console.log('5e. renderOralParts modified for TestDaF');
} else {
    console.error('5e. renderOralParts old code not found');
}

// 5f. Add renderTestDaFTasks function and modify getQuestion for TestDaF
const getQuestionOld = `function getQuestion() {
    var bank = ORAL_BANK[State.oral.topic];`;
const getQuestionNew = `function renderTestDaFTasks() {
    var container = document.getElementById('testdaf-tasks');
    if (!container) return;
    var testNum = State.oral.testdafNum || 1;
    container.innerHTML = TESTDAF_TASK_TYPES.map(function(t) {
        return '<button class="lc-testdaf-task-btn' + (t.num === State.oral.testdafTask ? ' active' : '') + '" data-task="' + t.num + '">' + t.num + '</button>';
    }).join('');
    container.querySelectorAll('.lc-testdaf-task-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            State.oral.testdafTask = parseInt(btn.dataset.task);
            State.oral.started = false;
            State.oral.messages = [];
            renderOralParts();
            renderConversation();
        });
    });
}

function getTestDaFQuestion() {
    var testNum = State.oral.testdafNum || 1;
    var taskNum = State.oral.testdafTask || 1;
    var task = getTestDaFTask(testNum, taskNum);
    if (!task) return null;
    var qText = '【' + task.title + ' - ' + task.type + ' (' + task.level + ')】\\n\\n';
    qText += 'Situation:\\n' + task.situation + '\\n\\n';
    qText += 'Aufgabenstellung:\\n' + task.requirements + '\\n\\n';
    qText += 'Vorbereitungszeit: ' + task.prepTime + ' Sekunden | Sprechzeit: ' + task.speakTime + ' Sekunden';
    return qText;
}

function getQuestion() {
    // TestDaF mode for German
    if (State.lang === 'de' && State.oral.testdafMode !== false) {
        return getTestDaFQuestion();
    }
    var bank = ORAL_BANK[State.oral.topic];`;

if (html.includes(getQuestionOld)) {
    html = html.replace(getQuestionOld, getQuestionNew);
    console.log('5f. getQuestion modified for TestDaF');
} else {
    console.error('5f. getQuestion old code not found');
}

// 5g. Add TestDaF event listener for the select dropdown
const eventListenersPos = html.indexOf("document.getElementById('btn-start-oral')");
if (eventListenersPos !== -1) {
    const testdafListener = `// TestDaF mode toggle
    document.getElementById('testdaf-select')?.addEventListener('change', function(e) {
        State.oral.testdafNum = parseInt(e.target.value);
        State.oral.started = false;
        State.oral.messages = [];
        renderOralParts();
        renderConversation();
    });
    `;
    html = html.slice(0, eventListenersPos) + testdafListener + html.slice(eventListenersPos);
    console.log('5g. TestDaF event listener added');
}

// 5h. Modify the AI examiner prompt for German/TestDaF
const aiPromptOld = "var systemPrompt = 'You are an IELTS speaking examiner conducting a Part ' + State.oral.part + ' interview on the topic of ' + topicName + '. The candidate just responded. Provide a natural follow-up response as the examiner. - Part 1: Brief acknowledgment + simple follow-up question. - Part 2: Ask about specific aspects of their topic card. - Part 3: Ask deeper, more analytical questions. Keep your response to 1-2 sentences. Be natural and encouraging.';";
const aiPromptNew = `var systemPrompt;
    if (State.lang === 'de') {
        systemPrompt = 'Du bist ein TestDaF-Prüfer (德福口语考官). Du führst einen mündlichen Test durch, Aufgabe ' + State.oral.testdafTask + '. Der Prüfling hat gerade geantwortet. Reagiere natürlich als Prüfer. - Bestätige kurz die Antwort. - Stelle eine Nachfrage zum Thema. - Gib Feedback auf Deutsch. Maximal 2 Sätze. Sei natürlich und ermutigend.';
    } else {
        systemPrompt = 'You are an IELTS speaking examiner conducting a Part ' + State.oral.part + ' interview on the topic of ' + topicName + '. The candidate just responded. Provide a natural follow-up response as the examiner. - Part 1: Brief acknowledgment + simple follow-up question. - Part 2: Ask about specific aspects of their topic card. - Part 3: Ask deeper, more analytical questions. Keep your response to 1-2 sentences. Be natural and encouraging.';
    }`;
if (html.includes(aiPromptOld)) {
    html = html.replace(aiPromptOld, aiPromptNew);
    console.log('5h. AI prompt modified for German');
} else {
    console.error('5h. AI prompt old code not found');
}

// 5i. Modify switchLanguage to enable TestDaF mode for German
const switchLangOld = "if (config.topics.length > 0) State.oral.topic = config.topics[0].id;";
const switchLangNew = "if (config.topics.length > 0) State.oral.topic = config.topics[0].id;\n    State.oral.testdafMode = (lang === 'de');";
if (html.includes(switchLangOld)) {
    html = html.replace(switchLangOld, switchLangNew);
    console.log('5i. switchLanguage updated for TestDaF');
}

// 5j. Modify the FALLBACK_RESPONSES to add German responses
const fallbackOld = `const FALLBACK_RESPONSES = {
    positive: [`;
const fallbackNew = `const FALLBACK_RESPONSES = {
    de: {
        positive: [
            'Das ist ein interessanter Punkt. Können Sie das näher erläutern?',
            'Ich sehe. Könnten Sie dazu ein Beispiel geben?',
            'Danke für Ihre Antwort. Warum denken Sie so?',
            'Das ist eine gute Überlegung. Wie passt das zu Ihren persönlichen Erfahrungen?',
            'Ich verstehe. Können Sie das etwas genauer ausführen?',
        ],
        probing: [
            'Das ist eine interessante Sichtweise. Glauben Sie, dass andere auch so denken?',
            'Können Sie sich Situationen vorstellen, in denen das nicht gilt?',
            'Wie unterscheidet sich das von anderen Ländern oder Kulturen?',
            'Was denken Sie sind die Hauptgründe dafür?',
            'Wie könnte sich das in Zukunft verändern, meinen Sie?',
        ],
    },
    positive: [`;
if (html.includes(fallbackOld)) {
    html = html.replace(fallbackOld, fallbackNew);
    console.log('5j. German fallback responses added');
}

// 5k. Modify the fallback response usage in sendUserResponse
const fallbackUseOld = "var followUp = aiResp ? aiResp : ((State.oral.part === 3 ? FALLBACK_RESPONSES.probing : FALLBACK_RESPONSES.positive)[Math.floor(Math.random() * 5)]);";
const fallbackUseNew = "var fallbackPool = State.lang === 'de' ? (State.oral.testdafTask >= 4 && State.oral.testdafTask <= 6 ? FALLBACK_RESPONSES.de.probing : FALLBACK_RESPONSES.de.positive) : (State.oral.part === 3 ? FALLBACK_RESPONSES.probing : FALLBACK_RESPONSES.positive);\n        var followUp = aiResp ? aiResp : fallbackPool[Math.floor(Math.random() * 5)];";
if (html.includes(fallbackUseOld)) {
    html = html.replace(fallbackUseOld, fallbackUseNew);
    console.log('5k. Fallback response usage updated');
} else {
    // Try alternate match
    const altOld = "var pool = State.oral.part === 3 ? FALLBACK_RESPONSES.probing : FALLBACK_RESPONSES.positive;";
    const altNew = "var pool = State.lang === 'de' ? (State.oral.testdafTask >= 4 && State.oral.testdafTask <= 6 ? FALLBACK_RESPONSES.de.probing : FALLBACK_RESPONSES.de.positive) : (State.oral.part === 3 ? FALLBACK_RESPONSES.probing : FALLBACK_RESPONSES.positive);";
    if (html.includes(altOld)) {
        html = html.replace(altOld, altNew);
        console.log('5k. Fallback response (alt) updated');
    } else {
        console.error('5k. Fallback response old code not found');
    }
}

// 5l. Add dictionary lookup to vocabulary section
// Add a "查词" button to the vocabulary word items
const renderVocabFind = "function renderVocabulary() {";
const dictButtonCode = `// Add dictionary lookup buttons to vocabulary items
function addDictButtonsToVocab() {
    document.querySelectorAll('.lc-vocab-word').forEach(function(el) {
        if (el.querySelector('.lc-vocab-dict-btn')) return;
        var word = el.dataset.word || el.textContent.trim().split(' ')[0];
        if (!word) return;
        var btn = document.createElement('button');
        btn.className = 'lc-vocab-dict-btn';
        btn.innerHTML = '<i data-lucide="search" style="width:11px;height:11px;"></i> 查词';
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var rect = btn.getBoundingClientRect();
            if (State.lang === 'de') {
                lookupGermanWord(word).then(function(result) {
                    if (result) {
                        showDictPopupResult(word, result, rect.left, rect.bottom);
                    } else {
                        showDictPopupResult(word, { translation: '未找到释义', source: 'builtin' }, rect.left, rect.bottom);
                    }
                });
            } else {
                showDictPopupResult(word, { translation: '仅德语支持查词', source: 'builtin' }, rect.left, rect.bottom);
            }
        });
        el.appendChild(btn);
    });
    refreshIcons();
}

function showDictPopupResult(word, result, x, y) {
    var existing = document.getElementById('lc-dict-popup');
    if (existing) existing.remove();
    var popup = document.createElement('div');
    popup.id = 'lc-dict-popup';
    popup.className = 'lc-dict-popup';
    popup.style.left = Math.min(x, window.innerWidth - 380) + 'px';
    popup.style.top = (y + 8) + 'px';
    popup.innerHTML = '<div class="lc-dict-popup-header"><span class="lc-dict-popup-word">' + escapeHtml(word) + '</span><button class="lc-dict-popup-close" onclick="this.parentElement.parentElement.remove()">×</button></div>' +
        '<div class="lc-dict-popup-translation">' + escapeHtml(result.translation || '未找到') + '</div>' +
        '<div class="lc-dict-popup-source">来源: ' + (result.source || 'builtin') + '</div>';
    document.body.appendChild(popup);
    setTimeout(function() {
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });
    }, 100);
}

`;
if (html.includes(renderVocabFind)) {
    html = html.replace(renderVocabFind, dictButtonCode + renderVocabFind);
    console.log('5l. Dictionary lookup buttons added');
}

// 5m. Call addDictButtonsToVocab after renderVocabulary
const renderVocabEnd = html.indexOf('function renderVocabulary() {');
if (renderVocabEnd !== -1) {
    // Find the end of renderVocabulary function
    let braceCount = 0;
    let funcEnd = -1;
    let inFunc = false;
    for (let i = renderVocabEnd; i < html.length; i++) {
        if (html[i] === '{') { braceCount++; inFunc = true; }
        if (html[i] === '}') {
            braceCount--;
            if (inFunc && braceCount === 0) {
                funcEnd = i + 1;
                break;
            }
        }
    }
    if (funcEnd !== -1) {
        html = html.slice(0, funcEnd) + '\n    addDictButtonsToVocab();' + html.slice(funcEnd);
        console.log('5m. addDictButtonsToVocab call added');
    }
}

// Write the final HTML
fs.writeFileSync(indexPath, html, 'utf8');
console.log('\n=== Integration complete ===');
console.log('Final file size:', html.length, 'bytes (' + (html.length / 1024).toFixed(1) + ' KB)');
