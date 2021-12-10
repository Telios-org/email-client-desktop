/* eslint-disable import/extensions */
import * as draftjsType from 'draft-js/index.d.ts';

export const matchesEntityType = (type: string) => type === 'LINK';

export default function strategy(
  contentBlock: draftjsType.contentBlock,
  cb,
  contentState: draftjsType.contentState
) {
  if (!contentState) return;
  contentBlock.findEntityRanges((character: draftjsType.CharacterMetadata) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      matchesEntityType(contentState.getEntity(entityKey).getType())
    );
  }, cb);
}
