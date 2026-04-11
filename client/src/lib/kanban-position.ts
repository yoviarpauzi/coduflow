const POSITION_STEP = 65536;

export const getAppendPosition = (items: Array<{ position: number }>) => {
  if (items.length === 0) return POSITION_STEP;
  return items[items.length - 1].position + POSITION_STEP;
};

export const getPositionAtIndex = (
  items: Array<{ position: number }>,
  index: number,
) => {
  if (index === 0) {
    return items[1] ? items[1].position / 2 : POSITION_STEP;
  }

  if (index === items.length - 1) {
    return items[index - 1].position + POSITION_STEP;
  }

  return (items[index - 1].position + items[index + 1].position) / 2;
};
