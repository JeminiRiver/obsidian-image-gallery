import groupImages from "./group-images";

const buildHorizontal = (
  container: HTMLElement,
  imageGroups: Map<string, any>,
  settings: {[key: string]: any}
) => {

  // inject the gallery wrapper
  const gallery = container.createEl('div')
  gallery.addClass('grid-wrapper')
  gallery.style.marginRight = `-${settings.gutter}px`

  imageGroups.forEach((groupedImages, key) => {

    // inject the gallery group label if getting subfolders
    if( settings.recursive) {
      const label = gallery.createEl('div')
      label.addClass('gallery-group-label')
      label.style.width = '100%'
      label.style.textAlign = 'center'
      label.style.margin = '10px 0'
      label.style.fontSize = '0.8em'
      label.style.color = '#666'
      label.style.lineHeight = 'normal'
      label.style.fontWeight = 'bold'
      label.style.backgroundColor = '#0000000f'
      label.style.padding = '10px'
      label.style.borderRadius = `${settings.radius}px`
      label.innerText = key
    }

    const group = gallery.createEl('div')
    group.addClass('grid-group')
    group.style.display = 'flex'
    group.style.flexWrap = 'wrap'
    group.style.margin = `0px ${settings.gutter}px ${settings.gutter}px 0px`
    group.style.width = '100%'

    // inject and style images
    groupedImages.forEach((file: {[key: string]: string}) => {
      const figure = group.createEl('figure')
      figure.addClass('grid-item')
      figure.style.margin = `0px ${settings.gutter}px ${settings.gutter}px 0px`
      figure.style.width = 'auto'
      figure.style.height = `${settings.height}px`
      figure.style.borderRadius = `${settings.radius}px`
      figure.style.flex = '1 0 auto'
      figure.style.overflow = 'hidden'
      figure.style.cursor = 'pointer'
      figure.setAttribute('data-name', file.name)
      figure.setAttribute('data-folder', file.folder)
      figure.setAttribute('data-src', file.uri)

      const img = figure.createEl('img')
      img.style.objectFit = 'cover'
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.borderRadius = '0px'
      img.src = file.uri

      // inject the image label if requested
      if( settings.label ) {
        const label = figure.createEl('div')
        label.addClass('gallery-label')
        label.style.width = '100%'
        label.style.textAlign = 'center'
        label.style.marginTop = '10px'
        label.style.fontSize = '0.8em'
        label.style.color = '#666'
        label.style.lineHeight = 'normal'
        label.innerText = file.name
      }
    })
  })


  return gallery
}

export default buildHorizontal
