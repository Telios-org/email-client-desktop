import React, { Component, useState, useEffect } from 'react';
import { Icon, Loader } from 'rsuite';
import { Document, Paper } from 'react-iconly';
import { AttachmentType } from '../../../main_window/reducers/types';
import FileService from '../../../services/file.service';

type Props = {
  attachment: AttachmentType
};

type State = {
  content: string,
  showImagePreview: boolean,
  filename: string
};

export default class AttachmentPreview extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      content: "",
      filename: props.attachment.filename,
      showImagePreview: props.attachment.size < 10000000 && props.attachment.contentType && props.attachment.contentType.indexOf('image') > -1
    };
  }

  async componentDidMount() {
    const { showImagePreview } = this.state;
    const { attachment } = this.props;

    if(showImagePreview && !attachment.content) {
      const data = await FileService.getFile(attachment.id);
      this.setState({ content: data, filename: attachment.id });
    }

    if(showImagePreview && attachment.content) {
      this.setState({ content: attachment.content });
    }
  }

  render() {
    const { content, showImagePreview, filename } = this.state;
    const { attachment } = this.props;

    return (
      <div>
        <Paper set="bulk" size="large" className="mb-1 -mr-1"/>

        {/* {showImagePreview && content === "" && (
          <div className="flex w-28 h-20 overflow-hidden bg-gray-600 bg-opacity-5">
            <div className="m-auto">
              <Loader size="sm" />
            </div>
          </div>
        )}

        {showImagePreview && content !== "" && (
          <div className="w-28 h-20 overflow-hidden">
            <img className="object-fit object-center" src={`data:${attachment.contentType};base64, ${content}`} alt={filename} />
          </div>
        )} */}
      </div>
    );
  }
}

// type Props = {
//   attachment: AttachmentType;
// };

// export default function AttachmentPreview(props: Props) {
//   const { attachment } = props;
//   const [content, setContent] = useState("");
//   const showImagePreview = attachment.size < 10000000 && attachment.contentType.indexOf('image') > -1;

//   useEffect(() => {
//     if(showImagePreview && !attachment.content && !content) {
//       FileService.getFile(attachment.id)
//         .then((data) => {
//           console.log('SET CONTENT 1', data)
//           setContent(data);
//         });
//     }

//     if(showImagePreview && attachment.content && !content) {
//       console.log('SET CONTENT 2', attachment.content)
//       setContent(attachment.content);
//     }
//   }, [content]);

//   return (
//     <div>
//       {!showImagePreview && (
//         <Icon icon="file-text" size="2x" />
//       )}

//       {showImagePreview && content === "" && (
//         <div className="flex w-28 h-20 overflow-hidden bg-gray-600 bg-opacity-5">
//           <div className="m-auto">
//             <Loader size="sm" />
//           </div>
//         </div>
//       )}

//       {showImagePreview && content !== "" && (
//         <div className="w-28 h-20 overflow-hidden">
//           <img className="object-fit object-center" src={`data:${attachment.contentType};base64, ${content}`} alt={attachment.filename} />
//         </div>
//       )}
//     </div>
//   );
// }
