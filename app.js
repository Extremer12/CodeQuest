// --- Estado del Usuario (Cargar desde LocalStorage) ---
let userStats = JSON.parse(localStorage.getItem('codequest_stats')) || {
    xp: 1240,
    streak: 12,
    completedLessons: [] // IDs o índices de lecciones terminadas
};

function saveStats() {
    localStorage.setItem('codequest_stats', JSON.stringify(userStats));
}

// --- Base de Datos de Lecciones ---
const lessons = [
    {
        id: "intro",
        module: "Conceptos Básicos",
        level: "Nivel 1: ¿Qué es Programar?",
        theoryTitle: "Dando Instrucciones",
        theoryText: "Programar es simplemente darle instrucciones a la computadora. Como es una máquina, necesita que le hablemos en su idioma. Nosotros usaremos uno muy popular llamado **JavaScript**.<br><br>Para empezar, le pediremos que muestre un texto en la pantalla mediante la instrucción `console.log()`.",
        theoryExample: `<span class="text-primary">console</span>.<span class="text-secondary">log</span>(<span class="text-tertiary">"¡Hola Mundo!"</span>);`,
        defaultCode: 'console.log("¡Hola Mundo!");\n',
        tasks: [{ id: 1, text: 'Haz clic en "Ejecutar Código" para ver tu primer programa', xp: 10 }],
        validate: (code, output) => output.includes("¡Hola Mundo!"),
        hint: 'Haz clic en el botón Ejecutar Código abajo a la derecha.'
    },
    {
        id: "strings",
        module: "Conceptos Básicos",
        level: "Nivel 2: Las Comillas",
        theoryTitle: "Textos vs Comandos",
        theoryText: "La computadora se confunde fácil. Si escribes `Hola` sin más, pensará que es una orden no definida y te dará error.<br><br>Para decirle 'relájate, esto es solo texto', **SIEMPRE debemos envolverlo en comillas**. A los textos en programación les llamamos **Strings** (cadenas).",
        theoryExample: `<span class="text-primary">console</span>.<span class="text-secondary">log</span>(<span class="text-tertiary">"Soy un texto ninja"</span>);`,
        defaultCode: 'console.log(Aprender);\n// ¡Oh no! Arriba falta algo importante para que Aprender sea un texto.\n',
        tasks: [{ id: 1, text: 'Arregla el código envolviendo la palabra Aprender en comillas dobles o simples', xp: 20 }],
        validate: (code, output) => output.includes("Aprender") && (code.includes('"Aprender"') || code.includes("'Aprender'")),
        hint: 'Pon comillas alrededor de la palabra, así: "Aprender"'
    },
    {
        id: "variables",
        module: "Conceptos Básicos",
        level: "Nivel 3: Cajas de Memoria",
        theoryTitle: "Creando Variables",
        theoryText: "Imagina que tienes una caja vacía donde guardas cosas, y le pones una etiqueta para recordar qué hay adentro. En código, esas cajas se llaman **Variables**.<br><br>Usamos la palabra mágica `let` para crear la caja.",
        theoryExample: `<span class="text-primary">let</span> miCaja = <span class="text-tertiary">"Una espada"</span>;`,
        defaultCode: '// Crea una variable llamada nombre y guarda tu nombre adentro (recuerda las comillas para textos)\n',
        tasks: [{ id: 1, text: 'Crea una variable "nombre" con un texto', xp: 30 }],
        validate: (code, output) => code.includes('let nombre') && (code.includes('"') || code.includes("'")),
        hint: 'Escribe: let nombre = "TuNombre";'
    },
    {
        id: "numbers",
        module: "JavaScript Básico",
        level: "Nivel 4: Números Mágicos",
        theoryTitle: "Tipos de Datos",
        theoryText: "Ya vimos que los textos van con comillas. Pero la computadora también sabe matemáticas. Los **Números** NO llevan comillas.<br><br>Si pones `" + '"25"' + "` será texto plano, pero si pones `25` será un número matemático con el que puedes sumar.",
        theoryExample: `<span class="text-primary">let</span> puntos = <span class="text-secondary">10</span>;`,
        defaultCode: '// Crea una variable puntos con el numero 100 (sin comillas)\n',
        tasks: [{ id: 1, text: 'Crea una variable "puntos" con el número 100', xp: 20 }],
        validate: (code, output) => code.includes('let puntos') && code.includes('100') && !code.includes('"100"') && !code.includes("'100'"),
        hint: 'Escribe: let puntos = 100;'
    }
];

let currentLessonIndex = 0;
let editor; // Instancia de Monaco

// --- Referencias al DOM ---
const runBtn = document.getElementById('runBtn');
const consoleOutput = document.getElementById('consoleOutput');
const clearConsole = document.getElementById('clearConsole');
const successModal = document.getElementById('successModal');
const continueBtn = document.getElementById('continueBtn');
const modalContent = successModal.querySelector('div');

