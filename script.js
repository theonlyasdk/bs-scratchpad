const titleInput = document.getElementById("title-input");
const getHtmlBtn = document.getElementById("get-html-btn");
const htmlModal = new bootstrap.Modal(document.getElementById("htmlModal"));
const addSnippetModal = new bootstrap.Modal(document.getElementById("addSnippetModal"));
const htmlModalLabel = document.getElementById("htmlModalLabel");
const copyHtmlBtn = document.getElementById("copy-html-btn");
const snippetsMenu = document.getElementById("snippets-menu");
const wordWrapToggle = document.getElementById("word-wrap-toggle");
const autocompleteToggle = document.getElementById("autocomplete-toggle");
const snippetTitleInput = document.getElementById("snippet-title-input");
const saveSnippetBtn = document.getElementById("save-snippet-btn");
const editorThemeSelect = document.getElementById("editor-theme-select");
const fontSizeInput = document.getElementById("font-size-input");
const tabSizeInput = document.getElementById("tab-size-input");
const editorFontSelect = document.getElementById("editor-font-select");
const customFontInput = document.getElementById("custom-font-input");
const previewIframe = document.getElementById("preview-iframe");
const importSnippetsBtn = document.getElementById("import-snippets-btn");
const exportSnippetsBtn = document.getElementById("export-snippets-btn");
const clearSnippetsBtn = document.getElementById("clear-snippets-btn");
const importSnippetsInput = document.getElementById("import-snippets-input");
const docStorageKey = "bs-scratchpad-document-data";
const settingsStorageKey = "bs-scratchpad-settings";
const snippetsStorageKey = "bs-scratchpad-snippets";
const editor = ace.edit("editor");
const snippetEditor = ace.edit("snippet-code-editor");
const fullHtmlEditor = ace.edit("full-html-editor");

[editor, snippetEditor, fullHtmlEditor].forEach((ed) => {
    ed.session.setMode("ace/mode/html");
    ed.$blockScrolling = Infinity;
});

const getIframeContent = (userCode) => {
    const title = titleInput.value || "Document";
    return `
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
    <style>
        body {
            padding: 1.5rem;
        }
    </style>
</head>
<body>
    <div class="app">
${userCode.trim().indent(8)}
    </div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</body>
</html>
    `.trim();
}

const animateButtonText = (button, newText, duration = 2000) => {
    const buttonSpan = button.querySelector('span');
    if (!buttonSpan) return;

    button.width = "200px";
    
    const originalText = buttonSpan.innerHTML;
    buttonSpan.style.display = "inline-block";
    buttonSpan.style.opacity = 0;
    buttonSpan.style.filter = "blur(2px)";
    buttonSpan.style.transform = "scale(0.95)";

    setTimeout(() => {
        buttonSpan.innerHTML = newText;
        buttonSpan.style.opacity = 1;
        buttonSpan.style.filter = "blur(0px)";
        buttonSpan.style.transform = "scale(1.0)";
    }, 300);

    setTimeout(() => {
        buttonSpan.style.opacity = 0;
        buttonSpan.style.transform = "scale(1.0)";
        buttonSpan.style.filter = "blur(2px)";

        setTimeout(() => {
            buttonSpan.innerHTML = originalText;
            buttonSpan.style.opacity = 1;
            buttonSpan.style.transform = "scale(1.0)";
            buttonSpan.style.filter = "blur(0px)";
        }, 300);
    }, duration);
};

const updatePreview = () => {
    const code = editor.getValue();
    previewIframe.srcdoc = code.trim()
        ? getIframeContent(code)
        : `<!DOCTYPE html><html lang="en" data-bs-theme="dark" style="background-color: #111111;"><head><title>Preview</title><link href="lib/css/bootstrap-icons.css" rel="stylesheet"><style>body, html { margin: 0; padding: 0; height: 100vh; display: flex; justify-content: center; align-items: center; background-color: #111111; color: #6c757d; flex-direction: column; font-family: sans-serif; } i { font-size: 4rem; margin-bottom: 1rem; animation: fade-in 1s linear } @keyframes fade-in {from {opacity:0;filter:blur(5px);} to {opacity:1;filter:blur(0px);}}</style></head><body><i class="bi bi-eye"></i></body></html>`;
}

const saveData = () => {
    localStorage.setItem(
        docStorageKey,
        JSON.stringify({
            title: titleInput.value,
            code: editor.getValue(),
        })
    );
}

