// CURRENTLY THE BELOW ISN'T WORKING AS INTENDED WHEN USING IN ClassName

const passwordStrengthClass = (password: string, score: number) => {
  if (password !== '') {
    switch (score) {
      case 0:
      case 1:
        return `bg-red-500 text-white`;
      case 2:
        return `bg-orange-500 text-white`;
      case 3:
        return `bg-yellow-500 text-white`;
      case 4:
        return `bg-green-500 text-white`;
      default:
        return `bg-gray-200 text-gray-300`;
    }
  }
  return `bg-gray-200 text-gray-300`;
};
export default passwordStrengthClass;
