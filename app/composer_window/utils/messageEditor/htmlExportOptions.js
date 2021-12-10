import Prism from 'prismjs';
import { stateToHTML } from 'draft-js-export-html';

const cssCodeBlock = ` /**
* prism.js tomorrow night eighties for JavaScript, CoffeeScript, CSS and HTML
* Based on https://github.com/chriskempson/tomorrow-theme
* @author Rose Pritchard
*/

code,
pre {
   color: #ccc;
   border-radius:5px;
   background: #2d2d2d;
   font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
   font-size: 1em;
   text-align: left;
   white-space: pre;
   word-spacing: normal;
   word-break: normal;
   word-wrap: normal;
   line-height: 1.5;

   -moz-tab-size: 4;
   -o-tab-size: 4;
   tab-size: 4;

   -webkit-hyphens: none;
   -moz-hyphens: none;
   -ms-hyphens: none;
   hyphens: none;

}

/* Code blocks */
pre {
   padding: 1em;
   margin: .5em 0;
   overflow: auto;
}

/* Inline code */
:not(pre) > code{
   padding: .1em;
   border-radius: .3em;
   white-space: normal;
}

.token.comment,
.token.block-comment,
.token.prolog,
.token.doctype,
.token.cdata {
   color: #999;
}

.token.punctuation {
   color: #ccc;
}

.token.tag,
.token.attr-name,
.token.namespace,
.token.deleted {
   color: #e2777a;
}

.token.function-name {
   color: #6196cc;
}

.token.boolean,
.token.number,
.token.function {
   color: #f08d49;
}

.token.property,
.token.class-name,
.token.constant,
.token.symbol {
   color: #f8c555;
}

.token.selector,
.token.important,
.token.atrule,
.token.keyword,
.token.builtin {
   color: #cc99cd;
}

.token.string,
.token.char,
.token.attr-value,
.token.regex,
.token.variable {
   color: #7ec699;
}

.token.operator,
.token.entity,
.token.url {
   color: #67cdcc;
}

.token.important,
.token.bold {
   font-weight: bold;
}
.token.italic {
   font-style: italic;
}

.token.entity {
   cursor: help;
}

.token.inserted {
   color: green;
}`;

const exportOptions = {
  blockRenderers: {
    'code-block': block => {
      const code = block.getText();
      let html = Prism.highlight(
        code,
        Prism.languages.javascript,
        'javascript'
      );
      html = html.replace(/\n/g, '<br>');
      return `<pre>${html}</pre>`;
    }
  },
  blockStyleFn: block => {
    if (block.getType() === 'ordered-list-item') {
      return {
        attributes: { class: 'list-decimal' }
      };
    }
    if (block.getType() === 'unordered-list-item') {
      return {
        attributes: { class: 'list-disc' }
      };
    }
  }
};

const editorHTMLexport = editorState => {
  const currentState = editorState.getCurrentContent();
  const body = stateToHTML(currentState, exportOptions);
  if (body.indexOf('</pre>') > -1) {
    return `<html>
      <head>
      <meta charset=utf-8>
      <style type="text/css">
      ${cssCodeBlock}
      </style>
      </head>
      <body><div>${body}</div></body>
     </html>`;
  }
  return `<html>
    <head>
    <meta charset=utf-8>
    <style type="text/css">
    </style>
    </head>
    <body>${body}</body>
   </html>`;
};

// return `<html>
// <head>
// <meta charset=utf-8>
// <style type="text/css">
//   body {
//     font-size: small;
//   }
//   p {
//     margin:0px;
//   }
//   </style>
// </head>
// <body>${body}</body>
// </html>`;

export default editorHTMLexport;