const loadData = () => {
    const data = JSON.parse(localStorage.getItem(docStorageKey) || "{}");
    titleInput.value = data.title || "";
    editor.setValue(data.code || "", -1);
    updatePreview();
}

const saveSettings = () => {
    localStorage.setItem(
        settingsStorageKey,
        JSON.stringify({
            theme: editorThemeSelect.value,
            wordWrap: wordWrapToggle.checked,
            autocomplete: autocompleteToggle.checked,
            fontSize: fontSizeInput.value,
            tabSize: tabSizeInput.value,
            font: editorFontSelect.value === "custom" ? customFontInput.value : editorFontSelect.value,
        })
    );
}

const loadSettings = () => {
    let fontTraverseIndex = 0;
    let predefinedFontsLength = Object.keys(predefinedFonts).length - 1;

    Object.entries(editorThemes).forEach(([name, path]) => editorThemeSelect.add(new Option(name, path)));
    Object.entries(predefinedFonts).forEach(([name, value]) => {
        editorFontSelect.add(new Option(name, value));

        if (fontTraverseIndex === predefinedFontsLength - 1) {
            editorFontSelect.appendChild(document.createElement("hr"));
        }

        fontTraverseIndex++;
    });

    const settings = JSON.parse(localStorage.getItem(settingsStorageKey) || "{}");
    const theme = settings.theme || "ace/theme/tomorrow_night";
    const fontSize = settings.fontSize || 16;
    const tabSize = settings.tabSize || 4;
    const font = settings.font || "monospace";
    const autocomplete = settings.autocomplete === undefined ? true : settings.autocomplete;

    editorThemeSelect.value = theme;
    wordWrapToggle.checked = settings.wordWrap === true;
    autocompleteToggle.checked = autocomplete;
    fontSizeInput.value = fontSize;
    tabSizeInput.value = tabSize;

    if (Object.values(predefinedFonts).includes(font)) {
        editorFontSelect.value = font;
        customFontInput.style.display = "none";
    } else {
        editorFontSelect.value = "custom";
        customFontInput.value = font;
        customFontInput.style.display = "block";
    }

    [editor, snippetEditor, fullHtmlEditor].forEach((ed) => {
        ed.setTheme(theme);
        ed.setFontSize(parseInt(fontSize));
        ed.session.setTabSize(parseInt(tabSize));
        ed.setOptions({
            fontFamily: font,
            enableBasicAutocompletion: autocomplete,
            enableLiveAutocompletion: autocomplete
        });
    });
    editor.session.setUseWrapMode(wordWrapToggle.checked);
};

const populateSnippets = () => {
    snippetsMenu.innerHTML = "";
    const createItem = (name, code) => {
        const a = document.createElement("a");
        a.className = "dropdown-item";
        a.href = "#";
        a.textContent = name;
        a.dataset.code = code;
        const li = document.createElement("li");
        li.appendChild(a);
        return li;
    };
    for (const [name, code] of Object.entries(defaultSnippets)) {
        snippetsMenu.appendChild(createItem(name, code.trimNewLineStart()));
    }
    const customSnippets = JSON.parse(localStorage.getItem(snippetsStorageKey) || "[]");
    if (customSnippets.length > 0) {
        snippetsMenu.appendChild(document.createElement("hr"));
        customSnippets.forEach((s) => snippetsMenu.appendChild(createItem(s.title, s.code)));
    }
    snippetsMenu.appendChild(document.createElement("hr"));
    const addBtnLi = document.createElement("li");
    const addBtnA = document.createElement("a");
    addBtnA.className = "dropdown-item";
    addBtnA.href = "#";
    addBtnA.innerHTML = `<i class="bi bi-plus-lg me-2"></i>New Snippet`;
    addBtnA.onclick = (e) => {
        e.preventDefault();
        snippetTitleInput.value = "";
        snippetEditor.setValue("", -1);
        addSnippetModal.show();
    };
    addBtnLi.appendChild(addBtnA);
    snippetsMenu.appendChild(addBtnLi);
};

