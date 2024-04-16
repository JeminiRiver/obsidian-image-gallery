const groupImages = (
  list: {[key: string]: any},
  keyGetter: (arg0: any) => any
) => {

  const map: Map<string, any> = new Map();
  list.forEach((item: any) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });

  return map;

}

export default groupImages
