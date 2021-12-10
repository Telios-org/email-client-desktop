const {
  EditorState,
  convertToRaw,
  convertFromRaw,
  DefaultDraftBlockRenderMap,
  ContentState,
  convertFromHTML,
  getSafeBodyFromHTML
} = require('draft-js');

const Immutable = require('immutable');
const clone = require('rfdc')();

module.exports.editorStateFromHTML = htmlBody => {
  const blockRenderMap = Immutable.Map({
    image: {
      element: 'img'
    }
  });

  const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(
    blockRenderMap
  );

  const blocksFromHTML = convertFromHTML(
    htmlBody,
    getSafeBodyFromHTML,
    extendedBlockRenderMap
  );

  const state = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  );
  const { blocks, entityMap } = convertToRaw(state);
  const imgCount = blocks.filter(b => b.type === 'image').length;

  if (imgCount > 0) {
    const fixedEntityMap = clone(entityMap);
    let arrKeys = Object.keys(fixedEntityMap);
    arrKeys = arrKeys.map(k => parseInt(k, 10));

    const lastKey = Math.max(...arrKeys);
    let blockCounter = lastKey;

    const fixedContentBlocks = blocks.map(blck => {
      if (blck.type === 'image') {
        blockCounter += 1;
        return {
          ...blck,
          text: ' ',
          type: 'atomic',
          entityRanges: [{ offset: 0, length: 1, key: blockCounter }]
        };
      }
      return blck;
    });

    const blocksFromHTML2 = convertFromHTML(htmlBody);
    const state2 = ContentState.createFromBlockArray(
      blocksFromHTML2.contentBlocks,
      blocksFromHTML2.entityMap
    );
    const { entityMap: imgEntities } = convertToRaw(state2);

    let entityCounter = lastKey;
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(imgEntities)) {
      if (value.type === 'IMAGE') {
        entityCounter += 1;
        fixedEntityMap[entityCounter] = value;
      }
    }
    const editorDefaultValue = {
      blocks: fixedContentBlocks,
      entityMap: fixedEntityMap
    };
    return EditorState.createWithContent(convertFromRaw(editorDefaultValue));
  }

  //   console.log(blocksFromHTML);
  //   const state = ContentState.createFromBlockArray(
  //     blocksFromHTML.contentBlocks,
  //     blocksFromHTML.entityMap
  //   );
  // console.log(JSON.stringify(convertToRaw(state)));
  return EditorState.createWithContent(state);
};
