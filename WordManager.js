"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WordManager;
const react_1 = __importStar(require("react"));
function WordManager({ words, onAdd, onEdit, }) {
    const [newWord, setNewWord] = (0, react_1.useState)('');
    const [newMeaning, setNewMeaning] = (0, react_1.useState)('');
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [editWord, setEditWord] = (0, react_1.useState)('');
    const [editMeaning, setEditMeaning] = (0, react_1.useState)('');
    const handleAdd = () => {
        if (newWord && newMeaning) {
            onAdd({ word: newWord, meaning: newMeaning });
            setNewWord('');
            setNewMeaning('');
        }
    };
    const handleEdit = () => {
        if (editing && editWord && editMeaning) {
            onEdit({ ...editing, word: editWord, meaning: editMeaning });
            setEditing(null);
        }
    };
    return (react_1.default.createElement("div", { style: { maxWidth: 500, margin: '0 auto', textAlign: 'left' } },
        react_1.default.createElement("h2", null, "\u5355\u8BCD\u8BCD\u6C47\u7BA1\u7406"),
        react_1.default.createElement("div", { style: { marginBottom: 16 } },
            react_1.default.createElement("input", { placeholder: "\u5355\u8BCD", value: newWord, onChange: (e) => setNewWord(e.target.value), style: { marginRight: 8 } }),
            react_1.default.createElement("input", { placeholder: "\u91CA\u4E49", value: newMeaning, onChange: (e) => setNewMeaning(e.target.value), style: { marginRight: 8 } }),
            react_1.default.createElement("button", { onClick: handleAdd }, "\u6DFB\u52A0")),
        react_1.default.createElement("table", { style: { width: '100%', borderCollapse: 'collapse' } },
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("th", { style: { borderBottom: '1px solid #ccc' } }, "\u5355\u8BCD"),
                    react_1.default.createElement("th", { style: { borderBottom: '1px solid #ccc' } }, "\u91CA\u4E49"),
                    react_1.default.createElement("th", { style: { borderBottom: '1px solid #ccc' } }, "\u64CD\u4F5C"))),
            react_1.default.createElement("tbody", null, words.map((w) => editing?.id === w.id ? (react_1.default.createElement("tr", { key: w.id },
                react_1.default.createElement("td", null,
                    react_1.default.createElement("input", { value: editWord, onChange: (e) => setEditWord(e.target.value) })),
                react_1.default.createElement("td", null,
                    react_1.default.createElement("input", { value: editMeaning, onChange: (e) => setEditMeaning(e.target.value) })),
                react_1.default.createElement("td", null,
                    react_1.default.createElement("button", { onClick: handleEdit }, "\u4FDD\u5B58"),
                    react_1.default.createElement("button", { onClick: () => setEditing(null) }, "\u53D6\u6D88")))) : (react_1.default.createElement("tr", { key: w.id },
                react_1.default.createElement("td", null, w.word),
                react_1.default.createElement("td", null, w.meaning),
                react_1.default.createElement("td", null,
                    react_1.default.createElement("button", { onClick: () => {
                            setEditing(w);
                            setEditWord(w.word);
                            setEditMeaning(w.meaning);
                        } }, "\u7F16\u8F91")))))))));
}
