import { App, TFolder, TFile } from 'obsidian'
import renderError from './render-error'
import getSubfoldersList from "./get-subfolders-list";
import groupImages from "./group-images";

const getImagesList = (
    app: App,
    container: HTMLElement,
    settings: {[key: string]: any}
  ): Map<string, any> => {
  // retrieve a list of the files
  const folder = app.vault.getAbstractFileByPath(settings.path)

  let files
  if (folder instanceof TFolder) { files = folder.children }
  else {
    const error = 'The folder doesn\'t exist, or it\'s empty!'
    renderError(container, error)
    throw new Error(error)
  }

  // get sub folders if necessary
  if( settings.recursive) {
    files = getSubfoldersList(files)
  }

  // filter the list of files to make sure we're dealing with images only
  const validExtensions = ["jpeg", "jpg", "gif", "png", "webp", "tiff", "tif"]
  const images = files.filter(file => {
    if (file instanceof TFile && validExtensions.includes(file.extension)) return file
  })

  const mappedImages = images.map((image: any) => {
    return {
      name: image.name,
      folder: image.parent.path,
      uri: app.vault.adapter.getResourcePath(image.path),
      label: image.path.split('/').slice(0, -1).join('/').replace(folder.path + '/',''),
      stat: image.stat
    }
  })

  let imageGroups: Map<string, any> = groupImages(mappedImages, image => image.label)

  imageGroups.forEach((group, key) => {
    const orderedImages = group.sort((a: any, b: any) => {
      const refA = settings.sortby === 'name' ? a['name'].toUpperCase() : a.stat[settings.sortby]
      const refB = settings.sortby === 'name' ? b['name'].toUpperCase() : b.stat[settings.sortby]
      return (refA < refB) ? -1 : (refA > refB) ? 1 : 0
    })
    const sortedImages = settings.sort === 'asc' ? orderedImages : orderedImages.reverse()
    imageGroups.set(key, sortedImages)
  });

  // return an array of objects
  return imageGroups
}

export default getImagesList
