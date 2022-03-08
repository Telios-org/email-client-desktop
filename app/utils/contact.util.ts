const stringThemUp = (
  objArr: { name: string; address: string }[],
  complex = true,
  onlyFirstPart = false
) => {
  return objArr.reduce(
    (
      previous: string,
      current: { name: string; address: string },
      currentIndex: number
    ) => {
      const name = current.name && current.name.trim() !== current.address.trim()
        ? `${current.name} ${complex ? `<${current.address}>` : ''}`
        : `${current.address}`;

      let val = name;

      if (onlyFirstPart) {
        const part =
          val.trim().split(' ').length > 1
            ? val.trim().split(' ')[0]
            : val.trim().split('@')[0];
        val = part.charAt(0).toUpperCase() + part.slice(1);
      }

      if (currentIndex !== objArr.length - 1) {
        val += ',';
      }

      return `${previous}${val.trim()} `;
    },
    ''
  );
};

const peopleHeaderParser = (
  toJSON = '[]',
  fromJSON = '[]',
  ccJSON = '[]',
  bccJSON = '[]',
  direction: 'incoming' | 'outgoing' = 'incoming'
) => {
  const to = { arr: JSON.parse(toJSON), plainText: '' };
  const from = { arr: JSON.parse(fromJSON), plainText: '' };
  const cc = { arr: JSON.parse(ccJSON), plainText: '' };
  const bcc = { arr: JSON.parse(bccJSON), plainText: '' };

  let previewHead;
  const sender = {
    name: from.arr[0].name && from.arr[0].name.length ? from.arr[0].name : from.arr[0].address,
    address: from.arr[0].address,
    hasName: !!from.arr[0].name, // will simplify UI code to know if name and address are the same.
    inNetwork: from.arr[0].address.indexOf('telios.io') > -1,
    avatarInitials: ''
  };

  const senderArr = sender.name.split(' ');
  if (senderArr.length > 1) {
    sender.avatarInitials = `${senderArr[0][0]}${senderArr[1][0]}`.toUpperCase();
  } else {
    // eslint-disable-next-line prefer-destructuring
    sender.avatarInitials = senderArr[0][0].toUpperCase();
  }

  if (direction === 'incoming') {
    previewHead = sender.name ?? '';
  } else if (direction === 'outgoing') {
    previewHead = `To: ${stringThemUp(to.arr, false, true)}`;
  }

  to.plainText = stringThemUp(to.arr);
  cc.plainText = stringThemUp(cc.arr);
  bcc.plainText = stringThemUp(bcc.arr);
  from.plainText = stringThemUp(from.arr);


  return {
    previewHead,
    sender,
    recipients: {
      to,
      from,
      cc,
      bcc
    }
  };
};

export default peopleHeaderParser;