const lessonModule = document.getElementById('lessonModule');
const lessonLevel = document.getElementById('lessonLevel');
const progressBar = document.getElementById('progressBar');
const theoryTitle = document.getElementById('theoryTitle');
const theoryText = document.getElementById('theoryText');
const theoryExample = document.getElementById('theoryExample');
const taskList = document.getElementById('taskList');

// --- Inicialización de Monaco Editor ---
if (document.getElementById('monacoEditor')) {
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {
        editor = monaco.editor.create(document.getElementById('monacoEditor'), {
            value: lessons[currentLessonIndex].defaultCode,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 20 },
            roundedSelection: true,
            scrollBeyondLastLine: false,
            cursorSmoothCaretAnimation: "on"
        });
        renderLesson(currentLessonIndex);
    });
}

// --- Funciones de Lógica ---

function renderLesson(index) {
    const lesson = lessons[index];
    if (!lesson) return;

    lessonModule.innerText = lesson.module;
    lessonLevel.innerText = lesson.level;
    theoryTitle.innerText = lesson.theoryTitle;
    theoryText.innerHTML = lesson.theoryText;
    theoryExample.innerHTML = lesson.theoryExample;
    
    // Actualizar editor si ya existe
    if (editor) {
        editor.setValue(lesson.defaultCode);
    }

    const progress = ((index) / lessons.length) * 100 || 5;
    progressBar.style.width = `${progress}%`;

    taskList.innerHTML = lesson.tasks.map(task => `
        <div class="flex items-center justify-between p-4 rounded-lg bg-surface-container/40 border border-outline-variant/5">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-700">radio_button_unchecked</span>
                <span class="text-sm text-slate-400">${task.text}</span>
            </div>
            <span class="text-xs font-bold text-slate-600">+${task.xp} XP</span>
        </div>
    `).join('');
}

function printToConsole(text, type = 'normal') {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const outputEntry = document.createElement('div');
    outputEntry.className = 'flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300';
    const colorClass = type === 'error' ? 'text-error' : (type === 'success' ? 'text-tertiary' : 'text-on-background');
    outputEntry.innerHTML = `<span class="text-slate-600 shrink-0 select-none">[${timestamp}]</span><span class="${colorClass} font-medium">${text}</span>`;
    consoleOutput.appendChild(outputEntry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

runBtn.addEventListener('click', () => {
    if (!editor) return;
    const code = editor.getValue();
    const lesson = lessons[currentLessonIndex];
    let capturedOutput = [];

    if (consoleOutput.innerText.includes('Waiting for execution')) {
        consoleOutput.innerHTML = '';
    }

    const originalLog = console.log;
    console.log = (msg) => {
        capturedOutput.push(msg.toString());
        printToConsole(msg.toString());
    };

    try {
        eval(code);
        const isCorrect = lesson.validate(code, capturedOutput);
        if (isCorrect) {
            printToConsole("¡Excelente! Objetivo cumplido.", "success");
            setTimeout(showSuccess, 800);
        } else {
            printToConsole(`Pista: ${lesson.hint}`, "normal");
        }
    } catch (err) {
        let friendlyError = err.message;
        if (err instanceof ReferenceError) friendlyError = `No reconozco: "${err.message}". Revisa la escritura.`;
        else if (err instanceof SyntaxError) friendlyError = `Error de sintaxis: ${err.message}. Revisa paréntesis/comillas.`;
        printToConsole(friendlyError, "error");
    } finally {
        console.log = originalLog;
    }
});

function showSuccess() {
    successModal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-90');
    modalContent.classList.add('scale-100');
}

continueBtn.addEventListener('click', () => {
    const lesson = lessons[currentLessonIndex];
    
    // Sumar XP y guardar progreso
    userStats.xp += lesson.tasks.reduce((sum, t) => sum + t.xp, 0);
    if (!userStats.completedLessons.includes(lesson.id)) {
        userStats.completedLessons.push(lesson.id);
    }
    saveStats();

    successModal.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.add('scale-90');
    
    if (currentLessonIndex < lessons.length - 1) {
        currentLessonIndex++;
        renderLesson(currentLessonIndex);
        printToConsole(`--- Iniciando ${lessons[currentLessonIndex].theoryTitle} ---`);
    } else {
        printToConsole("¡Misiones completadas! Vuelve al mapa para ver tu progreso.", "success");
    }
});

clearConsole.addEventListener('click', () => {
    consoleOutput.innerHTML = `<div class="text-slate-500 flex gap-3"><span class="text-tertiary opacity-50">❯</span><span>Consola limpia.</span></div>`;
});

// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW fail', err));
    });
}
