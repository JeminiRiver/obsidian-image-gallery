import {TFolder, TAbstractFile} from 'obsidian'

const getSubfoldersList = (
  files: TAbstractFile[]
) => {

  files = files.flatMap(file => {
    if (file instanceof TFolder)
      return getSubfoldersList(file.children)
    else
      return file
  })

  // return an array of objects
  return files
}

export default getSubfoldersList
