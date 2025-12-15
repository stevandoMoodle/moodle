import{React as r}from"../react.js";function d(s){let{label:t,type:a="button",disabled:i=!1,loading:e=!1,onClick:n,className:u="",...c}=s,o=i||e;return r.createElement("button",{type:a,disabled:o,onClick:l=>{if(o){l.preventDefault();return}n&&n(l)},className:u,...c},e?t?`${t}\u2026`:"Loading\u2026":t)}export{d as default};
//# sourceMappingURL=Button.js.map
