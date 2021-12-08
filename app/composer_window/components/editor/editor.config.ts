export const FONT_FACES = [
  { label: 'Georgia', value: 'georgia' },
  { label: 'Arial', value: 'arial' },
  { label: 'Helvetica', value: 'helvetica' },
  { label: 'Monospace', value: 'menlo, consolas, courier new, monospace' },
  { label: 'Tahoma', value: 'tahoma, sans-serif' },
  { label: 'Verdana', value: 'verdana' },
  { label: 'Times New Roman', value: 'times new roman' },
  { label: 'Trebuchet MS', value: 'trebuchet ms' }
];

export const FONT_SIZES = [
  { label: '10', value: 10 },
  { label: '12', value: 12 },
  { label: '14', value: 14 },
  { label: '16', value: 16 },
  { label: '18', value: 18 },
  { label: '20', value: 20 },
  { label: '22', value: 22 },
  { label: '24', value: 24 },
  { label: '26', value: 26 }
];

// export const FONT_COLORS = [
//     /* white */
//     '#FFFFFF',
//     '#DADADA',
//     '#B5B5B5',
//     '#909090',
//     '#6B6B6B',
//     '#464646',
//     '#222222',
//     /* magenta */
//     '#F6CBCB',
//     '#EC9798',
//     '#E36667',
//     '#ED4139',
//     '#CF3932',
//     '#9A2B25',
//     '#681D19',
//     /* blue */
//     '#CDE1F2',
//     '#9CC3E5',
//     '#6CA6D9',
//     '#3B83C2',
//     '#2A47F6',
//     '#145390',
//     '#0F3A62',
//     /* green */
//     '#D7EAD3',
//     '#B3D6A9',
//     '#8FC380',
//     '#77F241',
//     '#66A657',
//     '#3A762B',
//     '#29501F',
//     /* yellow */
//     '#FFF2CD',
//     '#FEE59C',
//     '#FCD86F',
//     '#FDF84E',
//     '#F2C246',
//     '#BE8F35',
//     '#7F6124',
// ];

export const HEADER_CLASS = 'h4';
export const IFRAME_CLASS = 'editor-editor-iframe';

export const DEFAULT_FONT_FACE = FONT_FACES[1];
export const DEFAULT_FONT_SIZE = FONT_SIZES[2];
export const DEFAULT_FONT_COLOR = () => '#222222';
export const DEFAULT_BACKGROUND = () => '#FFFFFF';
export const DEFAULT_LINK = '';
export const DEFAULT_IMAGE = '';

export const RGB_REGEX = /rgb\((\d+)\s*,\s*(\d+),\s*(\d+)\)/;

export const EMBEDDABLE_TYPES = [
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/bmp'
];

export const DEFAULT_CSS = `
        // custom scroll
        body {
            --scrollbar-thumb-color: rgba(0, 0, 0, 0.35);
            --scrollbar-thumb-hover-color: rgba(0, 0, 0, 0.5);
        }

        * {
            scrollbar-width: thin;
            scrollbar-color: var(--scrollbar-thumb-color) transparent;
        }
        *::-webkit-scrollbar {
            width: 0.625rem; /* 10px */
            height: 0.625rem;
        }
        *::-webkit-scrollbar-thumb {
            border: .125rem solid transparent; /* 2px */
            background-clip: padding-box;
            border-radius: .3125rem; /* 5px */
            background-color: var(--scrollbar-thumb-color, rgba(0, 0, 0, 0.35) );
        }
        *::-webkit-scrollbar-track {
            background-color: transparent;
        }
        *::-webkit-scrollbar-thumb:horizontal:hover,
        *::-webkit-scrollbar-thumb:vertical:hover {
            background-color: var(--scrollbar-thumb-hover-color, rgba(0, 0, 0, 0.5) );
        }
        *::-webkit-scrollbar-corner {
            visibility: hidden;
        }

        html {
            height: 100%;
            font-size: 100%;
            cursor: text;
        }

        body {
            box-sizing: border-box;
            font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            -webkit-font-smoothing: antialiased;
            font-size: .875rem; /* 14 */
            line-height: 1.65;
            color: #222;
            background: #fff;
            /* to fix, CSS var are not passing through the iframe */
            word-wrap: break-word;
            margin: 0;
        }

        body a {
            color: #657ee4;
        }

        [id="editor"] {
            outline: none;
            padding: 0rem 1rem 1rem 1.25rem; // TODO: check other integrations
        }

        blockquote {
            padding: 0 0 0 1rem;
            margin: 0;
            border-left: 4px solid #e5e5e5;
        }

        blockquote blockquote blockquote {
            padding-left: 0;
            margin-left: 0;
            border: none;
        }

        ul, ol {
            padding-left: 1.4286em;
        }

        li {
            list-style-position: inside;
        }

        // Handle outlook https://github.com/ProtonMail/Angular/issues/6711
        p.MsoNormal, li.MsoNormal, div.MsoNormal {
            margin: 0;
        }

        code,
        pre {
        color: #ccc;
        border-radius:5px;
        background: #2d2d2d;
        font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
        font-size: 0.85em;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        word-wrap: normal;
        line-height: 1.5;

        -moz-tab-size: 4
        -o-tab-size: 4;
        tab-size: 4;

        -webkit-hyphens: none;
        -moz-hyphens: none;
        -ms-hyphens: none;
        hyphens: none;

        }

        /* Code blocks */
        pre {
        padding: 1rem;
        margin: .5rem 0;
        overflow: auto;
        }

        /* Inline code */
        :not(pre) > code{
        padding: 0.2rem 0.5rem;
        border-radius: .3em;
        white-space: normal;
        }
   `;