const exportSnippets = () => {
    const customSnippets = JSON.parse(localStorage.getItem(snippetsStorageKey) || "[]");
    if (customSnippets.length === 0) {
        animateButtonText(exportSnippetsBtn, 'No Snippets');
        return;
    }
    const blob = new Blob([JSON.stringify(customSnippets, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bootstrap-scratchpad-snippets.json";
    a.click();
    URL.revokeObjectURL(url);
    animateButtonText(exportSnippetsBtn, 'Exported');
};

const importSnippets = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedSnippets = JSON.parse(e.target.result);
            const customSnippets = JSON.parse(localStorage.getItem(snippetsStorageKey) || "[]");
            const mergedSnippets = [...customSnippets];
            let newSnippetsCount = 0;
            for (const importedSnippet of importedSnippets) {
                if (!customSnippets.some(s => s.title === importedSnippet.title)) {
                    mergedSnippets.push(importedSnippet);
                    newSnippetsCount++;
                }
            }
            localStorage.setItem(snippetsStorageKey, JSON.stringify(mergedSnippets));
            populateSnippets();
            animateButtonText(importSnippetsBtn, `<i class="bi bi-check-lg me-2"></i>Imported ${newSnippetsCount}`);
        } catch (error) {
            console.error("Error parsing snippets file:", error);
            alert("Invalid snippets file.");
            animateButtonText(importSnippetsBtn, '<i class="bi bi-x-lg me-2"></i>Import Failed');
        }
    };
    reader.readAsText(file);
};

const clearSnippets = () => {
    const customSnippets = JSON.parse(localStorage.getItem(snippetsStorageKey) || "[]");
    if (customSnippets.length === 0) {
        animateButtonText(clearSnippetsBtn, 'No Snippets');
        return;
    }

    if (confirm("Are you sure you want to clear all custom snippets?")) {
        localStorage.removeItem(snippetsStorageKey);
        animateButtonText(clearSnippetsBtn, "Cleared")
        populateSnippets();
    }
};

snippetsMenu.addEventListener("click", (e) => {
    if (e.target.tagName === "A" && e.target.dataset.code) {
        e.preventDefault();
        editor.insert(e.target.dataset.code);
        editor.focus();
    }
});

saveSnippetBtn.addEventListener("click", () => {
    const ltitle = snippetTitleInput.value.trim();
    const code = snippetEditor.getValue().trim();
    if (!ltitle || !code) return;
    const customSnippets = JSON.parse(localStorage.getItem(snippetsStorageKey) || "[]");
    customSnippets.push({
        title: ltitle,
        code,
    });
    localStorage.setItem(snippetsStorageKey, JSON.stringify(customSnippets));
    populateSnippets();
    addSnippetModal.hide();
});

editor.session.on("change", () => {
    updatePreview();
    saveData();
});

titleInput.addEventListener("input", saveData);
[editorThemeSelect, wordWrapToggle, autocompleteToggle, fontSizeInput, tabSizeInput, editorFontSelect, customFontInput].forEach((el) =>
    el.addEventListener("change", () => {
        const newTheme = editorThemeSelect.value;
        const newFontSize = parseInt(fontSizeInput.value);
        const newTabSize = parseInt(tabSizeInput.value);
        const newFont = editorFontSelect.value === "custom" ? customFontInput.value : editorFontSelect.value;
        const newAutocomplete = autocompleteToggle.checked;

        if (editorFontSelect.value === "custom") {
            customFontInput.style.display = "block";
        } else {
            customFontInput.style.display = "none";
        }

        [editor, snippetEditor, fullHtmlEditor].forEach((ed) => {
            ed.setTheme(newTheme);
            ed.setFontSize(newFontSize);
            ed.session.setTabSize(newTabSize);
            ed.setOptions({
                fontFamily: newFont,
                enableBasicAutocompletion: newAutocomplete,
                enableLiveAutocompletion: newAutocomplete
            });
        });
        editor.session.setUseWrapMode(wordWrapToggle.checked);
        saveSettings();
    })
);
getHtmlBtn.addEventListener("click", () => {
    htmlModalLabel.textContent = titleInput.value || "Full HTML";
    fullHtmlEditor.setValue(getIframeContent(editor.getValue()), -1);
    htmlModal.show();
});

copyHtmlBtn.addEventListener("click", () => {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = fullHtmlEditor.getValue();
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
    animateButtonText(copyHtmlBtn, 'Copied');
});

importSnippetsBtn.addEventListener("click", () => importSnippetsInput.click());
importSnippetsInput.addEventListener("change", importSnippets);
exportSnippetsBtn.addEventListener("click", exportSnippets);
clearSnippetsBtn.addEventListener("click", clearSnippets);

document.addEventListener("DOMContentLoaded", () => {
    populateSnippets();
    loadSettings();
    loadData();
});