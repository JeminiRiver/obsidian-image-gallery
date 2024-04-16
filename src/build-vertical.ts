import groupImages from "./group-images";

const buildVertical = (
  container: HTMLElement,
  imageGroups: Map<string, any>,
  settings: {[key: string]: any}
) => {

  // inject the gallery wrapper
  const gallery = container.createEl('div')
  gallery.addClass('grid-wrapper')
  gallery.style.lineHeight = '0px'

  imageGroups.forEach((groupedImages, key) => {

    // inject the gallery group label if getting subfolders
    if( settings.subfolder) {
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
    group.style.margin = `0px ${settings.gutter}px ${settings.gutter}px 0px`
    group.style.width = '100%'
    group.style.columnCount = `${settings.columns}`
    group.style.columnGap = `${settings.gutter}px`

    // inject and style images
    groupedImages.forEach((file: { [key: string]: string }) => {
      const figure = group.createEl('div')
      figure.addClass('grid-item')
      figure.style.breakInside = 'avoid-column'
      figure.style.marginBottom = `${settings.gutter}px`
      figure.style.width = '100%'
      figure.style.height = 'auto'
      figure.style.cursor = 'pointer'
      figure.setAttribute('data-name', file.name)
      figure.setAttribute('data-folder', file.folder)
      figure.setAttribute('data-src', file.uri)

      const img = figure.createEl('img')
      img.style.borderRadius = `${settings.radius}px`
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

export default buildVertical
